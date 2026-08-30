# Backend Opportunify (Node.js + Express + MongoDB)

API REST pour la plateforme Opportunify.

## Démarrage

```bash
cd backend
npm install
cp .env.example .env   # adapter les variables
npm run seed           # (optionnel) données de démo
npm run dev
```

L'API démarre sur `http://localhost:5000`.

### Sans MongoDB installé

Si aucun MongoDB n'écoute sur `MONGO_URI`, le serveur démarre (hors production) une
base locale de secours dont les données sont conservées dans `backend/.mongo-data`,
et crée automatiquement les comptes de démo si la base est vide.

Une seule instance du backend peut utiliser ce dossier à la fois : si le démarrage
échoue avec `DBPathInUse`, un ancien processus `mongod` tourne encore.

## Variables d'environnement

| Variable        | Description                          | Défaut                              |
|-----------------|--------------------------------------|-------------------------------------|
| PORT            | Port d'écoute                        | 5000                                |
| MONGO_URI       | URI de connexion MongoDB             | mongodb://127.0.0.1:27017/opportunify |
| JWT_SECRET      | Secret pour signer les tokens JWT    | -                                   |
| JWT_EXPIRES_IN  | Durée de validité des tokens         | 7d                                  |
| CLIENT_URL      | Origine(s) autorisée(s) CORS, séparées par des virgules | http://localhost:3000 |

En dehors de la production, toute origine `localhost`/`127.0.0.1` est acceptée, car
Next.js bascule sur un autre port (3001, 3002…) quand le 3000 est occupé.

## Comptes de démo (après `npm run seed`)

- Recruteur : `recruteur@opportunify.fr` / `password123`
- Candidat  : `candidat@opportunify.fr`  / `password123`

## Endpoints principaux

### Auth (`/api/auth`)
- `POST /register` — inscription (jobseeker | recruiter)
- `POST /login` — connexion, renvoie un JWT
- `GET  /me` — profil courant (protégé)
- `PUT  /profile` — mise à jour du profil
- `PUT  /password` — changement de mot de passe

### Offres (`/api/offers`)
- `GET  /` — liste + recherche (`q`, `type`, `category`, `location`, `remote`, `experienceLevel`, `salaryMin`, `salaryMax`, `sort`, `order`, `page`, `limit`)
- `GET  /:id` — détail (incrémente les vues)
- `GET  /me` — offres du recruteur connecté
- `POST /` — créer une offre (recruteur)
- `PUT  /:id` — modifier (propriétaire ou admin)
- `DELETE /:id` — supprimer (propriétaire ou admin)

### Candidatures (`/api/applications`)
- `POST /` — postuler (candidat)
- `GET  /me` — mes candidatures (candidat)
- `GET  /recruiter` — candidatures reçues (recruteur)
- `GET  /:id` — détail
- `PATCH /:id/status` — changer le statut (`pending|reviewed|accepted|rejected|withdrawn`)

### Messagerie (`/api/messages`)
- `GET  /conversations` — mes conversations
- `POST /conversations` — démarrer / récupérer une conversation
- `GET  /conversations/:id` — messages d'une conversation
- `POST /conversations/:id` — envoyer un message

### Dashboard (`/api/dashboard`)
- `GET /recruiter` — stats recruteur
- `GET /jobseeker` — stats candidat
