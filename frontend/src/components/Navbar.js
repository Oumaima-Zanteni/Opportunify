"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/offers", label: "Offres" },
];

export default function Navbar() {
  const { user, logout, isAuthenticated, isRecruiter, isJobseeker, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <nav className="section flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-black text-white">
              O
            </div>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              Opportun<span className="text-brand-600">ify</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === l.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isRecruiter && (
              <Link
                href="/dashboard/recruiter"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname?.startsWith("/dashboard/recruiter")
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink"
                }`}
              >
                Espace recruteur
              </Link>
            )}
            {isJobseeker && (
              <Link
                href="/dashboard/jobseeker"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname?.startsWith("/dashboard/jobseeker")
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink"
                }`}
              >
                Mon espace
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/messages"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname?.startsWith("/messages")
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink"
                }`}
              >
                Messages
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-neutral-100" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm font-medium hover:border-brand-300"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="max-w-[120px] truncate">{user?.firstName}</span>
                <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-fade-in rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-neutral-100 px-4 py-2.5">
                      <p className="text-sm font-semibold text-ink">{user?.firstName} {user?.lastName}</p>
                      <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                      <span className="mt-1 inline-block badge-red">
                        {user?.role === "recruiter" ? "Recruteur" : user?.role === "admin" ? "Admin" : "Chercheur"}
                      </span>
                    </div>
                    <Link href="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-ink hover:bg-neutral-50">Mon profil</Link>
                    {isRecruiter && (
                      <Link href="/offers/new" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-ink hover:bg-neutral-50">Publier une offre</Link>
                    )}
                    {isJobseeker && (
                      <>
                        <Link href="/cv" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-ink hover:bg-neutral-50">Mon CV</Link>
                        <Link href="/applications" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-ink hover:bg-neutral-50">Mes candidatures</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-brand-600 hover:bg-brand-50">
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Connexion</Link>
              <Link href="/register" className="btn-primary">S'inscrire</Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden rounded-lg p-2 hover:bg-neutral-100"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Mon profil</Link>
              {isJobseeker && (
                <>
                  <Link href="/cv" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Mon CV</Link>
                  <Link href="/applications" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Mes candidatures</Link>
                </>
              )}
              <Link href="/messages" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Messages</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-600 hover:bg-brand-50">Déconnexion</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1">Connexion</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1">S'inscrire</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
