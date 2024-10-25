class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
  
      if (input && input[0]) {
        const downsampledAudio = this.downsample(input[0], sampleRate, 16000);
        
        // Chunk the audio to match the model's expected size (192 samples)
        const chunkSize = 192;
        for (let i = 0; i < downsampledAudio.length; i += chunkSize) {
          const chunk = downsampledAudio.slice(i, i + chunkSize);
  
          // Ensure chunk matches model input size
          if (chunk.length === chunkSize) {
            this.port.postMessage(chunk);  // Send data back to main thread
          }
        }
      }
  
      return true;
    }
  
    downsample(buffer, inputSampleRate, outputSampleRate) {
      if (inputSampleRate === outputSampleRate) return buffer;
      const sampleRateRatio = inputSampleRate / outputSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
  
      for (let i = 0; i < newLength; i++) {
        result[i] = buffer[Math.round(i * sampleRateRatio)];
      }
  
      return result;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  
