"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
} from "../../../components/SkeletonCard";
import { useAuth } from "../../../context/AuthContext";
import {
  APPLICATION_STATUS,
  OFFER_TYPES,
  STATUS_LIST,
  formatDate,
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

/** Champs pris en compte pour la complétion du profil. */
const PROFILE_FIELDS = [
  { key: "title", label: "Intitulé de poste" },
  { key: "bio", label: "Bio / présentation" },
  { key: "location", label: "Localisation" },
  { key: "phone", label: "Téléphone" },
  { key: "skills", label: "Compétences" },
  { key: "avatarUrl", label: "Photo de profil" },
];

function computeProfile(user) {
  const items = PROFILE_FIELDS.map((f) => {
    const v = user?.[f.key];
    const filled = Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
    return { ...f, filled };
  });
  const done = items.filter((i) => i.filled).length;
  return {
    items,
    done,
    total: items.length,
    percent: Math.round((done / items.length) * 100),
  };
}

function typeLabel(type) {
  return OFFER_TYPES.find((t) => t.value === type)?.label || type;
}

function JobseekerDashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get("/dashboard/jobseeker");
        setData(d);
      } catch {
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

  const profile = useMemo(() => computeProfile(user), [user]);

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
        </div>
      </div>
    );
  }

  const total = s.totalApplications || 0;
  const successRate = total > 0 ? Math.round(((s.accepted || 0) / total) * 100) : 0;

  return (
    <div className="bg-neutral-50">
      <div className="section space-y-8 py-8 sm:py-10">
        {/* ===================== EN-TÊTE ===================== */}
        <Reveal>
          <DashboardHeader
            eyebrow="Mon espace candidat"
            title={
              <>
                Bonjour {user?.firstName || "à vous"}{" "}
                <span className="inline-block animate-bounce-slow">👋</span>
              </>
            }
            subtitle="Suivez vos candidatures, mesurez votre progression et gardez le cap sur vos objectifs."
            actions={
              <>
                <Link href="/applications" className="btn-outline">
                  Mes candidatures
                </Link>
                <Link href="/offers" className="btn-primary">
                  Explorer les offres →
                </Link>
              </>
            }
          >
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {total} candidature{total > 1 ? "s" : ""} envoyée{total > 1 ? "s" : ""}
              </span>
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {s.pending || 0} en attente
              </span>
              <span className="badge bg-white text-ink shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {successRate}% de réussite
              </span>
            </div>
          </DashboardHeader>
        </Reveal>

        {/* ===================== STATS ===================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Candidatures totales", value: s.totalApplications, accent: "red", icon: "📨", hint: "Depuis votre inscription", href: "/applications" },
            { label: "En attente", value: s.pending, accent: "amber", icon: "⏳", hint: "Réponse à venir" },
            { label: "Examinées", value: s.reviewed, accent: "blue", icon: "👀", hint: "Vues par le recruteur" },
            { label: "Acceptées", value: s.accepted, accent: "green", icon: "🎉", hint: `${successRate}% de réussite` },
          ].map((c, i) => (
            <Reveal key={c.label} variant="pop" delay={i * 90}>
              <StatCard {...c} />
            </Reveal>
          ))}
        </div>

        {/* ===================== GRAPHIQUE MOIS + COMPLÉTION PROFIL ===================== */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal variant="left" className="lg:col-span-2">
            <ChartCard
              title="Candidatures par mois"
              subtitle="Votre rythme de recherche"
              icon="📈"
              isEmpty={monthData.length === 0}
              emptyText="Postulez à une offre pour voir apparaître votre activité."
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="seekerBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_COLORS.brandDeep} stopOpacity={0.75} />
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
                    cursor={{ fill: "rgba(191,8,8,0.05)" }}
                  />
                  <Bar
                    dataKey="candidatures"
                    name="Candidatures"
                    fill="url(#seekerBarGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          {/* Complétion du profil */}
          <Reveal variant="right" delay={120} className="h-full">
            <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition-all duration-300 hover:shadow-cardHover sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-base text-brand-600">
                  🧩
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Complétion du profil</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Un profil complet inspire confiance aux recruteurs
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-4xl font-extrabold leading-none text-ink">
                  {profile.percent}%
                </span>
                <span className="pb-1 text-xs text-ink-muted">
                  {profile.done}/{profile.total} champs remplis
                </span>
              </div>
              <ProgressBar
                className="mt-3"
                value={profile.percent}
                tone={profile.percent >= 80 ? "green" : profile.percent >= 40 ? "amber" : "brand"}
              />

              <ul className="mt-5 flex-1 space-y-2">
                {profile.items.map((it) => (
                  <li key={it.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        it.filled
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {it.filled ? "✓" : "—"}
                    </span>
                    <span className={it.filled ? "text-ink-muted line-through" : "text-ink"}>
                      {it.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/profile"
                className={`mt-6 w-full ${profile.percent === 100 ? "btn-outline" : "btn-primary"}`}
              >
                {profile.percent === 100 ? "Voir mon profil" : "Compléter mon profil"}
              </Link>
            </section>
          </Reveal>
        </div>

        {/* ===================== DONUT + PIPELINE ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal variant="left">
            <ChartCard
              title="Répartition par statut"
              subtitle="Vue d'ensemble de vos candidatures"
              icon="🎯"
              isEmpty={statusData.length === 0}
              emptyText="Postulez à une offre pour visualiser la répartition."
            >
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
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

          <Reveal variant="right" delay={120}>
            <ChartCard
              title="Progression"
              subtitle="Où en sont vos candidatures"
              icon="🧭"
              isEmpty={statusTotal === 0}
              emptyText="Votre progression apparaîtra ici après votre première candidature."
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

              <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-sm font-semibold text-ink">Envie d'accélérer ?</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Plus vous postulez à des offres qui correspondent à votre profil, plus vos chances
                  augmentent.
                </p>
                <Link href="/offers" className="link-brand mt-3 inline-block text-sm">
                  Découvrir de nouvelles offres →
                </Link>
              </div>
            </ChartCard>
          </Reveal>
        </div>

        {/* ===================== CANDIDATURES RÉCENTES ===================== */}
        <Reveal variant="up">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Candidatures récentes</h2>
                <p className="mt-0.5 text-sm text-ink-muted">Vos 5 dernières postulations</p>
              </div>
              <Link href="/applications" className="link-brand text-sm">
                Tout voir →
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {!data?.recentApplications?.length ? (
                <EmptyState
                  icon="📨"
                  title="Aucune candidature"
                  description="Explorez les offres et postulez en un clic : vos candidatures apparaîtront ici."
                  action={
                    <Link href="/offers" className="btn-primary">
                      Voir les offres
                    </Link>
                  }
                />
              ) : (
                data.recentApplications.map((app, i) => (
                  <Reveal key={app._id} variant="up" delay={i * 70}>
                    <Link
                      href={`/applications/${app._id}`}
                      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-cardHover sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-soft to-ink text-base font-extrabold text-white">
                          {(app.offer?.company || app.offer?.title || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink transition-colors group-hover:text-brand-600">
                            {app.offer?.title}
                          </p>
                          <p className="truncate text-sm text-ink-muted">
                            {app.offer?.company}
                            {app.offer?.location ? ` · ${app.offer.location}` : ""}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            {app.offer?.type && (
                              <span className="badge-neutral">{typeLabel(app.offer.type)}</span>
                            )}
                            <span
                              className="text-[11px] text-neutral-400"
                              title={formatDate(app.createdAt)}
                            >
                              {timeAgo(app.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <StatusBadge status={app.status} />
                        <span className="text-ink-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600">
                          →
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))
              )}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

export default function JobseekerDashboardPage() {
  return (
    <ProtectedRoute roles={["jobseeker"]}>
      <JobseekerDashboardContent />
    </ProtectedRoute>
  );
}
