if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, controls;
var camera, scene, renderer, light;

var clock = new THREE.Clock();

var mixers = [];

let vehicle;
let object;
let target;
const groundSize = 2000;

const food = [];
const poison = [];

init();
animate();

function init() {

  // Vehicle driver for GA

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.set( 100, 200, 300 );

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

  // setup target for GE to find
  //   target = new THREE.Mesh( new THREE.SphereGeometry( 5, 32, 32 ), new THREE.MeshPhongMaterial( { color: 0x000000 } ));
  //   target.position.set(-500, 0, 0);
  //   scene.add(target);
  //   setInterval(function () {
  //     target.position.set(
  //       Math.random() * groundSize - groundSize/2,
  //       0,
  //       Math.random() * groundSize - groundSize/2
  //     );
  //   }, 5000);

  // distribute intial food
  const foodSize = 10;
  for (var i = 0; i < 10; i++) {
    const x = Math.random() * groundSize - groundSize/2;
    const z = Math.random() * groundSize - groundSize/2;
    const foodObj = new THREE.Mesh( new THREE.BoxGeometry( foodSize, foodSize, foodSize ), new THREE.MeshPhongMaterial( { color: 0x00B99A } ));
    foodObj.position.set(x, foodSize, z);
    scene.add(foodObj);
    food.push( foodObj );
  }

  const poisonSize = 10;
  for (var i = 0; i < 10; i++) {
    const x = Math.random() * groundSize - groundSize/2;
    const z = Math.random() * groundSize - groundSize/2;
    const poisonObj = new THREE.Mesh( new THREE.BoxGeometry( poisonSize, poisonSize, poisonSize ), new THREE.MeshPhongMaterial( { color: 0xFF6F91 } ));
    poisonObj.position.set(x, poisonSize, z);
    scene.add(poisonObj);
    poison.push( poisonObj );
  }

  // load fbx model and store animation
  var loader = new THREE.FBXLoader();
  loader.load( 'models/Walking.fbx', function ( model ) {

    object = model;

    object.position.set(0, 0, groundSize*-1); //set near the edge of the ground

    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );

    var action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();

    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    vehicle = new Vehicle(object, 0, -800);
    scene.add( object );
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


function animate() {

  requestAnimationFrame( animate );

  // Update animation
  if ( mixers.length > 0 ) {
    for ( var i = 0; i < mixers.length; i ++ ) {
      mixers[ i ].update( clock.getDelta() );
    }
  }

  if (object //Make sure object has loaded
      // Only move if there is food
      && food.length > 0
    ) {
      vehicle.behaviors(food, poison);
      vehicle.update();
      vehicle.display();
  }


  renderer.render( scene, camera );

  stats.update();

}
