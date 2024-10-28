class CustomVAD {
    constructor(modelUrl) {
        this.modelUrl = modelUrl;
        this.session = null;
        this.stateTensor = null;
        this.sampleRate = 16000;
    }

    async initialize() {
        this.session = await ort.InferenceSession.create(this.modelUrl);
        this.stateTensor = new ort.Tensor('float32', new Float32Array(256).fill(0), [2, 1, 64]);
    }

    async start() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        await audioContext.audioWorklet.addModule('audio-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

        workletNode.port.onmessage = async (event) => {
            const audioData = event.data;
            const vadResult = await this.runVAD(audioData);
            if (vadResult[0] > 0.5) {
                document.getElementById('status').innerText = "Voice detected!";
            } else {
                document.getElementById('status').innerText = "Listening for voice...";
            }
        };

        source.connect(workletNode);
    }

    async runVAD(audioData) {
        const audioTensor = new ort.Tensor('float32', audioData, [1, audioData.length]);
        const srTensor = new ort.Tensor('int64', BigInt(this.sampleRate), [1]);

        const results = await this.session.run({
            input: audioTensor,
            h: this.stateTensor,
            c: this.stateTensor,
            sr: srTensor,
        });

        this.stateTensor = results['hn'];
        return results['output'].data;
    }
}
