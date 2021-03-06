import * as THREE from 'three';
import cloneGltf from '../vendor/cloneGltf';

// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js


class Vehicle {
  constructor(gltf, scene, mixer, x, z, parentDna, texture) {

    this.gltf = gltf;
    this.scene = scene;
    this.mixer = mixer;
    this.texture = texture;
    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, z );
    this.maxForce = 0.8;

    this.health = 1;

    this.mutationRate = 0.3;

    //set inherited behaviour weightings
    if (parentDna) {
      this.dna = {
        generation: parentDna.generation++,
        maxSpeed: this.mutateGene(parentDna.maxSpeed, 1, 2, 8),
        foodAttraction: this.mutateGene(parentDna.foodAttraction, 0.1, 0, 1),
        poisonAttraction: this.mutateGene(parentDna.poisonAttraction, 0.1, 0, 1),
        foodPerception: this.mutateGene(parentDna.foodPerception, 10, 10, 1000),
        poisonPerception: this.mutateGene(parentDna.poisonPerception, 10, 10, 1000)
      };
    //if first gen, create random behaviour weightings
    }else{
      this.dna = {
        generation: 1,
        maxSpeed: Math.random() * 7 +2, //max speed of vehicle
        foodAttraction: Math.random(), //food
        poisonAttraction: Math.random(), //poison
        foodPerception: Math.random() * 1000 + 10, //food perception
        poisonPerception: Math.random() * 1000 + 10, //poison perception
      };
    }

