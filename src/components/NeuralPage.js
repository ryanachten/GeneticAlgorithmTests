import React from 'react';
import * as THREE from 'three';
import $ from 'jquery';
import {createScene} from '../three/initThree';
import Perceptron from '../neural/Perceptron';
import Point from '../neural/training';

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

    const perceptron = new Perceptron();

    const points = [];
    for (var i = 0; i < 100; i++) {
      const point = new Point(this.state.groundSize, this.state.groundSize);
      point.show();
      point.mesh.position.set(point.x, 0, point.y);
      this.scene.add(point.mesh);
      points.push(point);
    }

    for (var i = 0; i < points.length; i++) {
      const inputs = [points[i].x, points.y];
      const target = points[i].label;
      perceptron.train(inputs, target);

      const guess = perceptron.guess(inputs);
      if (guess === target) {
        points[i].mesh.material.color = new THREE.Color('green');
      }
      else{
        points[i].mesh.material.color = new THREE.Color('purple');
      }
    }

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
