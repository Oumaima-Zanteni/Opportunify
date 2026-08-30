# Frontend Opportunify (Next.js 14 + Tailwind CSS)

Interface web de la plateforme Opportunify.

## Démarrage

```bash
cd frontend
npm install
cp .env.example .env.local   # adapter NEXT_PUBLIC_API_URL si besoin
npm run dev
```

Le frontend démarre sur `http://localhost:3000`.

## Variables d'environnement

| Variable              | Description                | Défaut                          |
|-----------------------|----------------------------|---------------------------------|
| NEXT_PUBLIC_API_URL   | URL de l'API backend       | http://localhost:5000/api       |

## Pages

| Route                          | Description                                  |
|--------------------------------|----------------------------------------------|
| `/`                            | Accueil (hero, features, offres récentes)    |
| `/offers`                      | Liste des offres + filtres + recherche       |
| `/offers/:id`                  | Détail d'une offre + postulation             |
| `/offers/new`                  | Créer une offre (recruteur)                  |
| `/offers/:id/edit`             | Modifier une offre (recruteur)               |
| `/login`                       | Connexion                                    |
| `/register`                    | Inscription (candidat ou recruteur)          |
| `/profile`                     | Mon profil (édition)                         |
| `/applications`                | Mes candidatures / candidatures reçues       |
| `/applications/:id`            | Détail candidature + gestion statut          |
| `/messages`                    | Messagerie interne                           |
| `/dashboard/recruiter`         | Dashboard recruteur (stats + offres)         |
| `/dashboard/jobseeker`         | Dashboard candidat (stats + graphiques)      |

## Charte graphique

- **Rouge principal** : `#e51515` (brand-600)
- **Noir** : `#0a0a0a` (ink)
- **Blanc** : fond par défaut
- Police : Inter
- Style : moderne, épuré, cartes arrondies, ombres douces
