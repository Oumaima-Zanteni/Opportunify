"use client";

/**
 * Barre de progression.
 *
 * @param {number} value - valeur courante
 * @param {number} max - valeur maximale (défaut 100)
 * @param {("brand"|"dark"|"green"|"amber"|"blue")} tone - couleur de la barre
 * @param {("sm"|"md"|"lg")} size - épaisseur
 * @param {string} label - libellé affiché au-dessus
 * @param {boolean} showValue - affiche "x%" (ou "x/max") à droite du libellé
 * @param {string} valueText - texte personnalisé à droite du libellé
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  tone = "brand",
  size = "md",
  label,
  showValue = false,
  valueText,
  className = "",
}) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  const tones = {
    brand: "bg-gradient-to-r from-brand-500 to-brand-600",
    dark: "bg-gradient-to-r from-ink-soft to-ink",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    amber: "bg-gradient-to-r from-amber-400 to-amber-500",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
  };
  const sizes = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className={className}>
      {(label || showValue || valueText) && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          {label && <span className="font-medium text-ink-muted">{label}</span>}
          {(showValue || valueText) && (
            <span className="font-bold text-ink">{valueText ?? `${pct}%`}</span>
          )}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-neutral-100 ${sizes[size] || sizes.md}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            tones[tone] || tones.brand
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
