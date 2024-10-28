import { Resampler } from 'https://your-github-repo-path/resampler.js';

export class CustomVAD {
    constructor(modelUrl) {
        this.modelUrl = modelUrl;
        this.session = null;
        this.stateTensor = null;
        this.resampler = null;
    }

    async initialize() {
        this.session = await ort.InferenceSession.create(this.modelUrl);
        this.stateTensor = new ort.Tensor('float32', new Float32Array(2 * 64).fill(0), [2, 1, 64]);
        this.resampler = new Resampler({
            nativeSampleRate: 44100, // Adjust based on input sample rate
            targetSampleRate: 16000,
            targetFrameSize: 1536,
        });
    }

    async start() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        await audioContext.audioWorklet.addModule('https://your-github-repo-path/audio-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

        source.connect(workletNode);

        workletNode.port.onmessage = async (event) => {
            const audioFrame = event.data;
            const vadResult = await this.runVAD(audioFrame);

            if (vadResult.isSpeech > 0.5) {
                document.getElementById('status').innerText = "Voice detected!";
            } else {
                document.getElementById('status').innerText = "Listening for voice...";
            }
        };
    }

    async runVAD(audioData) {
        const audioTensor = new ort.Tensor('float32', audioData, [1, audioData.length]);
        const srTensor = new ort.Tensor('int64', new BigInt64Array([16000n]), [1]);

        const results = await this.session.run({
            input: audioTensor,
            h: this.stateTensor,
            sr: srTensor,
        });

        this.stateTensor = results['hn'];
        const [isSpeech] = results['output'].data;
        return { isSpeech, notSpeech: 1 - isSpeech };
    }
}
