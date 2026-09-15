function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200/70 rounded-xl ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* header */}
      <div className="bg-navbar-gradient h-[82px] flex items-center">
        <div className="container-custom flex items-center justify-between w-full">
          <Block className="w-20 h-14 bg-white/20" />
          <div className="hidden lg:flex gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Block key={i} className="w-16 h-4 bg-white/20" />
            ))}
          </div>
          <Block className="w-10 h-10 rounded-full bg-white/20" />
        </div>
      </div>

      {/* hero */}
      <div className="container-custom pt-8 pb-10">
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 mb-8">
          <div className="space-y-4">
            <Block className="w-2/3 h-6" />
            <Block className="w-full h-10" />
            <Block className="w-1/2 h-6" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Block key={i} className="w-28 h-9 rounded-full" />
              ))}
            </div>
          </div>
          <Block className="w-full h-56 rounded-[28px]" />
        </div>

        <Block className="w-full h-24 rounded-[28px] mb-8" />

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Block key={i} className="aspect-[4/3]" />
          ))}
        </div>
      </div>

      {/* generic content rows */}
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row} className="container-custom py-8">
          <Block className="w-64 h-6 mb-2" />
          <Block className="w-96 h-4 mb-5" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Block key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
