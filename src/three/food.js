import * as THREE from 'three';

// Add food or poison to the scene
export const addFood = (groundSize, xPos, zPos) => {

  const foodSize = 10;

  const margin = 100; // Prevent food being to close to edge and causing boundary issues
  const x = xPos ? xPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;
  const z = zPos ? zPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;

  const foodObj = new THREE.Mesh(
    new THREE.BoxGeometry( foodSize, foodSize, foodSize ),
    new THREE.MeshPhongMaterial( { color: 0x00B99A } )
  );
  foodObj.position.set(x, foodSize, z);

  return foodObj;
}

export const addPoison = (groundSize, xPos, zPos) => {

  const poisonSize = 10;

  const margin = 100; // Prevent food being to close to edge and causing boundary issues
  const x = xPos ? xPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;
  const z = zPos ? zPos : Math.random() * (groundSize - margin) - (groundSize - margin)/2;

  const poisonObj = new THREE.Mesh(
    new THREE.BoxGeometry( poisonSize, poisonSize, poisonSize ),
    new THREE.MeshPhongMaterial( { color: 0xFF6F91 } )
  );
  poisonObj.position.set(x, poisonSize, z);

  return poisonObj;
}
