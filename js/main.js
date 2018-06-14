// gtFL creation process: https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, controls;
var camera, scene, renderer, light;

var clock = new THREE.Clock();
let mixer;
let clip;

let gltf;
let vehicles = [];
let target;
const groundSize = 2000;

const foodCount = 50;
const food = [];
const poisonCount = 20;
const poison = [];

init();
animate();

function init() {

  // Vehicle driver for GA

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.set( 0, 2500, 0 ); //set above the ground
  camera.rotation.set(-1.5, 0, -1.5); //set lookking down

  controls = new THREE.OrbitControls( camera );
  controls.target.set( 0, 100, 0 );
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  // scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

  light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 0, 200, 0 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 200, 100 );
  scene.add( light );

  // scene.add( new THREE.CameraHelper( light.shadow.camera ) );

  // ground
  var mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( groundSize, groundSize ),
    new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } )
  );
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add( mesh );

  var grid = new THREE.GridHelper( groundSize, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

  // distribute intial food
  for (var i = 0; i < foodCount; i++) {
    addNutrient('food');
  }
  // distribute intial poison
  for (var i = 0; i < poisonCount; i++) {
    addNutrient('poison');
  }


  // Create mixer to run animations
  mixer = new THREE.AnimationMixer( scene );

  // Load fbx
  var loader = new THREE.GLTFLoader();
  loader.load( 'models/Walking.gltf', function ( data ) {

    gltf = data;

    // Create default vehicles
    for (var i = 0; i < 5; i++) {
      instanceVehicle(
        Math.random() * groundSize - groundSize/2,
        Math.random() * groundSize - groundSize/2
      );
    }
  });

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  // stats
  stats = new Stats();
  container.appendChild( stats.dom );

}


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

// Creates new model and then controller vehicle
function instanceVehicle(x, z, dna) {
  createModel().then( (model) => createVehicle(model, x, z, dna));
}

// Instantiate glTF model for vehicle
function createModel() {
  return new Promise(function(resolve, reject) {
    const clone = cloneGltf(gltf);

    // Access only the character mesh (ignore glTF cam and lights)
    const model = clone.scene.children[0];
    model.scale.set(1, 1, 1);

    // Rotate default correctly
    model.rotateZ(Math.PI);

    // Create pivot to workaround centred pivot
    const pivot = new THREE.Object3D();
    pivot.add(model);

    mixer.clipAction( clone.animations[0], model)
        .startAt( - Math.random() )
        .play();

    resolve(pivot);
  });
}

// Add add mixers and actions based on stored clip, add model to scene
function createVehicle(model, x, z, dna){

  // Set initial position for model
  model.position.set(x, 0, z);

  // Store materials on model to reflect health status
  model.materials = [];
  model.children[0].traverse( (child) => {
    if (child instanceof THREE.Mesh) {
      const oldMaterial = child.material;
      // Set green to full (i.e. health starts at 100%)
      const newMaterial = new THREE.MeshPhongMaterial({color: new THREE.Color(0, 1, 1), skinning: true});
      newMaterial.name = oldMaterial.name;
      child.material = newMaterial;
      model.materials.push(child.material);
    }
  });

  // Create vehicle based on model
  const vehicle = new Vehicle(model, x, z, dna);
  vehicles.push(vehicle);

  // Visualise vehicle behaviour
  createHelperGuides(model, vehicle);

  scene.add( model );
}

// Visualise vehicle behaviour
function createHelperGuides(model, vehicle) {

  // Add spheres indicating food/posion proclivity
  const foodSphere = new THREE.Mesh(
    new THREE.SphereGeometry( 10, 5, 5 ),
    new THREE.MeshPhongMaterial( { color: new THREE.Color(0, vehicle.dna[0], 0) } )
  );
  foodSphere.position.set(10, 200, 0);
  model.add(foodSphere);


  const poisonSphere = new THREE.Mesh(
    new THREE.SphereGeometry( 10, 5, 5 ),
    new THREE.MeshPhongMaterial( { color: new THREE.Color(vehicle.dna[1], 0, 0) } )
  );
  poisonSphere.position.set(-10, 200, 0);
  model.add(poisonSphere);

  const foodRadius = new THREE.Mesh(
    new THREE.CylinderGeometry( vehicle.dna[2], vehicle.dna[2], 10, 10, 1, true),
    new THREE.MeshPhongMaterial( { color: new THREE.Color(0, vehicle.dna[0], 0), opacity: 0.1, transparent: true} )
  );
  model.add(foodRadius);

  const poisonRadius = new THREE.Mesh(
    new THREE.CylinderGeometry( vehicle.dna[3], vehicle.dna[3], 10, 10, 1, true),
    new THREE.MeshPhongMaterial( { color: new THREE.Color(vehicle.dna[1], 0, 0), opacity: 0.1, transparent: true} )
  );
  model.add(poisonRadius);
}

// Add food or poison to the scene
function addNutrient(type, xPos, zPos) {

  const foodSize = 10;
  const poisonSize = 10;

  const margin = 100; // Prevent food being to close to edge and causing boundary issues
  const x = xPos ? xPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;
  const z = zPos ? zPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;
  if (type === 'food') {
    const foodObj = new THREE.Mesh(
      new THREE.BoxGeometry( foodSize, foodSize, foodSize ),
      new THREE.MeshPhongMaterial( { color: 0x00B99A } )
    );
    foodObj.position.set(x, foodSize, z);
    scene.add(foodObj);
    food.push( foodObj );
  }
  else if (type === 'poison'){
    const poisonObj = new THREE.Mesh(
      new THREE.BoxGeometry( poisonSize, poisonSize, poisonSize ),
      new THREE.MeshPhongMaterial( { color: 0xFF6F91 } )
    );
    poisonObj.position.set(x, poisonSize, z);
    scene.add(poisonObj);
    poison.push( poisonObj );
  }
}


function animate() {

  requestAnimationFrame( animate );

  // If vehicles are loaded and food or poison are still available
  if (vehicles.length > 0 && (food.length > 0 || poison.length > 0)) {

    // Update model animation
    mixer.update( clock.getDelta() );

    // Randomly add new food to scene
    if (Math.random() < 0.01) {
      addNutrient('food');
    }

    // Randomly add new poison to scene
    if (Math.random() < 0.01) {
      addNutrient('poison');
    }

    // Update vehicles
    for (var i = vehicles.length-1; i >= 0; i--) {
      if (!vehicles[i].dead()) {
        vehicles[i].boundaries();
        vehicles[i].behaviors(food, poison);
        vehicles[i].update();
        vehicles[i].display();

        if (vehicles[i].clone()) {
          instanceVehicle(vehicles[i].position.x, vehicles[i].position.y, vehicles[i].dna);
        }
      }
      else{
        // If dead, remove from screen and vehicles array
        scene.remove(vehicles[i].model);
        // Create new food where the vehicle died
        addNutrient('food', vehicles[i].position.x, vehicles[i].position.y);
        vehicles.splice(i, 1);
      }
    }
  }

  renderer.render( scene, camera );

  stats.update();

}
