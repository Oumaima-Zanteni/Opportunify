"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import OfferCard from "../components/OfferCard";
import Reveal from "../components/Reveal";
import Hero from "../components/Hero";

const STEPS = [
  { num: "01", title: "Créez votre compte", desc: "Inscription gratuite en moins d'une minute, recruteur ou candidat." },
  { num: "02", title: "Explorez les offres", desc: "Filtrez parmi les opportunités selon vos critères." },
  { num: "03", title: "Postulez en un clic", desc: "Envoyez votre candidature et suivez son statut en temps réel." },
  { num: "04", title: "Échangez en direct", desc: "Discutez avec recruteurs ou candidats via la messagerie intégrée." },
];

// Mots-clés réels qui défilent — pas de fausses entreprises
const KEYWORDS = [
  "Emploi", "Stage", "Alternance", "Freelance",
  "Remote", "CDI", "CDD", "Temps partiel",
  "Tech / IT", "Marketing", "Design", "Finance",
  "Junior", "Confirmé", "Senior", "Expert",
];

// Ce que chaque rôle peut réellement faire sur la plateforme
const RECRUITER_FEATURES = [
  { icon: "📝", title: "Publier des offres", desc: "Créez des annonces détaillées en quelques minutes." },
  { icon: "📥", title: "Recevoir des candidatures", desc: "Centralisez toutes les postulations reçues." },
  { icon: "✅", title: "Suivre les statuts", desc: "Examinez, acceptez ou refusez en un clic." },
  { icon: "💬", title: "Contacter les candidats", desc: "Échangez directement via la messagerie." },
  { icon: "📊", title: "Voir vos statistiques", desc: "Vues, candidatures, taux de conversion." },
  { icon: "🔍", title: "Gérer vos offres", desc: "Modifiez, fermez ou rouvrez à tout moment." },
];

const SEEKER_FEATURES = [
  { icon: "🔎", title: "Rechercher des offres", desc: "Filtrez par type, lieu, salaire et compétences." },
  { icon: "⚡", title: "Postuler en un clic", desc: "Candidature rapide avec lettre de motivation." },
  { icon: "📋", title: "Suivre vos candidatures", desc: "Statut en temps réel : en attente, examinée, acceptée." },
  { icon: "💬", title: "Discuter avec les recruteurs", desc: "Posez vos questions avant même l'entretien." },
  { icon: "👤", title: "Compléter votre profil", desc: "Compétences, bio, titre — soyez visible." },
  { icon: "📊", title: "Voir vos statistiques", desc: "Candidatures envoyées, statuts, tendances." },
];

