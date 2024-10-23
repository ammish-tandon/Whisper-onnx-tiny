class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs, outputs, parameters) {
      // Just forwarding the input to output for testing purposes
      if (inputs[0].length > 0) {
        this.port.postMessage(inputs[0][0]);
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  