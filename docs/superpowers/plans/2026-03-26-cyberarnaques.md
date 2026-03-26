# Cyberarnaques Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Cyberarnaques" awareness tool to dahouse.fr — a 12-step full-screen carousel that teaches visitors to recognize scam patterns.

**Architecture:** Single page with internal state (useState for current step). No API, no data collection. Carousel of 12 steps + intro screen + final screen. Integrates into the existing tools grid with SplitFlapCounter and ToolRating.

**Tech Stack:** Next.js 15, React 19, Framer Motion, Tailwind CSS 4, lucide-react icons.

---

### Task 1: Create layout.tsx (SEO metadata)

**Files:**
- Create: `src/app/outils/cyberarnaques/layout.tsx`

- [ ] **Step 1: Create the layout file**

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Cyberarnaques - Les signaux d'alerte et les bons reflexes",
	description:
		"Apprenez a reconnaitre les signaux d'une cyberarnaque et adoptez les bons reflexes. Parcours interactif gratuit, aucune donnee collectee.",
	keywords: ["cyberarnaque", "arnaque", "phishing", "sensibilisation", "securite", "prevention", "ingenierie sociale"],
	openGraph: {
		title: "Cyberarnaques - DAHOUSE",
		description: "Parcours interactif pour reconnaitre et dejouer les cyberarnaques.",
		url: "https://dahouse.fr/outils/cyberarnaques",
	},
	alternates: { canonical: "https://dahouse.fr/outils/cyberarnaques" },
};

