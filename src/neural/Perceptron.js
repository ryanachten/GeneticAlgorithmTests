class Perceptron {

  constructor() {
    // Weightings for inputs
    this.weights = [];
    for (var i = 0; i < 2; i++) {
      this.weights.push(Math.random() * 2 -1);
    }
    // Perceptron learning rate
    this.lr = 0.1;
  }

  guess(inputs){
    // Computes weighted sum
    let sum = 0;
    for (var i = 0; i < this.weights.length; i++) {
      // Mult input by associated weighting
      sum += inputs[i] * this.weights[i];
    }
    // Pass sum through activation function
    const output = this.sign(sum);
    return output;
  }

  // Activation function
  sign(n){
    if (n >= 0) {
      return 1;
    }
    else{
      return -1;
    }
  }

  // Receives the inputs and the known answer
  // Adjusts the weights for inputs accordingly
  train(inputs, target){
    const guess = this.guess(inputs);
    // Error = known answer - guess
    const error = target - guess;
    // Tunes weights based on guess error and perceptron learning rate
    for (var i = 0; i < this.weights.length; i++) {
      this.weights[i] += error * inputs[i] * this.lr;
    }

  }
}

export default Perceptron;
