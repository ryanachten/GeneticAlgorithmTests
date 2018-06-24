class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = [];

    for (var i = 0; i < this.rows; i++) {
      this.matrix[i] = [];
      for (var j = 0; j < this.cols; j++) {
        this.matrix[i][j] = 0;
      }
    }
  }

  // Populate matrix with random values
  randomise(){
    for (var i = 0; i < this.rows; i++) {
      this.matrix[i] = [];
      for (var j = 0; j < this.cols; j++) {
        this.matrix[i][j] = Math.floor(Math.random() * 10);
      }
    }
  }

  add(n){
    // If object to be added is a matrix
    if (n instanceof Matrix) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.matrix[i][j] += n.matrix[i][j];
        }
      }
    }
    // If object to be added is a scalar
    else{
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.matrix[i][j] += n;
        }
      }
    }
  }

  // Multiplies matrix by scalar
  multiply(n){
    // If object to be multiplied is a matrix (Schur / Hadamard product)
    // Note: rows and cols need to be of the same number
    if (n instanceof Matrix) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.matrix[i][j] *= n.matrix[i][j];
        }
      }
    }
    // If object to be multiplied is a scalar
    else{
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.matrix[i][j] *= n;
        }
      }
    }
  }

  // Produces matrix product based on two matricies
  // Note: number of columns in A must match number of rows in B
  static product(a, b){
    if (a.cols !== b.rows) {
      throw new Error('Columns in matrix A must match rows in matrix B');
    }else{
      let result = new Matrix(a.cols, b.rows);
      for (var i = 0; i < result.cols; i++) {
        for (var j = 0; j < result.rows; j++) {
          // Compute dot product of values in column
          let sum = 0;
          for (var k = 0; k < a.cols; k++) {
            sum += a.matrix[i][k] * b.matrix[k][j]
          }
          result.matrix[i][j] = sum;
        }
      }
      return result;
    }
  }
}

export default Matrix;
