"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	ShieldAlert,
	ShieldCheck,
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
	Lock,
	ExternalLink,
	type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Step data                                                          */
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
	// Phase "Introduction"
	{
		phase: "Introduction",
		phaseColor: "text-blue-600",
		icon: UserX,
		title: "Ça n\u2019arrive pas qu\u2019aux autres",
		text: "Les arnaques en ligne ne ciblent pas les gens crédules. Elles exploitent des mécanismes psychologiques universels. Personne n\u2019est immunisé. Ce qui fait la différence, ce n\u2019est pas l\u2019intelligence : c\u2019est le contexte. Fatigue, stress, émotion, routine. C\u2019est là que les arnaqueurs frappent.",
	},
	{
		phase: "Introduction",
		phaseColor: "text-blue-600",
		icon: Brain,
		title: "Votre cerveau est la cible",
		text: "Les cyberarnaques s\u2019appuient sur des biais psychologiques bien documentés : l\u2019autorité (un faux conseiller bancaire), l\u2019urgence (un compte bloqué), la réciprocité (un faux remboursement), l\u2019engagement (une série de petites actions anodines qui mènent à la grande). Comprendre ces ressorts, c\u2019est déjà s\u2019en protéger.",
	},
	{
		phase: "Introduction",
		phaseColor: "text-blue-600",
		icon: DatabaseZap,
		title: "Vos données sont déjà dans la nature",
		text: "Des fuites de données massives (opérateurs, réseaux sociaux, e-commerce) ont mis en circulation des millions de noms, emails, numéros de téléphone et mots de passe. Les arnaqueurs croisent ces informations pour construire des scenarii crédibles et personnalisés. C\u2019est ce qu\u2019on appelle l\u2019ingénierie sociale.",
	},
	// Phase "Les signaux d'alerte"
	{
		phase: "Les signaux d\u2019alerte",
		phaseColor: "text-amber-600",
		icon: AlertTriangle,
		title: "Signal 1 : la gravité",
		text: "Le premier signal est un choc émotionnel. L\u2019arnaqueur crée une situation grave pour court-circuiter votre réflexion. Fraude bancaire, colis bloqué, amende impayée, compte piraté. Le sujet est toujours alarmant.",
		example: "Bonjour, ici le service fraude de votre banque. Des mouvements suspects ont été détectés sur votre compte.",
	},
	{
		phase: "Les signaux d\u2019alerte",
		phaseColor: "text-amber-600",
		icon: Timer,
		title: "Signal 2 : l\u2019urgence",
		text: "Une fois l\u2019émotion installée, on vous met sous pression temporelle. L\u2019objectif : vous empêcher de réfléchir, de vérifier, de demander conseil. Si on vous donne un délai court, c\u2019est un signal d\u2019alerte.",
		example: "Si vous ne validez pas cette opération dans les 15 minutes, votre compte sera définitivement bloqué.",
	},
	{
		phase: "Les signaux d\u2019alerte",
		phaseColor: "text-amber-600",
		icon: EyeOff,
		title: "Signal 3 : la confidentialité",
		text: "L\u2019arnaqueur vous demande de ne parler de la situation à personne. C\u2019est un levier d\u2019isolement : il veut vous couper de vos filets de sécurité (conjoint, collègue, conseiller bancaire réel).",
		example: "Cette opération est confidentielle dans le cadre d\u2019une enquête de la Banque de France. Vous ne devez en parler à personne, y compris à votre conseiller bancaire habituel.",
	},
	{
		phase: "Les signaux d\u2019alerte",
		phaseColor: "text-amber-600",
		icon: HandMetal,
		title: "Signal 4 : la prise en main",
		text: "L\u2019arnaqueur veut garder le contrôle de l\u2019échange. Il vous guide pas à pas, vous demande de rester en ligne, vous transfère à un faux responsable. L\u2019objectif : ne jamais vous laisser le temps de raccrocher et de vérifier par vous-même.",
		example: "Ne raccrochez pas, je vous transfère à mon responsable qui va finaliser la procédure avec vous.",
	},
	{
		phase: "Les signaux d\u2019alerte",
		phaseColor: "text-amber-600",
		icon: Theater,
		title: "Signal 5 : le décor est faux",
		text: "Tout est imitable : un email avec le logo de votre banque, un site identique à l\u2019original, un numéro de téléphone qui s\u2019affiche comme celui de votre conseiller (spoofing). Bientôt, même la voix sera clonée par IA. Ne faites jamais confiance à l\u2019apparence.",
		example: "SMS reçu de \u00ab La Poste \u00bb : \u00ab Votre colis est en attente. Confirmez la livraison ici : la-p0ste-suivi.com \u00bb. L\u2019URL contient un zéro à la place du \u00ab o \u00bb.",
	},
	// Phase "Les bons réflexes"
	{
		phase: "Les bons réflexes",
		phaseColor: "text-emerald-600",
		icon: PhoneOff,
		title: "Réflexe 1 : rompre l\u2019échange",
		text: "Le premier réflexe est de couper le contact. Raccrochez le téléphone, fermez l\u2019onglet, ne répondez pas au SMS. Prenez du recul. Aucun organisme sérieux ne vous reprochera d\u2019avoir raccroché pour vérifier.",
	},
	{
		phase: "Les bons réflexes",
		phaseColor: "text-emerald-600",
		icon: SearchCheck,
		title: "Réflexe 2 : vérifier par vous-même",
		text: "Retrouvez le numéro officiel de l\u2019organisme concerné (sur votre carte bancaire, sur le site officiel, dans votre espace client). Appelez-le vous-même. Ne rappelez jamais le numéro qui vous a contacté, même s\u2019il ressemble au bon.",
	},
	{
		phase: "Les bons réflexes",
		phaseColor: "text-emerald-600",
		icon: MessageCircle,
		title: "Réflexe 3 : en parler",
		text: "Parlez-en à une personne de confiance avant d\u2019agir. Un collègue, un proche, votre responsable informatique. En entreprise, c\u2019est le meilleur rempart contre la fraude au président : un simple \u00ab j\u2019ai reçu un truc bizarre \u00bb suffit souvent à désamorcer.",
	},
	{
		phase: "Les bons réflexes",
		phaseColor: "text-emerald-600",
		icon: KeyRound,
		title: "Réflexe 4 : le code secret",
		text: "Mettez en place un code verbal secret avec vos proches ou votre équipe. Comme la toupie dans Inception : si le code n\u2019est pas prononcé, la demande n\u2019est pas authentique. C\u2019est simple, gratuit, et ça deviendra indispensable avec le clonage vocal par IA.",
	},
];

