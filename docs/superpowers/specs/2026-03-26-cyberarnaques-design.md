# Cyberarnaques — Spec de design

## Resume

Nouvel outil de sensibilisation aux cyberarnaques sur dahouse.fr/outils/cyberarnaques. Parcours lineaire de 12 etapes en carrousel plein ecran, bouton "J'ai compris" pour avancer. Aucune collecte de donnees. Vouvoiement.

## Objectif

Ancrer chez le visiteur les signaux d'alerte et les bons reflexes face aux arnaques en ligne, par telephone ou en personne. Creer un pattern mental : "si je reconnais ces signaux, je m'arrete et je verifie".

## Structure du parcours

### Phase 1 — Introduction (etapes 1-3)

| # | Titre | Icone | Contenu |
|---|-------|-------|---------|
| 1 | Ca n'arrive pas qu'aux autres | `UserX` | Deconstruction du biais "les naifs se font avoir". Fatigue, stress, emotion — ca peut toucher tout le monde. |
| 2 | Votre cerveau est la cible | `Brain` | Biais psychologiques exploites : autorite, urgence, reciprocite, engagement. Les connaitre = premiere defense. |
| 3 | Vos donnees sont deja dans la nature | `DatabaseZap` | Fuites de donnees massives → ingenierie sociale. Plus l'arnaque colle a la realite, plus le cerveau valide. |

### Phase 2 — Les 5 signaux d'alerte (etapes 4-8)

| # | Titre | Icone | Contenu | Exemple |
|---|-------|-------|---------|---------|
| 4 | Signal 1 : la gravite | `AlertTriangle` | Annonce grave pour declencher une reaction emotionnelle | "Ici le service fraude de votre banque. Des mouvements suspects ont ete detectes." |
| 5 | Signal 2 : l'urgence | `Timer` | "Il faut agir maintenant" — empeche le recul et la verification | "Si vous ne validez pas dans les 15 minutes, votre compte sera bloque." |
| 6 | Signal 3 : la confidentialite | `EyeOff` | "N'en parlez a personne" — isole la victime de ses garde-fous | "Cette operation est confidentielle dans le cadre d'une enquete de la Banque de France." |
| 7 | Signal 4 : la prise en main | `HandMetal` | Ne jamais laisser la victime raccrocher ou reflechir seule | "Ne raccrochez pas, je vous transfere a mon responsable." |
| 8 | Signal 5 : le decor est faux | `Theater` | Emails, sites, numeros, et bientot voix — tout peut etre falsifie | SMS "La Poste" avec lien vers "la-p0ste-suivi.com" |

### Phase 3 — Les bons reflexes (etapes 9-12)

| # | Titre | Icone | Contenu |
|---|-------|-------|---------|
| 9 | Reflexe 1 : rompre l'echange | `PhoneOff` | Raccrocher, fermer, poser le telephone. Si on ne vous laisse pas le temps, c'est suspect. |
| 10 | Reflexe 2 : verifier par vous-meme | `SearchCheck` | Retrouver soi-meme le numero officiel. Jamais rappeler le numero qui a contacte. |
| 11 | Reflexe 3 : en parler | `MessageCircle` | Raconter a un proche active l'esprit critique. Essentiel contre l'arnaque au president. |
| 12 | Reflexe 4 : le code secret | `KeyRound` | Mot de passe oral absurde en famille/entreprise (concept "toupie" Inception). Indispensable avec le clonage vocal IA. |

### Ecran final

- Icone : `ShieldCheck` (emerald)
- Message sobre (pas de felicitations excessives)
- 3 ressources : cybermalveillance.gouv.fr, 0 805 805 817, pre-plainte-en-ligne.gouv.fr
- Bouton "Retour aux outils"

## UX et interactions

### Carrousel

- **Navigation** : bouton unique "J'ai compris" en bas, pas de retour arriere
- **Progression** : compteur "Etape X / 12" + barre de progression indigo
- **Label de phase** : affiche au-dessus du compteur ("Introduction", "Les signaux d'alerte", "Les bons reflexes")
- **Transition** : fade + slide gauche (framer-motion, ~0.4s)

### Structure d'une carte

- Icone en haut (badge rond teinte, style existant)
- Titre court (1 ligne)
- Texte principal (3-5 phrases, vouvoiement)
- Encadre exemple optionnel (glass-card sombre, italique)

### Ecran d'accueil (avant etape 1)

- Header standard dahouse.fr (back link, icone badge, titre, description)
- Bouton "Commencer" (indigo)
- Indication "3 minutes de lecture"

## Integration technique

### Fichiers a creer

| Fichier | Contenu |
|---------|---------|
| `src/app/outils/cyberarnaques/layout.tsx` | Metadata SEO uniquement |
| `src/app/outils/cyberarnaques/page.tsx` | Page complete avec carrousel (useState, tableau d'etapes) |

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/app/outils/page.tsx` | Ajouter carte dans la grille des outils |
| `functions/api/tool-stats.ts` | Ajouter `cyberarnaques` dans BASE_COUNTS |

### Pas de fichier API dedie

Aucune collecte de donnees, pas de rapport email.

### Modele de donnees (interne a la page)

```typescript
interface Step {
  phase: string;       // "Introduction" | "Les signaux d'alerte" | "Les bons reflexes"
  icon: LucideIcon;
  title: string;
  text: string;
  example?: string;
}
```

### Carte dans la grille outils

- **Slug** : `cyberarnaques`
- **Icone** : `ShieldAlert`
- **Tags** : `["securite", "sensibilisation", "arnaque", "prevention"]`
- **Privacy** : "Aucune donnee collectee. Tout se passe dans votre navigateur."
- **Href** : `/outils/cyberarnaques`

## Design visuel

- Suit integralement le design system dahouse.fr existant (Deep Titanium, glassmorphism, indigo primary)
- Animations framer-motion coherentes avec les autres pages
- Police Sora pour les titres, Inter pour le corps
- Couleurs des phases : indigo (intro), amber (signaux d'alerte), emerald (bons reflexes)
- Ecran final : emerald dominant (ShieldCheck)

## Hors scope

- Pas de quiz/QCM
- Pas de collecte email
- Pas de rapport PDF
- Pas de nouveau composant partage (carrousel interne a la page)
- Pas de backend/API dedie
