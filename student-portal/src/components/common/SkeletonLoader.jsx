export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />
);

export const SkeletonCard = () => (
  <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
    <SkeletonBox className="h-40 w-full rounded-xl" />
    <SkeletonBox className="h-6 w-3/4" />
    <SkeletonBox className="h-4 w-1/2" />
    <SkeletonBox className="h-2.5 w-full mt-4" />
    <SkeletonBox className="h-10 w-full rounded-xl mt-2" />
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-5 rounded-2xl glass-panel space-y-3">
        <SkeletonBox className="h-8 w-8 rounded-lg" />
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-7 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonList = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 rounded-xl glass-panel flex items-center justify-between">
        <div className="space-y-2 flex-1 pr-4">
          <SkeletonBox className="h-5 w-1/3" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
        <SkeletonBox className="h-8 w-20 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

export const SkeletonPage = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonBox className="h-32 w-full rounded-2xl" />
    <SkeletonStats />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export default SkeletonPage;
