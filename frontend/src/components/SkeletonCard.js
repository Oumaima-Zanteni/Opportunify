"use client";

const SHIMMER =
  "animate-shimmer bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%]";

/**
 * Bloc de squelette basique.
 * @param {string} className - dimensions + arrondi (ex : "h-4 w-32 rounded")
 */
export function Skeleton({ className = "h-4 w-full rounded" }) {
  return <div className={`${SHIMMER} ${className}`} />;
}

/** Squelette d'une carte de stat (même forme que <StatCard />). */
export function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-8 w-16 rounded-lg" />
          <Skeleton className="mt-2 h-3 w-20 rounded-full" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

/** Grille de squelettes de stats. */
export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}

/** Squelette de graphique. */
export function SkeletonChart({ height = 260 }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="w-full">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="mt-2 h-3 w-24 rounded-full" />
        </div>
      </div>
      <div className="mt-6 flex items-end gap-3" style={{ height }}>
        {[55, 80, 40, 95, 65, 75, 50].map((h, i) => (
          <div key={i} className="flex-1" style={{ height: `${h}%` }}>
            <Skeleton className="h-full w-full rounded-t-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Squelette de liste de lignes (candidatures, offres...). */
export function SkeletonList({ rows = 4, avatar = true }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card"
        >
          {avatar && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
          <div className="w-full">
            <Skeleton className="h-4 w-1/3 rounded-full" />
            <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Squelette de tableau (desktop) / cartes (mobile). */
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
      <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3">
        <Skeleton className="h-3 w-32 rounded-full" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-full">
              <Skeleton className="h-4 w-1/3 rounded-full" />
              <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="hidden h-6 w-20 shrink-0 rounded-full sm:block" />
            <Skeleton className="hidden h-4 w-10 shrink-0 rounded-full md:block" />
            <Skeleton className="h-4 w-16 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Squelette d'en-tête de dashboard. */
export function SkeletonHeader() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card sm:p-8">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="mt-4 h-9 w-64 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-80 rounded-full" />
      <Skeleton className="mt-4 h-3 w-48 rounded-full" />
    </div>
  );
}

/**
 * Squelette complet d'un dashboard (en-tête + stats + graphiques + liste).
 * @param {number} stats - nombre de cartes de stats
 * @param {number} charts - nombre de graphiques
 */
export default function SkeletonCard({ stats = 4, charts = 2, list = 4 }) {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      <SkeletonStatGrid count={stats} />
      {charts > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: charts }).map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>
      )}
      {list > 0 && <SkeletonList rows={list} />}
    </div>
  );
}