export default function CyberarnaqueLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/outils/cyberarnaques/layout.tsx
git commit -m "feat(cyberarnaques): add layout with SEO metadata"
```

---

### Task 2: Create page.tsx (carousel + all content)

**Files:**
- Create: `src/app/outils/cyberarnaques/page.tsx`

This is the main file. It contains the step data, the carousel logic, and all screens (intro, 12 steps, final).

- [ ] **Step 1: Create the page file with imports and step data**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	ShieldAlert,
	UserX,
	Brain,
	DatabaseZap,
	AlertTriangle,
	Timer,
	EyeOff,
	HandMetal,
	Theater,
	PhoneOff,
	SearchCheck,
	MessageCircle,
	KeyRound,
	ShieldCheck,
	Lock,
	ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Donnees des etapes                                                 */
/* ------------------------------------------------------------------ */

interface Step {
	phase: string;
	phaseColor: string;
	icon: LucideIcon;
	title: string;
	text: string;
	example?: string;
}

const STEPS: Step[] = [
	// Phase 1 — Introduction
	{
		phase: "Introduction",
		phaseColor: "text-indigo-400",
		icon: UserX,
		title: "Ca n'arrive pas qu'aux autres",
		text: "Quand on entend parler d'une arnaque, la premiere reaction est souvent : \"Comment a-t-il pu tomber dans le panneau ?\" C'est une erreur. Les arnaques modernes exploitent des mecanismes psychologiques profonds. Personne n'est a l'abri. Ce n'est pas une question d'intelligence, c'est une question de contexte : fatigue, stress, emotion, moment de faiblesse. Ca peut arriver a n'importe qui, a n'importe quel moment.",
	},
	{
		phase: "Introduction",
		phaseColor: "text-indigo-400",
		icon: Brain,
		title: "Votre cerveau est la cible",
		text: "Les arnaqueurs ne piratent pas votre ordinateur. Ils piratent votre cerveau. Ils utilisent des leviers documentes en psychologie sociale : l'autorite (\"je suis le commissaire Dupont\"), l'urgence (\"vous avez 2 heures\"), la reciprocite (\"je vous aide, aidez-moi en retour\"), l'engagement (\"vous avez deja commence la procedure\"). Ces biais existent chez tout le monde. Les connaitre, c'est la premiere defense.",
	},
	{
		phase: "Introduction",
		phaseColor: "text-indigo-400",
		icon: DatabaseZap,
		title: "Vos donnees sont deja dans la nature",
		text: "Les fuites de donnees massives sont devenues banales. Nom, adresse, telephone, email, parfois numero de securite sociale ou IBAN. Ces informations circulent et se revendent. Quand un arnaqueur vous appelle en citant votre nom, votre adresse et votre banque, ce n'est pas de la magie. C'est de l'ingenierie sociale. Plus l'arnaque colle a votre realite, plus votre cerveau valide l'histoire. C'est exactement pour ca que les fuites de donnees, meme \"juste un email\", sont graves.",
	},
	// Phase 2 — Les signaux d'alerte
	{
		phase: "Les signaux d'alerte",
		phaseColor: "text-amber-400",
		icon: AlertTriangle,
		title: "Signal 1 : la gravite",
		text: "Un accident, un compte bloque, une fraude en cours, une enquete judiciaire vous concernant. Le premier outil de l'arnaqueur, c'est de vous annoncer quelque chose de grave. L'objectif est de declencher une reaction emotionnelle qui court-circuite votre raisonnement. Plus c'est grave, moins vous reflechissez.",
		example: "\"Bonjour, ici le service fraude de votre banque. Des mouvements suspects ont ete detectes sur votre compte.\"",
	},
	{
		phase: "Les signaux d'alerte",
		phaseColor: "text-amber-400",
		icon: Timer,
		title: "Signal 2 : l'urgence",
		text: "\"Il faut agir maintenant.\" \"Vous avez jusqu'a ce soir.\" \"Chaque minute compte.\" L'urgence est le deuxieme pilier. Elle vous empeche de prendre du recul, de verifier, de demander un avis. Un interlocuteur legitime ne vous mettra jamais dans une situation ou tout se joue dans les 10 prochaines minutes.",
		example: "\"Si vous ne validez pas cette operation dans les 15 minutes, votre compte sera definitivement bloque.\"",
	},
	{
		phase: "Les signaux d'alerte",
		phaseColor: "text-amber-400",
		icon: EyeOff,
		title: "Signal 3 : la confidentialite",
		text: "\"Surtout n'en parlez a personne.\" \"C'est une enquete en cours, toute divulgation est passible de poursuites.\" \"Meme votre conjoint ne doit pas etre au courant.\" Cet isolement est calcule. En vous coupant de votre entourage, l'arnaqueur supprime vos garde-fous. Des que quelqu'un vous demande le secret, c'est un signal d'alarme majeur.",
		example: "\"Cette operation est confidentielle dans le cadre d'une enquete de la Banque de France. Vous ne devez en parler a personne, y compris a votre conseiller bancaire habituel.\"",
	},
	{
		phase: "Les signaux d'alerte",
		phaseColor: "text-amber-400",
		icon: HandMetal,
		title: "Signal 4 : la prise en main",
		text: "L'arnaqueur ne vous laisse jamais raccrocher, jamais reflechir, jamais verifier. \"Restez en ligne.\" \"Je vous guide etape par etape.\" \"Ne quittez pas l'application.\" L'objectif est de garder le controle sur votre attention et vos actions. Toute situation legitime vous laisse le temps de rappeler, de verifier, de reflechir.",
		example: "\"Ne raccrochez pas, je vous transfere a mon responsable qui va finaliser la procedure avec vous.\"",
	},
	{
		phase: "Les signaux d'alerte",
		phaseColor: "text-amber-400",
		icon: Theater,
		title: "Signal 5 : le decor est faux",
		text: "Sur Internet, tout peut etre falsifie. Un email peut afficher n'importe quel expediteur. Un site web peut reproduire celui de votre banque a l'identique. Un numero de telephone peut etre maquille pour afficher celui de votre conseiller. Et demain, la voix de votre patron ou d'un proche pourra etre clonee a partir de quelques secondes d'enregistrement. A moins d'etre expert, vous ne pouvez pas vous fier aux apparences numeriques.",
		example: "Vous recevez un SMS de \"La Poste\" avec un lien vers un site visuellement identique a laposte.fr. L'URL est \"la-p0ste-suivi.com\".",
	},
	// Phase 3 — Les bons reflexes
	{
		phase: "Les bons reflexes",
		phaseColor: "text-emerald-400",
		icon: PhoneOff,
		title: "Reflexe 1 : rompre l'echange",
		text: "Le reflexe le plus important. Raccrochez. Fermez l'onglet. Posez le telephone. Sortez de la piece s'il le faut. Toute situation qui ne vous laisse pas le temps de reflechir est suspecte par definition. Un interlocuteur legitime comprendra toujours que vous ayez besoin de rappeler. S'il insiste pour que vous restiez en ligne, c'est precisement la raison pour laquelle vous devez raccrocher.",
	},
	{
		phase: "Les bons reflexes",
		phaseColor: "text-emerald-400",
		icon: SearchCheck,
		title: "Reflexe 2 : verifier par vous-meme",
		text: "Apres avoir raccroche, verifiez. Mais pas en rappelant le numero qui vous a contacte, pas en cliquant sur le lien qu'on vous a envoye. Retrouvez vous-meme le numero officiel de l'organisme : sur votre carte bancaire, sur un courrier papier, sur le site officiel que vous tapez vous-meme dans le navigateur. Appelez ce numero. Si l'alerte etait reelle, votre interlocuteur le confirmera.",
	},
	{
		phase: "Les bons reflexes",
		phaseColor: "text-emerald-400",
		icon: MessageCircle,
		title: "Reflexe 3 : en parler",
		text: "Parlez-en a un proche, un collegue, quelqu'un de confiance. Decrivez la situation. Le simple fait de raconter l'histoire a voix haute active votre esprit critique et celui de l'autre. C'est d'autant plus important dans le cadre professionnel : l'arnaque au president repose entierement sur l'isolement du collaborateur cible.",
	},
	{
		phase: "Les bons reflexes",
		phaseColor: "text-emerald-400",
		icon: KeyRound,
		title: "Reflexe 4 : le code secret",
		text: "Un conseil pour les plus prudents. Convenez en famille ou en entreprise d'un mot de passe oral, un mot absurde qui n'a aucun rapport avec le sujet. Comme la toupie dans Inception : si elle ne tombe pas, c'est un reve. Si le mot de passe n'est pas prononce, la demande n'est pas authentique. Avant tout virement, le mot \"parapluie\" doit apparaitre dans l'echange. Si quelqu'un appelle en se faisant passer pour un proche, demandez-lui le code. Avec l'arrivee du clonage vocal par IA, ce reflexe deviendra indispensable.",
	},
];

const TOTAL_STEPS = STEPS.length;
```

