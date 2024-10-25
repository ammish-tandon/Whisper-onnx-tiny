class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

      if (input && input[0]) {
          const downsampledAudio = this.downsample(input[0], sampleRate, 16000);  // Downsample to 16kHz
          this.port.postMessage(downsampledAudio);  // Send data back to main thread
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
