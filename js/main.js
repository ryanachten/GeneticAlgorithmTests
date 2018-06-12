if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, controls;
var camera, scene, renderer, light;

var clock = new THREE.Clock();
let mixer;
let clip;

let vehicles = [];
let target;
const groundSize = 2000;

const foodCount = 20;
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
  const foodSize = 10;
  for (var i = 0; i < foodCount; i++) {
    const x = Math.random() * groundSize - groundSize/2;
    const z = Math.random() * groundSize - groundSize/2;
    const foodObj = new THREE.Mesh( new THREE.BoxGeometry( foodSize, foodSize, foodSize ), new THREE.MeshPhongMaterial( { color: 0x00B99A } ));
    foodObj.position.set(x, foodSize, z);
    scene.add(foodObj);
    food.push( foodObj );
  }

  const poisonSize = 10;
  for (var i = 0; i < poisonCount; i++) {
    const x = Math.random() * groundSize - groundSize/2;
    const z = Math.random() * groundSize - groundSize/2;
    const poisonObj = new THREE.Mesh( new THREE.BoxGeometry( poisonSize, poisonSize, poisonSize ), new THREE.MeshPhongMaterial( { color: 0xFF6F91 } ));
    poisonObj.position.set(x, poisonSize, z);
    scene.add(poisonObj);
    poison.push( poisonObj );
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

// Add add mixers and actions based on stored clip, add model to scene
function createVehicle(model){

  const x = Math.random() * groundSize - groundSize/2;
  const z = Math.random() * groundSize - groundSize/2;
  model.position.set(x, 0, z);

  const vehicle = new Vehicle(model, x, z);
  vehicles.push(vehicle);

  scene.add( model );
}


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

  requestAnimationFrame( animate );

  // Iterate through vehicle collection
  if (vehicles.length > 0) {
    mixer.update( clock.getDelta() );
    vehicles.map( (vehicle) => {
      vehicle.behaviors(food, poison);
      vehicle.update();
      vehicle.display();
    });
  }

  renderer.render( scene, camera );

  stats.update();

}
