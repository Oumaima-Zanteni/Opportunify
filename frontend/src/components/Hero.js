"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Hero section — split, chic et professionnel.
 * Palette rouge profond / noir / blanc.
 *
 * Conçue pour tenir, avec le marquee, dans la hauteur de l'écran :
 * toutes les tailles sont fluides (clamp) et se réduisent sur les écrans courts.
 */
export default function Hero({ stats }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(query.trim() ? `/offers?q=${encodeURIComponent(query.trim())}` : "/offers");
  };

  const titleWords = ["Connectez", "talents", "et"];

  return (
    <section className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-ink">
      {/* ===== Fond : halos rouges ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-600 opacity-20 blur-3xl animate-pulse-glow" />
        <div className="absolute left-1/3 top-20 h-96 w-96 rounded-full bg-brand-500 opacity-10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-white opacity-5 blur-3xl animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* ===== Grille subtile ===== */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      <div
        className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 sm:px-10 lg:grid-cols-2 lg:gap-20 xl:gap-28 xl:px-16"
        style={{ paddingTop: "clamp(1rem, 3vh, 3rem)", paddingBottom: "clamp(1rem, 3vh, 3rem)" }}
      >
        {/* ===== Gauche : texte + recherche ===== */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold text-brand-300 backdrop-blur-md animate-fade-in sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Plateforme de recrutement moderne
          </div>

          {/* Titre — taille fluide */}
          <h1
            className="font-extrabold leading-[1.08] tracking-tight text-white"
            style={{
              fontSize: "clamp(1.75rem, 1rem + 2.6vw, 3.4rem)",
              marginTop: "clamp(0.75rem, 2vh, 1.5rem)",
            }}
          >
            {titleWords.map((w, i) => (
              <span
                key={i}
                className="inline-block animate-reveal-up opacity-0"
                style={{ animationDelay: `${0.15 + i * 0.12}s`, animationFillMode: "forwards" }}
              >
                {w}&nbsp;
              </span>
            ))}
            <span
              className="inline-block animate-reveal-up text-brand-400 opacity-0"
              style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
            >
              opportunités
            </span>
          </h1>

          {/* Sous-titre — masqué sur écrans très courts */}
          <p
            className="hidden max-w-xl leading-relaxed text-white/70 animate-fade-in opacity-0 [@media(min-height:700px)]:block"
            style={{
              animationDelay: "0.8s",
              animationFillMode: "forwards",
              marginTop: "clamp(0.75rem, 1.8vh, 1.5rem)",
              fontSize: "clamp(0.875rem, 0.8rem + 0.3vw, 1.125rem)",
            }}
          >
            Opportunify rapproche recruteurs et chercheurs d'emploi, stages et alternances.
            Publiez vos offres, postulez en un clic et échangez en direct.
          </p>

          {/* Barre de recherche */}
          <form
            onSubmit={handleSearch}
            className="flex max-w-lg items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-2xl backdrop-blur-md animate-fade-in opacity-0"
            style={{
              animationDelay: "1s",
              animationFillMode: "forwards",
              marginTop: "clamp(0.875rem, 2.2vh, 1.75rem)",
            }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
              <svg className="h-4 w-4 shrink-0 text-white/50 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un poste, une entreprise…"
                className="w-full min-w-0 bg-transparent py-2 text-sm text-white placeholder-white/40 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0 px-4 py-2 text-sm">
              Rechercher
            </button>
          </form>

          {/* Boutons d'action */}
          <div
            className="flex flex-wrap gap-3 animate-fade-in opacity-0"
            style={{
              animationDelay: "1.15s",
              animationFillMode: "forwards",
              marginTop: "clamp(0.75rem, 1.8vh, 1.25rem)",
            }}
          >
            <Link href="/register?role=jobseeker" className="btn-primary px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base">
              Je cherche un poste
            </Link>
            <Link
              href="/register?role=recruiter"
              className="btn border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white transition-all duration-200 hover:bg-white/10 sm:px-6 sm:py-3 sm:text-base"
            >
              Je recrute
            </Link>
          </div>

          {/* Stats réelles */}
          <div
            className="flex items-center gap-6 animate-fade-in opacity-0 sm:gap-8"
            style={{
              animationDelay: "1.3s",
              animationFillMode: "forwards",
              marginTop: "clamp(1rem, 2.5vh, 2rem)",
            }}
          >
            <div className="group">
              <p
                className="font-extrabold text-white transition-transform duration-200 group-hover:scale-110"
                style={{ fontSize: "clamp(1.25rem, 1rem + 0.7vw, 1.875rem)" }}
              >
                {stats.loading ? "…" : stats.offers}
              </p>
              <p className="text-[11px] text-white/60">Offres en ligne</p>
            </div>
            <div className="h-9 w-px bg-white/10" />
            <div className="group">
              <p
                className="font-extrabold text-white transition-transform duration-200 group-hover:scale-110"
                style={{ fontSize: "clamp(1.25rem, 1rem + 0.7vw, 1.875rem)" }}
              >
                4
              </p>
              <p className="text-[11px] text-white/60">Types d'opportunités</p>
            </div>
            <div className="h-9 w-px bg-white/10" />
            <div className="group">
              <p
                className="font-extrabold text-brand-500 transition-transform duration-200 group-hover:scale-110"
                style={{ fontSize: "clamp(1.25rem, 1rem + 0.7vw, 1.875rem)" }}
              >
                100%
              </p>
              <p className="text-[11px] text-white/60">Gratuit</p>
            </div>
          </div>
        </div>

        {/* ===== Droite : carte citation (desktop uniquement) ===== */}
        <div className="relative hidden items-center justify-center lg:flex">
          <div
            className="relative w-full max-w-sm animate-fade-in opacity-0"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            {/* Bordure lumineuse */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-600 opacity-30 blur-sm" />

            <div
              className="relative rounded-2xl border border-white/10 bg-ink-soft/80 backdrop-blur-xl"
              style={{ padding: "clamp(1.25rem, 2.5vh, 1.75rem)" }}
            >
              <span className="absolute -top-3 left-6 text-5xl font-black leading-none text-brand-600/40">&ldquo;</span>

              <p
                className="font-medium leading-relaxed text-white"
                style={{ fontSize: "clamp(0.9375rem, 0.85rem + 0.2vw, 1.0625rem)" }}
              >
                Le bon profil existe. Le bon poste aussi. Opportunify les rapproche.
              </p>

              <div
                className="h-px w-full bg-gradient-to-r from-brand-600 via-brand-500 to-transparent"
                style={{ marginTop: "clamp(0.875rem, 2vh, 1.25rem)", marginBottom: "clamp(0.875rem, 2vh, 1.25rem)" }}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xl font-extrabold text-brand-500">{stats.loading ? "…" : stats.offers}</p>
                  <p className="text-[10px] text-white/60">Offres</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white">4</p>
                  <p className="text-[10px] text-white/60">Types</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white">&#8734;</p>
                  <p className="text-[10px] text-white/60">Possibilités</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Emploi", "Stage", "Alternance", "Freelance"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/70 transition-colors hover:border-brand-500/40 hover:text-brand-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Halos */}
            <div className="absolute -right-8 -top-8 -z-10 h-32 w-32 rounded-full bg-brand-600 opacity-20 blur-3xl animate-pulse-glow" />
            <div className="absolute -bottom-8 -left-8 -z-10 h-32 w-32 rounded-full bg-brand-500 opacity-15 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
