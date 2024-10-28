export class Resampler {
    constructor({ nativeSampleRate, targetSampleRate, targetFrameSize }) {
        this.nativeSampleRate = nativeSampleRate;
        this.targetSampleRate = targetSampleRate;
        this.targetFrameSize = targetFrameSize;
        this.inputBuffer = [];
    }

    process(audioFrame) {
        const outputFrames = [];
        for (const sample of audioFrame) {
            this.inputBuffer.push(sample);
        }

        while ((this.inputBuffer.length * this.targetSampleRate) / this.nativeSampleRate > this.targetFrameSize) {
            const outputFrame = new Float32Array(this.targetFrameSize);
            let outputIndex = 0;
            let inputIndex = 0;
            while (outputIndex < this.targetFrameSize) {
                let sum = 0;
                let num = 0;
                while (
                    inputIndex <
                    Math.min(
                        this.inputBuffer.length,
                        ((outputIndex + 1) * this.nativeSampleRate) / this.targetSampleRate
                    )
                ) {
                    sum += this.inputBuffer[inputIndex];
                    num++;
                    inputIndex++;
                }
                outputFrame[outputIndex] = sum / num;
                outputIndex++;
            }
            this.inputBuffer = this.inputBuffer.slice(inputIndex);
            outputFrames.push(outputFrame);
        }
        return outputFrames;
    }
}
