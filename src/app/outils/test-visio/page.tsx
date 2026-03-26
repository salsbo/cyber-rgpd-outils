"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Video,
	Lock,
	Play,
	Wifi,
	Clock,
	Activity,
	AlertTriangle,
	Shield,
	Globe,
	RotateCcw,
	TrendingDown,
	Monitor,
	Router,
	Server,
} from "lucide-react";
import {
	runQualityTest,
	mosLabel,
	natLabel,
	natSimpleDescription,
	type TestProgress,
	type QualityMetrics,
	type TestPhase,
} from "@/lib/webrtc-quality";

const API_URL = process.env.NEXT_PUBLIC_VISIO_TEST_API || "https://visio-test.dahouse.fr";

// --- MOS Scale zones ---
const MOS_ZONES = [
	{ min: 1.0, max: 2.5, label: "Inutilisable", color: "#ef4444", desc: "Conversation impossible" },
	{ min: 2.5, max: 3.5, label: "Dégradée", color: "#f97316", desc: "Coupures, son haché" },
	{ min: 3.5, max: 4.0, label: "Correcte", color: "#eab308", desc: "Quelques imperfections" },
	{ min: 4.0, max: 4.5, label: "Bonne", color: "#22c55e", desc: "Comme un appel Teams" },
	{ min: 4.5, max: 5.0, label: "Excellente", color: "#10b981", desc: "Qualité téléphone fixe" },
];

// MOS references for context
const MOS_REFERENCES = [
	{ mos: 4.4, label: "Téléphone fixe" },
	{ mos: 4.0, label: "Teams / Zoom HD" },
	{ mos: 3.5, label: "Appel mobile 4G" },
	{ mos: 2.5, label: "VoIP bas débit" },
];

function mosColor(mos: number): string {
	if (mos >= 4.0) return "text-emerald-600";
	if (mos >= 3.5) return "text-amber-600";
	if (mos >= 2.5) return "text-orange-600";
	return "text-red-600";
}

function mosBg(mos: number): string {
	if (mos >= 4.0) return "bg-emerald-50 border-emerald-200";
	if (mos >= 3.5) return "bg-amber-50 border-amber-200";
	if (mos >= 2.5) return "bg-orange-50 border-orange-200";
	return "bg-red-50 border-red-200";
}

function metricColor(value: number, good: number, warn: number): string {
	if (value <= good) return "text-emerald-600";
	if (value <= warn) return "text-amber-600";
	return "text-red-600";
}

function natColor(nat: string): string {
	if (nat === "open" || nat === "full-cone") return "text-emerald-600";
	if (nat === "restricted") return "text-amber-600";
	if (nat === "symmetric") return "text-red-600";
	return "text-blue-600";
}

