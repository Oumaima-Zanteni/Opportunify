"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

const LANGUAGE_LEVELS = [
  "Notions",
  "Intermédiaire",
  "Courant",
  "Avancé",
  "Bilingue",
  "Langue maternelle",
];

const emptyExperience = () => ({
  position: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const emptyEducation = () => ({
  degree: "",
  school: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const emptyLanguage = () => ({ name: "", level: "Intermédiaire" });

const emptyCertification = () => ({ title: "", issuer: "", date: "", url: "", description: "" });

const emptyResume = () => ({
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
});

const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function formatMonth(value) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month] = match;
  const index = Number(month) - 1;
  return `${MONTHS[index] || month} ${year}`;
}

function periodLabel(item) {
  const start = formatMonth(item.startDate);
  const end = item.current ? "aujourd'hui" : formatMonth(item.endDate);
  if (start && end) return `${start} — ${end}`;
  return start || end || "";
}

/* ------------------------------------------------------------------ */
/* Petits blocs de mise en page du formulaire                          */
/* ------------------------------------------------------------------ */

function Section({ title, description, children, action }) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function ItemCard({ index, total, onMoveUp, onMoveDown, onRemove, title, children }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 transition duration-200 hover:border-brand-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{title || `Élément ${index + 1}`}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded-lg px-2 py-1 text-xs text-ink-muted transition duration-200 hover:bg-white hover:text-brand-600 disabled:opacity-30"
            aria-label="Monter"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded-lg px-2 py-1 text-xs text-ink-muted transition duration-200 hover:bg-white hover:text-brand-600 disabled:opacity-30"
            aria-label="Descendre"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition duration-200 hover:bg-brand-50"
          >
            Supprimer
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu du CV                                                        */
/* ------------------------------------------------------------------ */

function PreviewSection({ title, children }) {
  return (
    <div className="cv-block mt-6">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">{title}</h3>
      <div className="mt-1 h-px w-full bg-brand-500/70" />
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

function CvPreview({ data }) {
  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
  const contacts = [data.email, data.phone, data.location].filter(Boolean);
  const links = [
    data.linkedin && { label: "LinkedIn", value: data.linkedin },
    data.github && { label: "GitHub", value: data.github },
    data.portfolio && { label: "Portfolio", value: data.portfolio },
  ].filter(Boolean);

  const hasExperiences = data.experiences?.some((e) => e.position || e.company);
  const hasEducation = data.education?.some((e) => e.degree || e.school);
  const hasLanguages = data.languages?.some((l) => l.name);
  const hasCertifications = data.certifications?.some((c) => c.title);

  return (
    <div className="cv-page bg-white px-9 py-10 text-[13px] leading-relaxed text-ink-soft">
      {/* En-tête */}
      <div className="cv-block border-b-2 border-brand-600 pb-5">
        <h1 className="text-[26px] font-extrabold uppercase tracking-tight text-ink">
          {fullName || "Votre nom"}
        </h1>
        {data.title && (
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            {data.title}
          </p>
        )}
        {contacts.length > 0 && (
          <p className="mt-3 text-xs text-ink-muted">{contacts.join("  ·  ")}</p>
        )}
        {links.length > 0 && (
          <p className="mt-1 text-xs text-ink-muted">
            {links.map((l) => `${l.label} : ${l.value}`).join("  ·  ")}
          </p>
        )}
      </div>

      {data.summary && (
        <PreviewSection title="Profil">
          <p className="whitespace-pre-line text-[13px] text-ink-soft">{data.summary}</p>
        </PreviewSection>
      )}

      {hasExperiences && (
        <PreviewSection title="Expériences professionnelles">
          {data.experiences
            .filter((e) => e.position || e.company)
            .map((exp, i) => (
              <div key={i} className="cv-block">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-ink">{exp.position || "Poste"}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    {periodLabel(exp)}
                  </p>
                </div>
                <p className="text-[12px] font-semibold text-brand-600">
                  {[exp.company, exp.location].filter(Boolean).join(" · ")}
                </p>
                {exp.description && (
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] text-ink-muted">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
        </PreviewSection>
      )}

      {hasEducation && (
        <PreviewSection title="Formation">
          {data.education
            .filter((e) => e.degree || e.school)
            .map((edu, i) => (
              <div key={i} className="cv-block">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-ink">{edu.degree || "Diplôme"}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    {periodLabel(edu)}
                  </p>
                </div>
                <p className="text-[12px] font-semibold text-brand-600">
                  {[edu.school, edu.location].filter(Boolean).join(" · ")}
                </p>
                {edu.description && (
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] text-ink-muted">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
        </PreviewSection>
      )}

      {data.skills?.length > 0 && (
        <PreviewSection title="Compétences">
          <div className="flex flex-wrap gap-x-2 gap-y-1.5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-brand-700"
              >
                {s}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {hasLanguages && (
        <PreviewSection title="Langues">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {data.languages
              .filter((l) => l.name)
              .map((lang, i) => (
                <div key={i} className="flex items-baseline justify-between border-b border-dashed border-neutral-200 pb-1">
                  <span className="font-semibold text-ink">{lang.name}</span>
                  <span className="text-[12px] text-ink-muted">{lang.level}</span>
                </div>
              ))}
          </div>
        </PreviewSection>
      )}

      {hasCertifications && (
        <PreviewSection title="Certifications & projets">
          {data.certifications
            .filter((c) => c.title)
            .map((cert, i) => (
              <div key={i} className="cv-block">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-ink">{cert.title}</p>
                  {cert.date && (
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                      {formatMonth(cert.date)}
                    </p>
                  )}
                </div>
                {(cert.issuer || cert.url) && (
                  <p className="text-[12px] font-semibold text-brand-600">
                    {[cert.issuer, cert.url].filter(Boolean).join(" · ")}
                  </p>
                )}
                {cert.description && (
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] text-ink-muted">
                    {cert.description}
                  </p>
                )}
              </div>
            ))}
        </PreviewSection>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function CvBuilderContent() {
  const { user } = useAuth();
  const [data, setData] = useState(emptyResume);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("form"); // mobile : form | preview
  const [skillInput, setSkillInput] = useState("");
  const debounceRef = useRef(null);

  // Chargement initial : CV existant sinon pré-remplissage depuis le profil
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/resume/me");
        if (cancelled) return;
        if (res.resume) {
          setData({ ...emptyResume(), ...res.resume });
        } else {
          setData({
            ...emptyResume(),
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            title: user?.title || "",
            email: user?.email || "",
            phone: user?.phone || "",
            location: user?.location || "",
            summary: user?.bio || "",
            skills: user?.skills || [],
          });
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(async (payload, { silent = true } = {}) => {
    setSaving(true);
    try {
      await api.put("/resume/me", payload);
      setSavedAt(new Date());
      setDirty(false);
      if (!silent) toast.success("CV enregistré");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }, []);

  // Auto-sauvegarde debounce 1,5 s
  useEffect(() => {
    if (loading || !dirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persist(data), 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data, dirty, loading, persist]);

  const update = (patch) => {
    setDirty(true);
    setData((prev) => ({ ...prev, ...patch }));
  };

  const updateList = (key, index, patch) => {
    setDirty(true);
    setData((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = (key, factory) => {
    setDirty(true);
    setData((prev) => ({ ...prev, [key]: [...prev[key], factory()] }));
  };

  const removeItem = (key, index) => {
    setDirty(true);
    setData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const moveItem = (key, index, delta) => {
    const target = index + delta;
    setDirty(true);
    setData((prev) => {
      if (target < 0 || target >= prev[key].length) return prev;
      const list = [...prev[key]];
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [key]: list };
    });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (data.skills.includes(value)) {
      setSkillInput("");
      return;
    }
    update({ skills: [...data.skills, value] });
    setSkillInput("");
  };

  const handleDownload = async () => {
    if (dirty) await persist(data);
    // Laisse le temps au navigateur d'appliquer les styles avant d'ouvrir la boîte d'impression
    setTab("preview");
    setTimeout(() => window.print(), 250);
  };

  if (loading) {
    return (
      <div className="section py-16">
        <div className="h-9 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-neutral-50" />
          <div className="h-96 animate-pulse rounded-xl bg-neutral-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="section py-10">
      {/* En-tête */}
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Créateur de CV</h1>
          <p className="mt-1 text-ink-muted">
            Construisez un CV professionnel et téléchargez-le en PDF en un clic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-ink-muted">
            {saving
              ? "Enregistrement…"
              : dirty
              ? "Modifications non enregistrées"
              : savedAt
              ? `Enregistré à ${savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "Sauvegarde automatique activée"}
          </span>
          <button type="button" onClick={() => persist(data, { silent: false })} className="btn-outline">
            Enregistrer
          </button>
          <button type="button" onClick={handleDownload} className="btn-primary">
            Télécharger en PDF
          </button>
        </div>
      </div>

      {/* Onglets mobile */}
      <div className="no-print mt-6 flex gap-2 rounded-xl bg-neutral-100 p-1 lg:hidden">
        {[
          { key: "form", label: "Éditer" },
          { key: "preview", label: "Aperçu" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ${
              tab === t.key ? "bg-white text-brand-600 shadow-card" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Formulaire */}
        <div className={`no-print space-y-5 ${tab === "form" ? "block" : "hidden"} lg:block`}>
          <Section title="Informations personnelles" description="Les bases de votre CV">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Prénom</label>
                <input value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Nom</label>
                <input value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Titre du poste visé</label>
              <input
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                className="input"
                placeholder="ex : Développeuse Full-Stack"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input value={data.phone} onChange={(e) => update({ phone: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Localisation</label>
              <input
                value={data.location}
                onChange={(e) => update({ location: e.target.value })}
                className="input"
                placeholder="Ville, pays"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">LinkedIn</label>
                <input value={data.linkedin} onChange={(e) => update({ linkedin: e.target.value })} className="input" placeholder="linkedin.com/in/…" />
              </div>
              <div>
                <label className="label">GitHub</label>
                <input value={data.github} onChange={(e) => update({ github: e.target.value })} className="input" placeholder="github.com/…" />
              </div>
              <div>
                <label className="label">Portfolio</label>
                <input value={data.portfolio} onChange={(e) => update({ portfolio: e.target.value })} className="input" placeholder="monsite.com" />
              </div>
            </div>
          </Section>

          <Section title="Résumé / accroche" description="3 à 5 lignes pour vous présenter">
            <textarea
              value={data.summary}
              onChange={(e) => update({ summary: e.target.value })}
              rows={5}
              className="input resize-none"
              placeholder="Développeuse full-stack passionnée avec 4 ans d'expérience…"
            />
          </Section>

          <Section
            title="Expériences professionnelles"
            description="Commencez par la plus récente"
            action={
              <button type="button" onClick={() => addItem("experiences", emptyExperience)} className="btn-outline text-xs">
                + Ajouter
              </button>
            }
          >
            {data.experiences.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-ink-muted">
                Aucune expérience pour le moment.
              </p>
            )}
            {data.experiences.map((exp, i) => (
              <ItemCard
                key={i}
                index={i}
                total={data.experiences.length}
                title={exp.position || exp.company || `Expérience ${i + 1}`}
                onMoveUp={() => moveItem("experiences", i, -1)}
                onMoveDown={() => moveItem("experiences", i, 1)}
                onRemove={() => removeItem("experiences", i)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Poste</label>
                    <input value={exp.position} onChange={(e) => updateList("experiences", i, { position: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Entreprise</label>
                    <input value={exp.company} onChange={(e) => updateList("experiences", i, { company: e.target.value })} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Lieu</label>
                  <input value={exp.location} onChange={(e) => updateList("experiences", i, { location: e.target.value })} className="input" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Début</label>
                    <input type="month" value={exp.startDate} onChange={(e) => updateList("experiences", i, { startDate: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Fin</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) => updateList("experiences", i, { endDate: e.target.value })}
                      className="input disabled:bg-neutral-100"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateList("experiences", i, { current: e.target.checked, endDate: "" })}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  />
                  Poste en cours
                </label>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateList("experiences", i, { description: e.target.value })}
                    rows={3}
                    className="input resize-none"
                    placeholder="Missions, réalisations, chiffres clés…"
                  />
                </div>
              </ItemCard>
            ))}
          </Section>

          <Section
            title="Formation"
            description="Diplômes et cursus"
            action={
              <button type="button" onClick={() => addItem("education", emptyEducation)} className="btn-outline text-xs">
                + Ajouter
              </button>
            }
          >
            {data.education.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-ink-muted">
                Aucune formation pour le moment.
              </p>
            )}
            {data.education.map((edu, i) => (
              <ItemCard
                key={i}
                index={i}
                total={data.education.length}
                title={edu.degree || edu.school || `Formation ${i + 1}`}
                onMoveUp={() => moveItem("education", i, -1)}
                onMoveDown={() => moveItem("education", i, 1)}
                onRemove={() => removeItem("education", i)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Diplôme</label>
                    <input value={edu.degree} onChange={(e) => updateList("education", i, { degree: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">École / université</label>
                    <input value={edu.school} onChange={(e) => updateList("education", i, { school: e.target.value })} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Lieu</label>
                  <input value={edu.location} onChange={(e) => updateList("education", i, { location: e.target.value })} className="input" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Début</label>
                    <input type="month" value={edu.startDate} onChange={(e) => updateList("education", i, { startDate: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Fin</label>
                    <input
                      type="month"
                      value={edu.endDate}
                      disabled={edu.current}
                      onChange={(e) => updateList("education", i, { endDate: e.target.value })}
                      className="input disabled:bg-neutral-100"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={edu.current}
                    onChange={(e) => updateList("education", i, { current: e.target.checked, endDate: "" })}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  />
                  En cours
                </label>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateList("education", i, { description: e.target.value })}
                    rows={2}
                    className="input resize-none"
                    placeholder="Spécialité, mention, projets…"
                  />
                </div>
              </ItemCard>
            ))}
          </Section>

          <Section title="Compétences" description="Appuyez sur Entrée pour ajouter, cliquez pour retirer">
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="input"
                placeholder="ex : React, puis Entrée"
              />
              <button type="button" onClick={addSkill} className="btn-outline">+ Ajouter</button>
            </div>
            {data.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ skills: data.skills.filter((x) => x !== s) })}
                    className="badge bg-brand-50 text-brand-700 transition duration-200 hover:bg-brand-100"
                  >
                    {s} <span className="text-brand-500">✕</span>
                  </button>
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Langues"
            action={
              <button type="button" onClick={() => addItem("languages", emptyLanguage)} className="btn-outline text-xs">
                + Ajouter
              </button>
            }
          >
            {data.languages.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-ink-muted">
                Aucune langue renseignée.
              </p>
            )}
            {data.languages.map((lang, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[140px] flex-1">
                  <label className="label">Langue</label>
                  <input value={lang.name} onChange={(e) => updateList("languages", i, { name: e.target.value })} className="input" placeholder="Anglais" />
                </div>
                <div className="min-w-[150px] flex-1">
                  <label className="label">Niveau</label>
                  <select value={lang.level} onChange={(e) => updateList("languages", i, { level: e.target.value })} className="input">
                    {LANGUAGE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem("languages", i)}
                  className="btn-ghost px-3 py-2.5 text-xs text-brand-600"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </Section>

          <Section
            title="Certifications & projets"
            description="Optionnel"
            action={
              <button type="button" onClick={() => addItem("certifications", emptyCertification)} className="btn-outline text-xs">
                + Ajouter
              </button>
            }
          >
            {data.certifications.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-ink-muted">
                Aucune certification ni projet.
              </p>
            )}
            {data.certifications.map((cert, i) => (
              <ItemCard
                key={i}
                index={i}
                total={data.certifications.length}
                title={cert.title || `Certification ${i + 1}`}
                onMoveUp={() => moveItem("certifications", i, -1)}
                onMoveDown={() => moveItem("certifications", i, 1)}
                onRemove={() => removeItem("certifications", i)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Titre</label>
                    <input value={cert.title} onChange={(e) => updateList("certifications", i, { title: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Organisme</label>
                    <input value={cert.issuer} onChange={(e) => updateList("certifications", i, { issuer: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Date</label>
                    <input type="month" value={cert.date} onChange={(e) => updateList("certifications", i, { date: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Lien</label>
                    <input value={cert.url} onChange={(e) => updateList("certifications", i, { url: e.target.value })} className="input" placeholder="https://…" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={cert.description}
                    onChange={(e) => updateList("certifications", i, { description: e.target.value })}
                    rows={2}
                    className="input resize-none"
                  />
                </div>
              </ItemCard>
            ))}
          </Section>

          <p className="text-center text-xs text-ink-muted">
            Besoin d'un CV déjà rédigé ?{" "}
            <Link href="/profile" className="link-brand">Téléversez un fichier depuis votre profil</Link>
          </p>
        </div>

        {/* Aperçu */}
        <div className={`${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-20">
            <div className="no-print mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Aperçu en direct</p>
              <span className="badge-neutral">Format A4</span>
            </div>
            <div
              id="cv-preview"
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition duration-200 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto"
            >
              <CvPreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CvPage() {
  return (
    <ProtectedRoute roles={["jobseeker"]}>
      <CvBuilderContent />
    </ProtectedRoute>
  );
}
