class Perceptron {

  constructor(n, learningRate) {
    // Weightings for n inputs
    this.weights = new Array(n);
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = Math.random() * 2 -1;
    }
    // Perceptron learning rate
    this.lr = learningRate;
  }

  // Receives the inputs and the known answer
  // Adjusts the weights for inputs accordingly
  train(inputs, target){
    const guess = this.feedForward(inputs);
    // Error = known answer - guess
    const error = target - guess;
    // Tunes weights based on guess error and perceptron learning rate
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += error * inputs[i] * this.lr;
    }
  }

  feedForward(inputs){
    // Computes weighted sum
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      // Mult input by associated weighting
      sum += inputs[i] * this.weights[i];
    }
    // Pass sum through activation function
    return this.activate(sum);
  }

  // Activation function
  activate(n){
    if (n >= 0) {
      return 1;
    }
    else{
      return -1;
    }
  }
}

export default Perceptron;
