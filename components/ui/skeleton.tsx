export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} style={style} />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-slate-200/70" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-slate-200/70" />
            <div className="h-2 w-1/4 rounded bg-slate-200/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
