import Matrix from '../3rd_party/transformation-matrix';

class CVContextData {
  constructor() {
    this.saved = [];
    this.cArrPos = 0;
    this.cTr = new Matrix();
    this.cO = 1;
    let i;
    let len = 15;
    this.savedOp = new Float32Array(len);
    for (i = 0; i < len; i += 1) {
      this.saved[i] = new Float32Array(16);
    }
    this._length = len;
  }

  duplicate() {
    let newLength = this._length * 2;
    let currentSavedOp = this.savedOp;
    this.savedOp = new Float32Array(newLength);
    this.savedOp.set(currentSavedOp);
    let i = 0;
    for (i = this._length; i < newLength; i += 1) {
      this.saved[i] = new Float32Array(16);
    }
    this._length = newLength;
  }

  reset() {
    this.cArrPos = 0;
    this.cTr.reset();
    this.cO = 1;
  }
}


export default CVContextData;
