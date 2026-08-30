"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../lib/api";
import OfferCard from "../../components/OfferCard";
import EmptyState from "../../components/EmptyState";
import { OFFER_TYPES, CATEGORIES, EXPERIENCE_LEVELS } from "../../lib/constants";

export default function OffersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    remote: searchParams.get("remote") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    sort: searchParams.get("sort") || "createdAt",
    order: "desc",
  });

  const fetchOffers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      params.set("page", p);
      params.set("limit", 9);
      const data = await api.get(`/offers?${params.toString()}`);
      setOffers(data.offers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchOffers(1); }, [fetchOffers]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ q: "", type: "", category: "", location: "", remote: "", experienceLevel: "", sort: "createdAt", order: "desc" });
    router.push("/offers");
  };

  return (
    <div className="section py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Offres d'opportunités</h1>
        <p className="mt-2 text-ink-muted">{total} offre{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink">Filtres</h2>
              <button onClick={resetFilters} className="text-xs text-brand-600 hover:underline">Réinitialiser</button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Recherche</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    value={filters.q}
                    onChange={(e) => updateFilter("q", e.target.value)}
                    placeholder="Mots-clés…"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label">Type</label>
                <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)} className="input">
                  <option value="">Tous</option>
                  {OFFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Catégorie</label>
                <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} className="input">
                  <option value="">Toutes</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Lieu</label>
                <input type="text" value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} placeholder="Ville, pays…" className="input" />
              </div>

              <div>
                <label className="label">Niveau</label>
                <select value={filters.experienceLevel} onChange={(e) => updateFilter("experienceLevel", e.target.value)} className="input">
                  <option value="">Tous niveaux</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={filters.remote === "true"} onChange={(e) => updateFilter("remote", e.target.checked ? "true" : "")} className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-ink">Remote uniquement</span>
              </label>

              <div>
                <label className="label">Trier par</label>
                <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)} className="input">
                  <option value="createdAt">Plus récentes</option>
                  <option value="salary">Salaire</option>
                  <option value="views">Popularité</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Offers list */}
        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="card h-56 animate-pulse p-5">
                  <div className="h-4 w-24 rounded bg-neutral-100" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-neutral-100" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-neutral-100" />
                  <div className="mt-6 h-16 w-full rounded bg-neutral-50" />
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="Aucune offre trouvée"
              description="Essayez de modifier vos filtres ou élargissez votre recherche."
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {offers.map((o) => <OfferCard key={o._id} offer={o} />)}
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchOffers(page - 1)}
                    disabled={page <= 1}
                    className="btn-outline px-3 py-2"
                  >← Précédent</button>
                  <span className="px-4 text-sm font-medium text-ink-muted">Page {page} / {totalPages}</span>
                  <button
                    onClick={() => fetchOffers(page + 1)}
                    disabled={page >= totalPages}
                    className="btn-outline px-3 py-2"
                  >Suivant →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