- [ ] **Step 2: Add the component with intro screen, carousel, and final screen**

Below the constants, in the same file `src/app/outils/cyberarnaques/page.tsx`:

```tsx
/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CyberarnaqueePage() {
	// "intro" | step index (0-11) | "final"
	const [current, setCurrent] = useState<"intro" | number | "final">("intro");

	const handleStart = () => setCurrent(0);
	const handleNext = () => {
		if (typeof current === "number") {
			if (current < TOTAL_STEPS - 1) {
				setCurrent(current + 1);
			} else {
				setCurrent("final");
			}
		}
	};

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-2xl mx-auto">
				{/* Back link */}
				<Link
					href="/outils"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors mb-8"
				>
					<ArrowLeft className="w-4 h-4" />
					Tous les outils
				</Link>

				<AnimatePresence mode="wait">
					{current === "intro" && (
						<IntroScreen key="intro" onStart={handleStart} />
					)}
					{typeof current === "number" && (
						<StepScreen
							key={`step-${current}`}
							step={STEPS[current]}
							index={current}
							total={TOTAL_STEPS}
							onNext={handleNext}
						/>
					)}
					{current === "final" && <FinalScreen key="final" />}
				</AnimatePresence>
			</div>
		</main>
	);
}

/* ------------------------------------------------------------------ */
/*  Ecran d'accueil                                                    */
/* ------------------------------------------------------------------ */

function IntroScreen({ onStart }: { onStart: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.4 }}
		>
			<div className="flex items-center gap-3 mb-6">
				<div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
					<ShieldAlert className="w-6 h-6 text-amber-400" />
				</div>
				<div>
					<h1 className="text-3xl md:text-4xl font-display font-bold">
						Cyberarnaques
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Les signaux d'alerte et les bons reflexes
					</p>
				</div>
			</div>

			<div className="glass-card p-6 rounded-2xl border border-white/10 mb-8">
				<p className="text-muted-foreground leading-relaxed">
					Ce parcours vous presente les mecanismes utilises par les
					arnaqueurs et les reflexes concrets pour vous en proteger.
					Chaque etape merite votre attention : les arnaques
					fonctionnent parce qu'elles exploitent des failles
					humaines, pas techniques.
				</p>
				<p className="text-muted-foreground leading-relaxed mt-4">
					3 minutes de lecture. Aucune donnee collectee.
				</p>
			</div>

			<motion.div
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				className="inline-flex items-center gap-1 text-xs text-emerald-400/80 mb-6"
			>
				<Lock className="w-3 h-3" />
				Tout se passe dans votre navigateur. Aucune donnee collectee.
			</motion.div>

			<div>
				<button
					onClick={onStart}
					className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
				>
					Commencer
				</button>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  Ecran d'etape (carrousel)                                          */
/* ------------------------------------------------------------------ */

function StepScreen({
	step,
	index,
	total,
	onNext,
}: {
	step: Step;
	index: number;
	total: number;
	onNext: () => void;
}) {
	const Icon = step.icon;
	const progress = ((index + 1) / total) * 100;

	return (
		<motion.div
			initial={{ opacity: 0, x: 40 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -40 }}
			transition={{ duration: 0.4 }}
		>
			{/* Progression */}
			<div className="mb-8">
				<div className="flex items-center justify-between text-sm mb-2">
					<span className={step.phaseColor}>{step.phase}</span>
					<span className="text-muted-foreground">
						{index + 1} / {total}
					</span>
				</div>
				<div className="w-full h-1 rounded-full bg-white/10">
					<motion.div
						className="h-full rounded-full bg-indigo-500"
						initial={{ width: `${(index / total) * 100}%` }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.4 }}
					/>
				</div>
			</div>

			{/* Carte */}
			<div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10">
				<div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
					<Icon className="w-6 h-6 text-white" />
				</div>

				<h2 className="text-2xl font-display font-bold mb-4">
					{step.title}
				</h2>

				<p className="text-muted-foreground leading-relaxed">
					{step.text}
				</p>

				{step.example && (
					<div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
						<p className="text-sm text-white/70 italic">
							{step.example}
						</p>
					</div>
				)}
			</div>

			{/* Bouton */}
			<div className="mt-8">
				<button
					onClick={onNext}
					className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
				>
					J&apos;ai compris
				</button>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  Ecran final                                                        */
/* ------------------------------------------------------------------ */

function FinalScreen() {
	const resources = [
		{
			label: "cybermalveillance.gouv.fr",
			description: "Assistance et diagnostic en ligne",
			href: "https://www.cybermalveillance.gouv.fr",
		},
		{
			label: "0 805 805 817",
			description: "Info Escroqueries (appel gratuit)",
			href: "tel:0805805817",
		},
		{
			label: "pre-plainte-en-ligne.gouv.fr",
			description: "Deposer une pre-plainte si vous etes victime",
			href: "https://www.pre-plainte-en-ligne.gouv.fr",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="text-center mb-8">
				<div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
					<ShieldCheck className="w-8 h-8 text-emerald-400" />
				</div>
				<h2 className="text-2xl font-display font-bold mb-3">
					Vous connaissez les signaux et les reflexes
				</h2>
				<p className="text-muted-foreground">
					Gardez-les en tete. En cas de doute, ces ressources peuvent vous aider.
				</p>
			</div>

			<div className="space-y-3 mb-10">
				{resources.map((r) => (
					<a
						key={r.label}
						href={r.href}
						target="_blank"
						rel="noopener noreferrer"
						className="glass-card p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] block"
					>
						<div>
							<p className="font-semibold text-white">{r.label}</p>
							<p className="text-sm text-muted-foreground">
								{r.description}
							</p>
						</div>
						<ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
					</a>
				))}
			</div>

			<Link
				href="/outils"
				className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				Retour aux outils
			</Link>
		</motion.div>
	);
}
```

