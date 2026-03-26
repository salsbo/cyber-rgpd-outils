# "Votre métier" — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter 6 pages verticales métiers sur dahouse.fr avec dropdown navbar, contenu personnalisé, et mini-formulaire de contact intégré.

**Architecture:** Pages statiques Next.js 15 (`generateStaticParams`) alimentées par un fichier de données centralisé `src/content/metiers.ts`. Nouveau dropdown "Votre métier" dans la navbar (même pattern que "Offres"). Mini-formulaire réutilisant l'endpoint `/api/contact` existant.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Cloudflare Pages (static export), Turnstile CAPTCHA, Resend API

**Spec:** `docs/superpowers/specs/2026-03-20-votre-metier-design.md`

---

## File Map

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Create | `src/content/metiers.ts` | Types + données des 6 métiers |
| Create | `src/lib/constants.ts` | Constantes partagées (Turnstile site key) |
| Create | `src/components/ui/MetierHero.tsx` | Section hero avec gradient métier |
| Create | `src/components/ui/MetierEnjeux.tsx` | Grille enjeux critiques 2x2 |
| Create | `src/components/ui/MetierSolutions.tsx` | Cards solutions 3 colonnes |
| Create | `src/components/ui/MetierContactForm.tsx` | Mini-formulaire contact |
| Create | `src/app/votre-metier/[slug]/page.tsx` | Page métier (routing, metadata, assembly) |
| Modify | `src/components/ui/Navbar.tsx` | Ajouter dropdown "Votre métier" |
| Modify | `src/app/contact/page.tsx` | Utiliser constante Turnstile partagée |
| Modify | `functions/api/contact.ts` | Support champ `metier` dans le sujet email |

---

### Task 1: Fichier de données métiers

**Files:**
- Create: `src/content/metiers.ts`

- [ ] **Step 1: Créer le fichier avec types et données**

