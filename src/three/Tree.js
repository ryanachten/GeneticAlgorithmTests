import * as THREE from 'three';

class Tree {
  constructor(groundSize, scene) {
    this.width = Math.random() * 1000 + 200;
    this.height = Math.random() * 1000 + 500;
    this.x = Math.random() * (groundSize - (this.width*2 +100)) - (groundSize - (this.width*2 +100))/2;
    this.z = Math.random() * (groundSize - (this.width*2 +100)) - (groundSize - (this.width*2 +100))/2;
    this.fallingFruit = [];
    this.fallenFruit = [];
    this.model = undefined;
    this.health = 1.0;
    this.scene = scene;
  }

  create(){
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(this.width/10, this.width/8, this.height, 8, 1, true),
      new THREE.MeshPhongMaterial({ color: 0xcd9465, transparent: true, opacity: 0.5  })
    );
    trunk.name = 'trunk';


    const treeTop = new THREE.Mesh(
      new THREE.ConeGeometry(this.width, this.height/4, 10),
      new THREE.MeshPhongMaterial({ color: new THREE.Color('hsl(170, 100%, 36%)'), transparent: true, opacity: 0.5 })
    );
    treeTop.position.y += this.height/2;
    treeTop.name = 'treeTop';

    const treeObj = new THREE.Object3D();
    treeObj.add(trunk, treeTop);

    treeObj.position.set(this.x, 0, this.z);
    treeObj.position.y += this.height/2; //align with ground level
    treeObj.updateMatrixWorld(); //update child matricies
    this.scene.add(treeObj);

    this.trunk = trunk;
    this.treeTop = treeTop;
    this.model = treeObj;

    return this;
  }

  createFruit(){
    this.treeTop.updateMatrix();
    const vertices = this.treeTop.geometry.vertices;
    const fruits = [];
    const fruitSize = 10;

    for (var i = 1; i < vertices.length-1; i++) {
      if (Math.random() < 0.3) {
        const fruit = new THREE.Mesh(
          new THREE.BoxGeometry(fruitSize, fruitSize, fruitSize),
          new THREE.MeshPhongMaterial({ color: 'blue' })
        );

        // Create vertice copy to apply matrix transforms to align fruit w/ real world vertice position w/o affecting mesh structure
        const vertPos = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z);
        vertPos.applyMatrix4(this.treeTop.matrix);
        vertPos.applyMatrix4(this.model.matrix);

        fruit.position.copy(vertPos);
        fruit.position.y = (this.height - fruitSize);
        this.scene.add(fruit);
        fruits.push(fruit);
      }
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

  dead(){
    if (this.health <= 0) {
      if (this.fallingFruit.length > 1) {
        this.fallingFruit.map( (fruit) => {
          this.scene.remove(fruit);
        });
      }
      this.scene.remove(this.model);
      return true;
    }
    else{
      return false;
    }
  }

  update(){
    this.health -= 0.0001;
    this.treeTop.rotation.y += 0.001;

    this.model.children[1].material.color.setHSL(0.472,this.health,0.36);

    if (Math.random() < 0.001 && this.fallingFruit.length === 0) {
      this.createFruit();
    }

    if (this.fallingFruit.length > 0) {
      this.fruitFall();
    }
  }
}

export default Tree;
