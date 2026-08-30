"use client";

/**
 * Palette de la charte pour les graphiques recharts.
 */
export const CHART_COLORS = {
  brand: "#bf0808",
  brandDeep: "#910d0d",
  brandSoft: "#ec9494",
  ink: "#000000",
  inkMuted: "#474747",
  grid: "#ededed",
  pending: "#f59e0b",
  reviewed: "#3b82f6",
  accepted: "#16a34a",
  rejected: "#bf0808",
  withdrawn: "#474747",
};

/** Couleur de la pastille du tooltip (ignore les fills en dégradé "url(#...)"). */
function dotColor(p) {
  const candidates = [p?.payload?.color, p?.color, p?.payload?.fill];
  for (const c of candidates) {
    if (typeof c === "string" && c && !c.startsWith("url(")) return c;
  }
  return CHART_COLORS.brand;
}

/**
 * Tooltip recharts personnalisé (fond ink, texte blanc, coins arrondis).
 *
 * @param {string} suffix - suffixe ajouté après la valeur (ex : "candidatures")
 */
export function ChartTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl bg-ink px-3.5 py-2.5 text-xs text-white shadow-xl">
      {label !== undefined && label !== null && label !== "" && (
        <p className="mb-1 font-semibold text-white">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: dotColor(p) }} />
            <span className="text-neutral-300">{p.name}</span>
            <span className="ml-auto font-bold text-white">
              {p.value}
              {suffix ? ` ${suffix}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Légende horizontale personnalisée (pas celle par défaut de recharts).
 *
 * @param {Array<{name: string, value: number, color: string}>} items
 */
export function ChartLegend({ items = [], total }) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.name} className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
          <span className="truncate text-ink-muted">{it.name}</span>
          <span className="ml-auto font-bold text-ink">
            {it.value}
            {total ? (
              <span className="ml-1 font-normal text-ink-muted">
                ({Math.round((it.value / total) * 100)}%)
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Conteneur de graphique avec titre, sous-titre, action et état vide intégré.
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {React.ReactNode} icon
 * @param {React.ReactNode} action - lien / bouton en haut à droite
 * @param {boolean} isEmpty - affiche le message "pas encore de données"
 * @param {string} emptyText
 * @param {string} className
 */
export default function ChartCard({
  title,
  subtitle,
  icon,
  action,
  isEmpty = false,
  emptyText = "Pas encore de données à afficher",
  children,
  className = "",
}) {
  return (
    <section
      className={`group rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition-all duration-300 hover:shadow-cardHover sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-base text-brand-600">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>

      <div className="mt-5">
        {isEmpty ? (
          <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center">
            <span className="text-2xl">📊</span>
            <p className="mt-2 max-w-[15rem] text-sm text-ink-muted">{emptyText}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
