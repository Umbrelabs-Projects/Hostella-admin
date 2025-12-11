import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton components for common use cases

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-8 flex-1 rounded" />
      <Skeleton className="h-8 w-24 rounded" />
      <Skeleton className="h-8 w-24 rounded" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="pt-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className="max-w-xs space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex justify-between items-center py-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex gap-4 items-center py-4">
      <Skeleton className="h-10 w-64 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export default Skeleton;
