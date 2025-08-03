// Loading skeleton for interactive content
export function AboutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="mb-8 w-32 h-6 bg-zinc-800 rounded"></div>
      
      {/* Founders Section Skeleton */}
      <section className="mb-16">
        <div className="w-48 h-8 bg-zinc-800 rounded mb-8"></div>
        <div className="space-y-12">
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <div className="w-32 h-6 bg-zinc-800 rounded mb-4"></div>
            <div className="w-64 h-4 bg-zinc-800 rounded mb-2"></div>
            <div className="w-full h-16 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <div className="w-32 h-6 bg-zinc-800 rounded mb-4"></div>
            <div className="w-64 h-4 bg-zinc-800 rounded mb-2"></div>
            <div className="w-full h-16 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </section>
      
      {/* Features Skeleton */}
      <section className="mb-16">
        <div className="w-64 h-8 bg-zinc-800 rounded mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="w-48 h-6 bg-zinc-800 rounded mb-2"></div>
              <div className="w-full h-12 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}