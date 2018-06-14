// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js

class Vehicle {
  constructor(model, x, y, dna) {

    this.model = model;
    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, y );
    this.maxSpeed = 3;
    this.maxForce = 0.8;

    this.health = 1;

    this.mutationRate = 0.1;

    //set inherited behaviour weightings
    if (dna) {
      this.dna = [
        this.mutateGene(dna[0], 0.1, 0, 1),
        this.mutateGene(dna[1], 0.1, 0, 1),
        this.mutateGene(dna[2], 10, 10, 1000),
        this.mutateGene(dna[3], 10, 10, 1000)
      ];
    //if first gen, create random behaviour weightings
    }else{
      this.dna = [
        Math.random(), //food
        Math.random(), //poison
        Math.random() * 1000 + 10, //food perception
        Math.random() * 1000 + 10, //poison perception
      ];
    }
  }

  mutateGene(gene, mutationSize, mutationMin, mutationMax){
    if (Math.random() < this.mutationRate) {
      const mutation = Math.random() * (mutationSize*2) - mutationSize;
      console.log('Original', gene);
      gene += mutationSize; //adjust gene to mutationSize
      console.log('Mutated', Math.max(mutationMin, Math.min(mutationMax, gene)));
      return Math.max(mutationMin, Math.min(mutationMax, gene)); //clamp gene
      return gene;
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
    this.velocity.clampLength(0, this.maxSpeed); //instead of p5's .limit()?
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
    const steerGood = this.eat(good, 0.1, this.dna[2]);
    const steerBad = this.eat(bad, -0.1, this.dna[3]);

    steerGood.multiplyScalar(this.dna[0]);
    steerBad.multiplyScalar(this.dna[1]);

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
    desired.setLength(this.maxSpeed);
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
      desired = new THREE.Vector2(this.maxSpeed, this.velocity.y);
    }
    else if (this.position.x > maxWidth - d) {
      desired = new THREE.Vector2(-this.maxSpeed, this.velocity.y);
    }

    if (this.position.y < minHeight - d) {
      desired = new THREE.Vector2(this.velocity.x, this.maxSpeed);
    }
    else if (this.position.y > maxHeight - d) {
      desired = new THREE.Vector2(this.velocity.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.multiplyScalar(this.maxSpeed);

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
      material.color.g = this.health;
      material.color.r = 1-this.health;
    });
  }
}
