"use client";

import Link from "next/link";

/**
 * Carte de statistique du dashboard.
 *
 * @param {string} label - libellé de la stat
 * @param {number|string} value - valeur affichée
 * @param {React.ReactNode} icon - icône (emoji ou svg)
 * @param {("default"|"red"|"green"|"amber"|"blue"|"dark")} accent - couleur de l'icône
 * @param {string} hint - petite précision sous la valeur
 * @param {number} trend - variation en % (positive ou négative)
 * @param {string} trendLabel - libellé de la variation
 * @param {string} href - si fourni, la carte devient un lien
 */
export default function StatCard({
  label,
  value,
  icon,
  accent = "default",
  hint,
  trend,
  trendLabel,
  href,
  className = "",
}) {
  const accents = {
    default: {
      tile: "bg-neutral-100 text-ink",
      glow: "from-neutral-200/60",
      bar: "bg-ink",
    },
    red: {
      tile: "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25",
      glow: "from-brand-100",
      bar: "bg-brand-500",
    },
    green: {
      tile: "bg-green-50 text-green-700 ring-1 ring-green-100",
      glow: "from-green-100",
      bar: "bg-green-500",
    },
    amber: {
      tile: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      glow: "from-amber-100",
      bar: "bg-amber-500",
    },
    blue: {
      tile: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      glow: "from-blue-100",
      bar: "bg-blue-500",
    },
    dark: {
      tile: "bg-ink text-white shadow-lg shadow-black/20",
      glow: "from-neutral-200",
      bar: "bg-ink",
    },
  };
  const a = accents[accent] || accents.default;

  const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
  const positive = hasTrend && trend >= 0;

  const content = (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-cardHover ${className}`}
    >
      {/* halo décoratif */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${a.glow} to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-[2rem]">
            {value ?? 0}
          </p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-300 group-hover:scale-110 ${a.tile}`}
          >
            {icon}
          </div>
        )}
      </div>

      {hasTrend && (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 ${
              positive ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"
            }`}
          >
            {positive ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="font-normal text-ink-muted">{trendLabel}</span>}
        </div>
      )}

      {/* liseré bas au survol */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-0 ${a.bar} transition-all duration-500 group-hover:w-full`}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
