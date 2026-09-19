import { describe, expect, it } from "vitest";
import { concatFloat32, createVad, downsample, encodeWav, isWav, rms } from "./audio-utils";

describe("audio helpers", () => {
  it("rms của im lặng là 0 và của sóng vuông biên độ 0.5 là 0.5", () => {
    expect(rms(new Float32Array(100))).toBe(0);
    expect(rms(new Float32Array(100).fill(0.5))).toBeCloseTo(0.5, 5);
  });

  it("hạ tần số lấy mẫu giảm đúng số mẫu", () => {
    const out = downsample(new Float32Array(4800).fill(1), 48000, 16000);
    expect(out.length).toBe(1600);
    expect(out[10]).toBeCloseTo(1, 5);
  });

  it("gộp mảng", () => {
    expect(Array.from(concatFloat32([new Float32Array([1, 2]), new Float32Array([3])]))).toEqual([1, 2, 3]);
  });

  it("mã hóa WAV có header hợp lệ và đúng kích thước", () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1]), 16000);
    expect(wav.byteLength).toBe(44 + 8);
    const bytes = new Uint8Array(wav);
    expect(isWav(new Uint8Array([...bytes, ...new Array(40).fill(0)]))).toBe(true);
    const view = new DataView(wav);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getInt16(46, true)).toBe(Math.floor(0.5 * 0x7fff));
  });

  it("isWav từ chối dữ liệu lạ", () => {
    expect(isWav(new Uint8Array(100))).toBe(false);
  });
});

describe("createVad", () => {
  const FRAME = 85;
  function run(levels: number[], opts?: Parameters<typeof createVad>[0]) {
    const vad = createVad(opts);
    for (const l of levels) {
      const r = vad.push(l, FRAME);
      if (r !== "continue") return r;
    }
    return "continue";
  }
  const quiet = (ms: number) => Array(Math.ceil(ms / FRAME)).fill(0.004);
  const loud = (ms: number) => Array(Math.ceil(ms / FRAME)).fill(0.15);

  it("nói rồi im lặng ~1.4 giây thì kết thúc", () => {
    expect(run([...quiet(500), ...loud(1500), ...quiet(1600)])).toBe("finished");
  });

  it("chưa đủ im lặng thì vẫn tiếp tục nghe", () => {
    expect(run([...quiet(500), ...loud(1500), ...quiet(600)])).toBe("continue");
  });

  it("ngắt quãng ngắn giữa câu không bị coi là nói xong", () => {
    expect(run([...quiet(500), ...loud(800), ...quiet(500), ...loud(800), ...quiet(300)])).toBe("continue");
  });

  it("không nói gì thì báo no-speech", () => {
    expect(run(quiet(8000))).toBe("no-speech");
  });

  it("tiếng ồn nền ổn định không bị coi là tiếng nói", () => {
    expect(run(Array(100).fill(0.03))).not.toBe("finished");
  });

  it("nói quá dài thì tự dừng ở mức tối đa", () => {
    expect(run([...quiet(500), ...loud(30000)], { maxMs: 10000 })).toBe("finished");
  });
});
