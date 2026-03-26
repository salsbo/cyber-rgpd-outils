# Spec : Pages "Votre métier" — dahouse.fr

> Date : 2026-03-20
> Statut : validé (brainstorm)

## Objectif

Ajouter 6 pages verticales métiers sur dahouse.fr pour parler à chaque visiteur dans le contexte de son activité professionnelle. Chaque page adapte le wording, les enjeux critiques, les solutions proposées et l'ambiance visuelle (gradient coloré) au métier du visiteur.

## Décisions de design

| Question | Décision |
|----------|----------|
| Nom de l'onglet navbar | "Votre métier" |
| Navigation | Dropdown dans la navbar (même pattern que "Offres") |
| Routing | 6 sous-pages : `/votre-metier/[slug]` |
| Style visuel | Gradient métier subtil sur fond Dark Titanium existant |
| Ton du wording | Interpellation directe ("Vos données patients ne peuvent pas attendre.") |
| CTA | Mini-formulaire intégré dans chaque page (4 champs visibles + 2 hidden) |
| Approche technique | Pages statiques dédiées avec `generateStaticParams` + fichier de données centralisé |

## Les 6 verticaux métiers

| Métier | Slug | Emoji | Couleur accent (Tailwind) |
|--------|------|-------|---------------------------|
| Médecin libéral | `medecin` | 🩺 | `sky` |
| Avocat | `avocat` | ⚖️ | `amber` |
| Commerce & artisanat | `commerce` | 🍞 | `orange` |
| Immobilier | `immobilier` | 🏠 | `emerald` |
| Expert-comptable | `comptable` | 📊 | `violet` |
| Collectivité & asso | `collectivite` | 🏛️ | `blue` |

## Architecture technique

### Fichiers à créer

```
src/
├── content/
│   └── metiers.ts                    # Données des 6 métiers (suit convention src/content/)
├── app/
│   └── votre-metier/
│       └── [slug]/
│           └── page.tsx              # Page métier (generateStaticParams + generateMetadata)
└── components/
    └── ui/
        ├── MetierHero.tsx            # Hero avec gradient métier
        ├── MetierEnjeux.tsx          # Grille enjeux critiques (2x2)
        ├── MetierSolutions.tsx       # Cards solutions (3 cols)
        └── MetierContactForm.tsx     # Mini-formulaire (3 champs + hidden)
```

### Fichiers à modifier

```
src/components/ui/Navbar.tsx          # Ajouter dropdown "Votre métier" avant "Offres"
src/app/contact/page.tsx              # Extraire constante Turnstile vers shared constants
functions/api/contact.ts              # Support champ optionnel `metier` dans le body
```

### Structure de données — `src/content/metiers.ts`

```ts
export interface Enjeu {
  icon: string;              // Emoji (ex: "🔒", "📡") — pas de Lucide, cohérent avec le dropdown navbar
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

export interface Solution {
  title: string;
  description: string;
  linkTo?: string;
}

export interface Metier {
  slug: string;
  label: string;
  emoji: string;
  accentColor: string;
  hero: {
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  enjeux: Enjeu[];
  solutions: Solution[];
  cta: {
    title: string;
    placeholder: string;   // Placeholder du textarea "Message" (ex: "Ex : cabinet de 3 médecins...")
  };
}

export const metiers: Metier[] = [ /* 6 entrées */ ];

export function getMetierBySlug(slug: string): Metier | undefined {
  return metiers.find((m) => m.slug === slug);
}
```

### Page métier — `src/app/votre-metier/[slug]/page.tsx`

- `generateStaticParams()` retourne les 6 slugs depuis `metiers`
- `generateMetadata()` (même pattern que `src/app/blog/[slug]/page.tsx`) :
  - Title : `"Médecin libéral — DAHOUSE"`
  - Description : reprend le `hero.subtitle`
  - OpenGraph configuré par métier
- `params` : type `Promise<{ slug: string }>` (Next.js 15 async params), résolu avec `await`
- Si slug invalide → `notFound()` (import depuis `next/navigation`)
- Importe `getMetierBySlug`, rend les 4 sections :
  1. `MetierHero` — label mono uppercase + emoji, titre H1, accent en gradient couleur métier, sous-titre, blob gradient en fond
  2. `MetierEnjeux` — grille 2x2 (mobile 1 col), cards glassmorphism avec liseré gauche coloré par sévérité (critical=red, warning=amber, info=accent)
  3. `MetierSolutions` — 3 colonnes, cards glassmorphism, lien optionnel vers `/offres`
  4. `MetierContactForm` — prénom, nom, email, textarea + champ hidden `metier`, Turnstile CAPTCHA, POST vers `/api/contact`

### Navbar — modification dropdown

