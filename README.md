# Opportunify

Plateforme qui met en relation **recruteurs** et **chercheurs d'opportunités** (emploi, stage, alternance, freelance).

## Stack

- **Frontend** : Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, React Hot Toast
- **Backend** : Node.js, Express, MongoDB, Mongoose
- **Auth** : JWT custom + bcrypt, rôles `jobseeker` / `recruiter` / `admin`
- **Charte** : rouge (`#e51515`), blanc, noir (`#0a0a0a`) — style moderne

## Structure

```
opportunify/
├── backend/      # API Express + MongoDB
│   └── src/
│       ├── config/        # db, jwt
│       ├── controllers/   # auth, offer, application, message, dashboard
│       ├── middleware/    # auth, error
│       ├── models/        # User, Offer, Application, Message
│       ├── routes/        # auth, offer, application, message, dashboard
│       ├── utils/         # seed.js
│       └── server.js
└── frontend/     # Next.js
    └── src/
        ├── app/           # pages (App Router)
        ├── components/    # Navbar, Footer, OfferCard, etc.
        ├── context/       # AuthContext
        └── lib/           # api, constants
```

## Démarrage rapide

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # adapter MONGO_URI si besoin
npm run seed               # données de démo (optionnel)
npm run dev
```

API : `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App : `http://localhost:3000`

### Comptes de démo (après `npm run seed`)

| Rôle       | Email                        | Mot de passe   |
|------------|------------------------------|----------------|
| Recruteur  | recruteur@opportunify.fr     | password123    |
| Candidat   | candidat@opportunify.fr      | password123    |

## Fonctionnalités

### Authentification
- Inscription avec choix du rôle (candidat / recruteur)
- Connexion JWT sécurisée (bcrypt)
- Gestion du profil + changement de mot de passe

### Offres (CRUD complet)
- Recruteur : publier, modifier, supprimer, gérer le statut
- Recherche plein-texte + filtres (type, catégorie, lieu, remote, niveau, salaire)
- Tri par date, salaire, popularité
- Pagination
- Compteur de vues

### Candidatures
- Candidat : postuler avec lettre de motivation, prétentions salariales, disponibilité
- Suivi du statut : en attente → examinée → acceptée / refusée / retirée
- Recruteur : voir les candidatures reçues, changer le statut, ajouter des notes

### Messagerie interne
- Conversations 1-à-1 entre recruteur et candidat
- Lien avec une candidature
- Compteur de messages non lus
- Marquage automatique comme lu

### Dashboards analytics
- **Recruteur** : offres publiées, candidatures par statut, vues totales, top offres, candidatures récentes
- **Candidat** : candidatures par statut (pie chart), candidatures par mois (bar chart), candidatures récentes

## API Endpoints

Voir [`backend/README.md`](./backend/README.md) pour la liste complète.