/* ------------------------------------------------------------------ */
/*  IntroScreen                                                        */
/* ------------------------------------------------------------------ */

function IntroScreen({ onStart }: { onStart: () => void }) {
	return (
		<motion.div
			key="intro"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.5 }}
			className="text-center space-y-8"
		>
			{/* Icon badge */}
			<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200">
				<ShieldAlert className="w-6 h-6 text-amber-600" />
			</div>

			{/* Title */}
			<div>
				<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
					Cyberarnaques
				</h1>
				<p className="text-lg text-muted-foreground">
					Les signaux d&apos;alerte et les bons réflexes
				</p>
			</div>

			{/* Glass card intro */}
			<div className="glass-card rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left space-y-4">
				<p className="text-muted-foreground leading-relaxed">
					Ce parcours vous présente les 5 signaux qui trahissent une cyberarnaque
					et les 4 réflexes qui vous protègent. Pas de jargon, pas de théorie
					excessive : des repères concrets, applicables immédiatement.
				</p>
				<p className="text-sm text-muted-foreground">
					3 minutes de lecture. Aucune donnée collectée.
				</p>
			</div>

			{/* Privacy pulse */}
			<motion.div
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
			>
				<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
				<span className="text-sm text-emerald-600 font-medium">
					Aucune donnée collectée. Cet outil fonctionne entièrement dans votre navigateur.
				</span>
			</motion.div>

			{/* Start button */}
			<div>
				<button
					onClick={onStart}
					className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
				>
					Commencer
				</button>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  StepScreen                                                         */
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
			key={`step-${index}`}
			initial={{ opacity: 0, x: 40 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -40 }}
			transition={{ duration: 0.4 }}
			className="space-y-6"
		>
			{/* Progress bar */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className={`font-medium ${step.phaseColor}`}>
						{step.phase}
					</span>
					<span className="text-muted-foreground">
						{index + 1} / {total}
					</span>
				</div>
				<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
					<motion.div
						className="h-full bg-blue-500 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.4, ease: "easeOut" }}
					/>
				</div>
			</div>

			{/* Glass card */}
			<div className="glass-card rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-5">
				{/* Icon badge */}
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 border border-gray-200">
					<Icon className="w-6 h-6 text-gray-900" />
				</div>

				{/* Title */}
				<h2 className="text-2xl font-display font-bold">
					{step.title}
				</h2>

				{/* Text */}
				<p className="text-muted-foreground leading-relaxed">
					{step.text}
				</p>

				{/* Example block */}
				{step.example && (
					<div className="glass-card rounded-xl bg-gray-100 border border-gray-200 p-4">
						<p className="text-sm italic text-gray-600 leading-relaxed">
							{step.example}
						</p>
					</div>
				)}
			</div>

			{/* Next button */}
			<div className="flex justify-end">
				<button
					onClick={onNext}
					className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
				>
					J&apos;ai compris
				</button>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  FinalScreen                                                        */
/* ------------------------------------------------------------------ */

function FinalScreen() {
	const resources = [
		{
			href: "https://www.cybermalveillance.gouv.fr",
			label: "cybermalveillance.gouv.fr",
			description: "Assistance et diagnostic en ligne",
		},
	];

	return (
		<motion.div
			key="final"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="text-center space-y-8"
		>
			{/* Icon badge */}
			<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200">
				<ShieldCheck className="w-8 h-8 text-emerald-600" />
			</div>

			{/* Title */}
			<div>
				<h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
					Vous connaissez les signaux et les réflexes
				</h2>
				<p className="text-muted-foreground">
					Gardez-les en tête. En cas de doute, ces ressources peuvent vous aider.
				</p>
			</div>

			{/* Resource links */}
			<div className="space-y-3 text-left">
				{resources.map((r) => (
					<a
						key={r.href}
						href={r.href}
						target="_blank"
						rel="noopener noreferrer"
						className="glass-card rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors group"
					>
						<div>
							<p className="font-display font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
								{r.label}
							</p>
							<p className="text-sm text-muted-foreground">
								{r.description}
							</p>
						</div>
						<ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-blue-600 transition-colors" />
					</a>
				))}
			</div>

			{/* Back to tools */}
			<div>
				<Link
					href="/outils"
					className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
				>
					<ArrowLeft className="w-4 h-4" />
					Retour aux outils
				</Link>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function CyberarnaqueePage() {
	const [current, setCurrent] = useState<"intro" | number | "final">("intro");

	function handleStart() {
		setCurrent(0);
	}

	function handleNext() {
		if (typeof current === "number") {
			if (current < STEPS.length - 1) {
				setCurrent(current + 1);
			} else {
				setCurrent("final");
			}
		}
	}

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-2xl mx-auto">
				{/* Back link */}
				<Link
					href="/outils"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8"
				>
					<ArrowLeft className="w-4 h-4" />
					Tous les outils
				</Link>

				{/* Content */}
				<AnimatePresence mode="wait">
					{current === "intro" && (
						<IntroScreen onStart={handleStart} />
					)}
					{typeof current === "number" && (
						<StepScreen
							step={STEPS[current]}
							index={current}
							total={STEPS.length}
							onNext={handleNext}
						/>
					)}
					{current === "final" && <FinalScreen />}
				</AnimatePresence>
			</div>
		</main>
	);
}
