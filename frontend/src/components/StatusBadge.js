"use client";

import { APPLICATION_STATUS } from "../lib/constants";

/**
 * Badge de statut de candidature.
 *
 * @param {string} status - clé de APPLICATION_STATUS
 * @param {boolean} dot - affiche une pastille de couleur (défaut : true)
 * @param {string} className - classes additionnelles
 */
export default function StatusBadge({ status, dot = true, className = "" }) {
  const cfg = APPLICATION_STATUS[status] || { label: status, color: "neutral" };
  const colorClass =
    {
      amber: "badge-amber",
      red: "badge-red",
      green: "badge-green",
      blue: "badge bg-blue-50 text-blue-700",
      neutral: "badge-neutral",
    }[cfg.color] || "badge-neutral";

  const dotClass =
    {
      amber: "bg-amber-500",
      red: "bg-brand-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      neutral: "bg-neutral-400",
    }[cfg.color] || "bg-neutral-400";

  return (
    <span className={`${colorClass} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />}
      {cfg.label}
    </span>
  );
}
