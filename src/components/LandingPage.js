import React from 'react';
import * as THREE from 'three';
import $ from 'jquery';
import GLTFLoader from '../vendor/GLTFLoader';

import {createScene, loadTextures} from '../three/initThree';
import {addFood, addPoison} from  '../three/evolution';
import {Vehicle, instanceVehicle} from '../three/vehicle';
import Tree from '../three/tree';


class LandingPage extends React.Component {
  constructor(props) {
    super(props)

    this.animate = this.animate.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);

    this.state = {
      canvasWidth: undefined,
      canvasHeight: undefined,
      groundSize: 4000,
    }
  }

  componentDidMount() {
    this.setupThree();

    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
    this.stop()
    if (this.state.showStats) {
      const statsCanvas = document.getElementById('stats');
      statsCanvas.remove();
    }
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions(){

    const canvasHeight = $(window).height();
    const canvasWidth = $(window).width();

    this.setState({
      canvasWidth,
      canvasHeight
    });
    this.camera.aspect = canvasWidth / canvasHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( canvasWidth, canvasHeight );
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  setupThree(){
    const {camera, scene, renderer} = createScene(this.state.groundSize);
    this.camera = camera;
    this.scene = scene;

    this.renderer = renderer;
    this.mount.appendChild(this.renderer.domElement);

    this.mixer = new THREE.AnimationMixer(this.scene);

    this.clock = new THREE.Clock();

    loadTextures(['pig.jpg', 'rat.jpg', 'dog.jpg', 'human.jpg', 'donkey.jpg']).then( (imgs) => {
      this.textures = imgs;

      // Then load fbx
      var loader = new GLTFLoader();
      loader.load( 'models/Walking.gltf', ( data ) => {

        this.gltf = data;

        this.initEvolution();
      });
    });
  }

  initEvolution() {

    // Create forrest
    this.trees = [];
    for (var i = 0; i < 5; i++) {
      const tree = new Tree(this.state.groundSize);
      this.scene.add(tree.create());
      const fruits = tree.createFruit();
      fruits.map( (fruit) => {
        this.scene.add(fruit);
      });
      this.trees.push(tree);
    }

    const foodCount = 20;
    const poisonCount = 20;

    this.food = [];
    this.poison = [];

    // distribute intial food
    for (var i = 0; i < foodCount; i++) {
      const foodObj = addFood(this.state.groundSize);
      this.scene.add( foodObj);
      this.food.push( foodObj );
    }
    // distribute intial poison
    for (var i = 0; i < poisonCount; i++) {
      const poisonObj = addPoison(this.state.groundSize);
      this.scene.add( poisonObj );
      this.poison.push( poisonObj );
    }

    this.vehicles = [];

    // // Create default vehicles
    for (var i = 0; i < 5; i++) {
      instanceVehicle(
        this.gltf,
        this.scene,
        this.mixer,
        Math.random() * this.state.groundSize - this.state.groundSize/2,
        Math.random() * this.state.groundSize - this.state.groundSize/2,
        undefined,
        this.textures[i] //texture index
      ).then( ({vehicle, model}) => {
        this.scene.add(model);
        this.vehicles.push(vehicle);
      });
    }

    this.start();
  }

  animate() {

    this.renderScene();

    this.frameId = window.requestAnimationFrame(this.animate);

  }

  renderScene() {

    // If vehicles are loaded and food or poison are still available
    if (this.vehicles.length > 0 && (this.food.length > 0 || this.poison.length > 0)) {

      // Update forrest
      this.trees.map( (tree) => {
        if (Math.random() < 0.001 && tree.fallingFruit.length === 0) {
          const fruits = tree.createFruit();
          fruits.map( (fruit) => {
            this.scene.add(fruit);
          });
        }
        if (tree.fallenFruit.length > 0) {
          for (var i = 0; i < tree.fallenFruit.length; i++) {
            this.food.push(tree.fallenFruit[i]);
            tree.fallenFruit.splice(i, 1);
          }
        }
        tree.update();
      });

      // Update model animation
      this.mixer.update( this.clock.getDelta() );

      // Randomly add new food to scene
      if (Math.random() < 0.01) {
        const foodObj = addFood(this.state.groundSize);
        this.scene.add( foodObj);
        this.food.push( foodObj );
      }

      // Randomly add new poison to scene
      if (Math.random() < 0.01) {
        const poisonObj = addPoison(this.state.groundSize);
        this.scene.add( poisonObj);
        this.poison.push( poisonObj );
      }

      // Update vehicles
      for (var i = this.vehicles.length-1; i >= 0; i--) {
        if (!this.vehicles[i].dead()) {
          this.vehicles[i].boundaries();
          this.vehicles[i].behaviors(this.food, this.poison);
          this.vehicles[i].update();
          this.vehicles[i].display();

          if (this.vehicles[i].clone()) {
            instanceVehicle(
              this.gltf,
              this.scene,
              this.mixer,
              this.vehicles[i].position.x,
              this.vehicles[i].position.y,
              this.vehicles[i].dna,
              this.vehicles[i].model.texture
            ).then( ({vehicle, model}) => {
              this.scene.add(model);
              this.vehicles.push(vehicle);
            });
          }
        }
        else{
          // If dead, remove from screen and vehicles array
          this.scene.remove(this.vehicles[i].model);
          // Create new food where the vehicle died
          const foodObj = addFood(this.state.groundSize, this.vehicles[i].position.x, this.vehicles[i].position.y);
          this.scene.add( foodObj);
          this.food.push( foodObj );
          // Remove animation action from mixer
          this.mixer.uncacheAction(this.vehicles[i].model.action.getClip(), this.vehicles[i].model.children[0]);
          this.vehicles.splice(i, 1);

        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        style={{  width: this.state.canvasWidth,
                  height: this.state.canvasHeight  }}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default LandingPage;
