"use client";

/**
 * État vide générique.
 *
 * @param {React.ReactNode} icon - icône affichée dans le cercle (défaut : loupe)
 * @param {string} title - titre
 * @param {string} description - texte explicatif
 * @param {React.ReactNode} action - bouton / lien d'action
 * @param {boolean} compact - version resserrée (padding réduit)
 * @param {string} className - classes additionnelles
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-gradient-to-b from-neutral-50 to-white text-center ${
        compact ? "px-5 py-10" : "px-6 py-14 sm:py-16"
      } ${className}`}
    >
      {/* halo décoratif */}
      <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-100/50 blur-2xl" />

      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-brand-600 shadow-card ring-1 ring-brand-100">
        {icon || (
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        )}
      </div>

      <h3 className="relative text-base font-bold text-ink sm:text-lg">{title}</h3>
      {description && (
        <p className="relative mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
