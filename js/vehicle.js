// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js

class Vehicle {
  constructor(model, x, y) {

    this.model = model;
    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, y );
    this.maxSpeed = 3;
    this.maxForce = 0.8;

    this.health = 1;

    //normalised behaviour weightings
    this.dna = [
      Math.random(), //food
      Math.random() //poison
    ];
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
    const steerGood = this.eat(good, 0.1);
    const steerBad = this.eat(bad, -0.1);

    steerGood.multiplyScalar(this.dna[0]);
    steerBad.multiplyScalar(this.dna[1]);

    this.applyForce(steerGood);
    this.applyForce(steerBad);
  }

  eat(list, nutrition){
    // Iterate through list and find the closest item
    let record = Infinity;
    let closestIndex = -1;
    const maxDistance = 1000; //max distance for food/poison line of sight
    for (let i = 0; i < list.length; i++) {
      const listPos = new THREE.Vector2(list[i].position.x, list[i].position.z);
      const distance = this.position.distanceTo(listPos);
      // if the current item's distance is less than the record
      // and within the line of sight distance
      if (distance < record && distance <= maxDistance) {
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

  // Vehicle 'dies' is health is less than 0
  dead(){
    return (this.health < 0)
  }

  // Determine how vehicle model should be displayed
  display(){
    // Rotate model to face direction
    this.model.lookAt(this.position.x, 0 , this.position.y);

    // Position model based on vehicle position
    this.model.position.set(this.position.x, 0, this.position.y);

    // Update colour of model based on health
    this.model.materials.map( (material) => {
      material.color.g = this.health;
      material.color.r = 1-this.health;
    });
  }
}
