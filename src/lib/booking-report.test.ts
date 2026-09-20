import { describe, expect, it } from "vitest";
import { buildRevenueSeries, csvEscape, daysBetween, occupancyForMonth, toCsv } from "./booking-report";

describe("daysBetween", () => {
  it("gồm cả 2 đầu và đi qua cuối tháng/năm", () => {
    expect(daysBetween("2026-12-30", "2027-01-02")).toEqual(["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
  });
});

describe("buildRevenueSeries", () => {
  it("cộng tiền cọc theo ngày giờ Việt Nam (23h VN vẫn tính ngày đó)", () => {
    // 2026-09-20T16:30Z = 23:30 ngày 20/9 giờ VN
    const s = buildRevenueSeries([{ paidAt: new Date("2026-09-20T16:30:00Z"), amount: 100000 }], [{ paidAt: new Date("2026-09-21T02:00:00Z"), amount: 50000 }], "2026-09-19", "2026-09-21");
    expect(s.map((p) => [p.key, p.stay, p.rental])).toEqual([
      ["2026-09-19", 0, 0],
      ["2026-09-20", 100000, 0],
      ["2026-09-21", 0, 50000],
    ]);
  });

  it("kỳ dài hơn 62 ngày gom theo tháng; bỏ qua đơn chưa nhận cọc", () => {
    const s = buildRevenueSeries([{ paidAt: null, amount: 100000 }, { paidAt: new Date("2026-02-10T05:00:00Z"), amount: 200000 }], [], "2026-01-01", "2026-04-30");
    expect(s.map((p) => p.key)).toEqual(["2026-01", "2026-02", "2026-03", "2026-04"]);
    expect(s[1].stay).toBe(200000);
    expect(s[0].stay).toBe(0);
  });
});

describe("occupancyForMonth", () => {
  const days = daysBetween("2026-09-01", "2026-09-30");
  it("homestay: ngày trả phòng đã trống", () => {
    const occ = occupancyForMonth([{ start: new Date("2026-09-10T00:00:00Z"), end: new Date("2026-09-12T00:00:00Z"), quantity: 2 }], days, "stay");
    expect(occ[8]).toBe(0);
    expect(occ[9]).toBe(2);
    expect(occ[10]).toBe(2);
    expect(occ[11]).toBe(0);
  });
  it("thuê xe: tính cả ngày nhận và ngày trả, cộng dồn số xe", () => {
    const occ = occupancyForMonth(
      [
        { start: new Date("2026-09-10T00:00:00Z"), end: new Date("2026-09-12T00:00:00Z"), quantity: 1 },
        { start: new Date("2026-09-12T00:00:00Z"), end: new Date("2026-09-12T00:00:00Z"), quantity: 2 },
      ],
      days,
      "car"
    );
    expect(occ[11]).toBe(3);
    expect(occ[12]).toBe(0);
  });
});

describe("csv", () => {
  it("escape dấu phẩy, ngoặc kép, xuống dòng", () => {
    expect(csvEscape('Nguyễn "A", B')).toBe('"Nguyễn ""A"", B"');
    expect(csvEscape("dòng1\ndòng2")).toBe('"dòng1\ndòng2"');
  });
  it("chặn CSV injection từ tên khách do người lạ nhập", () => {
    expect(csvEscape("=HYPERLINK(\"http://x\")")).toBe("\"'=HYPERLINK(\"\"http://x\"\")\"");
    expect(csvEscape("+84901234567")).toBe("'+84901234567");
    expect(csvEscape("@cmd")).toBe("'@cmd");
  });
  it("toCsv ghép tiêu đề và dòng, null thành rỗng", () => {
    expect(toCsv(["a", "b"], [[1, null], ["x", "y"]])).toBe("a,b\r\n1,\r\nx,y");
  });
});
