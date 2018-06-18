import * as THREE from 'three';
import Vehicle from './vehicle';
import cloneGltf from '../vendor/cloneGltf';

class Wolf extends Vehicle{

  constructor(gltf, scene, mixer, x, z, parentDna, texture) {

    super(gltf, scene, mixer, x, z, parentDna, texture);

    if (parentDna) {
      this.dna = {
        generation: parentDna.generation++,
        maxSpeed: this.mutateGene(parentDna.maxSpeed, 1, 5, 15),
        foodAttraction: this.mutateGene(parentDna.foodAttraction, 0.1, 0, 1),
        poisonAttraction: this.mutateGene(parentDna.poisonAttraction, 0.1, 0, 1),
        foodPerception: this.mutateGene(parentDna.foodPerception, 10, 500, 1000),
        poisonPerception: this.mutateGene(parentDna.poisonPerception, 10, 20, 1000)
      };
    //if first gen, create random behaviour weightings
    }else{
      this.dna = {
        generation: 1,
        maxSpeed: Math.random() * 10 +5, //max speed of vehicle
        foodAttraction: Math.random(), //food
        poisonAttraction: Math.random(), //poison
        foodPerception: Math.random() * 1000 + 500, //food perception
        poisonPerception: Math.random() * 1000 + 20, //poison perception
      };
    }

  }

  behaviors(good, bad){
    const steerGood = this.eatVehicle(good, 0.2, this.dna.foodPerception);
    const steerBad = this.eat(bad, -0.2, this.dna.poisonPerception);

    steerGood.multiplyScalar(this.dna.foodAttraction);
    steerBad.multiplyScalar(this.dna.poisonAttraction);

    this.applyForce(steerGood);
    this.applyForce(steerBad);
  }

  eatVehicle(list, nutrition, perception){
    // Iterate through list and find the closest item
    let record = Infinity;
    let closestIndex = -1;
    for (let i = 0; i < list.length; i++) {
      const listPos = new THREE.Vector2(list[i].model.position.x, list[i].model.position.z);
      const distance = this.position.distanceTo(listPos);
      // if the current item's distance is less than the record
      // and within the line of sight distance
      if (distance < record && distance <= perception) {
        record = distance;
        closestIndex = i;
      }
    }

    // If the closest item is within a given radius
    // 'eat' amd remove the item
    const eatRadius = 30;
    if (record < eatRadius) {

      // Reduce victim vehicle's health to 0
      // allow vehicle.dead() to handle unmounting vehicle
      list[closestIndex].health = 0;

      // health of vehicle goes up/down based on what they 'ate'
      this.health += nutrition;
    }
    // Otherwise return closest item vector
    else if(closestIndex > -1) {
      // console.log(list[closestIndex].position);
      return this.seek(new THREE.Vector2(
        list[closestIndex].model.position.x,
        list[closestIndex].model.position.z)
      );
    }

    // If nothing left to seek, return 0 vector
    return new THREE.Vector2(0, 0);
  }

  // Instantiate glTF model for vehicle
  createModel(gltf, mixer, scene, x, z, dna, texture) {
    const clone = cloneGltf(gltf);

    // Access only the character mesh (ignore glTF cam and lights)
    const character = clone.scene.children[0];
    character.scale.set(1, 1, 1);

    // Rotate default correctly
    character.rotateZ(Math.PI);

    // Create pivot to workaround centred pivot
    const model = new THREE.Object3D();
    model.add(character);

    model.action = mixer.clipAction( clone.animations[0], character)
    .startAt( - Math.random() )
    .play();

    // Set initial position for model
    model.position.set(x, 0, z);

    // Set model scale relative to speed
    // i.e slower == bigger
    const scale = 3;
    model.children[0].scale.set(scale, scale, scale);

    // Clone texture to prevent affecting parent
    const newTexture = texture.clone();
    newTexture.image = texture.image;
    newTexture.needsUpdate = true;
    model.texture = newTexture; //store a reference to texture to give to children

    // Store materials on model to reflect health status
    model.materials = [];
    model.children[0].traverse( (child) => {
      if (child instanceof THREE.Mesh) {
        const oldMaterial = child.material;
        // Set green to full (i.e. health starts at 100%)
        const newMaterial = new THREE.MeshPhongMaterial({skinning: true, opacity: 1, transparent: true});
        newMaterial.name = oldMaterial.name;
        newMaterial.map = newTexture;
        newMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
        newMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
        newMaterial.map.repeat.set( dna.generation, dna.generation );
        child.material = newMaterial;
        model.materials.push(child.material);
      }
    });

    this.createHelperGuides(model, scale, dna);

    return model;
  }

  clone(){
    if (Math.random() < 0.0005) {
      return new Wolf(this.gltf, this.scene, this.mixer, this.position.x, this.position.y, this.dna, this.texture);
    }
  }
}

export default Wolf;
