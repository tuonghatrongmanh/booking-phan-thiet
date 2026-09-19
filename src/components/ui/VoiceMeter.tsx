// Vạch âm lượng nhỏ (5 thanh nhảy theo tiếng nói) - cho người dùng THẤY micro đang thu được tiếng.
export default function VoiceMeter({ level, className = "" }: { level: number; className?: string }) {
  const weights = [0.5, 0.85, 1, 0.75, 0.45];
  return (
    <span className={`inline-flex items-end gap-[2px] h-4 ${className}`} aria-hidden="true">
      {weights.map((w, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-current transition-[height] duration-100"
          style={{ height: `${Math.max(20, Math.min(100, level * w * 100 + 20))}%` }}
        />
      ))}
    </span>
  );
}