- [ ] **Step 3: Verify the dev server renders the page**

Run: `cd ~/dahouse.fr && npm run dev`

Open: `http://localhost:3000/outils/cyberarnaques`

Expected: Intro screen with title, description, "Commencer" button. Clicking through all 12 steps should work. Final screen shows 3 resource links.

- [ ] **Step 4: Commit**

```bash
git add src/app/outils/cyberarnaques/page.tsx
git commit -m "feat(cyberarnaques): add carousel page with 12 steps"
```

---

### Task 3: Add to the tools listing grid

**Files:**
- Modify: `src/app/outils/page.tsx`

- [ ] **Step 1: Add the import for ShieldAlert icon**

In `src/app/outils/page.tsx`, add `ShieldAlert` to the lucide-react import (line 6):

```tsx
import { Wrench, Mail, Video, Shield, Globe, MapPin, ClipboardCheck, Smartphone, Wifi, Signal, Lock, ArrowRight, Cable, ShieldAlert } from "lucide-react";
```

- [ ] **Step 2: Add `cyberarnaques` to BASE_COUNTS**

In `src/app/outils/page.tsx`, add the entry after `"simulation-wifi": 0,` (line 25):

```tsx
	"cyberarnaques": 0,
```

- [ ] **Step 3: Add the tool object to the tools array**