// --- MOS Gauge component ---
function MosGauge({ mos }: { mos: number }) {
	const minMos = 1;
	const maxMos = 5;
	const pct = ((mos - minMos) / (maxMos - minMos)) * 100;

	return (
		<div className="w-full mt-4 mb-2">
			{/* Zone labels */}
			<div className="flex mb-1.5">
				{MOS_ZONES.map((zone) => {
					const width = ((zone.max - zone.min) / (maxMos - minMos)) * 100;
					return (
						<div key={zone.label} className="text-center" style={{ width: `${width}%` }}>
							<span className="text-[10px] text-muted-foreground leading-none">
								{zone.label}
							</span>
						</div>
					);
				})}
			</div>

			{/* Gauge bar */}
			<div className="relative h-4 rounded-full overflow-hidden flex">
				{MOS_ZONES.map((zone) => {
					const width = ((zone.max - zone.min) / (maxMos - minMos)) * 100;
					return (
						<div
							key={zone.label}
							className="h-full"
							style={{ width: `${width}%`, backgroundColor: zone.color, opacity: 0.3 }}
						/>
					);
				})}
				{/* Marker */}
				<motion.div
					initial={{ left: "0%" }}
					animate={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg shadow-gray-300"
					style={{ transform: "translateX(-50%)" }}
				/>
			</div>

			{/* Reference marks */}
			<div className="relative h-5 mt-1">
				{MOS_REFERENCES.map((ref) => {
					const refPct = ((ref.mos - minMos) / (maxMos - minMos)) * 100;
					return (
						<div
							key={ref.label}
							className="absolute text-[9px] text-muted-foreground/60 whitespace-nowrap"
							style={{ left: `${refPct}%`, transform: "translateX(-50%)" }}
						>
							<div className="w-px h-1.5 bg-gray-200 mx-auto mb-0.5" />
							{ref.label}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// --- Score breakdown component ---
function ScoreBreakdown({ metrics }: { metrics: QualityMetrics }) {
	const { breakdown } = metrics;
	const total = breakdown.latencyPenalty + breakdown.jitterPenalty + breakdown.packetLossPenalty;
	const maxScore = 4.4; // theoretical max with E-model

	const factors = [
		{
			label: "Temps de réponse",
			penalty: breakdown.latencyPenalty,
			value: `${metrics.latency} ms`,
			icon: <Clock className="w-4 h-4" />,
			status: metrics.latency < 100 ? "good" : metrics.latency < 200 ? "warn" : "bad",
			detail: metrics.latency < 100
				? "Excellent - aucun décalage perceptible entre les interlocuteurs"
				: metrics.latency < 200
					? "Correct - léger décalage, les conversations se chevauchent parfois"
					: "Élevé - décalage notable, la conversation devient difficile",
		},
		{
			label: "Stabilité des flux",
			penalty: breakdown.jitterPenalty,
			value: metrics.jitter < 5 ? "Pas de variation" : `${metrics.jitter} ms de variation`,
			icon: <Activity className="w-4 h-4" />,
			status: metrics.jitter < 15 ? "good" : metrics.jitter < 30 ? "warn" : "bad",
			detail: metrics.jitter < 15
				? "Flux régulier - le son et la vidéo restent fluides tout au long de l’appel"
				: metrics.jitter < 30
					? "Légères variations - quelques micro-saccades possibles sur le son"
					: "Flux irrégulier - son haché et image saccadée, l’appel sera inconfortable",
		},
		{
			label: "Fiabilité de la liaison",
			penalty: breakdown.packetLossPenalty,
			value: metrics.packetLoss < 0.1 ? "Aucune perte" : `${metrics.packetLoss}% de perte`,
			icon: <Wifi className="w-4 h-4" />,
			status: metrics.packetLoss < 1 ? "good" : metrics.packetLoss < 3 ? "warn" : "bad",
			detail: metrics.packetLoss < 1
				? "Liaison fiable - les données audio et vidéo arrivent intégralement à destination"
				: metrics.packetLoss < 3
					? "Quelques pertes - certains mots ou images peuvent manquer ponctuellement"
					: "Pertes importantes - des morceaux entiers de conversation sont perdus en route",
		},
	] as const;

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Score théorique maximum : <span className="text-gray-900">{maxScore}/5</span>.
				{total > 0.1
					? ` Vous perdez ${Math.round(total * 10) / 10} point${total >= 2 ? "s" : ""} à cause de :`
					: " Votre connexion ne perd quasiment rien."}
			</p>
			{factors.map((f) => {
				const statusColor = f.status === "good" ? "text-emerald-600" : f.status === "warn" ? "text-amber-600" : "text-red-600";
				return (
					<div key={f.label} className="glass-card p-4 rounded-xl border border-gray-200">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-2">
								<span className={statusColor}>{f.icon}</span>
								<span className="text-sm text-gray-900 font-medium">{f.label}</span>
							</div>
							<span className={`text-sm font-mono ${statusColor}`}>{f.value}</span>
						</div>
						{f.penalty > 0.1 && (
							<div className="flex items-center gap-1.5 mt-1">
								<TrendingDown className="w-3 h-3 text-amber-600" />
								<span className="text-xs text-amber-600">
									-{Math.round(f.penalty * 10) / 10} point{f.penalty >= 2 ? "s" : ""} sur le score
								</span>
							</div>
						)}
						<p className="text-xs text-muted-foreground mt-1.5">{f.detail}</p>
					</div>
				);
			})}
		</div>
	);
}

// --- Network diagnostic with visual path ---
function NetworkDiagnostic({ metrics }: { metrics: QualityMetrics }) {
	const { localOverhead, minLatency, latency } = metrics;

	// localOverhead = avg RTT - min RTT = delay added by local network (WiFi, switch)
	// minLatency = best RTT = pure propagation (internet path)
	const internetDelay = Math.round(minLatency / 2); // one-way
	const localDelay = localOverhead;
	const totalDelay = localDelay + internetDelay;

	const localPct = totalDelay > 0 ? Math.round((localDelay / totalDelay) * 100) : 20;
	const internetPct = 100 - localPct;

	// Clamp router position between 15% and 85%
	const routerPosition = Math.max(15, Math.min(85, localPct));

	const isLocalDominant = localPct > 50 && localDelay > 5; // LAN = maillon faible
	const isLocalIssue = (localDelay > 10 && localPct > 30) || isLocalDominant;
	const isInternetSlow = internetDelay > 50;
	const jitterHigh = metrics.jitter > 20;

	const localColor = isLocalIssue ? "text-amber-600" : "text-emerald-600";
	const internetColor = isInternetSlow ? "text-amber-600" : "text-emerald-600";
	const localBg = isLocalIssue ? "bg-amber-200" : "bg-blue-100";
	const internetBg = isInternetSlow ? "bg-amber-200" : "bg-emerald-400/40";

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className="glass-card p-5 rounded-2xl border border-gray-200"
		>
			<div className="flex items-center gap-2 mb-5">
				<Monitor className="w-5 h-5 text-blue-600" />
				<span className="text-gray-900 font-display font-semibold">
					Diagnostic réseau - où se situe le délai ?
				</span>
			</div>

			{/* Visual path: PC → Router (at junction) → Server */}
			<div className="relative px-2 mb-6">
				{/* Gauge bar */}
				<div className="relative h-3 rounded-full overflow-hidden mx-6">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${Math.max(localPct, 5)}%` }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className={`${localBg} h-full absolute left-0`}
					/>
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${Math.max(internetPct, 5)}%` }}
						transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
						className={`${internetBg} h-full absolute right-0`}
					/>
				</div>

				{/* PC icon - left */}
				<div className="absolute left-0 -top-4 flex flex-col items-center gap-1">
					<div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
						<Monitor className="w-4 h-4 text-gray-700" />
					</div>
					<span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Votre PC</span>
				</div>

				{/* Router icon - positioned at junction */}
				<motion.div
					initial={{ left: "50%" }}
					animate={{ left: `${routerPosition}%` }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="absolute -top-4 flex flex-col items-center gap-1"
					style={{ transform: "translateX(-50%)" }}
				>
					<div className="w-9 h-9 rounded-lg bg-gray-100 border border-blue-200 flex items-center justify-center shadow-lg shadow-blue-100">
						<Router className="w-4 h-4 text-blue-600" />
					</div>
					<span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Routeur</span>
				</motion.div>

				{/* Server icon - right */}
				<div className="absolute right-0 -top-4 flex flex-col items-center gap-1">
					<div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
						<Server className="w-4 h-4 text-gray-700" />
					</div>
					<span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Serveur</span>
				</div>
			</div>

			{/* Latency labels under each segment */}
			<div className="flex justify-between px-2 mb-4 mt-8">
				<div className="text-center flex-1">
					<span className={`text-xs font-mono font-medium ${localColor}`}>
						{localDelay > 0 ? `~${localDelay} ms` : "< 1 ms"}
					</span>
					<p className="text-[10px] text-muted-foreground mt-0.5">
						Réseau local {jitterHigh ? "(Wi-Fi)" : "(câble/Wi-Fi)"}
					</p>
				</div>
				<div className="text-center flex-1">
					<span className={`text-xs font-mono font-medium ${internetColor}`}>
						~{internetDelay} ms
					</span>
					<p className="text-[10px] text-muted-foreground mt-0.5">
						Fournisseur internet
					</p>
				</div>
			</div>

			{/* Total */}
			<div className="flex items-center justify-center gap-2 py-2 mb-3 rounded-lg bg-gray-100">
				<Clock className="w-3.5 h-3.5 text-muted-foreground" />
				<span className="text-xs text-muted-foreground">
					Aller-retour total : <span className="text-gray-900 font-mono">{latency} ms</span>
					{" "}(meilleur : <span className="text-gray-900 font-mono">{minLatency} ms</span>)
				</span>
			</div>

			{/* Interpretation */}
			<div className="text-sm text-muted-foreground">
				{isLocalDominant && jitterHigh && (
					<p>
						<span className="text-amber-600 font-medium">Votre Wi-Fi est le maillon faible.</span>{" "}
						Plus de la moitié du délai ({localDelay} ms sur {latency} ms) vient de votre réseau local,
						avec de l&apos;instabilité. Branchez un câble Ethernet pour une amélioration immédiate.
					</p>
				)}
				{isLocalDominant && !jitterHigh && (
					<p>
						<span className="text-amber-600 font-medium">Votre réseau local consomme la majorité du délai.</span>{" "}
						{localDelay} ms sur {latency} ms ({localPct}%) viennent d&apos;avant votre box internet.
						Vérifiez la charge du réseau, les équipements entre votre PC et le routeur.
					</p>
				)}
				{isLocalIssue && !isLocalDominant && jitterHigh && (
					<p>
						<span className="text-amber-600 font-medium">Le problème vient probablement de votre Wi-Fi.</span>{" "}
						Votre réseau local ajoute {localDelay} ms de délai avec de l&apos;instabilité.
						Branchez un câble Ethernet pour une amélioration immédiate.
					</p>
				)}
				{isLocalIssue && !isLocalDominant && !jitterHigh && (
					<p>
						<span className="text-amber-600 font-medium">Votre réseau local ajoute du délai.</span>{" "}
						{localDelay} ms supplémentaires entre votre PC et votre routeur.
						Vérifiez la charge du réseau ou la qualité de votre câble.
					</p>
				)}
				{isInternetSlow && !isLocalIssue && (
					<p>
						<span className="text-amber-600 font-medium">Le délai vient de votre fournisseur internet.</span>{" "}
						Votre réseau local est rapide ({localDelay > 0 ? `${localDelay} ms` : "< 1 ms"})  -
						le goulot d&apos;étranglement est entre votre box et le serveur.
					</p>
				)}
				{!isLocalIssue && !isInternetSlow && (
					<p>
						<span className="text-emerald-600 font-medium">Chemin réseau sain.</span>{" "}
						Réseau local rapide, connexion internet fluide
						 - aucun goulot d&apos;étranglement identifié.
					</p>
				)}
			</div>
		</motion.div>
	);
}

export default function TestVisioPage() {
	const [progress, setProgress] = useState<TestProgress>({
		phase: "idle",
		progress: 0,
		message: "",
	});
	const [result, setResult] = useState<QualityMetrics | null>(null);
	const [error, setError] = useState("");

	const isRunning = !["idle", "done", "error"].includes(progress.phase);

	async function handleStart() {
		setResult(null);
		setError("");
		setProgress({ phase: "token", progress: 0, message: "" });

		try {
			const metrics = await runQualityTest(API_URL, setProgress);
			setResult(metrics);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Une erreur est survenue pendant le test"
			);
		}
	}

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				{/* Back link */}
				<Link
					href="/outils"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8"
				>
					<ArrowLeft className="w-4 h-4" />
					Retour aux outils
				</Link>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-10"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<Video className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-mono text-blue-600">
							test visio
						</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						Votre connexion est-elle prête pour la visio ?
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						On simule un vrai appel Teams ou Zoom pendant 10 secondes
						pour mesurer la qualité réelle de votre liaison.
					</p>
				</motion.div>

				{/* Start button */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex justify-center mb-8"
				>
					<button
						onClick={handleStart}
						disabled={isRunning}
						className="group px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
					>
						{isRunning ? (
							<>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								>
									<Activity className="w-5 h-5" />
								</motion.div>
								Test en cours...
							</>
						) : result ? (
							<>
								<RotateCcw className="w-5 h-5" />
								Relancer le test
							</>
						) : (
							<>
								<Play className="w-5 h-5" />
								Lancer le test
							</>
						)}
					</button>
				</motion.div>

				{/* Privacy banner */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="flex items-center justify-center gap-2 mb-10"
				>
					<motion.div
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
					>
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">
							Aucune donnée personnelle collectée. Le test
							s&apos;exécute entre votre navigateur et notre
							serveur.
						</span>
					</motion.div>
				</motion.div>

				{/* Progress */}
				<AnimatePresence mode="wait">
					{isRunning && (
						<motion.div
							key="progress"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="glass-card p-6 rounded-2xl border border-gray-200 mb-8"
						>
							<div className="flex items-center gap-3 mb-2">
								<PhaseIcon phase={progress.phase} />
								<span className="text-gray-900 font-medium">
									{progress.message}
								</span>
							</div>
							{progress.detail && (
								<p className="text-sm text-muted-foreground mb-4 ml-8">
									{progress.detail}
								</p>
							)}
							<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
								<motion.div
									className="h-full bg-blue-500 rounded-full"
									initial={{ width: 0 }}
									animate={{ width: `${progress.progress}%` }}
									transition={{ duration: 0.3 }}
								/>
							</div>
							<div className="flex justify-between mt-1.5">
								<span className="text-xs text-muted-foreground">
									{progress.progress}%
								</span>
								<span className="text-xs text-muted-foreground">
									~{Math.max(0, Math.round((100 - progress.progress) / 7))}s restantes
								</span>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Error */}
				<AnimatePresence>
					{error && !isRunning && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="glass-card p-6 rounded-2xl border border-red-200 bg-red-50 mb-8"
						>
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
								<div>
									<p className="text-gray-900 font-medium">Test impossible</p>
									<p className="text-sm text-muted-foreground mt-1">
										{progress.error || error}
									</p>
									<p className="text-sm text-muted-foreground mt-2">
										Vérifiez votre connexion internet et réessayez.
										Si le problème persiste,{" "}
										<Link href="https://cyber-rgpd.com" className="text-blue-600 hover:text-blue-600">
											contactez-nous
										</Link>.
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				<AnimatePresence mode="wait">
					{result && progress.phase === "done" && (
						<motion.div
							key="results"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="space-y-6"
						>
							{/* MOS Score + Gauge */}
							<div className={`glass-card p-8 rounded-2xl border text-center ${mosBg(result.mos)}`}>
								<p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">
									Qualité estimée de vos appels
								</p>
								<div className={`text-6xl font-display font-bold mb-1 ${mosColor(result.mos)}`}>
									{result.mos}
									<span className="text-2xl text-muted-foreground">/5</span>
								</div>
								<p className={`text-xl font-display font-semibold mb-1 ${mosColor(result.mos)}`}>
									{mosLabel(result.mos)}
								</p>
								<p className="text-sm text-muted-foreground">
									{progress.message}
								</p>

								<MosGauge mos={result.mos} />

								<p className="text-xs text-muted-foreground mt-2">
									Échelle MOS (Mean Opinion Score) - standard international utilisé
									par les opérateurs télécoms pour évaluer la qualité vocale
								</p>
							</div>

							{/* Score breakdown */}
							<div className="glass-card p-6 rounded-2xl border border-gray-200">
								<h3 className="text-gray-900 font-display font-semibold mb-4">
									D&apos;où vient votre score ?
								</h3>
								<ScoreBreakdown metrics={result} />
							</div>

							{/* Network diagnostic */}
							<NetworkDiagnostic metrics={result} />

							{/* NAT compatibility */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="glass-card p-5 rounded-2xl border border-gray-200"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Globe className={`w-5 h-5 ${natColor(result.natType)}`} />
										<span className="text-sm text-gray-900 font-medium">
											Compatibilité réseau
										</span>
									</div>
									<span className={`text-sm font-medium ${natColor(result.natType)}`}>
										{natLabel(result.natType)}
									</span>
								</div>
								<p className="text-xs text-muted-foreground mt-2">
									{natSimpleDescription(result.natType)}
								</p>
							</motion.div>

							{/* Advice */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="glass-card p-6 rounded-2xl border border-gray-200"
							>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-gray-900 font-display font-semibold mb-2">
											{result.mos >= 3.5
												? "Vous êtes prêt pour la visio"
												: "Conseils pour améliorer vos appels"}
										</p>
										<ul className="text-sm text-muted-foreground space-y-1.5">
											{result.latency >= 200 && (
												<li>Temps de réponse élevé - branchez-vous en Ethernet ou rapprochez-vous du Wi-Fi.</li>
											)}
											{result.jitter >= 30 && (
												<li>Connexion instable - évitez les téléchargements pendant vos appels.</li>
											)}
											{result.packetLoss >= 3 && (
												<li>Pertes de données - vérifiez votre câble réseau ou redémarrez votre box.</li>
											)}
											{result.natType === "symmetric" && (
												<li>Réseau restrictif - signalez-le à votre service informatique.</li>
											)}
											{result.mos >= 4.0 && (
												<li>Votre connexion est parfaitement adaptée à Teams, Zoom et Meet. Bonne réunion !</li>
											)}
											{result.mos >= 3.5 && result.mos < 4.0 && (
												<li>Qualité suffisante pour la visio. Pour l&apos;améliorer, privilégiez le câble Ethernet.</li>
											)}
										</ul>
									</div>
								</div>
							</motion.div>

							{/* CTA */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="text-center mt-6"
							>
								<p className="text-muted-foreground mb-4">
									Besoin d&apos;aide pour améliorer votre connexion ?
								</p>
								<motion.div
									animate={{ opacity: [0.7, 1, 0.7] }}
									transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
								>
									<Link
										href="https://cyber-rgpd.com"
										className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200"
									>
										Contactez-nous pour un diagnostic complet &rarr;
									</Link>
								</motion.div>
								<Link
									href="/outils"
									className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mt-4"
								>
									<ArrowLeft className="w-4 h-4" />
									Retour aux outils
								</Link>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}

// --- Sub-components ---

function PhaseIcon({ phase }: { phase: TestPhase }) {
	const cls = "w-5 h-5 text-blue-600";
	switch (phase) {
		case "token": return <Lock className={cls} />;
		case "cdn": return <Wifi className={cls} />;
		case "nat": return <Globe className={cls} />;
		case "connecting": return <Video className={cls} />;
		case "measuring": return <Activity className={cls} />;
		default: return <Play className={cls} />;
	}
}