    this.model = this.createModel(this.gltf, this.mixer, this.scene, x, z, this.dna, this.texture);
    scene.add(this.model);
    return this;
  }

  mutateGene(gene, mutationSize, mutationMin, mutationMax){
    if (Math.random() < this.mutationRate) {
      const mutation = Math.random() * (mutationSize*2) - mutationSize;
      gene += mutationSize; //adjust gene to mutationSize
      return Math.max(mutationMin, Math.min(mutationMax, gene)); //clamp gene
      return gene;
    // If not within mutation rate, return copy of parent gene
    }else{
      return gene;
    }
  }

  // Method to update vehicle location
  update(){
    // health declines each frame
    this.health -= 0.001;
    // update velocity
    this.velocity.add(this.acceleration);
    // limit speed
    this.velocity.clampLength(0, this.dna.maxSpeed); //instead of p5's .limit()?
    // update position
    this.position.add(this.velocity);
    // reset acceleration to 0 ea. cycle
    this.acceleration.multiplyScalar(0);
  }

  applyForce(force){
    // Can add mass here for A = F / M
    this.acceleration.add(force);
  }


  // Applys weighting based on DNA to object steering
  // Good and bad refer to opposing forces (i.e. food and poison)
  behaviors(good, bad){
    const steerGood = this.eat(good, 0.2, this.dna.foodPerception);
    const steerBad = this.eat(bad, -0.2, this.dna.poisonPerception);

    steerGood.multiplyScalar(this.dna.foodAttraction);
    steerBad.multiplyScalar(this.dna.poisonAttraction);

    this.applyForce(steerGood);
    this.applyForce(steerBad);
  }

  eat(list, nutrition, perception){
    // Iterate through list and find the closest item
    let record = Infinity;
    let closestIndex = -1;
    for (let i = 0; i < list.length; i++) {
      const listPos = new THREE.Vector2(list[i].position.x, list[i].position.z);
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
    const eatRadius = 10;
    if (record < eatRadius) {
      this.scene.remove(list[closestIndex]);
      list.splice(closestIndex, 1);

      // health of vehicle goes up/down based on what they 'ate'
      this.health += nutrition;
    }
    // Otherwise return closest item vector
    else if(closestIndex > -1) {
      // console.log(list[closestIndex].position);
      return this.seek(new THREE.Vector2(
        list[closestIndex].position.x,
        list[closestIndex].position.z)
      );
    }

    // If nothing left to seek, return 0 vector
    return new THREE.Vector2(0, 0);
  }

  // Calculate steering force towards target
  // **params** target: Vector2 position
  seek(target){

    let desired = target.sub(this.position);
    // scale to maximum speed - *p5* desired.setMag(this.maxspeed);
      // .setMag() - Set the magnitude of this vector to the value
    desired.normalize();
    desired.setLength(this.dna.maxSpeed);
    // steering = desired minus velocity
    const steer = desired.sub(this.velocity);
    steer.clampLength(0, this.maxForce);

    // Return steering force vector
    return steer;
  }

  // Keeps vehicle within the boundaries of the scene
  boundaries(){
    const d = 25; //margin from the edge
    let desired = null;
    const maxWidth = 2000;
    const minWidth = -2000;
    const maxHeight = 2000;
    const minHeight = -2000;

    if (this.position.x < minWidth - d) {
      desired = new THREE.Vector2(this.dna.maxSpeed, this.velocity.y);
    }
    else if (this.position.x > maxWidth - d) {
      desired = new THREE.Vector2(-this.dna.maxSpeed, this.velocity.y);
    }

    if (this.position.y < minHeight - d) {
      desired = new THREE.Vector2(this.velocity.x, this.dna.maxSpeed);
    }
    else if (this.position.y > maxHeight - d) {
      desired = new THREE.Vector2(this.velocity.x, -this.dna.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.multiplyScalar(this.dna.maxSpeed);

      let steer = new THREE.Vector2();
      steer.subVectors(desired, this.velocity);
      steer.clampLength(0, this.maxForce);

      this.applyForce(steer);
    }
  }

  clone(){
    if (Math.random() < 0.0005) {
      return new Vehicle(this.gltf, this.scene, this.mixer, this.position.x, this.position.y, this.dna, this.texture);
    }
  }


  // Vehicle 'dies' is health is less than 0
  dead(){
    if (this.health <= 0) {
      // If dead, remove from screen and vehicles array
      this.scene.remove(this.model);
      // Remove animation action from mixer
      this.mixer.uncacheAction(this.model.action.getClip(), this.model.children[0]);
      return true;
    }
    else{
      return false;
    }
  }

  // Determine how vehicle model should be displayed
  display(){
    // Rotate model to face direction
    this.model.lookAt(this.position.x, 0, this.position.y);

    // Position model based on vehicle position
    this.model.position.set(this.position.x, 0, this.position.y);

    // Update colour of model based on health
    this.model.materials.map( (material) => {
      material.opacity = this.health;
    });
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
    const scale = 2 * (1- dna.maxSpeed/8) + 1;
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

    // this.createHelperGuides(model, scale, dna);

    return model;
  }

  // Visualise vehicle behaviour
  createHelperGuides(model, scale, dna) {

    // Add spheres indicating food/posion proclivity
    const foodSphere = new THREE.Mesh(
      new THREE.SphereGeometry( 10, 5, 5 ),
      new THREE.MeshPhongMaterial( { color: new THREE.Color(0, dna.foodAttraction, 0) } )
    );
    foodSphere.position.set(10, 200*scale, 0);
    model.add(foodSphere);


    const poisonSphere = new THREE.Mesh(
      new THREE.SphereGeometry( 10, 5, 5 ),
      new THREE.MeshPhongMaterial( { color: new THREE.Color(dna.poisonAttraction, 0, 0) } )
    );
    poisonSphere.position.set(-10, 200*scale, 0);
    model.add(poisonSphere);

    const foodRadius = new THREE.Mesh(
      new THREE.CylinderGeometry( dna.foodPerception, dna.foodPerception, 10, 10, 1, true),
      new THREE.MeshPhongMaterial( { color: new THREE.Color(0, dna.foodAttraction, 0), opacity: 0.1, transparent: true} )
    );
    model.add(foodRadius);

    const poisonRadius = new THREE.Mesh(
      new THREE.CylinderGeometry( dna.poisonPerception, dna.poisonPerception, 10, 10, 1, true),
      new THREE.MeshPhongMaterial( { color: new THREE.Color(dna.poisonAttraction, 0, 0), opacity: 0.1, transparent: true} )
    );
    model.add(poisonRadius);
  }
}
export default Vehicle;
