# Rapport Technique - Gestion des Stagiaires

## 1. Vue d'Ensemble du Projet

### 1.1 Description

L'application **Gestion des Stagiaires** est un système complet de gestion du cycle de vie des stagiaires au sein d'une organisation (type GIAS Industries). Elle permet de gérer l'ensemble du processus, depuis la candidature initiale jusqu'à la fin du stage, en passant par le suivi quotidien et l'évaluation des performances.

### 1.2 Objectifs Principaux

- Automatiser le processus de recrutement des stagiaires
- Centraliser la gestion des profils et documents
- Suivre la présence quotidienne
- Évaluer les performances des stagiaires
- Générer des conventions de stage automatiques
- Obtenir des statistiques et rapports analytiques

---

## 2. Architecture Technique

### 2.1 Stack Technologique

| Composant | Technologie |
|-----------|-------------|
| Serveur | Node.js (>=18.0.0) |
| Framework | Express.js 4.18.2 |
| Base de données | MySQL avec Sequelize ORM |
| Authentification | JWT + bcrypt |
| SMS/OTP | Twilio |
| Upload de fichiers | Multer |
| Génération PDF | PDFKit |
| Export Excel | xlsx |
| Sécurité | Helmet, express-rate-limit, CORS |

### 2.2 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration DB et entreprise
│   ├── middleware/      # Auth et RBAC
│   ├── models/          # Modèles Sequelize (14 modèles)
│   ├── routes/          # API endpoints (14 fichiers)
│   ├── services/        # Logique métier (11 services)
│   ├── index.js         # Point d'entrée
│   └── seed.js          # Données initiales
├── uploads/              # Fichiers uploadés (CV, LM)
├── package.json
└── .env
```

---

## 3. Modèles de Données

### 3.1 Entités Principales

| Modèle | Description | Relations clés |
|--------|-------------|----------------|
| **Utilisateur** | Compte utilisateur | Departement, Admin, Stagiaire, Tuteur |
| **Stagiaire** | Intern en stage | Utilisateur, Departement, Tuteur, Evaluations, Presences, Documents, Conventions |
| **Candidature** | Candidature spontanée | Departement (souhaité) → Stagiaire (conversion) |
| **Departement** | Service/Département | Utilisateurs, Stagiaires, Responsable |
| **Convention** | Accord de stage | Stagiaire, suivi de statut |
| **Evaluation** | Évaluation performance | Stagiaire, Tuteur, Validateur RH |
| **Presence** | Pointage quotidien | Stagiaire, Validateur |
| **Document** | Fichiers uploadés | Stagiaire, Générateur |
| **Notification** | Notifications utilisateur | Utilisateur |
| **Message** | Messages internes | Expéditeur, Destinataire |
| **AuditLog** | Journal d'audit | Utilisateur |

### 3.2 Schéma des Relations

```
Departement (1,N) ← Utilisateur
Departement (1,N) ← Stagiaire
Utilisateur (1,1) ← Stagiaire (compte)
Utilisateur (1,N) ← Stagiaire (tuteur)

Stagiaire (1,N) ← Evaluation
Stagiaire (1,N) ← Presence
Stagiaire (1,N) ← Document
Stagiaire (1,N) ← Convention
Stagiaire (1,N) ← Message

