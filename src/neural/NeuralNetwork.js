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

    this.learningRate = 0.1;
  }


  // Takes an input in the form of an array
  feedForward(inputs_arr){

    // Generate hidden outputs
    const inputs = Matrix.fromArray(inputs_arr);
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


  // Adjust network weights through backpropagation
  train(inputs_arr, targets_arr){

    // Generate hidden outputs
    const inputs = Matrix.fromArray(inputs_arr);
    const hidden = Matrix.product(this.weights_ih, inputs);
    hidden.add(this.bias_h);
    hidden.map(sigmoid); // Apply activation function to hidden matrix

    // Generate outputs
    const outputs = Matrix.product(this.weights_ho, hidden);
    outputs.add(this.bias_o);
    outputs.map(sigmoid);

    // Convert arrays to matricies
    const targets = Matrix.fromArray(targets_arr);

    // Error margin from output
    // Error = output - known answer (target)
    const output_errors = Matrix.subtract(targets, outputs);

    // Calculate gradient for descent
    const gradients = Matrix.map(outputs, dsigmoid);
    gradients.multiply(output_errors);
    gradients.multiply(this.learningRate);

    // Calculate hidden/output deltas
    const hidden_transposed = Matrix.transpose(hidden);
    const weights_ho_deltas = Matrix.product(gradients, hidden_transposed);

    // Adjust hidden/output weights by delta
    this.weights_ho.add(weights_ho_deltas);

    // Adjust hidden/output bias by its delta (gradient)
    this.bias_o.add(gradients);


    // Error margin for hidden layers
    const weights_ho_transposed = Matrix.transpose(this.weights_ho);
    const hidden_errors = Matrix.product(weights_ho_transposed, output_errors);

    // Calculate hidden gradient
    const hidden_gradients = Matrix.map(hidden, dsigmoid);
    hidden_gradients.multiply(hidden_errors);
    hidden_gradients.multiply(this.learningRate);

    // Calculate input/hidden deltas
    const inputs_transposed = Matrix.transpose(inputs);
    const weights_ih_deltas = Matrix.product(hidden_gradients, inputs_transposed);

    // Adjust input/hidden weights by delta
    this.weights_ih.add(weights_ih_deltas);

    // Adjust input/hidden bias by its delta (hidden gradient)
    this.bias_h.add(hidden_gradients);
  }
}


// Sigmoid function used as activation function
// returns val exp/log constrained between 0 & 1 regardless of size
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// (Kind of) sigmoid derivative
function dsigmoid(y) {
  // Proper dreivative would be: sigmoid(x) * (1 - sigmoid)
  return y * (1 - y);
}


export default NeuralNetwork;
