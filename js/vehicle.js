// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js

class Vehicle {
  constructor(model, x, y) {

    this.model = model;
    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, y );
    this.maxSpeed = 3;
    this.maxForce = 0.8;

    //normalised behaviour weightings
    this.dna = [
      Math.random(), //food
      Math.random() //poison
    ];
  }

  // Method to update vehicle location
  update(){
    // update velocity
    this.velocity.add(this.acceleration);
    // limit speed
    this.velocity.clampLength(0, this.maxSpeed); //instead of p5's .limit()?
    // update position
    this.position.add(this.velocity);
    // reset acceleration to 0 ea. cycle
    this.acceleration.multiplyScalar(0);

    // Rotate model to face direction
    this.model.lookAt(this.position.x, 0 , this.position.y);
  }

  applyForce(force){
    // Can add mass here for A = F / M
    this.acceleration.add(force);
  }

  // Applys weighting based on DNA to object steering
  // Good and bad refer to opposing forces (i.e. food and poison)
  behaviors(good, bad){
    const steerGood = this.eat(good);
    const steerBad = this.eat(bad);

    // console.log(steerGood, steerBad);

    steerGood.multiplyScalar(this.dna[0]);
    steerBad.multiplyScalar(this.dna[1]);

    // console.log(steerGood, steerBad);

    // debugger;

    this.applyForce(steerGood);
    this.applyForce(steerBad);
  }

  eat(list){
    // Iterate through list and find the closest item
    let record = Infinity;
    let closestIndex = -1;
    let i;
    for ( i = 0; i < list.length; i++) {
      const listPos = new THREE.Vector2(list[i].position.x, list[i].position.z);
      const distance = this.position.distanceTo(listPos);
      if (distance < record) {
        record = distance;
        closestIndex = i;
      }
    }

    // If the closest item is within a given radius
    // 'eat' amd remove the item
    if (record < 3) {
      scene.remove(list[closestIndex]);
      list.splice(closestIndex, 1);
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

  display(){
      this.model.position.set(this.position.x, 0, this.position.y);
  }
}
