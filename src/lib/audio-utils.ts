// Ham thuan cho ghi am giong noi (khong dung API trinh duyet) - de test duoc.

export function rms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

// Ha tan so lay mau (vd 48000 -> 16000) bang trung binh cac mau trong moi o - du cho nhan dang giong noi
export function downsample(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (outRate >= inRate) return input;
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

export function concatFloat32(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// WAV PCM 16-bit mono - dinh dang Gemini doc duoc chac chan
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function isWav(buf: Uint8Array): boolean {
  const ascii = (o: number, n: number) => String.fromCharCode(...buf.slice(o, o + n));
  return buf.length > 44 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE";
}

// ---- Phat hien "nguoi dung noi xong" (Voice Activity Detection) ----
// Doc do to (rms) theo tung khung ~85ms: hieu chinh tieng on nen 350ms dau, bat dau noi khi
// vuot nguong 2 khung lien tiep, ket thuc khi im lang du lau SAU KHI da noi.
export type VadResult = "continue" | "finished" | "no-speech";

export type Vad = { push: (level: number, frameMs: number) => VadResult; readonly speechStartedAtMs: number | null };

export function createVad(opts?: { calibrationMs?: number; silenceMs?: number; noSpeechMs?: number; maxMs?: number }): Vad {
  const calibrationMs = opts?.calibrationMs ?? 350;
  const silenceMs = opts?.silenceMs ?? 1400;
  const noSpeechMs = opts?.noSpeechMs ?? 7000;
  const maxMs = opts?.maxMs ?? 20000;

  let elapsed = 0;
  let noiseSum = 0;
  let noiseFrames = 0;
  let threshold = 0.02;
  let loudRun = 0;
  let speechStartedAt: number | null = null;
  let silentFor = 0;

  return {
    get speechStartedAtMs() {
      return speechStartedAt;
    },
    push(level, frameMs) {
      elapsed += frameMs;
      if (elapsed <= calibrationMs) {
        noiseSum += level;
        noiseFrames++;
        if (elapsed + frameMs > calibrationMs) threshold = Math.max(0.02, (noiseSum / Math.max(1, noiseFrames)) * 3);
        return "continue";
      }
      if (speechStartedAt === null) {
        loudRun = level > threshold ? loudRun + 1 : 0;
        if (loudRun >= 2) speechStartedAt = elapsed - frameMs * 2;
        else if (elapsed >= noSpeechMs) return "no-speech";
        return "continue";
      }
      silentFor = level < threshold * 0.7 ? silentFor + frameMs : 0;
      if (silentFor >= silenceMs || elapsed >= maxMs) return "finished";
      return "continue";
    },
  };
}
