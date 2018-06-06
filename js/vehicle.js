// Based on Shiffman's class: https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/blob/master/chp06_agents/NOC_6_01_Seek/vehicle.js

class Vehicle {
  constructor(x, y) {

    this.acceleration = new THREE.Vector2( 0, 0 );
    this.velocity = new THREE.Vector2( 0, 1 );
    this.position = new THREE.Vector2( x, y );
    this.maxSpeed = 2;
    this.maxForce = 0.2;
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
  }

  applyForce(force){
    // Can add mass here for A = F / M
    this.acceleration.add(force);
  }

  // Calculate steering force towards target
  seek(target){
    let desired = target.sub(this.position);
    // scale to maximum speed - *p5* desired.setMag(this.maxspeed);
      // .setMag() - Set the magnitude of this vector to the value
    desired.normalize();
    desired.setLength(this.maxSpeed);
    // steering = desired minus velocity
    const steer = desired.sub(this.velocity);
    // steer.clampLength(0, this.maxForce);

    this.applyForce(steer);
  }
}