In `src/app/outils/page.tsx`, add after the `simulation-wifi` object (before the closing `];` of the tools array, around line 134):

```tsx
	{
		name: "Cyberarnaques",
		description:
			"Apprenez a reconnaitre les 5 signaux d'une arnaque et les reflexes pour vous en proteger. Parcours interactif de 3 minutes.",
		href: "/outils/cyberarnaques",
		icon: ShieldAlert,
		slug: "cyberarnaques",
		tags: ["Securite", "Sensibilisation", "Arnaque", "Prevention"],
		privacy: "Aucune donnee collectee",
	},
```

- [ ] **Step 4: Verify the tool card appears in the grid**

Open: `http://localhost:3000/outils`

Expected: New "Cyberarnaques" card with ShieldAlert icon, 4 tags, privacy notice. Clicking it navigates to `/outils/cyberarnaques`.

- [ ] **Step 5: Commit**

```bash
git add src/app/outils/page.tsx
git commit -m "feat(cyberarnaques): add tool card to listing grid"
```

---

### Task 4: Register slug in tool-stats API

**Files:**
- Modify: `functions/api/tool-stats.ts`

- [ ] **Step 1: Add `cyberarnaques` to BASE_COUNTS in tool-stats.ts**

In `functions/api/tool-stats.ts`, add after `"simulation-wifi": 0,` (line 22):

```tsx
	"cyberarnaques": 0,
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/tool-stats.ts
git commit -m "feat(cyberarnaques): register slug in tool-stats API"
```

---

### Task 5: Build verification

- [ ] **Step 1: Run production build**

Run: `cd ~/dahouse.fr && npm run build`

Expected: Build succeeds with no errors. `/out/outils/cyberarnaques/index.html` is generated.

- [ ] **Step 2: Verify the generated page exists**

Run: `ls -la ~/dahouse.fr/out/outils/cyberarnaques/`

Expected: `index.html` file present.

- [ ] **Step 3: Final commit (if any lint fixes needed)**

Only if the build produced warnings that need fixing. Otherwise skip.
