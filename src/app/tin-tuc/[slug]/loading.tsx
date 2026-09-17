import { PageSkeletonShell, Block } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <PageSkeletonShell>
      <div className="container-custom py-8">
        <Block className="w-full h-64 rounded-3xl mb-6" />
        <Block className="w-2/3 h-7 mb-3" />
        <Block className="w-1/3 h-4 mb-6" />
        <div className="space-y-3">
          <Block className="w-full h-4" />
          <Block className="w-full h-4" />
          <Block className="w-3/4 h-4" />
        </div>
      </div>
    </PageSkeletonShell>
  );
}
