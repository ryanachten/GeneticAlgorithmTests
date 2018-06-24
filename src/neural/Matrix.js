class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];

    for (var i = 0; i < this.rows; i++) {
      this.data[i] = [];
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  // Populate matrix with random values
  randomise(){
    for (var i = 0; i < this.rows; i++) {
      this.data[i] = [];
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] = Math.floor(Math.random() * 10);
      }
    }
  }

  add(n){
    // If object to be added is a matrix
    if (n instanceof Matrix) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.data[i][j] += n.data[i][j];
        }
      }
    }
    // If object to be added is a scalar
    else{
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.data[i][j] += n;
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
          this.data[i][j] *= n.data[i][j];
        }
      }
    }
    // If object to be multiplied is a scalar
    else{
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.data[i][j] *= n;
        }
      }
    }
  }

  // Apply a function to every matrix element
  // Note: function argument must return result
  map(fn){
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        const val = this.data[i][j];
        this.data[i][j] = fn(val);
      }
    }
  }

  // Produces matrix product based on two matricies
  // Note: number of columns in A must match number of rows in B
  static product(a, b){
    if (a.cols !== b.rows) {
      throw new Error('Columns in matrix A must match rows in matrix B');
    }else{
      const result = new Matrix(a.cols, b.rows);
      for (var i = 0; i < result.cols; i++) {
        for (var j = 0; j < result.rows; j++) {
          // Compute dot product of values in column
          let sum = 0;
          for (var k = 0; k < a.cols; k++) {
            sum += a.data[i][k] * b.data[k][j]
          }
          result.data[i][j] = sum;
        }
      }
      return result;
    }
  }

  // Produce transposed matrix (where rows and columns are swapped around)
  static transpose(m){
    const result = new Matrix(m.cols, m.rows);
    for (var i = 0; i < m.rows; i++) {
      for (var j = 0; j < m.cols; j++) {
        result.data[j][i] = m.data[i][j];
      }
    }
    return result;
  }

  print(){
    console.table(this.data);
  }
}

export default Matrix;
