"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Signal,
	Smartphone,
	Lock,
	ChevronRight,
	ChevronLeft,
	BarChart3,
	MapPin,
	Info,
	Mail,
	Activity,
	CheckCircle,
	Tag,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Grille d'évaluation 4G / 5G                                      */
/* ------------------------------------------------------------------ */

type Grade = "excellent" | "bon" | "juste" | "pauvre";

interface GradeInfo {
	label: string;
	color: string;
	bg: string;
	border: string;
	connectivity: string;
}

const GRADES: Record<Grade, GradeInfo> = {
	excellent: {
		label: "Excellent",
		color: "text-emerald-600",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		connectivity: "Vitesses rapides sans perte. Conditions idéales pour tous les usages (visio, cloud, VoIP).",
	},
	bon: {
		label: "Bon",
		color: "text-blue-600",
		bg: "bg-blue-50",
		border: "border-blue-400/30",
		connectivity: "Vitesses rapides, connexion fiable. Convient pour la plupart des usages professionnels.",
	},
	juste: {
		label: "Juste",
		color: "text-amber-600",
		bg: "bg-amber-50",
		border: "border-amber-400/30",
		connectivity: "Connexion fonctionnelle mais latence plus longue. Débits corrects, quelques ralentissements possibles en visio.",
	},
	pauvre: {
		label: "Pauvre",
		color: "text-red-600",
		bg: "bg-red-50",
		border: "border-red-400/30",
		connectivity: "Vitesses très réduites, déconnexions régulières. Peut ne pas maintenir une connexion stable.",
	},
};

function evaluateRSRP(v: number): Grade {
	if (v >= -84) return "excellent";
	if (v >= -102) return "bon";
	if (v >= -111) return "juste";
	return "pauvre";
}

function evaluateRSRQ(v: number): Grade {
	if (v >= -5) return "excellent";
	if (v >= -9) return "bon";
	if (v >= -12) return "juste";
	return "pauvre";
}

function evaluateSINR(v: number): Grade {
	if (v >= 12.5) return "excellent";
	if (v >= 10) return "bon";
	if (v >= 7) return "juste";
	return "pauvre";
}

const GRADE_ORDER: Grade[] = ["excellent", "bon", "juste", "pauvre"];

function worstGrade(grades: Grade[]): Grade {
	let worst = 0;
	for (const g of grades) {
		const idx = GRADE_ORDER.indexOf(g);
		if (idx > worst) worst = idx;
	}
	return GRADE_ORDER[worst];
}

/* ------------------------------------------------------------------ */
/*  Mode opératoire                                                    */
/* ------------------------------------------------------------------ */

interface Step {
	title: string;
	content: string[];
	tip?: string;
	isMeasurementChoice?: boolean;
	exterieurContent?: string[];
	interieurContent?: string[];
}

const STEPS_ANDROID: Step[] = [
	{
		title: "Ouvrir le menu diagnostic",
		content: [
			"Ouvrez l'application Téléphone (celle pour passer des appels).",
			"Composez le code : *#*#4636#*#*",
			"Le menu « Testing » ou « Informations sur le téléphone » s'ouvre automatiquement.",
		],
		tip: "Sur certains Samsung, le code est *#0011# - si le premier ne fonctionne pas, essayez celui-ci.",
	},
	{
		title: "Accéder aux informations réseau",
		content: [
			"Appuyez sur « Informations sur le téléphone » (ou « Phone information »).",
			"Faites défiler vers le bas jusqu'à la section signal.",
			"Repérez les valeurs RSRP et SNR (ou SINR).",
		],
	},
	{
		title: "Mesure du signal",
		content: ["Choisissez le type de mesure à réaliser :"],
		isMeasurementChoice: true,
		exterieurContent: [
			"Placez-vous à l'extérieur du bâtiment, idéalement à l'entrée principale.",
			"Attendez 10 secondes que les valeurs se stabilisent.",
			"Notez les valeurs RSRP et SINR affichées.",
		],
		interieurContent: [
			"Déplacez-vous à l'intérieur du bâtiment, à l'emplacement souhaité.",
			"Attendez 10 secondes que les valeurs se stabilisent.",
			"Notez les valeurs RSRP et SINR affichées.",
			"Répétez si besoin dans plusieurs zones (bureau, salle de réunion, sous-sol…).",
		],
	},
];

