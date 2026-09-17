"use client";

import { useEffect, useRef, useState } from "react";

type LogoItem = { id: string; name: string; image: string; href: string | null };

function BrandLogoImg({ logo, keyPrefix, onBroken }: { logo: LogoItem; keyPrefix: string; onBroken: (id: string) => void }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setBroken(true);
      onBroken(logo.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (broken) return null;

  const imgEl = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${keyPrefix}-${logo.id}`}
      ref={imgRef}
      src={logo.image}
      alt={logo.name}
      className="h-10 sm:h-12 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition shrink-0"
      onError={() => {
        setBroken(true);
        onBroken(logo.id);
      }}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) {
          setBroken(true);
          onBroken(logo.id);
        }
      }}
    />
  );

  if (logo.href) {
    return (
      <a href={logo.href} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {imgEl}
      </a>
    );
  }
  return imgEl;
}

export default function BrandMarquee({ logos }: { logos: LogoItem[] }) {
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

  const handleBroken = (id: string) => {
    setBrokenIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  if (brokenIds.size >= logos.length) return null;

  return (
    <section className="py-6">
      <div className="container-custom mb-4">
        <p className="text-center text-xs font-bold tracking-wide text-slate-400 uppercase">
          Được tin tưởng bởi
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex w-max animate-brand-marquee">
          <div className="flex items-center gap-12 pr-12 shrink-0">
            {logos.map((l) => (
              <BrandLogoImg key={l.id} logo={l} keyPrefix="a" onBroken={handleBroken} />
            ))}
          </div>
          <div className="flex items-center gap-12 pr-12 shrink-0" aria-hidden="true">
            {logos.map((l) => (
              <BrandLogoImg key={l.id} logo={l} keyPrefix="b" onBroken={handleBroken} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
