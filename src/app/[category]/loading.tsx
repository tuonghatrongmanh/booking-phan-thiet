import { PageSkeletonShell, Block } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <PageSkeletonShell>
      <div className="container-custom py-8">
        <Block className="w-56 h-7 mb-2" />
        <Block className="w-80 h-4 mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Block key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  );
}