const STEPS_ANDROID_ALT: Step = {
	title: "Alternative - via les Paramètres",
	content: [
		"Si le code ne fonctionne pas :",
		"Paramètres → À propos du téléphone → État → État de la carte SIM",
		"Ou : Paramètres → Connexions → Réseaux mobiles → Informations réseau",
		"Repérez « Intensité du signal » - les valeurs RSRP et SNR y figurent.",
	],
};

const STEPS_IPHONE: Step[] = [
	{
		title: "Ouvrir le Field Test Mode",
		content: [
			"Ouvrez l'application Téléphone.",
			"Composez le code : *3001#12345#*",
			"Appuyez sur le bouton d'appel vert.",
			"Le mode « Field Test » s'ouvre (écran avec des menus techniques).",
		],
	},
	{
		title: "Trouver les mesures d'antenne",
		content: [
			"Appuyez sur « LTE » pour la 4G ou « NR » pour la 5G.",
			"Puis appuyez sur « Serving Cell Meas » (Serving Cell Measurements).",
			"Repérez les lignes :",
			"  rsrp → c'est le RSRP (ex : −85 dBm)",
			"  sinr → c'est le SNR (ex : 15 dB)",
		],
	},
	{
		title: "Mesure du signal",
		content: ["Choisissez le type de mesure à réaliser :"],
		isMeasurementChoice: true,
		exterieurContent: [
			"Placez-vous à l'extérieur du bâtiment.",
			"Attendez 10 secondes que les valeurs se stabilisent.",
			"Notez les valeurs RSRP et SINR affichées.",
		],
		interieurContent: [
			"Déplacez-vous à l'intérieur du bâtiment.",
			"Attendez 10 secondes que les valeurs se stabilisent.",
			"Notez les valeurs RSRP et SINR affichées.",
			"Répétez si besoin dans plusieurs zones.",
		],
	},
];

/* ------------------------------------------------------------------ */
/*  Grille de référence (tableau)                                      */
/* ------------------------------------------------------------------ */

const REFERENCE_GRID = [
	{ rsrp: "≥ −84", rsrq: "≥ −5", sinr: "≥ 12,5", grade: "excellent" as Grade },
	{ rsrp: "−85 à −102", rsrq: "−5 à −9", sinr: "12 à 10", grade: "bon" as Grade },
	{ rsrp: "−103 à −111", rsrq: "−9 à −12", sinr: "10 à 7", grade: "juste" as Grade },
	{ rsrp: "≤ −112", rsrq: "≤ −12", sinr: "≤ 7", grade: "pauvre" as Grade },
];

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

type Platform = "choose" | "android" | "iphone";
type Phase = "modeop" | "input" | "result";

