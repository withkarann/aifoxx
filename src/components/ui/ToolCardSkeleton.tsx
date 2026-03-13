export function ToolCardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border-default rounded-[6px] p-4">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-bg-elevated animate-pulse" />
          <div className="h-4 w-28 rounded-[3px] bg-bg-elevated animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded-[3px] bg-bg-elevated animate-pulse" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded-[3px] bg-bg-elevated animate-pulse" />
        <div className="h-3 w-3/4 rounded-[3px] bg-bg-elevated animate-pulse" />
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-dim">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-[3px] bg-bg-elevated animate-pulse" />
          <div className="h-5 w-20 rounded-[3px] bg-bg-elevated animate-pulse" />
        </div>
        <div className="h-3 w-16 rounded-[3px] bg-bg-elevated animate-pulse" />
      </div>
    </div>
  );
}
