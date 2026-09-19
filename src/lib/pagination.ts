// Day so trang gon: 1 ... 4 5 6 ... 12 ("gap" = dau ba cham)
export function pageNumbers(current: number, total: number): (number | "gap")[] {
  const out: (number | "gap")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) out.push(p);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
}
