import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-ink text-white">
      <div className="section py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-black">O</div>
              <span className="text-xl font-extrabold">Opportun<span className="text-brand-500">ify</span></span>
            </div>
            <p className="mt-4 max-w-md text-sm text-neutral-400">
              La plateforme qui connecte recruteurs et chercheurs d'opportunités.
              Emplois, stages, alternances — trouvez la match parfait.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Plateforme</h4>
            <ul className="mt-4 space-y-2 text-sm text-neutral-400">
              <li><Link href="/offers" className="hover:text-brand-500">Offres</Link></li>
              <li><Link href="/register" className="hover:text-brand-500">S'inscrire</Link></li>
              <li><Link href="/login" className="hover:text-brand-500">Connexion</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Rôles</h4>
            <ul className="mt-4 space-y-2 text-sm text-neutral-400">
              <li><Link href="/register?role=recruiter" className="hover:text-brand-500">Je suis recruteur</Link></li>
              <li><Link href="/register?role=jobseeker" className="hover:text-brand-500">Je cherche un poste</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Opportunify. Tous droits réservés.</p>
          <p>Conçu avec <span className="text-brand-500">●</span> en Next.js & Node.js</p>
        </div>
      </div>
    </footer>
  );
}
