import Link from "next/link";
import { OFFER_TYPES, EXPERIENCE_LEVELS, formatSalary, timeAgo } from "../lib/constants";

const typeColors = {
  emploi: "badge-dark",
  stage: "badge-red",
  alternance: "badge-amber",
  freelance: "badge-neutral",
};

const levelLabels = Object.fromEntries(EXPERIENCE_LEVELS.map((l) => [l.value, l.label]));

export default function OfferCard({ offer }) {
  const typeLabel = OFFER_TYPES.find((t) => t.value === offer.type)?.label || offer.type;

  return (
    <Link href={`/offers/${offer._id}`} className="card-hover group block overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg font-black text-brand-600">
            {offer.company?.[0]?.toUpperCase() || "O"}
          </div>
          <div>
            <h3 className="line-clamp-1 font-bold text-ink group-hover:text-brand-600">{offer.title}</h3>
            <p className="text-sm text-ink-muted">{offer.company}</p>
          </div>
        </div>
        <span className={typeColors[offer.type] || "badge-neutral"}>{typeLabel}</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{offer.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {offer.location && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {offer.location}
          </span>
        )}
        {offer.remote && <span className="badge-green">Remote</span>}
        {offer.experienceLevel && <span className="badge-neutral">{levelLabels[offer.experienceLevel]}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-semibold text-ink">{formatSalary(offer.salaryMin, offer.salaryMax, offer.currency)}</span>
        <span className="text-xs text-ink-muted">{timeAgo(offer.createdAt)}</span>
      </div>
    </Link>
  );
}
