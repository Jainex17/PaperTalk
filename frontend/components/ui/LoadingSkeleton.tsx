'use client';

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="bg-card rounded-2xl p-6 border border-border h-48 animate-pulse"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="w-8 h-8 bg-secondary rounded-md mb-3"></div>
          <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="mt-auto pt-8">
            <div className="h-3 bg-secondary rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </>
  );
}
