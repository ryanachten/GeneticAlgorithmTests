import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';

export const createScene = (groundSize) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );

  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.set( 0, 2500, 0 ); //set above the ground
  camera.rotation.set(-1.5, 0, -1.5); //set lookking down

  const controls = new OrbitControls( camera );
  controls.target.set( 0, 100, 0 );
  controls.update();

  const hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff );
  hemisphereLight.position.set( 0, 200, 0 );
  scene.add( hemisphereLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 0, 200, 100 );
  scene.add( directionalLight );

  const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( groundSize, groundSize ),
    new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } )
  );
  ground.rotation.x = - Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add( ground );

  const grid = new THREE.GridHelper( groundSize, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  // container.appendChild( renderer.domElement );

  return {camera, scene, renderer};
};


export const loadTextures = (textures)  => {
  const loaded = [];
  return new Promise( (resolve, reject) => {
    const loader = new THREE.TextureLoader();
    for (var i = 0; i < textures.length; i++) {
      const curTexture = textures[i];
      loader.load( '/img/tex/' + curTexture, (texture) => {
        loaded.push(texture);
        if (loaded.length === textures.length) {
          resolve(loaded);
        }
      });
    }
  });
};