```ts
// src/content/metiers.ts

export interface Enjeu {
  icon: string;
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
    placeholder: string;
  };
}

export const metiers: Metier[] = [
  {
    slug: "medecin",
    label: "Médecin libéral",
    emoji: "🩺",
    accentColor: "sky",
    hero: {
      title: "Vos données patients",
      titleAccent: "ne peuvent pas attendre.",
      subtitle: "Télétransmission, sauvegarde, conformité HDS — on sécurise votre cabinet."
    },
    enjeux: [
      {
        icon: "🔒",
        title: "Données patients",
        description: "Sauvegarde chiffrée quotidienne, conformité HDS, accès contrôlé au dossier médical.",
        severity: "critical"
      },
      {
        icon: "📡",
        title: "Télétransmission",
        description: "Connexion fiable pour Sesam-Vitale, plan de reprise en cas de panne internet.",
        severity: "critical"
      },
      {
        icon: "💻",
        title: "Poste de travail",
        description: "Antivirus, mises à jour automatiques, verrouillage de session — votre poste est votre outil principal.",
        severity: "warning"
      },
      {
        icon: "📋",
        title: "Conformité réglementaire",
        description: "RGPD, HDS, traçabilité des accès — les obligations ne sont pas optionnelles.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Sauvegarde chiffrée",
        description: "Vos données patients sauvegardées chaque nuit, chiffrées, testées chaque mois.",
        linkTo: "/offres"
      },
      {
        title: "Supervision connexion",
        description: "Alerte en temps réel si votre lien internet tombe. Bascule 4G automatique.",
        linkTo: "/sentinel"
      },
      {
        title: "Sécurisation poste",
        description: "Antivirus géré, mises à jour planifiées, verrouillage USB. Sans rien toucher à vos habitudes."
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet de 3 médecins, logiciel Doctolib, NAS Synology, connexion fibre Orange..."
    }
  },
  {
    slug: "avocat",
    label: "Avocat",
    emoji: "⚖️",
    accentColor: "amber",
    hero: {
      title: "Vos dossiers clients",
      titleAccent: "méritent mieux qu'un NAS sous le bureau.",
      subtitle: "Confidentialité, partage sécurisé, conformité RGPD — on protège votre cabinet."
    },
    enjeux: [
      {
        icon: "🔐",
        title: "Confidentialité dossiers",
        description: "Secret professionnel = obligation. Chiffrement, accès restreint, traçabilité complète.",
        severity: "critical"
      },
      {
        icon: "📁",
        title: "Stockage & partage",
        description: "Partager des pièces avec un client sans WeTransfer ni clé USB. Sécurisé, traçable.",
        severity: "critical"
      },
      {
        icon: "✉️",
        title: "Messagerie sécurisée",
        description: "Emails chiffrés, anti-phishing, protection contre l'usurpation d'identité.",
        severity: "warning"
      },
      {
        icon: "📋",
        title: "Conformité RGPD",
        description: "Registre de traitement, durées de conservation, droit d'accès — tout doit être carré.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Coffre-fort numérique",
        description: "Stockage chiffré avec partage par lien sécurisé. Vos clients accèdent à leurs documents, rien de plus.",
        linkTo: "/offres"
      },
      {
        title: "Messagerie protégée",
        description: "Anti-spam, anti-phishing, chiffrement TLS. Vos échanges restent confidentiels.",
        linkTo: "/offres"
      },
      {
        title: "Supervision accès",
        description: "Qui a accédé à quoi, quand. Journal d'audit complet pour votre conformité.",
        linkTo: "/sentinel"
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet individuel, 2 collaborateurs, RPVA, serveur local, échanges par email..."
    }
  },
  {
    slug: "commerce",
    label: "Commerce & artisanat",
    emoji: "🍞",
    accentColor: "orange",
    hero: {
      title: "Votre caisse plante ?",
      titleAccent: "Vos clients ne vont pas attendre.",
      subtitle: "TPE, Wi-Fi, commandes en ligne — on fiabilise votre outil de travail."
    },
    enjeux: [
      {
        icon: "💳",
        title: "Caisse & TPE",
        description: "Terminal de paiement, logiciel de caisse, connexion — si l'un tombe, vous ne vendez plus.",
        severity: "critical"
      },
      {
        icon: "📶",
        title: "Wi-Fi client",
        description: "Un Wi-Fi fiable pour vos clients et séparé de votre réseau pro. Obligatoire.",
        severity: "warning"
      },
      {
        icon: "🌐",
        title: "Site & commandes",
        description: "Click & collect, prise de commande en ligne — votre vitrine numérique doit tourner.",
        severity: "warning"
      },
      {
        icon: "📹",
        title: "Vidéosurveillance",
        description: "Caméras IP, enregistrement local ou cloud, accès distant sécurisé.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Réseau fiable",
        description: "Wi-Fi pro séparé du Wi-Fi client, bascule 4G automatique, zéro interruption.",
        linkTo: "/offres"
      },
      {
        title: "Supervision caisse",
        description: "Alerte si votre TPE ou votre caisse ne répond plus. Intervention rapide.",
        linkTo: "/sentinel"
      },
      {
        title: "Site web & commandes",
        description: "Application de prise de commande adaptée à votre activité. Simple, rapide, fiable.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre commerce en quelques lignes.",
      placeholder: "Ex : boulangerie, 2 points de vente, caisse Lightspeed, click & collect, Wi-Fi client..."
    }
  },
  {
    slug: "immobilier",
    label: "Immobilier",
    emoji: "🏠",
    accentColor: "emerald",
    hero: {
      title: "Vos mandats sont partout.",
      titleAccent: "Vos outils devraient suivre.",
      subtitle: "CRM, signature électronique, multi-agences — on connecte votre activité."
    },
    enjeux: [
      {
        icon: "📊",
        title: "CRM & mandats",
        description: "Gestion des biens, suivi acquéreurs, pipeline de vente — tout dans un seul outil.",
        severity: "critical"
      },
      {
        icon: "🏘️",
        title: "Multi-agences",
        description: "Plusieurs sites, une seule base. Accès distant sécurisé, données synchronisées.",
        severity: "critical"
      },
      {
        icon: "✍️",
        title: "Signature électronique",
        description: "Compromis, baux, mandats — signez à distance en toute conformité.",
        severity: "warning"
      },
      {
        icon: "📸",
        title: "Visites virtuelles",
        description: "Photos HDR, visites 360° — votre vitrine en ligne doit être irréprochable.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Apps métier connectées",
        description: "CRM, signature, diffusion annonces — on intègre vos outils pour qu'ils se parlent.",
        linkTo: "/offres"
      },
      {
        title: "Interconnexion agences",
        description: "VPN sécurisé entre vos sites, accès distant pour les agents terrain.",
        linkTo: "/offres"
      },
      {
        title: "Supervision réseau",
        description: "Chaque agence supervisée. Alerte et intervention avant que ça impacte vos ventes.",
        linkTo: "/sentinel"
      }
    ],
    cta: {
      title: "Décrivez votre agence en quelques lignes.",
      placeholder: "Ex : 3 agences, logiciel Apimo, 8 négociateurs terrain, signature Yousign..."
    }
  },
  {
    slug: "comptable",
    label: "Expert-comptable",
    emoji: "📊",
    accentColor: "violet",
    hero: {
      title: "Vos clients vous confient leurs chiffres.",
      titleAccent: "Pas le droit à l'erreur.",
      subtitle: "Archivage légal, échanges sécurisés, PRA — on protège votre cabinet."
    },
    enjeux: [
      {
        icon: "🔒",
        title: "Échanges sécurisés",
        description: "Vos clients vous envoient des bulletins de paie par email. C'est un problème.",
        severity: "critical"
      },
      {
        icon: "📦",
        title: "Archivage légal",
        description: "10 ans de conservation minimum. Intégrité, horodatage, accès contrôlé.",
        severity: "critical"
      },
      {
        icon: "🖥️",
        title: "Logiciel hébergé",
        description: "Cegid, Sage, ACD — en local ou en cloud, la disponibilité est non négociable.",
        severity: "warning"
      },
      {
        icon: "🔄",
        title: "Plan de reprise",
        description: "Si votre serveur tombe en période fiscale, combien de temps pouvez-vous attendre ?",
        severity: "warning"
      }
    ],
    solutions: [
      {
        title: "Portail client sécurisé",
        description: "Échange de documents chiffré. Fini les pièces jointes sensibles par email.",
        linkTo: "/offres"
      },
      {
        title: "Sauvegarde certifiée",
        description: "Archivage conforme, restauration testée, historique complet sur 10 ans.",
        linkTo: "/offres"
      },
      {
        title: "PRA en 4 heures",
        description: "Plan de reprise d'activité : votre cabinet repart en moins de 4 heures.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet 12 collaborateurs, Cegid en local, 800 dossiers, serveur vieillissant..."
    }
  },
  {
    slug: "collectivite",
    label: "Collectivité & association",
    emoji: "🏛️",
    accentColor: "blue",
    hero: {
      title: "Budget serré.",
      titleAccent: "Exigences maximales.",
      subtitle: "Données citoyens, accessibilité, multi-sites — on adapte les solutions à vos moyens."
    },
    enjeux: [
      {
        icon: "👥",
        title: "Données citoyens",
        description: "État civil, listes électorales, aides sociales — des données sensibles à protéger.",
        severity: "critical"
      },
      {
        icon: "🏢",
        title: "Multi-sites",
        description: "Mairie, annexes, associations — interconnecter sans exploser le budget.",
        severity: "warning"
      },
      {
        icon: "♿",
        title: "Accessibilité RGAA",
        description: "Vos services en ligne doivent être accessibles à tous. Obligation légale.",
        severity: "warning"
      },
      {
        icon: "💰",
        title: "Budget contraint",
        description: "Chaque euro compte. Les solutions doivent être dimensionnées, pas surdimensionnées.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Mutualisation",
        description: "Partage d'infrastructure entre services ou communes. Plus fiable, moins cher.",
        linkTo: "/offres"
      },
      {
        title: "Supervision centralisée",
        description: "Un tableau de bord pour tous vos sites. Alertes, état du réseau, interventions.",
        linkTo: "/sentinel"
      },
      {
        title: "Conformité RGPD",
        description: "Registre, DPO externalisé, sensibilisation agents — on vous accompagne.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre structure en quelques lignes.",
      placeholder: "Ex : commune 5 000 hab., 3 sites, 40 postes, pas d'informaticien en interne..."
    }
  }
];

export function getMetierBySlug(slug: string): Metier | undefined {
  return metiers.find((m) => m.slug === slug);
}
```