Candidature (1,1) → Stagiaire (conversion à l'acceptation)
```

---

## 4. Rôles et Permissions (RBAC)

### 4.1 Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| `super_admin` | Accès complet au système |
| `admin_rh` | Gestion RH, gérer les candidats et stagiaires |
| `chef_departement` | Gérer les stagiaires de son département |
| `stagiaire` | Accès limité à son propre profil |
| `candidat` | Soumettre une candidature |

### 4.2 Politique d'Accès

- Les candidats peuvent soumettre des candidatures publiquement
- Les stagiaires peuvent voir leur profil et historique
- Les chefs de département gèrent les stagiaires de leur service
- Les admins RH ont accès complet à la gestion RH
- Le super_admin a accès à toutes les fonctionnalités

---

## 5. Fonctionnalités Détaillées

### 5.1 Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | Inscription candidat avec vérification téléphone |
| `/api/auth/login` | POST | Connexion utilisateur |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/auth/me` | GET | Info utilisateur actuel |
| `/api/auth/send-otp` | POST | Envoi code OTP SMS |
| `/api/auth/verify-otp` | POST | Vérification téléphone |
| `/api/auth/forgot-password` | POST | Demande reset mot de passe |
| `/api/auth/reset-password` | POST | Reset mot de passe avec token |
| `/api/auth/change-password` | POST | Changement mot de passe |
| `/api/auth/refresh` | POST | Rafraîchir JWT |

**Sécurité:**
- Rate limiting (100 requêtes/minute)
- Hachage mot de passe avec bcrypt
- Tokens JWT avec expiration
- Vérification téléphone par OTP Twilio

### 5.2 Gestion des Candidatures

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/candidatures` | POST | Soumettre nouvelle candidature (CV/LM) |
| `/api/candidatures/track/:numero` | GET | Suivre par numéro |
| `/api/candidatures/suivi/:numero` | GET | Suivre avec email |
| `/api/candidatures` | GET | Liste toutes les candidatures (admin) |
| `/api/candidatures/:id` | GET | Détails candidature |
| `/api/candidatures/:id` | PUT | Mettre à jour statut |
| `/api/candidatures/:id/accept` | POST | Accepter → créer stagiaire + convention |
| `/api/candidatures/:id/reject` | POST | Rejeter |
| `/api/candidatures/:id/waitlist` | POST | Mettre en attente |
| `/api/candidatures/:id/documents` | POST | Demander documents |
| `/api/candidatures/:id/message` | POST | Envoyer message au candidat |

**Statuts de Candidature:**
- `en_attente` - En attente de review
- `en_cours` - En cours d'évaluation
- `documents_manquants` - Documents requis
- `liste_attente` - Liste d'attente
- `acceptee` - Acceptée
- `refusee` - Rejetée
- `annulee` - Annulée

### 5.3 Gestion des Stagiaires

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/stagiaires` | GET | Liste paginée et filtrée |
| `/api/stagiaires/:id` | GET | Détails stagiaire |
| `/api/stagiaires` | POST | Créer nouveau stagiaire |
| `/api/stagiaires/:id` | PUT | Mettre à jour |
| `/api/stagiaires/:id` | DELETE | Archiver (soft delete) |
| `/api/stagiaires/archives` | GET | Liste archivés |
| `/api/stagiaires/:id/terminer` | POST | Marquer stage terminé |
| `/api/stagiaires/:id/reactiver` | POST | Réactiver |

**Filtres:**
- Par département, entité, statut, tuteur
- Par recherche (nom, prénom, email)
- Pagination

### 5.4 Présences

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/presences` | GET | Liste des présences |
| `/api/presences` | POST | Enregistrer présence |
| `/api/presences/date/:date` | GET | Présences par date |
| `/api/presences/stagiaire/:id` | GET | Historique présence |

### 5.5 Évaluations

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/evaluations` | GET | Liste évaluations |
| `/api/evaluations` | POST | Créer évaluation |
| `/api/evaluations/stagiaire/:id` | GET | Évaluations d'un stagiaire |

### 5.6 Conventions

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/conventions` | GET | Liste conventions |
| `/api/conventions` | POST | Créer convention |
| `/api/conventions/generate/:stagiaireId` | POST | Générer PDF |
| `/api/conventions/:id/signer` | POST | Marquer comme signée |

### 5.7 Tableau de Bord (Dashboard)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/dashboard/kpis` | GET | KPIs principaux |
| `/api/dashboard/evolution` | GET | Tendances mensuelles |
| `/api/dashboard/departements` | GET | Répartition par département |
| `/api/dashboard/activite` | GET | Activité récente |
| `/api/dashboard/export/excel` | POST | Export Excel |
| `/api/dashboard/export/pdf` | POST | Générer rapport PDF |

**KPIs:**
- Total stagiaires, Stagiaires actifs
- Total candidatures, En attente/Acceptées/Rejetées
- Conventions en attente/signées
- Taux de présence
- Fin de stage imminentes (alertes)

---

## 6. Services Métier

| Service | Fonctionnalités |
|---------|-----------------|
| `authService.js` | Inscription, login, validation token |
| `emailService.js` | Envoi emails (confirmation, acceptation, rejet) |
| `otpService.js` | Génération et vérification OTP |
| `passwordResetService.js` | Réinitialisation mot de passe |
| `pdfService.js` | Génération PDF conventions |
| `smsService.js` | Envoi SMS (Twilio) |
| `auditService.js` | Journalisation des actions |
| `stagiaireService.js` | Logique gestion stagiaires |
| `userService.js` | Logique gestion utilisateurs |
| `searchService.js` | Recherche avancée |
| `notificationService.js` | NotificationsPush |

---

## 7. Sécurité et Conformité

### 7.1 Mesures de Sécurité

- **Helmet** - Headers HTTP sécurisés
- **CORS** - Contrôle des origines autorisées
- **Rate Limiting** - Limitation des requêtes (100/min)
- **bcrypt** - Hachage des mots de passe
- **JWT** - Tokens d'authentification
- **Audit Log** - Traçabilité des actions admin

### 7.2 Journalisation

- Toutes les actions importantes sont journalisées
- Logs d'erreur physiques (error.log)
- Traçabilité IP et utilisateur

---

## 8. API Reference Synthétique

### Routes Disponibles

```
/api/auth           → Authentification
/api/users          → Gestion utilisateurs
/api/departements   → Départements
/api/tuteurs        → Tuteurs/Mentors
/api/candidatures   → Candidatures
/api/conventions    → Conventions
/api/presences      → Présences
/api/evaluations    → Évaluations
/api/documents      → Documents
/api/dashboard      → Analytics
/api/notifications  → Notifications
/api/search         → Recherche
/api/stagiaires     → Stagiaires
```

---

## 9. Conclusion

Cette application est un système de gestion de stagiaires complet et structuré, adapté à un contexte d'entreprise. Elle offre:

- ✅ Gestion complète du cycle de vie des stagiaires
- ✅ Workflow de recrutement automatisé
- ✅ Suivi des présences et évaluations
- ✅ Génération automatique de documents
- ✅ Tableaux de bord analytiques
- ✅ Sécurité et traçabilité renforcées

L'architecture est modulaire, évolutive et suit les bonnes pratiques de développement Node.js/Express avec Sequelize.

---

*Document généré le 13 Avril 2026*