export default function HomePage() {
  const [recentOffers, setRecentOffers] = useState([]);
  const [stats, setStats] = useState({ offers: 0, loading: true });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/offers?limit=6");
        setRecentOffers(data.offers || []);
        setStats({ offers: data.total || 0, loading: false });
      } catch {
        setStats({ offers: 0, loading: false });
      }
    })();
  }, []);

  return (
    <>
      {/* Hero + marquee occupent exactement l'écran (100svh moins la navbar h-16) */}
      <div className="flex h-[calc(100svh-4rem)] min-h-[520px] flex-col overflow-hidden">
        {/* ===================== HERO ===================== */}
        <Hero stats={stats} />

        {/* ===================== MOTS-CLÉS MARQUEE ===================== */}
        <section className="shrink-0 border-t border-neutral-100 bg-white py-4 sm:py-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            Tous les types d'opportunités, tous les secteurs
          </p>
          <div className="relative mt-3 overflow-hidden">
            <div className="flex w-max animate-marquee gap-5 px-6">
              {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-brand-300 hover:text-brand-600"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {k}
                </span>
              ))}
            </div>
            {/* Dégradés latéraux */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
          </div>
        </section>
      </div>

      {/* ===================== DEUX ESPACES ===================== */}
      <section className="bg-neutral-50 py-20">
        <div className="section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="badge-red mb-4">Deux espaces dédiés</span>
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Une plateforme, deux parcours</h2>
            <p className="mt-4 text-ink-muted">
              Que vous recrutiez ou que vous cherchiez, Opportunify vous donne les outils adaptés à votre besoin.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Espace recruteur */}
            <Reveal variant="left">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-brand-50 to-white p-8 transition duration-300 hover:shadow-cardHover hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-xl text-white shadow-lg">
                    🏢
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink">Espace recruteur</h3>
                    <p className="text-sm text-ink-muted">Trouvez le bon profil</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {RECRUITER_FEATURES.map((f, i) => (
                    <li
                      key={f.title}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-white/60"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">{f.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{f.title}</p>
                        <p className="text-xs text-ink-muted">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link href="/register?role=recruiter" className="btn-primary mt-6 w-full">
                  Créer un compte recruteur
                </Link>
                {/* Ligne animée en bas */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500 group-hover:w-full" />
              </div>
            </Reveal>

            {/* Espace candidat */}
            <Reveal variant="right" delay={150}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-8 transition duration-300 hover:shadow-cardHover hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-xl text-white shadow-lg">
                    🧑‍💻
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink">Espace candidat</h3>
                    <p className="text-sm text-ink-muted">Trouvez le bon poste</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {SEEKER_FEATURES.map((f, i) => (
                    <li
                      key={f.title}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-white/60"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">{f.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{f.title}</p>
                        <p className="text-xs text-ink-muted">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link href="/register?role=jobseeker" className="btn-primary mt-6 w-full">
                  Créer un compte candidat
                </Link>
                {/* Ligne animée en bas */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500 group-hover:w-full" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== STEPS ===================== */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-brand-500 opacity-30 blur-3xl animate-pulse-glow" />
          <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-brand-500 opacity-20 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="badge bg-white/10 text-brand-200 backdrop-blur mb-4">Comment ça marche</span>
            <h2 className="text-3xl font-extrabold sm:text-4xl">Votre prochain poste en 4 étapes</h2>
            <p className="mt-4 text-white/60">Un parcours simple, rapide et transparent.</p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal
                key={s.num}
                variant="up"
                delay={i * 120}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:bg-white/10 hover:-translate-y-2"
              >
                <span className="text-5xl font-black text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:[-webkit-text-stroke:1.5px_#ec9494]">
                  {s.num}
                </span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60">{s.desc}</p>
                {/* Flèche entre les étapes */}
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-brand-400 lg:block">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== OFFRES RÉCENTES ===================== */}
      <section className="bg-white py-20">
        <div className="section">
          <Reveal className="flex items-end justify-between">
            <div>
              <span className="badge-red mb-3">Dernières publications</span>
              <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Offres récentes</h2>
              <p className="mt-2 text-ink-muted">Les dernières opportunités publiées sur la plateforme</p>
            </div>
            <Link href="/offers" className="btn-outline group">
              Voir tout
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentOffers.length === 0 ? (
              <Reveal className="col-span-full">
                <div className="card p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-neutral-100 text-2xl">📭</div>
                  <p className="mt-4 font-semibold text-ink">Aucune offre pour le moment</p>
                  <p className="mt-1 text-sm text-ink-muted">Soyez le premier à publier — revenez bientôt !</p>
                </div>
              </Reveal>
            ) : (
              recentOffers.map((o, i) => (
                <Reveal key={o._id} variant="up" delay={i * 100}>
                  <OfferCard offer={o} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="section py-20">
        <Reveal variant="up" className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center text-white sm:px-16">
          {/* Halo animé */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500 opacity-40 blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-0 left-1/4 h-60 w-60 rounded-full bg-brand-500 opacity-20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          </div>
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Prêt à trouver votre prochaine opportunité ?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/60">
            Rejoignez Opportunify aujourd'hui. Inscription gratuite en moins d'une minute.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register?role=jobseeker" className="btn-primary px-6 py-3 text-base">Je cherche un poste</Link>
            <Link href="/register?role=recruiter" className="btn bg-white text-ink hover:bg-neutral-100 px-6 py-3 text-base transition hover:-translate-y-0.5">Je recrute</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
