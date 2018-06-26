class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];

    for (let i = 0; i < this.rows; i++) {
      this.data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  // Populate matrix with random values
  randomise(){
    for (let i = 0; i < this.rows; i++) {
      this.data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = Math.random() * 2 -1;
      }
    }
  }

  add(n){
    // If object to be added is a matrix
    if (n instanceof Matrix) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += n.data[i][j];
        }
      }
    }
    // If object to be added is a scalar
    else{
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
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
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n.data[i][j];
        }
      }
    }
    // If object to be multiplied is a scalar
    else{
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n;
        }
      }
    }
  }

  // Apply a function to every matrix element
  // Note: function argument must return result
  map(fn){
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const val = this.data[i][j];
        this.data[i][j] = fn(val);
      }
    }
  }

  // Return new matrix where a function is appllied to every matrix element
  // Note: function argument must return result
  static map(m, fn){
    const result = new Matrix(m.rows, m.cols);
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        const val = m.data[i][j];
        result.data[i][j] = fn(val);
      }
    }
    return result;    
  }

  // Takes an array and returns a matrix
  static fromArray(arr){
    const m = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      m.data[i][0] = arr[i];
    }
    return m;
  }

  // Returns an array from the current matrix
  toArray(){
    const arr = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }

  // Returns new matrix from a-b (element-wise)
  static subtract(a, b){
    const result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  // Produces matrix product based on two matricies
  // Note: number of columns in A must match number of rows in B
  static product(a, b){
    if (a.cols !== b.rows) {
      throw new Error('Columns in matrix A must match rows in matrix B');
    }else{
      const result = new Matrix(a.rows, b.cols);
      for (let i = 0; i < result.rows; i++) {
        for (let j = 0; j < result.cols; j++) {
          // Compute dot product of values in column
          let sum = 0;
          for (let k = 0; k < a.cols; k++) {
            sum += a.data[i][k] * b.data[k][j];
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
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
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
