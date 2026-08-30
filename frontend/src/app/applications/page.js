"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { formatDate, formatSalary, OFFER_TYPES } from "../../lib/constants";

function ApplicationsContent() {
  const { isRecruiter, isJobseeker } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const endpoint = isRecruiter ? "/applications/recruiter" : "/applications/me";
        const data = await api.get(endpoint + (filter ? `?status=${filter}` : ""));
        setApps(data.applications);
      } catch {} finally { setLoading(false); }
    })();
  }, [isRecruiter, isJobseeker, filter]);

  return (
    <div className="section py-10">
      <h1 className="text-3xl font-extrabold text-ink">
        {isRecruiter ? "Candidatures reçues" : "Mes candidatures"}
      </h1>
      <p className="mt-1 text-ink-muted">{apps.length} candidature{apps.length > 1 ? "s" : ""}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["", "pending", "reviewed", "accepted", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === st ? "bg-brand-600 text-white" : "bg-neutral-100 text-ink-muted hover:bg-neutral-200"
            }`}
          >
            {st === "" ? "Toutes" : (st === "pending" ? "En attente" : st === "reviewed" ? "Examinées" : st === "accepted" ? "Acceptées" : "Refusées")}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          [1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-50" />)
        ) : apps.length === 0 ? (
          <EmptyState
            title={isRecruiter ? "Aucune candidature reçue" : "Aucune candidature"}
            description={isRecruiter ? "Les candidatures à vos offres apparaîtront ici." : "Postulez à des offres pour les suivre ici."}
            action={!isRecruiter && <Link href="/offers" className="btn-primary">Explorer les offres</Link>}
          />
        ) : (
          apps.map((app) => {
            const offer = app.offer || {};
            const person = isRecruiter ? app.candidate : app.recruiter;
            return (
              <Link key={app._id} href={`/applications/${app._id}`} className="card-hover block p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 font-black text-brand-600">
                      {(isRecruiter ? (person?.firstName?.[0] || "C") : (offer.company?.[0] || "O"))}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">
                        {isRecruiter ? `${person?.firstName} ${person?.lastName}` : offer.title}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {isRecruiter ? `pour ${offer.title}` : `${offer.company} · ${offer.location || "—"}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-ink-muted">{formatDate(app.createdAt)}</span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <ProtectedRoute>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