- [ ] **Step 2: Vérifier que le build passe**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`
Expected: aucune erreur TypeScript

- [ ] **Step 3: Commit**

```bash
git add src/content/metiers.ts
git commit -m "feat: add metiers data file with 6 business verticals"
```

---

### Task 2: Constante Turnstile partagée

**Files:**
- Create: `src/lib/constants.ts`
- Modify: `src/app/contact/page.tsx:31` — remplacer la constante locale

- [ ] **Step 1: Créer le fichier constants**

```ts
// src/lib/constants.ts
export const TURNSTILE_SITE_KEY = "0x4AAAAAACMSC4vxXPmJ0h9I";
```

- [ ] **Step 2: Modifier contact/page.tsx**

Remplacer la ligne 31 :
```ts
const TURNSTILE_SITE_KEY = "0x4AAAAAACMSC4vxXPmJ0h9I";
```
Par :
```ts
import { TURNSTILE_SITE_KEY } from "@/lib/constants";
```
(Supprimer la déclaration locale, ajouter l'import en haut du fichier.)

- [ ] **Step 3: Vérifier que le build passe**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`
Expected: aucune erreur

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts src/app/contact/page.tsx
git commit -m "refactor: extract Turnstile site key to shared constants"
```

---

### Task 3: Composant MetierHero

**Files:**
- Create: `src/components/ui/MetierHero.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/ui/MetierHero.tsx
"use client";

