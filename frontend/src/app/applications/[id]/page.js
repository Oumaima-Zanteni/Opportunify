"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, fileUrl } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import StatusBadge from "../../../components/StatusBadge";
import { APPLICATION_STATUS, STATUS_LIST, formatDate, formatSalary } from "../../../lib/constants";

function ApplicationDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isRecruiter } = useAuth();
  const [app, setApp] = useState(null);
  const [onlineResume, setOnlineResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/applications/${id}`);
        setApp(data.application);
        setNote(data.application.recruiterNote || "");
        // Recruteur : récupère aussi le CV en ligne du candidat (Route /api/resume/user/:userId)
        if (data.application.recruiter?._id === user?.id) {
          try {
            const resumeData = await api.get(`/resume/user/${data.application.candidate._id}`);
            setOnlineResume(resumeData.resume);
          } catch { /* pas de CV en ligne */ }
        }
      } catch (err) {
        toast.error(err.message);
      } finally { setLoading(false); }
    })();
  }, [id, user?.id]);

  const updateStatus = async (status) => {
    try {
      const data = await api.patch(`/applications/${id}/status`, { status, recruiterNote: note });
      setApp(data.application);
      toast.success(`Statut mis à jour : ${APPLICATION_STATUS[status].label}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveNote = async () => {
    try {
      const data = await api.patch(`/applications/${id}/status`, { status: app.status, recruiterNote: note });
      setApp(data.application);
      toast.success("Note enregistrée");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const withdraw = async () => {
    if (!confirm("Retirer cette candidature ?")) return;
    try {
      const data = await api.patch(`/applications/${id}/status`, { status: "withdrawn" });
      setApp(data.application);
      toast.success("Candidature retirée");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="section py-20"><div className="h-8 w-1/2 animate-pulse rounded bg-neutral-100" /></div>;
  if (!app) return <div className="section py-20 text-center"><h1 className="text-2xl font-bold">Candidature introuvable</h1><Link href="/applications" className="btn-primary mt-6">← Retour</Link></div>;

  const offer = app.offer || {};
  const candidate = app.candidate || {};
  const recruiter = app.recruiter || {};
  const canManage = isRecruiter && recruiter._id === user?.id;
  const isOwner = candidate._id === user?.id;

  return (
    <div className="section py-10 max-w-4xl">
      <Link href="/applications" className="text-sm text-ink-muted hover:text-brand-600">← Retour</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Offer summary */}
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/offers/${offer._id}`} className="text-xl font-extrabold text-ink hover:text-brand-600">{offer.title}</Link>
                <p className="text-ink-muted">{offer.company} · {offer.location}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            {offer.description && <p className="mt-4 line-clamp-3 text-sm text-ink-muted">{offer.description}</p>}
          </div>

          {/* Cover letter */}
          {app.coverLetter && (
            <div className="card p-6">
              <h2 className="font-bold text-ink">Lettre de motivation</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">{app.coverLetter}</p>
            </div>
          )}

          {/* CV du candidat (recruteur) */}
          {canManage && (
            <div className="card p-6">
              <h2 className="font-bold text-ink">CV du candidat</h2>
              {app.resumeUrl ? (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white">
                    {(app.resumeUrl.split(".").pop() || "cv").toUpperCase().slice(0, 4)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {app.resumeName || `CV de ${candidate.firstName} ${candidate.lastName}`}
                    </p>
                    <p className="text-xs text-ink-muted">Transmis le {formatDate(app.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={fileUrl(app.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      Ouvrir
                    </a>
                    <a
                      href={fileUrl(app.resumeUrl)}
                      download={app.resumeName || undefined}
                      className="btn-primary"
                    >
                      Télécharger
                    </a>
                  </div>
                </div>
              ) : onlineResume ? (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white">
                    CV
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      Le candidat a un CV en ligne sur Opportunify
                    </p>
                    <p className="text-xs text-ink-muted">
                      Demandez-lui de le joindre à sa candidature, ou échangez par message.
                    </p>
                  </div>
                  <Link
                    href={`/messages?to=${candidate._id}&application=${app._id}`}
                    className="btn-primary"
                  >
                    Contacter
                  </Link>
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-ink-muted">
                  Le candidat n'a pas joint de CV à cette candidature.
                </p>
              )}
            </div>
          )}

          {/* Candidate info (for recruiter) */}
          {canManage && (
            <div className="card p-6">
              <h2 className="font-bold text-ink">Profil du candidat</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink">{candidate.firstName} {candidate.lastName}</p>
                  <p className="text-sm text-ink-muted">{candidate.title} · {candidate.location}</p>
                </div>
              </div>
              {candidate.bio && <p className="mt-3 text-sm text-ink-muted">{candidate.bio}</p>}
              {candidate.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Link href={`/messages?to=${candidate._id}&application=${app._id}`} className="btn-outline">Contacter</Link>
                <a href={`mailto:${candidate.email || ""}`} className="btn-ghost">Email</a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-ink">Détails</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Postulé le</span><span className="font-medium">{formatDate(app.createdAt)}</span></div>
              {app.expectedSalary > 0 && <div className="flex justify-between"><span className="text-ink-muted">Prétentions</span><span className="font-medium">{formatSalary(app.expectedSalary, 0, "EUR")}</span></div>}
              {app.availability && <div className="flex justify-between"><span className="text-ink-muted">Disponibilité</span><span className="font-medium">{app.availability}</span></div>}
            </div>
          </div>

          {/* Recruiter actions */}
          {canManage && (
            <div className="card p-6">
              <h3 className="font-bold text-ink">Actions</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {STATUS_LIST.filter((s) => s !== "withdrawn").map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatus(st)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      app.status === st ? "bg-brand-600 text-white" : "bg-neutral-100 text-ink-muted hover:bg-neutral-200"
                    }`}
                  >
                    {APPLICATION_STATUS[st].label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="label">Note interne</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input resize-none" placeholder="Note sur ce candidat…" />
                <button onClick={saveNote} className="btn-outline mt-2 w-full">Enregistrer la note</button>
              </div>
            </div>
          )}

          {/* Candidate actions */}
          {isOwner && app.status !== "withdrawn" && (
            <div className="card p-6">
              <h3 className="font-bold text-ink">Actions</h3>
              <button onClick={withdraw} className="btn-danger mt-3 w-full">Retirer ma candidature</button>
              <Link href={`/messages?to=${recruiter._id}&application=${app._id}`} className="btn-outline mt-2 w-full">Contacter le recruteur</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <ProtectedRoute>
      <ApplicationDetailContent />
    </ProtectedRoute>
  );
}
