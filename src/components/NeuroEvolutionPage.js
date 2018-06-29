// Study for neural network using multilayer perceptrons

import React from 'react';
import * as THREE from 'three';
import $ from 'jquery';
import {createScene} from '../three/initThree';
import Perceptron from '../neural/Perceptron';
import NeuralNetwork from '../neural/NeuralNetwork';
import Matrix from '../neural/Matrix';

class NeuralPage extends React.Component {

  constructor(props){
    super(props);

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

    this.setState(() => ({
      canvasWidth,
      canvasHeight
    }));
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

    // XOR training data
    const training_data = [
      { inputs: [0, 1],
        targets: [1] },
      { inputs: [1, 0],
        targets: [1] },
      { inputs: [1, 1],
        targets: [0] },
      { inputs: [0, 0],
        targets: [0] }
    ];

    const nn = new NeuralNetwork(2, 2, 1);
    // const output = nn.feedForward(input);
    // nn.train(input, target);

    // Train network based on randomly assigned training data
    const iterations = 50000;
    for (var i = 0; i < iterations; i++) {
        const data = training_data[Math.floor(Math.random()*training_data.length)]
        nn.train(data.inputs, data.targets);
    }

    console.log(nn.feedForward([0, 1])); //should return close to 1
    console.log(nn.feedForward([1, 0])); //should return close to 1
    console.log(nn.feedForward([1, 1])); //should return close to 0
    console.log(nn.feedForward([0, 0])); //should return close to 0

    this.start();
  }


  animate() {

    this.renderScene();

    this.frameId = window.requestAnimationFrame(this.animate);

  }

  renderScene() {

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

export default NeuralPage;
