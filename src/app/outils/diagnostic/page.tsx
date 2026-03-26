"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft, ArrowRight, ClipboardCheck, Lock, Activity,
	Wifi, Shield, HardDrive, Headphones, Server, Mail,
	AlertTriangle, CheckCircle, AlertCircle,
} from "lucide-react";
import {
	quickSpeedTest, getQuestions, computeResult, GRADE_COLORS,
	type QuizQuestion, type QuizAnswer, type QuizResult, type ReportSection,
} from "@/lib/diagnostic-quiz";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	Wifi: <Wifi className="w-5 h-5" />,
	Shield: <Shield className="w-5 h-5" />,
	HardDrive: <HardDrive className="w-5 h-5" />,
	Headphones: <Headphones className="w-5 h-5" />,
	Server: <Server className="w-5 h-5" />,
};

// DPE grades
const DPE_GRADES = [
	{ grade: "A", label: "Excellent", width: 35 },
	{ grade: "B", label: "Bon", width: 45 },
	{ grade: "C", label: "Correct", width: 55 },
	{ grade: "D", label: "Moyen", width: 65 },
	{ grade: "E", label: "Faible", width: 75 },
	{ grade: "F", label: "Critique", width: 85 },
];

function scoreColor(s: number): string {
	if (s >= 70) return "text-emerald-600";
	if (s >= 40) return "text-amber-600";
	return "text-red-600";
}

function scoreBg(s: number): string {
	if (s >= 70) return "bg-emerald-400";
	if (s >= 40) return "bg-amber-400";
	return "bg-red-400";
}

function statusIcon(status: string) {
	if (status === "good") return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
	if (status === "warning") return <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
	return <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />;
}

function statusBorder(status: string): string {
	if (status === "good") return "border-emerald-200";
	if (status === "warning") return "border-amber-200";
	return "border-red-200";
}

