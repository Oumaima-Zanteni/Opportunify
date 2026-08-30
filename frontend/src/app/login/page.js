"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
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
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 font-black text-white">O</div>
            <span className="text-2xl font-extrabold">Opportun<span className="text-brand-600">ify</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-ink">Connexion</h1>
          <p className="mt-1 text-sm text-ink-muted">Accédez à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-7">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Connexion…" : "Se connecter"}</button>
        </form>

        {/* <div className="mt-4 rounded-lg bg-neutral-50 p-4 text-center text-sm text-ink-muted">
          <p className="font-medium text-ink">Comptes de démo :</p>
          <p className="mt-1">Recruteur : recruteur@opportunify.fr</p>
          <p>Candidat : candidat@opportunify.fr</p>
          <p>Mot de passe : password123</p>
        </div> */}

        <p className="mt-6 text-center text-sm text-ink-muted">
          Pas encore de compte ? <Link href="/register" className="link-brand">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
