import { ReactNode } from "react";

function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200/70 rounded-xl ${className}`} />;
}

function HeaderSkeleton() {
  return (
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
  );
}

export function PageSkeletonShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <HeaderSkeleton />
      {children}
    </div>
  );
}

export { Block };
