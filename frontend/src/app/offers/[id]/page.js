"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import FileUpload from "../../../components/FileUpload";
import { OFFER_TYPES, CATEGORIES, EXPERIENCE_LEVELS, formatSalary, formatDate } from "../../../lib/constants";

export default function OfferDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isJobseeker } = useAuth();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: "", expectedSalary: "", availability: "Immédiate" });
  const [applying, setApplying] = useState(false);
  const [resume, setResume] = useState(
    user?.resumeUrl ? { url: user.resumeUrl, originalName: user.resumeName || "Mon CV enregistré" } : null
  );

  const savedResume = user?.resumeUrl
    ? { url: user.resumeUrl, originalName: user.resumeName || "Mon CV enregistré" }
    : null;
  const usingSavedResume = !!savedResume && resume?.url === savedResume.url;

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/offers/${id}`);
        setOffer(data.offer);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Pré-sélectionne le CV enregistré sur le profil dès qu'il est connu
  useEffect(() => {
    if (user?.resumeUrl && !resume) {
      setResume({ url: user.resumeUrl, originalName: user.resumeName || "Mon CV enregistré" });
    }
  }, [user?.resumeUrl, user?.resumeName]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await api.post("/applications", {
        offerId: offer._id,
        ...applyForm,
        resumeUrl: resume?.url || "",
        resumeName: resume?.originalName || "",
      });
      toast.success("Candidature envoyée !");
      setShowApply(false);
      router.push("/applications");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="section py-20">
        <div className="h-8 w-1/2 animate-pulse rounded bg-neutral-100" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
        <div className="mt-10 h-64 animate-pulse rounded-xl bg-neutral-50" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="section py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Offre introuvable</h1>
        <Link href="/offers" className="btn-primary mt-6">← Retour aux offres</Link>
      </div>
    );
  }

  const typeLabel = OFFER_TYPES.find((t) => t.value === offer.type)?.label;
  const catLabel = CATEGORIES.find((c) => c.value === offer.category)?.label;
  const levelLabel = EXPERIENCE_LEVELS.find((l) => l.value === offer.experienceLevel)?.label;
  const isOwner = user && offer.recruiter?._id === user.id;

  return (
    <div className="section py-10">
      <Link href="/offers" className="text-sm text-ink-muted hover:text-brand-600">← Toutes les offres</Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div>
          <div className="card p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-xl font-black text-brand-600">
                  {offer.company?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-ink">{offer.title}</h1>
                  <p className="text-ink-muted">{offer.company}</p>
                </div>
              </div>
              <span className="badge-dark">{typeLabel}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {offer.location && <span className="badge-neutral">📍 {offer.location}</span>}
              {offer.remote && <span className="badge-green">Remote</span>}
              {catLabel && <span className="badge-neutral">{catLabel}</span>}
              {levelLabel && <span className="badge-neutral">{levelLabel}</span>}
            </div>

            <div className="mt-7 border-t border-neutral-100 pt-6">
              <h2 className="text-lg font-bold text-ink">Description</h2>
              <p className="mt-3 whitespace-pre-line text-ink-soft">{offer.description}</p>
            </div>

            {offer.skills?.length > 0 && (
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <h2 className="text-lg font-bold text-ink">Compétences requises</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {offer.skills.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
          <div className="card p-6">
            <p className="text-sm text-ink-muted">Salaire</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{formatSalary(offer.salaryMin, offer.salaryMax, offer.currency)}</p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Publié le</span><span className="font-medium text-ink">{formatDate(offer.createdAt)}</span></div>
              {offer.deadline && <div className="flex justify-between"><span className="text-ink-muted">Date limite</span><span className="font-medium text-ink">{formatDate(offer.deadline)}</span></div>}
              <div className="flex justify-between"><span className="text-ink-muted">Vues</span><span className="font-medium text-ink">{offer.views}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Contact</span><span className="font-medium text-ink">{offer.contactEmail}</span></div>
            </div>

            <div className="mt-6 space-y-2">
              {isOwner ? (
                <>
                  <Link href={`/offers/${offer._id}/edit`} className="btn-dark w-full">Modifier l'offre</Link>
                  <Link href="/dashboard/recruiter" className="btn-outline w-full">Voir mes statistiques</Link>
                </>
              ) : isJobseeker ? (
                <button onClick={() => setShowApply(true)} className="btn-primary w-full">Postuler maintenant</button>
              ) : isAuthenticated ? (
                <p className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700">Compte recruteur — postulez avec un compte candidat</p>
              ) : (
                <>
                  <Link href="/login" className="btn-primary w-full">Connectez-vous pour postuler</Link>
                  <Link href="/register?role=jobseeker" className="btn-outline w-full">Créer un compte candidat</Link>
                </>
              )}
            </div>
          </div>

          {offer.recruiter && (
            <div className="card p-6">
              <p className="text-sm font-semibold text-ink">Recruteur</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {offer.recruiter.firstName?.[0]}{offer.recruiter.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{offer.recruiter.firstName} {offer.recruiter.lastName}</p>
                  <p className="text-xs text-ink-muted">{offer.recruiter.company}</p>
                </div>
              </div>
              {isAuthenticated && !isOwner && (
                <Link href={`/messages?to=${offer.recruiter._id}`} className="btn-outline mt-4 w-full">Contacter</Link>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Apply modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowApply(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">Postuler à {offer.title}</h2>
              <button onClick={() => setShowApply(false)} className="text-neutral-400 hover:text-ink">✕</button>
            </div>
            <form onSubmit={handleApply} className="mt-5 space-y-4">
              {/* CV */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Votre CV</p>
                    <p className="text-xs text-ink-muted">Optionnel, mais fortement recommandé</p>
                  </div>
                  <span className="badge-red">Recommandé</span>
                </div>

                <FileUpload
                  label=""
                  value={resume}
                  onUploaded={setResume}
                  onRemoved={() => setResume(null)}
                  className="bg-white"
                />

                {savedResume && !usingSavedResume && (
                  <button
                    type="button"
                    onClick={() => setResume(savedResume)}
                    className="btn-outline mt-3 w-full text-xs"
                  >
                    Utiliser mon CV enregistré ({savedResume.originalName})
                  </button>
                )}

                {!savedResume && !resume && (
                  <p className="mt-3 text-xs text-ink-muted">
                    Pas encore de CV ?{" "}
                    <Link href="/cv" className="link-brand">
                      Créer mon CV en ligne
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label className="label">Lettre de motivation</label>
                <textarea
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                  rows={5}
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal…"
                  className="input resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prétentions salariales (€)</label>
                  <input type="number" value={applyForm.expectedSalary} onChange={(e) => setApplyForm({ ...applyForm, expectedSalary: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Disponibilité</label>
                  <select value={applyForm.availability} onChange={(e) => setApplyForm({ ...applyForm, availability: e.target.value })} className="input">
                    <option>Immédiate</option>
                    <option>Sous 2 semaines</option>
                    <option>Sous 1 mois</option>
                    <option>Sous 3 mois</option>
                    <option>À définir</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApply(false)} className="btn-outline flex-1">Annuler</button>
                <button type="submit" disabled={applying} className="btn-primary flex-1">{applying ? "Envoi…" : "Envoyer ma candidature"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
