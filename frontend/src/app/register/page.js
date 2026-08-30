"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [role, setRole] = useState("jobseeker");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    company: "", title: "", phone: "", location: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "recruiter" || r === "jobseeker") setRole(r);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role };
      if (role === "jobseeker") delete payload.company;
      const user = await register(payload);
      toast.success(`Bienvenue ${user.firstName} !`);
      router.push(user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/jobseeker");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 font-black text-white">O</div>
            <span className="text-2xl font-extrabold">Opportun<span className="text-brand-600">ify</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-ink">Créer un compte</h1>
          <p className="mt-1 text-sm text-ink-muted">Rejoignez Opportunify en moins d'une minute</p>
        </div>

        {/* Role selector */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("jobseeker")}
            className={`rounded-xl border-2 p-4 text-left transition ${role === "jobseeker" ? "border-brand-600 bg-brand-50" : "border-neutral-200 hover:border-neutral-300"}`}
          >
            <div className="text-2xl">🎯</div>
            <p className="mt-2 font-bold text-ink">Je cherche</p>
            <p className="text-xs text-ink-muted">Emploi, stage, alternance</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`rounded-xl border-2 p-4 text-left transition ${role === "recruiter" ? "border-brand-600 bg-brand-50" : "border-neutral-200 hover:border-neutral-300"}`}
          >
            <div className="text-2xl">🏢</div>
            <p className="mt-2 font-bold text-ink">Je recrute</p>
            <p className="text-xs text-ink-muted">Publier des offres</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-7">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Nom</label>
              <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="Min. 6 caractères" />
          </div>
          {role === "recruiter" && (
            <div>
              <label className="label">Entreprise</label>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" placeholder="Nom de votre entreprise" />
            </div>
          )}
          <div>
            <label className="label">{role === "recruiter" ? "Fonction" : "Poste actuel"}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Localisation</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Ville, pays" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Création…" : "Créer mon compte"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Déjà inscrit ? <Link href="/login" className="link-brand">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
