// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js

class Vehicle {
  constructor(model, x, y, parentDna) {

    this.model = model;
    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, y );
    this.maxForce = 0.8;

    this.health = 1;

    this.mutationRate = 0.3;

    //set inherited behaviour weightings
    if (parentDna) {
      this.dna = {
        generation: parentDna.generation++,
        maxSpeed: this.mutateGene(parentDna.maxSpeed, 1, 1, 8),
        foodAttraction: this.mutateGene(parentDna.foodAttraction, 0.1, 0, 1),
        poisonAttraction: this.mutateGene(parentDna.poisonAttraction, 0.1, 0, 1),
        foodPerception: this.mutateGene(parentDna.foodPerception, 10, 10, 1000),
        poisonPerception: this.mutateGene(parentDna.poisonPerception, 10, 10, 1000)
      };
    //if first gen, create random behaviour weightings
    }else{
      this.dna = {
        generation: 1,
        maxSpeed: Math.random() * 7 +1, //max speed of vehicle
        foodAttraction: Math.random(), //food
        poisonAttraction: Math.random(), //poison
        foodPerception: Math.random() * 1000 + 10, //food perception
        poisonPerception: Math.random() * 1000 + 10, //poison perception
      };
    }
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
    const eatRadius = 5;
    if (record < eatRadius) {
      scene.remove(list[closestIndex]);
      list.splice(closestIndex, 1);

      // health of vehicle goes up/down based on what they 'ate'
      this.health += nutrition;
    }
    // Otherwise return closest item vector
    else if(closestIndex > -1) {
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
    const maxWidth = 1000;
    const minWidth = -1000;
    const maxHeight = 1000;
    const minHeight = -1000;

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
      return true;
    }
  }


  // Vehicle 'dies' is health is less than 0
  dead(){
    return (this.health < 0)
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
}
