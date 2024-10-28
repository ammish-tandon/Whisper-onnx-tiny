class CustomVAD {
    constructor(modelUrl) {
        this.modelUrl = modelUrl;
        this.session = null;
        this.stateTensor = null;
    }

    async initialize() {
        this.session = await ort.InferenceSession.create(this.modelUrl);
        this.resetState();
    }

    resetState() {
        const zeroes = new Float32Array(2 * 64).fill(0);
        this.stateTensor = {
            h: new ort.Tensor("float32", zeroes, [2, 1, 64]),
            c: new ort.Tensor("float32", zeroes, [2, 1, 64])
        };
    }

    async runVAD(audioFrame) {
        const audioTensor = new ort.Tensor("float32", audioFrame, [1, audioFrame.length]);
        const inputs = {
            input: audioTensor,
            h: this.stateTensor.h,
            c: this.stateTensor.c,
            sr: new ort.Tensor("int64", [16000n]),
        };
        const results = await this.session.run(inputs);
        this.stateTensor.h = results.hn;
        this.stateTensor.c = results.cn;
        const [isSpeech] = results.output.data;
        return isSpeech;
    }
}

window.CustomVAD = CustomVAD; // Make it globally accessible
