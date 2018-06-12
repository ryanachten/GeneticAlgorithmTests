if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, controls;
var camera, scene, renderer, light;

var clock = new THREE.Clock();
let mixer;
let clip;

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

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
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
  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = -100;
  light.shadow.camera.left = -120;
  light.shadow.camera.right = 120;
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

  for (var i = 0; i < poisonCount; i++) {
    addNutrient('poison');
  }


  // Create mixer to run animations
  mixer = new THREE.AnimationMixer( scene );

  // Load fbx
  var loader = new THREE.FBXLoader();
  for (var i = 0; i < 5; i++) {
    loader.load( 'models/Walking.fbx', function ( fbx ) {
      mixer.clipAction( fbx.animations[ 0 ], fbx )
          .startAt( - Math.random() )	// random phase (already running)
          .play();

      createVehicle(fbx);
    });
  }

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

// Add add mixers and actions based on stored clip, add model to scene
function createVehicle(model){

  // Set initial random position for model
  const x = Math.random() * groundSize - groundSize/2;
  const z = Math.random() * groundSize - groundSize/2;
  model.position.set(x, 0, z);

  // Store materials on model to reflect health status
  model.materials = [];
  model.traverse( (child) => {
    if (child instanceof THREE.Mesh) {
      // Set green to full (i.e. health starts at 100%)
      child.material.color = new THREE.Color(0, 1, 1);
      model.materials.push(child.material);
    }
  });


  // Create vehicle based on model
  const vehicle = new Vehicle(model, x, z);
  vehicles.push(vehicle);

  scene.add( model );
}

// Add food or poison to the scene
function addNutrient(type) {

  const foodSize = 10;
  const poisonSize = 10;

  const x = Math.random() * groundSize - groundSize/2;
  const z = Math.random() * groundSize - groundSize/2;
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

  // Randomly add new food to scene
  if (Math.random() < 0.01) {
    console.log('New food!');
    addNutrient('food');
  }

  // If vehicles are loaded and food or poison are still available
  if (vehicles.length > 0 && (food.length > 0 || poison.length > 0)) {

    // Update model animation
    mixer.update( clock.getDelta() );

    // Update vehicles
    for (var i = vehicles.length-1; i >= 0; i--) {
      if (!vehicles[i].dead()) {
        vehicles[i].behaviors(food, poison);
        vehicles[i].update();
        vehicles[i].display();
      }
      else{
        // If dead, remove from screen and vehicles array
        scene.remove(vehicles[i].model);
        vehicles.slice(i, 1);
      }
    }
  }

  renderer.render( scene, camera );

  stats.update();

}
