import * as THREE from 'three';

class Tree {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.fallingFruit = [];
    this.fallenFruit = [];
    this.model = undefined;
  }

  create(){
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(this.width/10, this.width/8, this.height, 8, 1, true),
      new THREE.MeshPhongMaterial({ color: 0x00B99A, transparent: true, opacity: 0.5  })
    );
    trunk.name = 'trunk';
    this.trunk = trunk;

    const treeTop = new THREE.Mesh(
      new THREE.ConeGeometry(this.width, this.height/4, 10),
      new THREE.MeshPhongMaterial({ color: 0x00B99A, transparent: true, opacity: 0.5 })
    );
    treeTop.position.y += this.height/2;
    treeTop.name = 'treeTop';
    this.treeTop = treeTop;


    const treeObj = new THREE.Object3D();
    treeObj.add(trunk, treeTop);

    treeObj.position.y += this.height/2;

    this.model = treeObj;
    return treeObj;
  }

  createFruit(){
    // this.treeTop.geometry.verticesNeedUpdate = true;
    // this.treeTop.updateMatrix();
    const vertices = this.treeTop.geometry.vertices;
    const fruits = [];
    const fruitSize = 10;

    for (var i = 1; i < vertices.length-1; i++) {
      const fruit = new THREE.Mesh(
        new THREE.BoxGeometry(fruitSize, fruitSize, fruitSize),
        new THREE.MeshPhongMaterial({ color: 'red' })
      );
      vertices[i].applyMatrix4(this.treeTop.matrix);
      fruit.position.copy(vertices[i]);
      fruit.position.y = (this.height - fruitSize);
      fruits.push(fruit);
    }

    this.fallingFruit = this.fallingFruit.concat(fruits);
    return fruits;
  }

  fruitFall(){

    for (var i = this.fallingFruit.length-1; i >= 0; i--) {
      // If the fruit hits the ground, remove from fruit
      if (this.fallingFruit[0].position.y+10 <= 0) {
        this.fallenFruit.push(this.fallingFruit[i]);
        this.fallingFruit.splice(i, 1);
      }else{
        this.fallingFruit[i].position.y -= 10;
      }
    }
  }

  update(){
    this.treeTop.rotation.y += 0.001;

    if (this.fallingFruit.length > 0) {
      this.fruitFall();
    }
  }
}

export default Tree;
