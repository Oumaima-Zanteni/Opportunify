"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import FileUpload from "../../components/FileUpload";
import { initials } from "../../lib/constants";

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: user?.company || "",
    title: user?.title || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    skills: user?.skills || [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(
    user?.resumeUrl ? { url: user.resumeUrl, originalName: user.resumeName || "Mon CV" } : null
  );

  const persistResume = async (next) => {
    try {
      await updateProfile({
        ...form,
        resumeUrl: next?.url || "",
        resumeName: next?.originalName || "",
      });
      setResume(next);
      toast.success(next ? "CV enregistré sur votre profil" : "CV retiré de votre profil");
    } catch (err) {
      toast.error(err.message);
    }
  };

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
    try {
      await updateProfile(form);
      toast.success("Profil mis à jour");
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="section max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mon profil</h1>
      <p className="mt-1 text-ink-muted">Gérez vos informations personnelles</p>

      <div className="mt-8 card overflow-hidden">
        <div className="bg-ink p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold">
              {initials(user?.firstName, user?.lastName)}
            </div>
            <div>
              <p className="text-xl font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-neutral-400">{user?.email}</p>
              <span className="mt-1 inline-block badge bg-brand-600">
                {user?.role === "recruiter" ? "Recruteur" : user?.role === "admin" ? "Admin" : "Chercheur d'opportunité"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-7">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Nom</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>

          {user?.role === "recruiter" && (
            <div>
              <label className="label">Entreprise</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{user?.role === "recruiter" ? "Fonction" : "Poste actuel"}</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Localisation</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Ville, pays" />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="input resize-none" placeholder="Présentez-vous en quelques lignes…" />
          </div>

          {user?.role === "jobseeker" && (
            <div>
              <label className="label">Compétences</label>
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
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-6">{loading ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </form>
      </div>

      {user?.role === "jobseeker" && (
        <div className="mt-6 card p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Mon CV</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ce CV vous sera proposé automatiquement lors de vos candidatures.
              </p>
            </div>
            <Link href="/cv" className="btn-outline">Créateur de CV</Link>
          </div>

          <div className="mt-5">
            <FileUpload
              label=""
              value={resume}
              onUploaded={persistResume}
              onRemoved={() => persistResume(null)}
              hint="Glissez-déposez votre CV ici"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
