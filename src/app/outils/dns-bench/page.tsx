"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft, Zap, Lock, Play, Activity, AlertTriangle, RotateCcw,
	User, Code, Clock, Shield, Wifi, ArrowDown, ArrowUp, Globe, Monitor,
} from "lucide-react";
import {
	runSpeedTest, getGradeInfo, REFERENCE_PROFILES,
	type TestProgress, type SpeedResult,
} from "@/lib/speed-test";

type ViewMode = "simple" | "expert";

// Ideal values for "surf parfait"
const IDEAL = { latency: 5, download: 500, upload: 200, ttfb: 50 };

function pctOfIdeal(value: number, ideal: number, invert = false): number {
	if (invert) return Math.min(100, Math.round((ideal / Math.max(value, 1)) * 100));
	return Math.min(100, Math.round((value / ideal) * 100));
}

function pctColor(pct: number): string {
	if (pct >= 80) return "text-emerald-600";
	if (pct >= 50) return "text-amber-600";
	return "text-red-600";
}

function pctBarColor(pct: number): string {
	if (pct >= 80) return "bg-emerald-400";
	if (pct >= 50) return "bg-amber-400";
	return "bg-red-400";
}

export default function BilanPerformancePage() {
	const [mode, setMode] = useState<ViewMode>("simple");
	const [progress, setProgress] = useState<TestProgress>({ phase: "idle", progress: 0, message: "" });
	const [result, setResult] = useState<SpeedResult | null>(null);
	const [error, setError] = useState("");

	const isRunning = !["idle", "done", "error"].includes(progress.phase);

	async function handleStart() {
		setResult(null);
		setError("");
		try {
			const data = await runSpeedTest(setProgress);
			setResult(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur inattendue");
			setProgress({ phase: "error", progress: 0, message: "" });
		}
	}

	const gradeInfo = result ? getGradeInfo(result.grade) : null;

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				<Link href="/outils" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8">
					<ArrowLeft className="w-4 h-4" /> Retour aux outils
				</Link>

				{/* Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<Zap className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-mono text-blue-600">bilan connexion</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						Où en est votre connexion internet ?
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						On mesure votre débit, votre temps de réponse et la rapidité
						de votre navigation, puis on vous positionne par rapport à
						une connexion idéale.
					</p>
				</motion.div>

				{/* Toggle */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
					<div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
						<button onClick={() => setMode("simple")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === "simple" ? "bg-blue-600 text-gray-900 shadow-lg shadow-blue-200" : "text-muted-foreground hover:text-gray-900"}`}>
							<User className="w-3.5 h-3.5" /> Utilisateur
						</button>
						<button onClick={() => setMode("expert")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === "expert" ? "bg-blue-600 text-gray-900 shadow-lg shadow-blue-200" : "text-muted-foreground hover:text-gray-900"}`}>
							<Code className="w-3.5 h-3.5" /> Expert
						</button>
					</div>
				</motion.div>

				{/* Start */}
				<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-8">
					<button onClick={handleStart} disabled={isRunning} className="group px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3">
						{isRunning ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Activity className="w-5 h-5" /></motion.div>Test en cours...</>) : result ? (<><RotateCcw className="w-5 h-5" />Relancer le test</>) : (<><Play className="w-5 h-5" />Tester ma connexion</>)}
					</button>
				</motion.div>

				{/* Privacy */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 mb-10">
					<motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">Aucune donnée personnelle collectée. Résultats non conservés.</span>
					</motion.div>
				</motion.div>

				{/* Progress */}
				<AnimatePresence mode="wait">
					{isRunning && (
						<motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 rounded-2xl border border-gray-200 mb-8">
							<div className="flex items-center gap-3 mb-2">
								<PhaseIcon phase={progress.phase} />
								<span className="text-gray-900 font-medium">{progress.message}</span>
							</div>
							{progress.detail && <p className="text-sm text-muted-foreground mb-3 ml-8">{progress.detail}</p>}
							<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
								<motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${progress.progress}%` }} transition={{ duration: 0.3 }} />
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Error */}
				<AnimatePresence>
					{error && !isRunning && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 rounded-2xl border border-red-200 bg-red-50 mb-8">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
								<p className="text-sm text-muted-foreground">{error}</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				<AnimatePresence mode="wait">
					{result && progress.phase === "done" && gradeInfo && (
						<motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

							{/* Main score gauge */}
							<div className={`glass-card p-8 rounded-2xl border text-center ${gradeInfo.bg}`}>
								{result.connection && (
									<div className="flex items-center justify-center gap-2 mb-4">
										<Wifi className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">{result.connection.isp} - {result.connection.ip}</span>
									</div>
								)}

								<p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Votre connexion par rapport à l&apos;idéal</p>

								<div className={`text-7xl font-display font-bold ${gradeInfo.color}`}>
									{result.score}%
								</div>
								<p className={`text-lg font-display font-semibold mt-1 ${gradeInfo.color}`}>
									{gradeInfo.desc}
								</p>

								{/* Main gauge */}
								<div className="w-full max-w-lg mx-auto mt-6 mb-2">
									<div className="relative">
										{/* Background gradient bar */}
										<div className="h-5 rounded-full overflow-hidden flex">
											<div className="h-full bg-red-500/30" style={{ width: "30%" }} />
											<div className="h-full bg-orange-400/30" style={{ width: "20%" }} />
											<div className="h-full bg-amber-400/30" style={{ width: "15%" }} />
											<div className="h-full bg-emerald-400/30" style={{ width: "15%" }} />
											<div className="h-full bg-emerald-200" style={{ width: "20%" }} />
										</div>
										{/* Cursor */}
										<motion.div
											initial={{ left: "0%" }}
											animate={{ left: `${Math.min(result.score, 98)}%` }}
											transition={{ duration: 1.2, ease: "easeOut" }}
											className="absolute top-0 h-5 w-1.5 bg-white rounded-full shadow-lg shadow-gray-300"
											style={{ transform: "translateX(-50%)" }}
										/>
									</div>
									{/* Scale labels */}
									<div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
										<span>Insuffisant</span>
										<span>Faible</span>
										<span>Correct</span>
										<span>Bon</span>
										<span>Idéal</span>
									</div>
								</div>

								{/* Reference profiles on gauge */}
								<div className="w-full max-w-lg mx-auto mt-3">
									<div className="relative h-4">
										{REFERENCE_PROFILES.map((ref) => (
											<div
												key={ref.name}
												className="absolute text-[9px] text-muted-foreground/50 whitespace-nowrap"
												style={{ left: `${ref.score}%`, transform: "translateX(-50%)" }}
											>
												<div className="w-px h-2 bg-gray-200 mx-auto mb-0.5" />
												{ref.name}
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Breakdown: 4 metrics as % of ideal */}
							<div className="space-y-3">
								<h3 className="text-gray-900 font-display font-semibold flex items-center gap-2">
									<Monitor className="w-5 h-5 text-blue-600" />
									Le détail
								</h3>

								<IdealBar
									icon={<Clock className="w-4 h-4" />}
									label="Temps de réponse"
									value={`${result.latency.avg} ms`}
									ideal={`${IDEAL.latency} ms`}
									pct={pctOfIdeal(result.latency.avg, IDEAL.latency, true)}
									detail={mode === "simple"
										? result.latency.avg < 20 ? "Quasiment instantané" : result.latency.avg < 50 ? "Rapide - aucun décalage ressenti" : result.latency.avg < 100 ? "Correct - léger temps d'attente" : "Lent - la navigation semble ramer"
										: `Min ${result.latency.min}ms / Max ${result.latency.max}ms / Gigue ${result.latency.jitter}ms`
									}
								/>

								<IdealBar
									icon={<ArrowDown className="w-4 h-4" />}
									label="Débit descendant"
									value={`${result.download.mbps} Mbps`}
									ideal={`${IDEAL.download} Mbps`}
									pct={pctOfIdeal(result.download.mbps, IDEAL.download)}
									detail={mode === "simple"
										? result.download.mbps > 100 ? "Très rapide - tout charge instantanément" : result.download.mbps > 25 ? "Suffisant pour la vidéo HD et les visios" : result.download.mbps > 5 ? "Correct pour la navigation de base" : "Trop lent pour un usage confortable"
										: `${result.download.bytes / 1024 / 1024} Mo en ${result.download.durationMs}ms`
									}
								/>

								<IdealBar
									icon={<ArrowUp className="w-4 h-4" />}
									label="Débit montant"
									value={`${result.upload.mbps} Mbps`}
									ideal={`${IDEAL.upload} Mbps`}
									pct={pctOfIdeal(result.upload.mbps, IDEAL.upload)}
									detail={mode === "simple"
										? result.upload.mbps > 20 ? "Rapide - visio HD et envoi de gros fichiers" : result.upload.mbps > 5 ? "Suffisant pour la visio et les emails" : "Faible - visio et envoi de fichiers lents"
										: `${Math.round(result.upload.bytes / 1024 / 1024 * 10) / 10} Mo en ${result.upload.durationMs}ms`
									}
								/>

								<IdealBar
									icon={<Globe className="w-4 h-4" />}
									label="Rapidité de navigation"
									value={`${Math.round(result.sites.filter(s => s.status !== "error").reduce((a, s) => a + s.ttfbMs, 0) / Math.max(1, result.sites.filter(s => s.status !== "error").length))} ms`}
									ideal={`${IDEAL.ttfb} ms`}
									pct={pctOfIdeal(
										result.sites.filter(s => s.status !== "error").reduce((a, s) => a + s.ttfbMs, 0) / Math.max(1, result.sites.filter(s => s.status !== "error").length),
										IDEAL.ttfb,
										true
									)}
									detail={mode === "simple"
										? "Temps moyen pour commencer à afficher Google, Microsoft, Amazon et GitHub"
										: result.sites.map(s => `${s.name}: ${s.ttfbMs}ms`).join(" - ")
									}
								/>
							</div>

							{/* Advice */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl border border-gray-200">
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-gray-900 font-display font-semibold mb-2">
											{result.score >= 70 ? "Votre connexion est en forme" : result.score >= 40 ? "Des améliorations sont possibles" : "Votre connexion a besoin d'attention"}
										</p>
										<ul className="text-sm text-muted-foreground space-y-1.5">
											{result.latency.avg > 100 && <li>Temps de réponse élevé - branchez-vous en Ethernet ou rapprochez-vous du Wi-Fi.</li>}
											{result.download.mbps < 10 && <li>Débit descendant faible - vérifiez votre forfait auprès de votre fournisseur.</li>}
											{result.upload.mbps < 2 && <li>Débit montant insuffisant - la visioconférence sera impactée.</li>}
											{result.latency.jitter > 30 && <li>Connexion instable - probable Wi-Fi, passez en câble Ethernet.</li>}
											{result.score >= 70 && <li>Votre connexion est adaptée à un usage professionnel normal.</li>}
											{result.score >= 90 && <li>Excellente connexion - rien à changer.</li>}
										</ul>
									</div>
								</div>
							</motion.div>

							{/* CTA + Retour */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center mt-6">
								<p className="text-muted-foreground mb-4">Besoin d&apos;aide pour optimiser votre connexion ?</p>
								<motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
									<Link href="https://cyber-rgpd.com" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200">
										Contactez-nous pour un diagnostic complet &rarr;
									</Link>
								</motion.div>
								<Link href="/outils" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mt-4">
									<ArrowLeft className="w-4 h-4" /> Retour aux outils
								</Link>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}

// --- Ideal comparison bar ---
function IdealBar({ icon, label, value, ideal, pct, detail }: {
	icon: React.ReactNode; label: string; value: string; ideal: string; pct: number; detail: string;
}) {
	const clampedPct = Math.min(100, Math.max(0, pct));
	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl border border-gray-200">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<span className={pctColor(clampedPct)}>{icon}</span>
					<span className="text-sm text-gray-900 font-medium">{label}</span>
				</div>
				<div className="flex items-center gap-2">
					<span className={`text-sm font-mono font-bold ${pctColor(clampedPct)}`}>{value}</span>
					<span className="text-xs text-muted-foreground">/ {ideal}</span>
				</div>
			</div>
			{/* Bar: position vs ideal */}
			<div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${clampedPct}%` }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className={`h-full rounded-full ${pctBarColor(clampedPct)}`}
				/>
				{/* Ideal marker at 100% */}
				<div className="absolute right-0 top-0 h-full w-0.5 bg-gray-200" />
			</div>
			<div className="flex items-center justify-between">
				<p className="text-xs text-muted-foreground">{detail}</p>
				<span className={`text-xs font-mono ${pctColor(clampedPct)}`}>{clampedPct}%</span>
			</div>
		</motion.div>
	);
}

function PhaseIcon({ phase }: { phase: string }) {
	const cls = "w-5 h-5 text-blue-600";
	switch (phase) {
		case "detect": return <Wifi className={cls} />;
		case "latency": return <Clock className={cls} />;
		case "download": return <ArrowDown className={cls} />;
		case "upload": return <ArrowUp className={cls} />;
		case "sites": return <Monitor className={cls} />;
		case "dns": return <Globe className={cls} />;
		default: return <Activity className={cls} />;
	}
}
