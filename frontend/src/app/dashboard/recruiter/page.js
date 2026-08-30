"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../../lib/api";
import ProtectedRoute from "../../../components/ProtectedRoute";
import StatCard from "../../../components/StatCard";
import StatusBadge from "../../../components/StatusBadge";
import EmptyState from "../../../components/EmptyState";
import DashboardHeader from "../../../components/DashboardHeader";
import ChartCard, { CHART_COLORS, ChartLegend, ChartTooltip } from "../../../components/ChartCard";
import ProgressBar from "../../../components/ProgressBar";
import Reveal from "../../../components/Reveal";
import {
  SkeletonChart,
  SkeletonHeader,
  SkeletonList,
  SkeletonStatGrid,
  SkeletonTable,
} from "../../../components/SkeletonCard";
import { useAuth } from "../../../context/AuthContext";
import {
  APPLICATION_STATUS,
  STATUS_LIST,
  formatDate,
  initials,
  timeAgo,
} from "../../../lib/constants";

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function monthLabel(id) {
  if (!id || typeof id !== "string") return id || "";
  const [year, month] = id.split("-");
  const idx = parseInt(month, 10) - 1;
  if (Number.isNaN(idx) || !MONTHS_SHORT[idx]) return id;
  return `${MONTHS_SHORT[idx]} ${String(year).slice(2)}`;
}

const OFFER_STATUS = {
  active: { label: "Active", className: "badge-green", dot: "bg-green-500" },
  draft: { label: "Brouillon", className: "badge-amber", dot: "bg-amber-500" },
  closed: { label: "Fermée", className: "badge-neutral", dot: "bg-neutral-400" },
};

function RecruiterDashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get("/dashboard/recruiter");
        setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const s = data?.stats || {};
  const byStatus = data?.applicationsByStatus || {};

  const statusData = useMemo(
    () =>
      STATUS_LIST.filter((k) => (byStatus[k] || 0) > 0).map((k) => ({
        key: k,
        name: APPLICATION_STATUS[k]?.label || k,
        value: byStatus[k],
        color: CHART_COLORS[k] || CHART_COLORS.inkMuted,
      })),
    [byStatus]
  );
  const statusTotal = statusData.reduce((acc, d) => acc + d.value, 0);

  const monthData = useMemo(
    () =>
      (data?.applicationsByMonth || []).map((m) => ({
        month: monthLabel(m._id),
        candidatures: m.count,
      })),
    [data]
  );

  const viewsData = useMemo(
    () =>
      (data?.viewsByOffer || [])
        .filter((o) => (o.views || 0) > 0)
        .map((o) => ({
          name: o.title?.length > 22 ? `${o.title.slice(0, 22)}…` : o.title,
          vues: o.views,
        })),
    [data]
  );

  if (loading) {
    return (
      <div className="bg-neutral-50">
        <div className="section space-y-8 py-8 sm:py-10">
          <SkeletonHeader />
          <SkeletonStatGrid count={4} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SkeletonChart />
            </div>
            <SkeletonChart />
          </div>
          <SkeletonList rows={4} />
          <SkeletonTable rows={4} />
        </div>
      </div>
    );
  }

  const totalApps = s.totalApplications || 0;
  const conversion =
    s.totalViews > 0 ? Math.round((totalApps / s.totalViews) * 100) : 0;

  return (
    <div className="bg-neutral-50">
      <div className="section space-y-8 py-8 sm:py-10">
        {/* ===================== EN-TÊTE ===================== */}
        <Reveal>
          <DashboardHeader
            eyebrow="Espace recruteur"
            title={
              <>
                Bonjour {user?.firstName || "à vous"}{" "}
                <span className="inline-block animate-bounce-slow">👋</span>
              </>
            }
            subtitle="Voici la vue d'ensemble de vos offres, de vos candidatures et de votre visibilité."
            actions={
              <>
                <Link href="/applications" className="btn-outline">
                  Voir les candidatures
                </Link>
                <Link href="/offers/new" className="btn-primary">
                  + Publier une offre
                </Link>
              </>
            }
          >
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {s.activeOffers || 0} offre{(s.activeOffers || 0) > 1 ? "s" : ""} active
                {(s.activeOffers || 0) > 1 ? "s" : ""}
              </span>
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {s.pendingApplications || 0} candidature
                {(s.pendingApplications || 0) > 1 ? "s" : ""} à traiter
              </span>
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {conversion}% de taux de conversion
              </span>
            </div>
          </DashboardHeader>
        </Reveal>

        {/* ===================== STATS ===================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Offres publiées", value: s.totalOffers, accent: "dark", icon: "📋", hint: `${s.activeOffers || 0} en ligne`, href: "/offers?recruiter=me" },
            { label: "Offres actives", value: s.activeOffers, accent: "green", icon: "✅", hint: "Visibles par les candidats" },
            { label: "Candidatures reçues", value: s.totalApplications, accent: "red", icon: "📨", hint: `${s.pendingApplications || 0} en attente`, href: "/applications" },
            { label: "Vues totales", value: s.totalViews, accent: "amber", icon: "👁", hint: `${conversion}% de conversion` },
          ].map((c, i) => (
            <Reveal key={c.label} variant="pop" delay={i * 90}>
              <StatCard {...c} />
            </Reveal>
          ))}
        </div>

        {/* ===================== GRAPHIQUES ===================== */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal variant="left" className="lg:col-span-2">
            <ChartCard
              title="Candidatures reçues par mois"
              subtitle="Évolution sur les 12 derniers mois"
              icon="📈"
              isEmpty={monthData.length === 0}
              emptyText="Les candidatures reçues s'afficheront ici dès votre première réception."
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="recruiterAppsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.inkMuted }}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.inkMuted }}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: CHART_COLORS.brandSoft, strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="candidatures"
                    name="Candidatures"
                    stroke={CHART_COLORS.brand}
                    strokeWidth={2.5}
                    fill="url(#recruiterAppsGradient)"
                    dot={{ r: 3, fill: CHART_COLORS.brand, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: CHART_COLORS.brandDeep, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <ChartCard
              title="Répartition des statuts"
              subtitle="Toutes vos candidatures"
              icon="🎯"
              isEmpty={statusData.length === 0}
              emptyText="Aucune candidature reçue pour le moment."
            >
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {statusData.map((e) => (
                        <Cell key={e.key} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-ink">{statusTotal}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    candidatures
                  </span>
                </div>
              </div>
              <ChartLegend items={statusData} total={statusTotal} />
            </ChartCard>
          </Reveal>
        </div>

        {/* ===================== VUES PAR OFFRE + PIPELINE ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal variant="left">
            <ChartCard
              title="Vues par offre"
              subtitle="Vos annonces les plus consultées"
              icon="👁"
              isEmpty={viewsData.length === 0}
              emptyText="Aucune vue enregistrée pour l'instant."
            >
              <ResponsiveContainer width="100%" height={Math.max(220, viewsData.length * 46)}>
                <BarChart
                  data={viewsData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.inkMuted }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.inkMuted }}
                  />
                  <Tooltip
                    content={<ChartTooltip suffix="vues" />}
                    cursor={{ fill: "rgba(191,8,8,0.05)" }}
                  />
                  <Bar
                    dataKey="vues"
                    name="Vues"
                    fill={CHART_COLORS.brandDeep}
                    radius={[0, 8, 8, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <ChartCard
              title="Pipeline de recrutement"
              subtitle="Où en sont vos candidatures"
              icon="🧭"
              isEmpty={statusTotal === 0}
              emptyText="Le pipeline se remplira avec vos premières candidatures."
            >
              <div className="space-y-5">
                {STATUS_LIST.map((k) => {
                  const value = byStatus[k] || 0;
                  const tone =
                    { pending: "amber", reviewed: "blue", accepted: "green", rejected: "brand", withdrawn: "dark" }[k] ||
                    "brand";
                  return (
                    <div key={k}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <StatusBadge status={k} />
                        <span className="text-xs font-bold text-ink">
                          {value}
                          <span className="ml-1 font-normal text-ink-muted">
                            ({statusTotal ? Math.round((value / statusTotal) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                      <ProgressBar value={value} max={statusTotal} tone={tone} size="sm" />
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </Reveal>
        </div>

        {/* ===================== CANDIDATURES RÉCENTES + TOP OFFRES ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Candidatures récentes */}
          <Reveal variant="up">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">Candidatures récentes</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">Les 5 dernières réceptions</p>
                </div>
                <Link href="/applications" className="link-brand text-sm">
                  Tout voir →
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {!data?.recentApplications?.length ? (
                  <EmptyState
                    compact
                    icon="📨"
                    title="Aucune candidature"
                    description="Les candidatures à vos offres apparaîtront ici."
                    action={
                      <Link href="/offers/new" className="btn-primary">
                        + Publier une offre
                      </Link>
                    }
                  />
                ) : (
                  data.recentApplications.map((app, i) => (
                    <Reveal key={app._id} variant="up" delay={i * 70}>
                      <Link
                        href={`/applications/${app._id}`}
                        className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-cardHover"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                          {app.candidate?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.candidate.avatarUrl}
                              alt={`${app.candidate?.firstName || ""} ${app.candidate?.lastName || ""}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials(app.candidate?.firstName, app.candidate?.lastName)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brand-600">
                            {app.candidate?.firstName} {app.candidate?.lastName}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {app.candidate?.title ? `${app.candidate.title} · ` : ""}
                            {app.offer?.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-neutral-400">
                            {timeAgo(app.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={app.status} />
                      </Link>
                    </Reveal>
                  ))
                )}
              </div>
            </section>
          </Reveal>

          {/* Top offres */}
          <Reveal variant="up" delay={120}>
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">Offres les plus populaires</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">Classement par candidatures reçues</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {!data?.topOffers?.length ? (
                  <EmptyState
                    compact
                    icon="🏆"
                    title="Aucune offre populaire"
                    description="Publiez une offre pour voir apparaître son classement."
                    action={
                      <Link href="/offers/new" className="btn-primary">
                        + Publier une offre
                      </Link>
                    }
                  />
                ) : (
                  (() => {
                    const max = Math.max(...data.topOffers.map((t) => t.count || 0), 1);
                    return data.topOffers.map((t, i) => (
                      <Reveal key={t._id} variant="up" delay={i * 70}>
                        <Link
                          href={`/offers/${t._id}`}
                          className="group block rounded-xl border border-neutral-200 p-3.5 transition-all duration-200 hover:border-brand-200 hover:shadow-card"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                                i === 0
                                  ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25"
                                  : "bg-neutral-100 text-ink"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brand-600">
                                {t.offer?.title}
                              </p>
                              <p className="truncate text-xs text-ink-muted">{t.offer?.company}</p>
                            </div>
                            <span className="badge-red shrink-0">{t.count}</span>
                          </div>
                          <ProgressBar
                            className="mt-3"
                            value={t.count}
                            max={max}
                            tone={i === 0 ? "brand" : "dark"}
                            size="sm"
                          />
                        </Link>
                      </Reveal>
                    ));
                  })()
                )}
              </div>
            </section>
          </Reveal>
        </div>

        {/* ===================== MES OFFRES ===================== */}
        <Reveal variant="up">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Mes offres</h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Gérez vos annonces et suivez leurs performances
                </p>
              </div>
              <Link href="/offers?recruiter=me" className="link-brand text-sm">
                Voir tout →
              </Link>
            </div>
            <MyOffers />
          </section>
        </Reveal>
      </div>
    </div>
  );
}

function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/offers/me");
        setOffers(data.offers);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="mt-5">
        <SkeletonTable rows={4} />
      </div>
    );

  if (offers.length === 0)
    return (
      <div className="mt-5">
        <EmptyState
          icon="📋"
          title="Aucune offre publiée"
          description="Créez votre première annonce pour commencer à recevoir des candidatures."
          action={
            <Link href="/offers/new" className="btn-primary">
              + Publier une offre
            </Link>
          }
        />
      </div>
    );

  return (
    <div className="mt-5">
      {/* Version tableau (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-5 py-3.5 font-bold">Offre</th>
              <th className="px-5 py-3.5 font-bold">Statut</th>
              <th className="px-5 py-3.5 font-bold">Candidatures</th>
              <th className="px-5 py-3.5 font-bold">Vues</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {offers.map((o) => {
              const st = OFFER_STATUS[o.status] || OFFER_STATUS.closed;
              return (
                <tr key={o._id} className="group transition-colors hover:bg-brand-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-extrabold text-ink">
                        {(o.company || o.title || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/offers/${o._id}`}
                          className="block truncate font-semibold text-ink transition-colors group-hover:text-brand-600"
                        >
                          {o.title}
                        </Link>
                        <p className="truncate text-xs text-ink-muted">
                          {o.location || "Lieu non précisé"} · publiée le {formatDate(o.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={st.className}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-ink">{o.applicationsCount ?? 0}</span>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{o.views ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/offers/${o._id}`} className="btn-ghost px-3 py-1.5 text-xs">
                        Voir
                      </Link>
                      <Link
                        href={`/offers/${o._id}/edit`}
                        className="btn-outline px-3 py-1.5 text-xs"
                      >
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Version cartes (mobile / tablette) */}
      <div className="space-y-3 md:hidden">
        {offers.map((o, i) => {
          const st = OFFER_STATUS[o.status] || OFFER_STATUS.closed;
          return (
            <Reveal key={o._id} variant="up" delay={i * 60}>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/offers/${o._id}`}
                      className="block truncate font-semibold text-ink"
                    >
                      {o.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {o.location || "Lieu non précisé"} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className={`${st.className} shrink-0`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-neutral-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase text-ink-muted">
                      Candidatures
                    </p>
                    <p className="text-lg font-extrabold text-ink">{o.applicationsCount ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase text-ink-muted">Vues</p>
                    <p className="text-lg font-extrabold text-ink">{o.views ?? 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/offers/${o._id}`} className="btn-outline flex-1 py-2 text-xs">
                    Voir
                  </Link>
                  <Link href={`/offers/${o._id}/edit`} className="btn-dark flex-1 py-2 text-xs">
                    Modifier
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <ProtectedRoute roles={["recruiter", "admin"]}>
      <RecruiterDashboardContent />
    </ProtectedRoute>
  );
}
