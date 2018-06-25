import Matrix from './Matrix';

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {

    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;

    // Weights between input and hidden nodes
    this.weights_ih = new Matrix(this.hiddenNodes, this.inputNodes);
    this.weights_ih.randomise();
    // Weights between hidden and output nodes
    this.weights_ho = new Matrix(this.outputNodes, this.hiddenNodes);
    this.weights_ho.randomise();

    // Bias for hidden nodes
    this.bias_h = new Matrix(this.hiddenNodes, 1);
    this.bias_h.randomise();
    // Bias for output nodes
    this.bias_o = new Matrix(this.outputNodes, 1);
    this.bias_o.randomise();
  }


  // Takes an input in the form of an array
  feedForward(input_arr){

    // Generate hidden outputs
    const inputs = Matrix.fromArray(input_arr);
    const hidden = Matrix.product(this.weights_ih, inputs);
    hidden.add(this.bias_h);
    hidden.map(sigmoid); // Apply activation function to hidden matrix

    // Generate outputs
    const output = Matrix.product(this.weights_ho, hidden);
    output.add(this.bias_o);
    output.map(sigmoid);

    // Return output
    return output.toArray();
  }
}


// Sigmoid function used as activation function
// returns val exp/log constrained between 0 & 1 regardless of size
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export default NeuralNetwork;