export default function Test4GPage() {
	const [platform, setPlatform] = useState<Platform>("choose");
	const [phase, setPhase] = useState<Phase>("modeop");
	const [currentStep, setCurrentStep] = useState(0);

	// Valeurs saisies
	const [reference, setReference] = useState("");
	const [location, setLocation] = useState<"outdoor" | "indoor" | null>(null);
	const [rsrp, setRsrp] = useState("");
	const [rsrq, setRsrq] = useState("");
	const [sinr, setSinr] = useState("");

	// Résultat
	const [result, setResult] = useState<{
		rsrpGrade: Grade;
		rsrqGrade: Grade | null;
		sinrGrade: Grade;
		overall: Grade;
	} | null>(null);

	// Email
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [sendError, setSendError] = useState("");

	const steps = platform === "android" ? STEPS_ANDROID : STEPS_IPHONE;

	function handleEvaluate() {
		const rsrpVal = parseFloat(rsrp);
		const sinrVal = parseFloat(sinr);
		if (isNaN(rsrpVal) || isNaN(sinrVal)) return;

		const rsrpG = evaluateRSRP(rsrpVal);
		const sinrG = evaluateSINR(sinrVal);

		let rsrqG: Grade | null = null;
		const grades = [rsrpG, sinrG];

		if (rsrq.trim() !== "") {
			const rsrqVal = parseFloat(rsrq);
			if (!isNaN(rsrqVal)) {
				rsrqG = evaluateRSRQ(rsrqVal);
				grades.push(rsrqG);
			}
		}

		setResult({
			rsrpGrade: rsrpG,
			rsrqGrade: rsrqG,
			sinrGrade: sinrG,
			overall: worstGrade(grades),
		});
		setPhase("result");
	}

	async function sendReport() {
		if (!result || !email) return;
		setSending(true);
		setSendError("");
		try {
			const res = await fetch("/api/4g-report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					reference: reference.trim(),
					location,
					platform,
					rsrp: parseFloat(rsrp),
					sinr: parseFloat(sinr),
					rsrq: rsrq.trim() ? parseFloat(rsrq) : null,
					rsrpGrade: result.rsrpGrade,
					sinrGrade: result.sinrGrade,
					rsrqGrade: result.rsrqGrade,
					overall: result.overall,
				}),
			});
			if (!res.ok) throw new Error("Erreur d'envoi");
			setSent(true);
			// Google Ads conversion tracking
			if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
				(window as any).gtag("event", "conversion", {
					send_to: "AW-17887383937/Wq3UCN6i9OwbEIGjr9FC",
					value: 1.0,
					currency: "EUR",
				});
			}
		} catch {
			setSendError("Impossible d'envoyer le rapport. Vérifiez votre email et réessayez.");
		} finally {
			setSending(false);
		}
	}

	function reset() {
		setPlatform("choose");
		setPhase("modeop");
		setCurrentStep(0);
		setReference("");
		setRsrp("");
		setRsrq("");
		setSinr("");
		setLocation(null);
		setResult(null);
		setEmail("");
		setSending(false);
		setSent(false);
		setSendError("");
	}

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-2xl mx-auto">
				<Link
					href="/outils"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8"
				>
					<ArrowLeft className="w-4 h-4" /> Retour aux outils
				</Link>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-10"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<Signal className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-mono text-blue-600">
							test 4G / 5G
						</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						Qualité de réception{" "}
						<span className="gradient-text">4G / 5G</span>
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Mesurez la qualité du signal 4G / 5G sur votre site avec votre
						smartphone. Aucune application à installer.
					</p>
				</motion.div>

				{/* Privacy */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="flex items-center justify-center gap-2 mb-10"
				>
					<motion.div
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
					>
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">
							Aucune donnée collectée. Tout reste sur votre appareil.
						</span>
					</motion.div>
				</motion.div>

				<AnimatePresence mode="wait">
					{/* ============ CHOIX PLATEFORME ============ */}
					{platform === "choose" && (
						<motion.div
							key="choose"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="space-y-4"
						>
							<p className="text-center text-gray-900 font-display font-semibold text-lg mb-6">
								Quel téléphone utilisez-vous ?
							</p>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => setPlatform("android")}
									className="glass-card p-6 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all hover:scale-[1.02] text-center group"
								>
									<Smartphone className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
									<span className="font-display font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
										Android
									</span>
									<p className="text-xs text-muted-foreground mt-1">
										Samsung, Pixel, Xiaomi...
									</p>
								</button>
								<button
									onClick={() => setPlatform("iphone")}
									className="glass-card p-6 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all hover:scale-[1.02] text-center group"
								>
									<Smartphone className="w-10 h-10 text-blue-600 mx-auto mb-3" />
									<span className="font-display font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
										iPhone
									</span>
									<p className="text-xs text-muted-foreground mt-1">
										Tous modèles
									</p>
								</button>
							</div>

							{/* Grille de référence */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200 mt-8">
								<h3 className="text-gray-900 font-display font-semibold mb-4 flex items-center gap-2">
									<BarChart3 className="w-5 h-5 text-blue-600" />
									Grille de lecture - Signal 4G / 5G
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">RSRP (dBm)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">RSRQ (dB)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">SINR (dB)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">Qualité</th>
											</tr>
										</thead>
										<tbody>
											{REFERENCE_GRID.map((row) => {
												const g = GRADES[row.grade];
												return (
													<tr key={row.grade} className="border-b border-gray-100">
														<td className="py-2.5 px-2 text-gray-900 font-mono text-xs">{row.rsrp}</td>
														<td className="py-2.5 px-2 text-gray-900 font-mono text-xs">{row.rsrq}</td>
														<td className="py-2.5 px-2 text-gray-900 font-mono text-xs">{row.sinr}</td>
														<td className="py-2.5 px-2">
															<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${g.bg} ${g.border} border ${g.color}`}>
																{g.label}
															</span>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
								<div className="mt-4 space-y-2 text-xs text-muted-foreground">
									<p><strong className="text-gray-600">RSRP</strong> - Puissance du signal reçu. Indicateur principal de la force du signal.</p>
									<p><strong className="text-gray-600">RSRQ</strong> - Qualité du signal reçu. Utile quand le RSRP seul ne suffit pas.</p>
									<p><strong className="text-gray-600">SINR</strong> - Rapport signal/bruit. Indique la clarté du signal par rapport aux interférences.</p>
								</div>
							</div>
						</motion.div>
					)}

					{/* ============ MODE OPÉRATOIRE ============ */}
					{platform !== "choose" && phase === "modeop" && (
						<motion.div
							key="modeop"
							initial={{ opacity: 0, x: 40 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -40 }}
						>
							{/* Progress */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-2">
									<button
										onClick={reset}
										className="text-xs text-muted-foreground hover:text-gray-900 transition-colors flex items-center gap-1"
									>
										<ChevronLeft className="w-3 h-3" />
										Changer de téléphone
									</button>
									<span className="text-xs text-muted-foreground">
										Étape {currentStep + 1} / {steps.length}
									</span>
								</div>
								<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
									<motion.div
										className="h-full bg-blue-500 rounded-full"
										animate={{
											width: `${((currentStep + 1) / steps.length) * 100}%`,
										}}
									/>
								</div>
							</div>

							{/* Platform badge */}
							<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 ${platform === "android" ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"}`}>
								<Smartphone className={`w-3.5 h-3.5 ${platform === "android" ? "text-emerald-600" : "text-blue-600"}`} />
								<span className={`text-xs font-medium ${platform === "android" ? "text-emerald-600" : "text-blue-600"}`}>
									{platform === "android" ? "Android" : "iPhone"}
								</span>
							</div>

							{/* Step card */}
							<AnimatePresence mode="wait">
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									className="glass-card p-6 rounded-2xl border border-gray-200"
								>
									<h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
										{steps[currentStep].title}
									</h2>
									{!steps[currentStep].isMeasurementChoice && (
										<ol className="space-y-3">
											{steps[currentStep].content.map((line, i) => (
												<li key={i} className="flex gap-3 text-sm text-gray-700">
													<span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-mono">
														{i + 1}
													</span>
													<span className="pt-0.5">
														{line.includes("*#") || line.includes("*3001") ? (
															<>
																{line.split(/(\*[#\d*]+\*?#?\*?)/).map((part, j) =>
																	part.match(/^\*[#\d*]+\*?#?\*?$/) ? (
																		<code key={j} className="px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-600 font-mono text-sm">
																			{part}
																		</code>
																	) : (
																		<span key={j}>{part}</span>
																	)
																)}
															</>
														) : (
															line
														)}
													</span>
												</li>
											))}
										</ol>
									)}

									{steps[currentStep].isMeasurementChoice && (
										<div className="space-y-4">
											<p className="text-sm text-gray-700">{steps[currentStep].content[0]}</p>
											<div className="grid grid-cols-2 gap-3">
												<button
													onClick={() => setLocation("outdoor")}
													className={`p-4 rounded-xl border text-sm text-center transition-all ${
														location === "outdoor"
															? "border-blue-500/50 bg-blue-50 text-gray-900"
															: "border-gray-200 bg-gray-50 text-muted-foreground hover:bg-gray-100"
													}`}
												>
													<MapPin className={`w-5 h-5 mx-auto mb-2 ${location === "outdoor" ? "text-blue-600" : ""}`} />
													Extérieur
												</button>
												<button
													onClick={() => setLocation("indoor")}
													className={`p-4 rounded-xl border text-sm text-center transition-all ${
														location === "indoor"
															? "border-blue-500/50 bg-blue-50 text-gray-900"
															: "border-gray-200 bg-gray-50 text-muted-foreground hover:bg-gray-100"
													}`}
												>
													<MapPin className={`w-5 h-5 mx-auto mb-2 ${location === "indoor" ? "text-blue-600" : ""}`} />
													Intérieur
												</button>
											</div>
											{location && (
												<motion.ol
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													className="space-y-3 mt-2"
												>
													{(location === "outdoor" ? steps[currentStep].exterieurContent : steps[currentStep].interieurContent)?.map((line, i) => (
														<li key={i} className="flex gap-3 text-sm text-gray-700">
															<span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-mono">
																{i + 1}
															</span>
															<span className="pt-0.5">{line}</span>
														</li>
													))}
												</motion.ol>
											)}
										</div>
									)}

									{steps[currentStep].tip && (
										<div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-400/5 border border-amber-400/10">
											<Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
											<p className="text-xs text-amber-600/80">
												{steps[currentStep].tip}
											</p>
										</div>
									)}
								</motion.div>
							</AnimatePresence>

							{/* Alternative Android */}
							{platform === "android" && currentStep === 1 && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="glass-card p-5 rounded-2xl border border-gray-100 mt-4"
								>
									<h3 className="text-sm font-display font-semibold text-gray-500 mb-3">
										{STEPS_ANDROID_ALT.title}
									</h3>
									<ul className="space-y-1.5">
										{STEPS_ANDROID_ALT.content.map((line, i) => (
											<li key={i} className="text-xs text-muted-foreground">
												{line}
											</li>
										))}
									</ul>
								</motion.div>
							)}

							{/* Navigation */}
							<div className="flex items-center justify-between mt-6">
								<button
									onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
									disabled={currentStep === 0}
									className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
								>
									<ChevronLeft className="w-4 h-4" /> Précédent
								</button>

								{currentStep < steps.length - 1 ? (
									<button
										onClick={() => setCurrentStep(currentStep + 1)}
										className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all"
									>
										Suivant <ChevronRight className="w-4 h-4" />
									</button>
								) : (
									<button
										onClick={() => setPhase("input")}
										disabled={steps[currentStep].isMeasurementChoice && !location}
										className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
									>
										Saisir mes valeurs <ChevronRight className="w-4 h-4" />
									</button>
								)}
							</div>
						</motion.div>
					)}

					{/* ============ SAISIE DES VALEURS ============ */}
					{phase === "input" && (
						<motion.div
							key="input"
							initial={{ opacity: 0, x: 40 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -40 }}
						>
							<button
								onClick={() => { setPhase("modeop"); setCurrentStep(steps.length - 1); }}
								className="text-xs text-muted-foreground hover:text-gray-900 transition-colors flex items-center gap-1 mb-6"
							>
								<ChevronLeft className="w-3 h-3" />
								Revoir le mode opératoire
							</button>

							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h2 className="text-lg font-display font-semibold text-gray-900 mb-6">
									Saisissez vos mesures
								</h2>

								{/* Référence */}
								<div className="mb-6">
									<label className="text-sm text-gray-900 mb-1.5 block flex items-center gap-2">
										<Tag className="w-4 h-4 text-blue-600" /> Référence <span className="text-muted-foreground font-normal"> - facultatif</span>
									</label>
									<input
										type="text"
										value={reference}
										onChange={(e) => setReference(e.target.value)}
										maxLength={200}
										placeholder="ex : Bureaux Rue de la Paix, Entrepôt Zone Nord..."
										className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-blue-200"
									/>
									<p className="text-xs text-muted-foreground mt-1">Nom du site ou de la zone testée (apparaîtra dans le rapport)</p>
								</div>

								{/* Localisation */}
								<div className="mb-6">
									<label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
										<MapPin className="w-4 h-4" /> Localisation de la mesure
									</label>
									<div className="grid grid-cols-2 gap-3">
										<button
											onClick={() => setLocation("outdoor")}
											className={`p-3 rounded-xl border text-sm text-center transition-all ${
												location === "outdoor"
													? "border-blue-500/50 bg-blue-50 text-gray-900"
													: "border-gray-200 bg-gray-50 text-muted-foreground hover:bg-gray-100"
											}`}
										>
											Extérieur
										</button>
										<button
											onClick={() => setLocation("indoor")}
											className={`p-3 rounded-xl border text-sm text-center transition-all ${
												location === "indoor"
													? "border-blue-500/50 bg-blue-50 text-gray-900"
													: "border-gray-200 bg-gray-50 text-muted-foreground hover:bg-gray-100"
											}`}
										>
											Intérieur
										</button>
									</div>
								</div>

								{/* RSRP */}
								<div className="mb-4">
									<label className="text-sm text-gray-900 mb-1.5 block">
										RSRP <span className="text-muted-foreground">(dBm) - obligatoire</span>
									</label>
									<input
										type="number"
										value={rsrp}
										onChange={(e) => setRsrp(e.target.value)}
										placeholder="ex : -85"
										className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-blue-200 font-mono"
									/>
									<p className="text-xs text-muted-foreground mt-1">Puissance du signal reçu (valeur négative, ex : −85)</p>
								</div>

								{/* SINR */}
								<div className="mb-4">
									<label className="text-sm text-gray-900 mb-1.5 block">
										SINR / SNR <span className="text-muted-foreground">(dB) - obligatoire</span>
									</label>
									<input
										type="number"
										value={sinr}
										onChange={(e) => setSinr(e.target.value)}
										placeholder="ex : 15"
										className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-blue-200 font-mono"
									/>
									<p className="text-xs text-muted-foreground mt-1">Rapport signal/bruit</p>
								</div>

								{/* RSRQ */}
								<div className="mb-6">
									<label className="text-sm text-gray-900 mb-1.5 block">
										RSRQ <span className="text-muted-foreground">(dB) - facultatif</span>
									</label>
									<input
										type="number"
										value={rsrq}
										onChange={(e) => setRsrq(e.target.value)}
										placeholder="ex : -7"
										className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-blue-200 font-mono"
									/>
									<p className="text-xs text-muted-foreground mt-1">Qualité du signal reçu (si disponible)</p>
								</div>

								<button
									onClick={handleEvaluate}
									disabled={!rsrp || !sinr || !location}
									className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-display font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									<BarChart3 className="w-4 h-4" />
									Évaluer la qualité du signal
								</button>
							</div>
						</motion.div>
					)}

					{/* ============ RÉSULTAT ============ */}
					{phase === "result" && result && (
						<motion.div
							key="result"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-6"
						>
							{/* Score global */}
							<div className={`glass-card p-8 rounded-2xl border ${GRADES[result.overall].border} text-center`}>
								{reference && (
									<p className="text-sm text-blue-600 font-mono mb-1">{reference}</p>
								)}
								<p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
									Qualité globale - {location === "outdoor" ? "Extérieur" : "Intérieur"}
								</p>
								<motion.div
									initial={{ scale: 0.5, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ type: "spring", damping: 15 }}
								>
									<span className={`text-5xl font-display font-bold ${GRADES[result.overall].color}`}>
										{GRADES[result.overall].label}
									</span>
								</motion.div>
								<p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
									{GRADES[result.overall].connectivity}
								</p>
							</div>

							{/* Détail par indicateur */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h3 className="text-gray-900 font-display font-semibold mb-4">Détail par indicateur</h3>
								<div className="space-y-3">
									{/* RSRP */}
									<div className={`p-4 rounded-xl border ${GRADES[result.rsrpGrade].border} ${GRADES[result.rsrpGrade].bg}`}>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold text-gray-900">RSRP</p>
												<p className="text-xs text-muted-foreground">Puissance du signal</p>
											</div>
											<div className="text-right">
												<p className="font-mono text-gray-900">{rsrp} dBm</p>
												<span className={`text-xs font-medium ${GRADES[result.rsrpGrade].color}`}>
													{GRADES[result.rsrpGrade].label}
												</span>
											</div>
										</div>
									</div>

									{/* SINR */}
									<div className={`p-4 rounded-xl border ${GRADES[result.sinrGrade].border} ${GRADES[result.sinrGrade].bg}`}>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold text-gray-900">SINR</p>
												<p className="text-xs text-muted-foreground">Rapport signal/bruit</p>
											</div>
											<div className="text-right">
												<p className="font-mono text-gray-900">{sinr} dB</p>
												<span className={`text-xs font-medium ${GRADES[result.sinrGrade].color}`}>
													{GRADES[result.sinrGrade].label}
												</span>
											</div>
										</div>
									</div>

									{/* RSRQ */}
									{result.rsrqGrade && (
										<div className={`p-4 rounded-xl border ${GRADES[result.rsrqGrade].border} ${GRADES[result.rsrqGrade].bg}`}>
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-semibold text-gray-900">RSRQ</p>
													<p className="text-xs text-muted-foreground">Qualité du signal</p>
												</div>
												<div className="text-right">
													<p className="font-mono text-gray-900">{rsrq} dB</p>
													<span className={`text-xs font-medium ${GRADES[result.rsrqGrade].color}`}>
														{GRADES[result.rsrqGrade].label}
													</span>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Grille de référence avec valeurs saisies */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h3 className="text-gray-900 font-display font-semibold mb-4 flex items-center gap-2">
									<BarChart3 className="w-5 h-5 text-blue-600" />
									Grille de référence
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">RSRP (dBm)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">RSRQ (dB)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">SINR (dB)</th>
												<th className="text-left py-2 px-2 text-muted-foreground font-normal">Qualité</th>
											</tr>
										</thead>
										<tbody>
											{REFERENCE_GRID.map((row) => {
												const g = GRADES[row.grade];
												const isRsrpMatch = row.grade === result.rsrpGrade;
												const isRsrqMatch = result.rsrqGrade && row.grade === result.rsrqGrade;
												const isSinrMatch = row.grade === result.sinrGrade;
												const isActive = row.grade === result.overall;
												return (
													<tr key={row.grade} className={`border-b border-gray-100 ${isActive ? "bg-gray-100" : ""}`}>
														<td className={`py-2.5 px-2 font-mono text-xs ${isRsrpMatch ? `font-bold ${g.color}` : "text-gray-500"}`}>
															{row.rsrp}
															{isRsrpMatch && (
																<span className={`ml-1.5 inline-flex px-1.5 py-0.5 rounded ${g.bg} ${g.border} border text-[10px] font-semibold ${g.color}`}>
																	{rsrp}
																</span>
															)}
														</td>
														<td className={`py-2.5 px-2 font-mono text-xs ${isRsrqMatch ? `font-bold ${g.color}` : "text-gray-500"}`}>
															{row.rsrq}
															{isRsrqMatch && rsrq && (
																<span className={`ml-1.5 inline-flex px-1.5 py-0.5 rounded ${g.bg} ${g.border} border text-[10px] font-semibold ${g.color}`}>
																	{rsrq}
																</span>
															)}
														</td>
														<td className={`py-2.5 px-2 font-mono text-xs ${isSinrMatch ? `font-bold ${g.color}` : "text-gray-500"}`}>
															{row.sinr}
															{isSinrMatch && (
																<span className={`ml-1.5 inline-flex px-1.5 py-0.5 rounded ${g.bg} ${g.border} border text-[10px] font-semibold ${g.color}`}>
																	{sinr}
																</span>
															)}
														</td>
														<td className="py-2.5 px-2">
															<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${g.bg} ${g.border} border ${g.color} ${isActive ? "ring-1 ring-white/20" : ""}`}>
																{g.label}
															</span>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>

							{/* Envoi par email */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h3 className="text-gray-900 font-display font-semibold mb-3 flex items-center gap-2">
									<Mail className="w-5 h-5 text-blue-600" />
									Recevoir le rapport par email
								</h3>
								{sent ? (
									<div className="flex items-center gap-2 text-emerald-600">
										<CheckCircle className="w-5 h-5" />
										<span className="text-sm">Rapport envoyé ! Vérifiez votre boîte de réception.</span>
									</div>
								) : (
									<div className="flex gap-2">
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="votre@email.com"
											className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-blue-200"
										/>
										<button
											onClick={sendReport}
											disabled={sending || !email}
											className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
										>
											{sending ? <Activity className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
											Envoyer
										</button>
									</div>
								)}
								{sendError && <p className="text-sm text-red-600 mt-2">{sendError}</p>}
								<motion.p
									animate={{ opacity: [0.5, 1, 0.5] }}
									transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
									className="text-xs text-emerald-600 mt-3"
								>
									Votre email est uniquement utilisé pour l&apos;envoi de ce rapport.
								</motion.p>
							</div>

							{/* Actions */}
							<div className="flex flex-col items-center gap-4">
								<button
									onClick={() => { setPhase("input"); setResult(null); setSent(false); setSendError(""); }}
									className="text-sm text-muted-foreground hover:text-gray-900 transition-colors"
								>
									Refaire une mesure
								</button>
								<motion.div
									animate={{ opacity: [0.7, 1, 0.7] }}
									transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
								>
									<Link
										href="https://cyber-rgpd.com"
										className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200"
									>
										Besoin d&apos;améliorer votre couverture ?
									</Link>
								</motion.div>
								<Link
									href="/outils"
									className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
								>
									<ArrowLeft className="w-4 h-4" /> Retour aux outils
								</Link>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}
