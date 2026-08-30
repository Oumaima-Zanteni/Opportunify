"use client";

/**
 * En-tête de dashboard : salutation, date du jour en français, actions.
 *
 * @param {string} eyebrow - petit label au-dessus du titre (ex : "Espace recruteur")
 * @param {React.ReactNode} title - titre principal (ex : "Bonjour Sarah 👋")
 * @param {string} subtitle - phrase d'accroche
 * @param {React.ReactNode} actions - boutons d'action principaux
 * @param {React.ReactNode} children - contenu additionnel (chips, résumé...)
 * @param {boolean} showDate - affiche la date du jour (défaut : true)
 */
export default function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  showDate = true,
  className = "",
}) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header
      className={`relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-card sm:p-8 ${className}`}
    >
      {/* halos décoratifs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="badge-red mb-3 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-ink-muted sm:text-base">{subtitle}</p>
          )}
          {showDate && (
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-ink-muted">
              <svg
                className="h-4 w-4 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="capitalize">{today}</span>
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div>
        )}
      </div>

      {children && <div className="relative mt-6">{children}</div>}
    </header>
  );
}
