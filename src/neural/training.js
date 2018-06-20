import * as THREE from 'three';

class Point {
  constructor(width, height) {
    this.x = Math.random() * width - width/2;
    this.y = Math.random() * height - height/2;
    this.label = this.x > this.y ? 1 : -1;
  }

  show(){
    const geometry = new THREE.SphereGeometry( 10, 32, 32 )
    let material;
    if (this.label === 1) {
      material = new THREE.MeshBasicMaterial({color: 'red'});
    }
    else{
      material = new THREE.MeshBasicMaterial({color: 'blue'});
    }
    this.mesh = new THREE.Mesh(geometry, material);
  }
}

export default Point;
