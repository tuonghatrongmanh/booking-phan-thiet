// Dung chung cho moi o nhap co gioi han ky tu SEO (title/description...) - doi mau
// theo % da dung de canh bao truoc khi vuot qua nguong Google thuong cat ngan.
export default function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len === 0 ? "text-slate-400" : len > max ? "text-brand-red" : len > max * 0.9 ? "text-amber-500" : "text-brand-green";
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {len}/{max}
    </span>
  );
}