export default function DiagnosticPage() {
	const [phase, setPhase] = useState<"speed" | "quiz" | "result">("speed");
	const [connectionType, setConnectionType] = useState<"adsl" | "fibre" | "unknown">("unknown");
	const [downloadMbps, setDownloadMbps] = useState(0);
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [currentQ, setCurrentQ] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [sendError, setSendError] = useState("");

	useEffect(() => {
		async function runSpeed() {
			const { mbps, type } = await quickSpeedTest();
			setConnectionType(type);
			setDownloadMbps(mbps);
			setQuestions(getQuestions(type));
			setPhase("quiz");
		}
		runSpeed();
	}, []);

	function handleAnswer(questionId: string, value: string, label: string, score: number) {
		const newAnswers = [...answers, { questionId, value, label, score }];
		setAnswers(newAnswers);
		if (currentQ < questions.length - 1) {
			setCurrentQ(currentQ + 1);
		} else {
			setResult(computeResult(newAnswers, connectionType, downloadMbps));
			setPhase("result");
		}
	}

	async function sendReport() {
		if (!result || !email) return;
		setSending(true);
		setSendError("");
		try {
			const res = await fetch("/api/diagnostic-report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					grade: result.grade,
					globalScore: result.globalScore,
					connectionType: result.connectionType,
					downloadMbps: result.downloadMbps,
					categories: result.categories.map(c => ({ label: c.label, score: c.score, color: c.color })),
					recommendations: result.recommendations,
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

	const q = questions[currentQ];
	const progressPct = questions.length > 0 ? Math.round(((currentQ) / questions.length) * 100) : 0;

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-2xl mx-auto">
				<Link href="/outils" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8">
					<ArrowLeft className="w-4 h-4" /> Retour aux outils
				</Link>

				{/* Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<ClipboardCheck className="w-4 h-4 text-indigo-600" />
						<span className="text-sm font-mono text-indigo-600">diagnostic IT</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						Votre informatique est-elle bien gérée ?
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						15 questions simples pour évaluer votre connexion, sécurité,
						sauvegardes et support. Résultat immédiat et rapport téléchargeable.
					</p>
				</motion.div>

				{/* Privacy */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 mb-10">
					<motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">Vos réponses ne sont ni stockées ni transmises.</span>
					</motion.div>
				</motion.div>

				{/* Speed test */}
				<AnimatePresence mode="wait">
					{phase === "speed" && (
						<motion.div key="speed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 rounded-2xl border border-gray-200 text-center">
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
								<Activity className="w-10 h-10 text-indigo-600 mx-auto" />
							</motion.div>
							<p className="text-gray-900 font-display font-semibold mt-4">Test de débit en cours...</p>
							<p className="text-sm text-muted-foreground mt-2">Détection de votre type de connexion.</p>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Quiz */}
				<AnimatePresence mode="wait">
					{phase === "quiz" && q && (
						<motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
							{/* Progress */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs text-muted-foreground">Question {currentQ + 1} / {questions.length}</span>
									<span className="text-xs text-muted-foreground">{progressPct}%</span>
								</div>
								<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
									<motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${progressPct}%` }} />
								</div>
							</div>

							{/* Connection badge */}
							{currentQ === 0 && (
								<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-4 ${connectionType === "adsl" ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
									<Wifi className={`w-4 h-4 ${connectionType === "adsl" ? "text-amber-600" : "text-emerald-600"}`} />
									<span className={`text-sm ${connectionType === "adsl" ? "text-amber-600" : "text-emerald-600"}`}>
										{connectionType === "adsl" ? `Connexion ADSL détectée (~${downloadMbps} Mbps)` : `Connexion fibre détectée (~${downloadMbps} Mbps)`}
									</span>
								</motion.div>
							)}

							{/* Question card */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h2 className="text-lg font-display font-semibold text-gray-900 mb-2">{q.question}</h2>
								{q.detail && <p className="text-sm text-muted-foreground mb-5">{q.detail}</p>}
								<div className="space-y-2">
									{q.choices.map((choice) => (
										<button key={choice.value} onClick={() => handleAnswer(q.id, choice.value, choice.label, choice.score)}
											className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center gap-3 group ${
												choice.value === "dunno"
													? "border-gray-100 bg-white hover:bg-gray-100 text-muted-foreground hover:text-gray-900"
													: "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-200 text-gray-900"
											}`}
										>
											<div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-indigo-400 transition-colors shrink-0" />
											{choice.label}
										</button>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Result */}
				<AnimatePresence mode="wait">
					{phase === "result" && result && (
						<motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
							<div className="space-y-6">

								{/* DPE-style label */}
								<div className="glass-card p-6 rounded-2xl border border-gray-200">
									<p className="text-sm text-muted-foreground text-center mb-4 uppercase tracking-wider">Étiquette informatique</p>
									<div className="space-y-1.5 max-w-sm mx-auto">
										{DPE_GRADES.map((g) => {
											const isActive = g.grade === result.grade;
											const color = GRADE_COLORS[g.grade];
											return (
												<div key={g.grade} className="flex items-center gap-2">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${g.width}%` }}
														transition={{ duration: 0.6, delay: DPE_GRADES.indexOf(g) * 0.1 }}
														className="h-8 rounded-r-lg flex items-center justify-between px-3 relative"
														style={{
															backgroundColor: isActive ? color : `${color}30`,
															boxShadow: isActive ? `0 0 15px ${color}50` : "none",
														}}
													>
														<span className={`font-display font-bold text-sm ${isActive ? "text-gray-900" : "text-gray-400"}`}>
															{g.grade}
														</span>
														<span className={`text-xs ${isActive ? "text-gray-900" : "text-gray-400"}`}>
															{g.label}
														</span>
														{isActive && (
															<motion.div
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																className="absolute -right-6 w-0 h-0"
																style={{
																	borderTop: "16px solid transparent",
																	borderBottom: "16px solid transparent",
																	borderLeft: `12px solid ${color}`,
																}}
															/>
														)}
													</motion.div>
												</div>
											);
										})}
									</div>
									<p className="text-center mt-6 text-muted-foreground">
										Score global : <span className="text-gray-900 font-display font-bold text-xl">{result.globalScore}/100</span>
									</p>
								</div>

								{/* Category scores */}
								<div className="glass-card p-6 rounded-2xl border border-gray-200">
									<h3 className="text-gray-900 font-display font-semibold mb-4">Score par domaine</h3>
									<div className="space-y-4">
										{result.categories.map((cat) => (
											<div key={cat.category}>
												<div className="flex items-center justify-between mb-1.5">
													<div className="flex items-center gap-2">
														<span style={{ color: cat.color }}>{CATEGORY_ICONS[cat.icon]}</span>
														<span className="text-sm text-gray-900">{cat.label}</span>
													</div>
													<span className={`text-sm font-display font-bold ${scoreColor(cat.score)}`}>{cat.score}/100</span>
												</div>
												<div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
													<motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${scoreBg(cat.score)}`} />
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Detailed report */}
								<div className="glass-card p-6 rounded-2xl border border-gray-200">
									<h3 className="text-gray-900 font-display font-semibold mb-4">Rapport détaillé</h3>
									<div className="space-y-4">
										{result.recommendations.map((rec, i) => (
											<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
												className={`p-4 rounded-xl border ${statusBorder(rec.status)} bg-gray-50`}
											>
												<div className="flex items-start gap-3">
													{statusIcon(rec.status)}
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground">{rec.category}</span>
															<h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
														</div>
														<p className="text-sm text-muted-foreground mt-1">{rec.finding}</p>
														<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
															<div className="p-2 rounded-lg bg-gray-100">
																<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Impact</p>
																<p className="text-xs text-gray-900">{rec.implication}</p>
															</div>
															<div className="p-2 rounded-lg bg-gray-100">
																<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Effort</p>
																<p className="text-xs text-gray-900">{rec.effort}</p>
															</div>
															<div className="p-2 rounded-lg bg-gray-100">
																<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Budget estimé</p>
																<p className="text-xs text-gray-900">{rec.cost}</p>
															</div>
														</div>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								</div>

								{/* Footer for PDF */}
								<div className="flex items-center justify-between px-2 py-3 opacity-50">
									<span className="text-xs text-muted-foreground">Diagnostic IT 360 - cyber-rgpd.com</span>
									<span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("fr-FR")}</span>
								</div>
							</div>

							{/* Send report by email */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h3 className="text-gray-900 font-display font-semibold mb-3 flex items-center gap-2">
									<Mail className="w-5 h-5 text-indigo-600" />
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
											className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-muted-foreground outline-none focus:border-indigo-200"
										/>
										<button
											onClick={sendReport}
											disabled={sending || !email}
											className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

							<div className="mt-6 space-y-4">
								<div className="text-center">
									<p className="text-muted-foreground mb-4">Vous souhaitez approfondir ce diagnostic ?</p>
									<motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
										<Link href="https://cyber-rgpd.com" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200">
											Demander un audit IT sur mesure &rarr;
										</Link>
									</motion.div>
									<Link href="/outils" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mt-4">
										<ArrowLeft className="w-4 h-4" /> Retour aux outils
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}
