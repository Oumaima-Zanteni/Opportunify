"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { OFFER_TYPES, CATEGORIES, EXPERIENCE_LEVELS } from "../lib/constants";

const empty = {
  title: "", company: "", description: "", type: "emploi",
  category: "tech", location: "", remote: false,
  salaryMin: "", salaryMax: "", currency: "EUR",
  skills: [], experienceLevel: "junior", deadline: "",
  contactEmail: "", status: "active",
};

export default function OfferFormPage() {
  const router = useRouter();
  const params = useParams();
  const editId = params?.id;
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const data = await api.get(`/offers/${editId}`);
          const o = data.offer;
          setForm({
            ...empty,
            ...o,
            salaryMin: o.salaryMin || "",
            salaryMax: o.salaryMax || "",
            deadline: o.deadline ? o.deadline.split("T")[0] : "",
          });
        } catch (err) {
          toast.error(err.message);
          router.push("/dashboard/recruiter");
        } finally {
          setFetching(false);
        }
      })();
    } else if (user) {
      setForm((f) => ({ ...f, company: user.company || "", contactEmail: user.email || "" }));
    }
  }, [editId, user, router]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      deadline: form.deadline || undefined,
    };
    try {
      if (editId) {
        await api.put(`/offers/${editId}`, payload);
        toast.success("Offre mise à jour");
        router.push(`/offers/${editId}`);
      } else {
        const data = await api.post("/offers", payload);
        toast.success("Offre publiée !");
        router.push(`/offers/${data.offer._id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="section py-20"><div className="h-8 w-1/2 animate-pulse rounded bg-neutral-100" /></div>;

  return (
    <div className="section max-w-3xl py-10">
      <Link href={editId ? `/offers/${editId}` : "/dashboard/recruiter"} className="text-sm text-ink-muted hover:text-brand-600">← Retour</Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">{editId ? "Modifier l'offre" : "Publier une offre"}</h1>
      <p className="mt-2 text-ink-muted">Renseignez les détails de l'opportunité</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-7">
        <div>
          <label className="label">Titre du poste *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="ex: Développeur Full-Stack" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Entreprise *</label>
            <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {OFFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" placeholder="Décrivez le poste, les missions, le profil recherché…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Niveau d'expérience</label>
            <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="input">
              {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Lieu</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Paris, France" />
          </div>
          <div>
            <label className="label">Date limite</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-sm text-ink">Télétravail possible</span>
        </label>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Salaire min</label>
            <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Salaire max</label>
            <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Devise</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
              <option>EUR</option><option>USD</option><option>GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Compétences requises</label>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} className="input" placeholder="ex: React, puis Entrée" />
            <button type="button" onClick={addSkill} className="btn-outline">+ Ajouter</button>
          </div>
          {form.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <span key={s} className="badge bg-brand-50 text-brand-700">
                  {s}
                  <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} className="ml-1 hover:text-brand-900">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email de contact</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="active">Active</option>
              <option value="draft">Brouillon</option>
              <option value="closed">Fermée</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href={editId ? `/offers/${editId}` : "/dashboard/recruiter"} className="btn-outline flex-1">Annuler</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Enregistrement…" : editId ? "Mettre à jour" : "Publier l'offre"}</button>
        </div>
      </form>
    </div>
  );
}