Position du dropdown "Votre métier" : s'insère **entre les simpleLinks (Blog, Outils) et le dropdown Offres** dans le rendu de la navbar. Ordre final : Blog | Outils | Votre métier ▾ | Offres ▾ | Contact | [Espace Client]

Structure identique au dropdown existant :
- Desktop : hover pour ouvrir, outside-click pour fermer, `useRef` + event listener
- Mobile : accordion dans le menu hamburger
- 6 items avec emoji + label, pointant vers `/votre-metier/[slug]`

### Mini-formulaire

- Réutilise l'endpoint existant `/api/contact` (Cloudflare Pages Function)
- Champs visibles : Prénom (text, required), Nom (text, required), Email (email, required), Message (textarea, required, placeholder depuis `cta.placeholder`)
- Champ hidden : `metier` = slug du métier courant
- Champ hidden : `subject` = `label` du métier (ex: "Médecin libéral")
- Turnstile CAPTCHA : site key `0x4AAAAAACMSC4vxXPmJ0h9I` — extraire dans `src/lib/constants.ts` (partagé avec `/contact`)
- Les champs envoyés correspondent au contrat existant : `firstName`, `lastName`, `email`, `message`, `subject` + nouveau champ optionnel `metier`
- Pas de nouveau endpoint serverless

### Modification de `/api/contact`

Ajout mineur : si le champ `metier` est présent dans le body, le sujet de l'email devient `[${metierLabel}] ${firstName} ${lastName}` au lieu de `[${subject}] ${firstName} ${lastName}`. Rétrocompatible — si `metier` absent, comportement inchangé. Le `metierLabel` est résolu côté serveur depuis une map slug→label, ou directement envoyé par le client dans le champ `subject`.

## Layout visuel de chaque page

```
┌─────────────────────────────────────────┐
│  NAVBAR ("Votre métier ▾" actif)        │
├─────────────────────────────────────────┤
│                                         │
│  HERO                                   │
│  Mono label : emoji + métier            │
│  H1 : titre                             │
│  Gradient text : titre accent           │
│  Sous-titre                             │
│  Gradient blob fond (couleur métier)    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ENJEUX CRITIQUES (2x2 desktop)         │
│  Cards glassmorphism + liseré sévérité  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CE QU'ON FAIT POUR VOUS (3 cols)       │
│  Cards glassmorphism + lien /offres     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MINI-FORMULAIRE                        │
│  Titre personnalisé                     │
│  Nom / Email / Message                  │
│  Turnstile + Bouton Envoyer             │
│                                         │
├─────────────────────────────────────────┤
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

## Animations

- Framer Motion `whileInView` scroll reveals sur chaque section (même pattern que homepage)
- Stagger sur les cards enjeux (delay 0.1 × index)
- Gradient blob en fond du hero avec `animate-float` existant
- Transitions hover sur cards : `hover:bg-white/[0.04] hover:border-white/20`

## SEO

6 pages indexables :
- `/votre-metier/medecin`
- `/votre-metier/avocat`
- `/votre-metier/commerce`
- `/votre-metier/immobilier`
- `/votre-metier/comptable`
- `/votre-metier/collectivite`

Chaque page a ses propres meta title, description, et OpenGraph.

## Compatibilité

- Static export (`output: "export"`) : compatible via `generateStaticParams`
- Cloudflare Pages : aucun changement d'infra
- Mobile responsive : grilles passent en 1 colonne
- Pas de nouveau endpoint serverless
- Pas de dépendance ajoutée

## Contenu des 6 métiers

Le contenu détaillé (titres, enjeux, solutions) sera rédigé dans `src/content/metiers.ts` lors de l'implémentation. Thèmes principaux par métier :

### Médecin libéral
- Enjeux : données patients / HDS, télétransmission (Sesam-Vitale), disponibilité internet, poste de travail sécurisé
- Solutions : sauvegarde chiffrée, supervision connexion, sécurisation poste

### Avocat
- Enjeux : confidentialité dossiers clients, stockage/partage sécurisé, messagerie chiffrée, conformité RGPD
- Solutions : coffre-fort numérique, partage sécurisé, supervision accès

### Commerce & artisanat
- Enjeux : caisse/TPE connectée, Wi-Fi client, site web/commandes en ligne, vidéosurveillance
- Solutions : réseau fiable, supervision caisse, app commandes

### Immobilier
- Enjeux : CRM/gestion mandats, visites virtuelles, signature électronique, multi-sites
- Solutions : apps métier, interconnexion agences, supervision

### Expert-comptable
- Enjeux : échange sécurisé avec clients, archivage légal, logiciel comptable hébergé, PRA
- Solutions : portail client sécurisé, sauvegarde certifiée, plan de reprise

### Collectivité & asso
- Enjeux : budget contraint, données citoyens/adhérents, accessibilité RGAA, multi-sites
- Solutions : mutualisation, supervision, conformité RGPD