import { motion } from "framer-motion";
import type { Metier } from "@/content/metiers";

const accentStyles: Record<string, { gradient: string; blob: string }> = {
  sky: { gradient: "from-sky-400 to-sky-600", blob: "bg-sky-500/10" },
  amber: { gradient: "from-amber-400 to-amber-600", blob: "bg-amber-500/10" },
  orange: { gradient: "from-orange-400 to-orange-600", blob: "bg-orange-500/10" },
  emerald: { gradient: "from-emerald-400 to-emerald-600", blob: "bg-emerald-500/10" },
  violet: { gradient: "from-violet-400 to-violet-600", blob: "bg-violet-500/10" },
  blue: { gradient: "from-blue-400 to-blue-600", blob: "bg-blue-500/10" },
};

export default function MetierHero({ metier }: { metier: Metier }) {
  const style = accentStyles[metier.accentColor] || accentStyles.blue;

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Gradient blob background */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${style.blob} blur-3xl animate-float pointer-events-none`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto text-center"
      >
        {/* Mono label */}
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {metier.emoji} {metier.label}
        </span>

        {/* Title */}
        <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
          {metier.hero.title}
          <br />
          <span className={`bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
            {metier.hero.titleAccent}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          {metier.hero.subtitle}
        </p>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MetierHero.tsx
git commit -m "feat: add MetierHero component with accent gradient"
```

---

### Task 4: Composant MetierEnjeux

**Files:**
- Create: `src/components/ui/MetierEnjeux.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/ui/MetierEnjeux.tsx
"use client";

import { motion } from "framer-motion";
import type { Enjeu } from "@/content/metiers";

const severityBorder: Record<string, string> = {
  critical: "border-l-red-500",
  warning: "border-l-amber-500",
};

const accentBorder: Record<string, string> = {
  sky: "border-l-sky-500",
  amber: "border-l-amber-500",
  orange: "border-l-orange-500",
  emerald: "border-l-emerald-500",
  violet: "border-l-violet-500",
  blue: "border-l-blue-500",
};

interface MetierEnjeuxProps {
  enjeux: Enjeu[];
  accentColor: string;
}

export default function MetierEnjeux({ enjeux, accentColor }: MetierEnjeuxProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center mb-12"
        >
          Les enjeux critiques de votre activité
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enjeux.map((enjeu, i) => {
            const borderClass =
              severityBorder[enjeu.severity] ||
              accentBorder[accentColor] ||
              "border-l-blue-500";

            return (
              <motion.div
                key={enjeu.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 border-l-4 ${borderClass}`}
              >
                <span className="text-2xl">{enjeu.icon}</span>
                <h3 className="mt-3 text-lg font-display font-semibold text-white">
                  {enjeu.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {enjeu.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MetierEnjeux.tsx
git commit -m "feat: add MetierEnjeux component with severity indicators"
```

---

### Task 5: Composant MetierSolutions

**Files:**
- Create: `src/components/ui/MetierSolutions.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/ui/MetierSolutions.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Solution } from "@/content/metiers";

const accentText: Record<string, string> = {
  sky: "text-sky-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  blue: "text-blue-400",
};

interface MetierSolutionsProps {
  solutions: Solution[];
  accentColor: string;
}

export default function MetierSolutions({ solutions, accentColor }: MetierSolutionsProps) {
  const linkColor = accentText[accentColor] || "text-blue-400";

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center mb-12"
        >
          Ce qu&apos;on fait pour vous
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((solution, i) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all"
            >
              <h3 className="text-lg font-display font-semibold text-white">
                {solution.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {solution.description}
              </p>
              {solution.linkTo && (
                <Link
                  href={solution.linkTo}
                  className={`inline-block mt-4 text-sm font-medium ${linkColor} hover:underline`}
                >
                  En savoir plus →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MetierSolutions.tsx
git commit -m "feat: add MetierSolutions component with linked cards"
```

---

### Task 6: Composant MetierContactForm

**Files:**
- Create: `src/components/ui/MetierContactForm.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/ui/MetierContactForm.tsx
"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface MetierContactFormProps {
  metierSlug: string;
  metierLabel: string;
  cta: {
    title: string;
    placeholder: string;
  };
}

export default function MetierContactForm({ metierSlug, metierLabel, cta }: MetierContactFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(""),
          'error-callback': () => setTurnstileToken(""),
          theme: 'dark',
        });
      }
    };

    if (window.turnstile) {
      initTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          initTurnstile();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const resetTurnstile = useCallback(() => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken("");
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = formData.get("website") as string;
    if (honeypot) {
      setFormState("success");
      return;
    }

    if (!turnstileToken) {
      setFormState("error");
      setErrorMessage("Veuillez compléter la vérification de sécurité");
      return;
    }

    const data = {
      firstName: (formData.get("firstName") as string || "").trim(),
      lastName: (formData.get("lastName") as string || "").trim(),
      email: (formData.get("email") as string || "").trim(),
      subject: metierLabel,
      message: (formData.get("message") as string || "").trim(),
      metier: metierSlug,
      turnstileToken,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Une erreur est survenue");

      setFormState("success");
      form.reset();
      resetTurnstile();
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue");
      resetTurnstile();
    }
  };

  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-center mb-8">
          {cta.title}
        </h2>

        <div className="bg-white/[0.03] border border-white/10 p-8 md:p-10 rounded-3xl backdrop-blur-xl">
          {formState === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Message reçu !</h3>
              <p className="text-muted-foreground">On revient vers vous rapidement.</p>
              <button
                onClick={() => setFormState("idle")}
                className="mt-8 text-sm text-white underline underline-offset-4 hover:text-white/80"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] opacity-0 h-0 w-0"
                aria-hidden="true"
              />

              {formState === "error" && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                  placeholder="jean@exemple.fr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white resize-none placeholder:text-white/20"
                  placeholder={cta.placeholder}
                />
              </div>

              <div ref={turnstileRef} className="flex justify-center" />

              <button
                disabled={formState === "submitting"}
                type="submit"
                className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-[1.01] shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formState === "submitting" ? "Envoi en cours..." : "Envoyer"}
                {formState === "idle" && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `cd ~/dahouse.fr && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MetierContactForm.tsx
git commit -m "feat: add MetierContactForm component with Turnstile"
```

---

### Task 7: Page métier (routing + metadata)

**Files:**
- Create: `src/app/votre-metier/[slug]/page.tsx`

- [ ] **Step 1: Créer la page**

Suivre le pattern exact de `src/app/blog/[slug]/page.tsx` :

```ts
import { notFound } from "next/navigation";
import { metiers, getMetierBySlug } from "@/content/metiers";
import type { Metadata } from "next";
import MetierHero from "@/components/ui/MetierHero";
import MetierEnjeux from "@/components/ui/MetierEnjeux";
import MetierSolutions from "@/components/ui/MetierSolutions";
import MetierContactForm from "@/components/ui/MetierContactForm";

export function generateStaticParams() {
  return metiers.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);
  if (!metier) return {};

  return {
    title: `${metier.label} — DAHOUSE`,
    description: metier.hero.subtitle,
    openGraph: {
      title: `${metier.label} — DAHOUSE`,
      description: metier.hero.subtitle,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function MetierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);
  if (!metier) notFound();

  return (
    <main className="min-h-screen">
      <MetierHero metier={metier} />
      <MetierEnjeux enjeux={metier.enjeux} accentColor={metier.accentColor} />
      <MetierSolutions solutions={metier.solutions} accentColor={metier.accentColor} />
      <MetierContactForm
        metierSlug={metier.slug}
        metierLabel={metier.label}
        cta={metier.cta}
      />
    </main>
  );
}
```

- [ ] **Step 2: Vérifier le build statique**

Run: `cd ~/dahouse.fr && npm run build`
Expected: build réussi, 6 pages générées dans `out/votre-metier/`

- [ ] **Step 3: Commit**

```bash
git add src/app/votre-metier/
git commit -m "feat: add votre-metier pages with static generation"
```

---

### Task 8: Dropdown "Votre métier" dans la navbar

**Files:**
- Modify: `src/components/ui/Navbar.tsx`

- [ ] **Step 1: Ajouter l'import et les states**

En haut du fichier, ajouter l'import (après les imports existants) :
```ts
import { metiers } from "@/content/metiers";
```

Dans le composant (après ligne 14 `const offresRef`), ajouter :
```ts
const [isMetierOpen, setIsMetierOpen] = useState(false);
const [isMobileMetierOpen, setIsMobileMetierOpen] = useState(false);
const metierRef = useRef<HTMLDivElement>(null);
```

Dans le `useEffect` outside-click existant (lignes 26-34), ajouter la gestion de `metierRef` :
```ts
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (offresRef.current && !offresRef.current.contains(event.target as Node)) {
      setIsOffresOpen(false);
    }
    if (metierRef.current && !metierRef.current.contains(event.target as Node)) {
      setIsMetierOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

- [ ] **Step 2: Insérer le dropdown desktop**

Dans le JSX desktop, **entre** le rendu `{simpleLinks.map(...)}` (fin ligne 80) et le commentaire `{/* Offres dropdown */}` (ligne 82), insérer :

```tsx
{/* Votre métier dropdown */}
<div
  ref={metierRef}
  className="relative"
  onMouseEnter={() => setIsMetierOpen(true)}
  onMouseLeave={() => setIsMetierOpen(false)}
>
  <button
    onClick={() => setIsMetierOpen(!isMetierOpen)}
    className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
  >
    Votre métier
    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isMetierOpen && "rotate-180")} />
  </button>

  <AnimatePresence>
    {isMetierOpen && (
      <motion.div
        initial={{ opacity: 0, y: -5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1.5 bg-[#0F1319] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl min-w-[220px]"
      >
        {metiers.map((m) => (
          <Link
            key={m.slug}
            href={`/votre-metier/${m.slug}`}
            onClick={() => setIsMetierOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            {m.emoji} {m.label}
          </Link>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

- [ ] **Step 3: Insérer l'accordion mobile**

Dans le JSX mobile, **entre** le rendu `{simpleLinks.map(...)}` (fin ligne 167) et le commentaire `{/* Offres accordion mobile */}` (ligne 169), insérer :

```tsx
{/* Votre métier accordion mobile */}
<div>
  <button
    onClick={() => setIsMobileMetierOpen(!isMobileMetierOpen)}
    className="text-lg font-medium text-muted-foreground hover:text-white flex items-center gap-2 w-full"
  >
    Votre métier
    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isMobileMetierOpen && "rotate-180")} />
  </button>
  <AnimatePresence>
    {isMobileMetierOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="pl-4 pt-2 space-y-2">
          {metiers.map((m) => (
            <Link
              key={m.slug}
              href={`/votre-metier/${m.slug}`}
              className="block text-base text-muted-foreground hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {m.emoji} {m.label}
            </Link>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

- [ ] **Step 4: Vérifier le build**

Run: `cd ~/dahouse.fr && npm run build`
Expected: build réussi

- [ ] **Step 5: Test visuel**

Run: `cd ~/dahouse.fr && npm run dev`
Vérifier dans le navigateur :
- Desktop : hover sur "Votre métier" ouvre le dropdown avec les 6 métiers
- Cliquer sur un métier → page `/votre-metier/[slug]` s'affiche
- Mobile : accordion "Votre métier" fonctionne
- Le dropdown "Offres" continue de fonctionner normalement

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Navbar.tsx
git commit -m "feat: add 'Votre métier' dropdown to navbar"
```

---

### Task 9: Modifier endpoint `/api/contact` pour supporter le champ métier

**Files:**
- Modify: `functions/api/contact.ts`

- [ ] **Step 1: Ajouter le champ optionnel à l'interface**

Dans `ContactFormData` (ligne 3-11), ajouter :
```ts
metier?: string;
```

- [ ] **Step 2: Sanitize le nouveau champ**

Après la ligne `data.message = sanitize(...)` (ligne 50), ajouter :
```ts
data.metier = sanitize(data.metier || '', 50);
```

- [ ] **Step 3: Ajouter le champ métier dans le template HTML email**

La ligne sujet email (ligne 249) reste inchangée — le formulaire métier envoie déjà `subject = metierLabel` (ex: "Médecin libéral"), donc le sujet de l'email sera `[Médecin libéral] Prénom Nom` automatiquement.

Ajouter dans le template HTML, après le bloc "Sujet" (après ligne 229), si `data.metier` est présent :
```ts
${data.metier ? `
<div class="field">
  <span class="label">Métier</span>
  <div class="value">${escapeHtml(data.metier)}</div>
</div>
` : ''}
```

- [ ] **Step 4: Vérifier que le formulaire /contact existant fonctionne toujours**

Le champ `metier` est optionnel — le formulaire existant n'envoie pas ce champ, donc le comportement est inchangé.

- [ ] **Step 5: Commit**

```bash
git add functions/api/contact.ts
git commit -m "feat: support optional metier field in contact endpoint"
```

---

### Task 10: Test complet et build final

- [ ] **Step 1: Build statique**

Run: `cd ~/dahouse.fr && npm run build`
Expected: build réussi, vérifier que `out/votre-metier/medecin/index.html` (et les 5 autres) existent.

- [ ] **Step 2: Vérifier les 6 pages**

Run: `cd ~/dahouse.fr && npm run dev`
Naviguer vers chaque page et vérifier :
- `/votre-metier/medecin` — gradient sky, 4 enjeux, 3 solutions, formulaire
- `/votre-metier/avocat` — gradient amber
- `/votre-metier/commerce` — gradient orange
- `/votre-metier/immobilier` — gradient emerald
- `/votre-metier/comptable` — gradient violet
- `/votre-metier/collectivite` — gradient blue

Vérifier sur chaque page :
- Hero avec gradient correct
- Cards enjeux avec liserés de sévérité
- Cards solutions avec liens
- Formulaire fonctionnel (Turnstile charge, champs présents)

- [ ] **Step 3: Vérifier responsive**

Ouvrir DevTools, tester en 375px (mobile) :
- Navbar : accordion "Votre métier" fonctionne
- Grilles passent en 1 colonne
- Formulaire lisible

- [ ] **Step 4: Vérifier `/contact` non cassé**

Naviguer vers `/contact` — formulaire existant inchangé, Turnstile charge.

- [ ] **Step 5: Lint**

Run: `cd ~/dahouse.fr && npm run lint`
Expected: pas de nouvelles erreurs

- [ ] **Step 6: Commit final si ajustements**

```bash
git add -A
git commit -m "fix: final adjustments for votre-metier pages"
```
