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

    const nn = new NeuralNetwork(3, 4, 2);
    console.log(nn);

    const m = new Matrix(3, 2);
    m.randomise();
    console.table(m.matrix);

    const m2 = new Matrix(2, 3);
    m2.randomise();
    console.table(m2.matrix);

    const p = Matrix.product(m, m2);
    console.table(p.matrix);

    // this.initTraining();
  }

  // Describes division line
  line(x){
    let y = 0.8 * x + 0.4;
    return y;
  }

  drawLine(color, x1, y1, x2, y2){
    const material = new THREE.LineBasicMaterial({
    	color
    });

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
    	new THREE.Vector3( x1, 0, y1 ),
    	new THREE.Vector3( x2, 0, y2 )
    );

    const line = new THREE.Line( geometry, material );
    this.scene.add( line );

    return line;
  }

  drawPoint(color, x, y){

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(20, 6, 6),
      new THREE.MeshBasicMaterial({
        color
      })
    );
    this.scene.add( sphere );

    return sphere;
  }

  map(n, start1, stop1, start2, stop2) {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
  };

  initTraining(){

    // List of points for training the perceptron
    this.training = new Array(2000);

    // Train perceptron one point at a time
    this.count = 0;
    this.xMin = -1;
    this.yMin = -1;
    this.xMax = 1;
    this.yMax = 1;

    // Perceptron object
    // 3 inputs - x, y, and bias
    // 2nd arg = learning rate
    this.ptron = new Perceptron(3, 0.001);

    // Create a random set of training points and calculate the "known" answer
    for (var i = 0; i < this.training.length; i++) {
      const x = Math.random() * (this.xMax - this.xMin) + this.xMin;
      const y = Math.random() * (this.yMax - this.yMin) + this.yMin;
      let answer = 1;
      if (y < this.line(x)) answer = -1;
      const mesh = this.drawPoint('green', x, y);
      this.training[i] = {
        input: [x, y, 1],
        output: answer,
        mesh
      };
    }

    // Draw known line
    const x1 = this.map(this.xMin, this.xMin, this.xMax, -this.state.groundSize/2, this.state.groundSize/2);

    const y1 = this.map(this.line(this.xMin), this.yMin, this.yMax, this.state.groundSize/2, -this.state.groundSize/2);

    const x2 = this.map(this.xMax, this.xMin, this.xMax, -this.state.groundSize/2, this.state.groundSize/2);

    const y2 = this.map(this.line(this.xMax), this.yMin, this.yMax, this.state.groundSize/2, -this.state.groundSize/2);

    this.drawLine('red', x1, y1, x2, y2);

    // Setup line based on weights
    this.weightLine = this.drawLine('blue', x1, y1, x2, y2);

    this.start();
  }


  animate() {

    this.renderScene();

    this.frameId = window.requestAnimationFrame(this.animate);

  }

  renderScene() {

    // Calc line coords based on weights
    // Formula is weights[0]*x + weights[1]*y + weights[2] (i.e. bias) = 0
    let weights = this.ptron.weights;
    let x1 = this.xMin;
    let y1 = (-weights[2] - weights[0] * x1) / weights[1];
    let x2 = this.xMax;
    let y2 = (-weights[2] - weights[0] * x2) / weights[1];

    x1 = this.map(x1, this.xMin, this.xMax, -this.state.groundSize/2, this.state.groundSize/2);
    y1 = this.map(y1, this.yMin, this.yMax, this.state.groundSize/2, -this.state.groundSize/2);
    x2 = this.map(x2, this.xMin, this.xMax, -this.state.groundSize/2, this.state.groundSize/2);
    y2 = this.map(y2, this.yMin, this.yMax, this.state.groundSize/2, -this.state.groundSize/2);


    // Update line vectors based on weight coords
    this.weightLine.geometry.vertices[0].set(x1, 0, y1);
    this.weightLine.geometry.vertices[1].set(x2, 0, y2);
    this.weightLine.geometry.verticesNeedUpdate = true;

    // Train perceptron one training point at a time
    this.ptron.train(this.training[this.count].input, this.training[this.count].output);
    this.count = (this.count+1) % this.training.length;


    for (var i = 0; i < this.count; i++) {
      const guess = this.ptron.feedForward(this.training[i].input);
      if (guess > 0) {
        // make color different
        this.training[i].mesh.material.color = new THREE.Color('purple');
      }else{
        this.training[i].mesh.material.color = new THREE.Color('green');
      }
      const x = this.map(this.training[i].input[0], this.xMin, this.xMax, -this.state.groundSize/2, this.state.groundSize/2);
      const y = this.map(this.training[i].input[1], this.yMin, this.yMax, this.state.groundSize/2, -this.state.groundSize/2);

      this.training[i].mesh.position.set(x, 0, y);
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

export default NeuralPage;
