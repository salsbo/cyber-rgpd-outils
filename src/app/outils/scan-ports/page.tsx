"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Shield,
	ShieldCheck,
	ShieldAlert,
	ShieldX,
	Lock,
	Play,
	Activity,
	AlertTriangle,
	RotateCcw,
	User,
	Code,
	Monitor,
	Info,
} from "lucide-react";

const API_URL =
	process.env.NEXT_PUBLIC_SCAN_PORTS_API || "https://scan-ports.dahouse.fr";

type ViewMode = "simple" | "expert";

interface PortResult {
	port: number;
	service: string;
	label: string;
	simpleLabel: string;
	detail: string;
	risk: "critical" | "high" | "medium" | "low" | "info";
	status: "open" | "closed";
	banner: string | null;
	responseTime: number;
}

interface OsGuess {
	type: string;
	label: string;
	simpleLabel: string;
	hints: string[];
}

interface ScanResult {
	ip: string;
	ports: PortResult[];
	os: OsGuess;
	timestamp: number;
	scanDuration: number;
}

const riskConfig = {
	critical: {
		icon: ShieldX,
		color: "text-red-600",
		bg: "bg-red-50 border-red-200",
		label: "Critique",
		simpleLabel: "Danger",
	},
	high: {
		icon: ShieldAlert,
		color: "text-orange-600",
		bg: "bg-orange-50 border-orange-200",
		label: "Élevé",
		simpleLabel: "Attention",
	},
	medium: {
		icon: ShieldAlert,
		color: "text-amber-600",
		bg: "bg-amber-50 border-amber-200",
		label: "Moyen",
		simpleLabel: "À vérifier",
	},
	low: {
		icon: ShieldCheck,
		color: "text-emerald-600",
		bg: "bg-emerald-50 border-emerald-200",
		label: "Faible",
		simpleLabel: "OK",
	},
	info: {
		icon: Info,
		color: "text-blue-600",
		bg: "bg-blue-50 border-blue-200",
		label: "Info",
		simpleLabel: "Normal",
	},
};

export default function ScanPortsPage() {
	const [mode, setMode] = useState<ViewMode>("simple");
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState("");
	const [result, setResult] = useState<ScanResult | null>(null);
	const [clientIp, setClientIp] = useState<string | null>(null);
	const [error, setError] = useState("");

	async function handleScan() {
		setLoading(true);
		setResult(null);
		setError("");
		setProgress("Demande d’accès au serveur de test...");

		try {
			// Step 1: Get token + client IP
			const tokenRes = await fetch(`${API_URL}/token`, { method: "POST" });
			if (!tokenRes.ok) {
				const err = await tokenRes.json().catch(() => ({}));
				throw new Error(err.detail || "Serveur indisponible");
			}
			const { token, clientIp: ip } = await tokenRes.json();
			setClientIp(ip);

			setProgress(`Scan de ${ip} en cours - analyse de 24 ports...`);

			// Step 2: Run scan
			const scanRes = await fetch(`${API_URL}/scan/${token}`, {
				method: "POST",
			});
			if (!scanRes.ok) {
				const err = await scanRes.json().catch(() => ({}));
				throw new Error(err.detail || "Erreur pendant le scan");
			}

			const data: ScanResult = await scanRes.json();
			setResult(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erreur inattendue"
			);
		} finally {
			setLoading(false);
			setProgress("");
		}
	}

	const openPorts = result?.ports.filter((p) => p.status === "open") || [];
	const criticalOpen = openPorts.filter(
		(p) => p.risk === "critical" || p.risk === "high"
	);

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				{/* Back */}
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
						<Shield className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-mono text-blue-600">
							scan exposition
						</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						Votre réseau est-il bien fermé ?
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						On vérifie si des services sensibles (bureau à distance,
						bases de données, partages de fichiers) sont visibles
						depuis internet.
					</p>
				</motion.div>

				{/* Mode toggle */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="flex justify-center mb-6"
				>
					<div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
						<button
							onClick={() => setMode("simple")}
							className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
								mode === "simple"
									? "bg-blue-600 text-gray-900 shadow-lg shadow-blue-200"
									: "text-muted-foreground hover:text-gray-900"
							}`}
						>
							<User className="w-3.5 h-3.5" />
							Utilisateur
						</button>
						<button
							onClick={() => setMode("expert")}
							className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
								mode === "expert"
									? "bg-blue-600 text-gray-900 shadow-lg shadow-blue-200"
									: "text-muted-foreground hover:text-gray-900"
							}`}
						>
							<Code className="w-3.5 h-3.5" />
							Expert
						</button>
					</div>
				</motion.div>

				{/* Scan button */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex justify-center mb-8"
				>
					<button
						onClick={handleScan}
						disabled={loading}
						className="group px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
					>
						{loading ? (
							<>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 1,
										repeat: Infinity,
										ease: "linear",
									}}
								>
									<Activity className="w-5 h-5" />
								</motion.div>
								Scan en cours...
							</>
						) : result ? (
							<>
								<RotateCcw className="w-5 h-5" />
								Relancer le scan
							</>
						) : (
							<>
								<Play className="w-5 h-5" />
								Scanner mon adresse IP
							</>
						)}
					</button>
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
							Seule votre adresse IP publique est scannée. Aucun
							résultat n&apos;est conservé.
						</span>
					</motion.div>
				</motion.div>

				{/* Progress */}
				<AnimatePresence>
					{loading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="glass-card p-6 rounded-2xl border border-gray-200 mb-8"
						>
							<div className="flex items-center gap-3 mb-3">
								<Shield className="w-5 h-5 text-blue-600" />
								<span className="text-gray-900 font-medium">
									{progress}
								</span>
							</div>
							<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
								<motion.div
									className="h-full bg-blue-500 rounded-full"
									animate={{ width: ["0%", "80%", "90%"] }}
									transition={{
										duration: 8,
										times: [0, 0.7, 1],
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Connexion aux 24 ports les plus sensibles - environ 5 à 10 secondes...
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Error */}
				<AnimatePresence>
					{error && !loading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="glass-card p-6 rounded-2xl border border-red-200 bg-red-50 mb-8"
						>
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
								<div>
									<p className="text-gray-900 font-medium">
										Scan impossible
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{error}
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				<AnimatePresence mode="wait">
					{result && !loading && (
						<motion.div
							key="results"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="space-y-6"
						>
							{/* Summary */}
							<div
								className={`glass-card p-6 rounded-2xl border text-center ${
									criticalOpen.length > 0
										? "border-red-200 bg-red-50"
										: openPorts.length > 0
											? "border-amber-200 bg-amber-400/5"
											: "border-emerald-200 bg-emerald-50"
								}`}
							>
								<div className="flex items-center justify-center gap-2 mb-2">
									<Monitor className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-mono text-muted-foreground">
										{result.ip}
									</span>
								</div>

								{criticalOpen.length > 0 ? (
									<>
										<ShieldX className="w-12 h-12 text-red-600 mx-auto mb-2" />
										<h2 className="text-2xl font-display font-bold text-red-600">
											{mode === "simple"
												? `${criticalOpen.length} service${criticalOpen.length > 1 ? "s" : ""} à risque exposé${criticalOpen.length > 1 ? "s" : ""}`
												: `${criticalOpen.length} port${criticalOpen.length > 1 ? "s" : ""} critiques ouverts`}
										</h2>
										<p className="text-sm text-muted-foreground mt-2">
											{mode === "simple"
												? "Des services sensibles sont accessibles depuis internet. Cela représente un risque de sécurité important."
												: `${openPorts.length} ports ouverts sur ${result.ports.length} scannés - ${criticalOpen.length} à risque élevé/critique`}
										</p>
									</>
								) : openPorts.length > 0 ? (
									<>
										<ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-2" />
										<h2 className="text-2xl font-display font-bold text-amber-600">
											{mode === "simple"
												? `${openPorts.length} service${openPorts.length > 1 ? "s" : ""} visible${openPorts.length > 1 ? "s" : ""}`
												: `${openPorts.length} port${openPorts.length > 1 ? "s" : ""} ouverts`}
										</h2>
										<p className="text-sm text-muted-foreground mt-2">
											{mode === "simple"
												? "Quelques services sont visibles, mais sans risque critique immédiat."
												: `${openPorts.length} ports ouverts sur ${result.ports.length} scannés - aucun risque critique`}
										</p>
									</>
								) : (
									<>
										<ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
										<h2 className="text-2xl font-display font-bold text-emerald-600">
											{mode === "simple"
												? "Rien de visible depuis internet"
												: "Aucun port ouvert détecté"}
										</h2>
										<p className="text-sm text-muted-foreground mt-2">
											{mode === "simple"
												? "Bonne nouvelle - aucun service sensible n'est accessible de l'extérieur."
												: `0 ports ouverts sur ${result.ports.length} scannés`}
										</p>
									</>
								)}
							</div>

							{/* OS Detection */}
							{result.os.type !== "unknown" && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="glass-card p-5 rounded-2xl border border-gray-200"
								>
									<div className="flex items-center gap-2 mb-2">
										<Monitor className="w-5 h-5 text-blue-600" />
										<span className="text-gray-900 font-medium">
											{mode === "simple"
												? "Système détecté"
												: "OS Fingerprint"}
										</span>
									</div>
									<p className="text-sm text-muted-foreground">
										{mode === "simple"
											? result.os.simpleLabel
											: result.os.label}
									</p>
									{mode === "expert" &&
										result.os.hints.length > 0 && (
											<div className="mt-2 space-y-1">
												{result.os.hints.map(
													(h, i) => (
														<p
															key={i}
															className="text-xs font-mono text-gray-500 bg-gray-100 rounded px-2 py-1"
														>
															{h}
														</p>
													)
												)}
											</div>
										)}
								</motion.div>
							)}

							{/* Open ports detail */}
							{openPorts.length > 0 && (
								<div>
									<h3 className="text-gray-900 font-display font-semibold mb-3 flex items-center gap-2">
										<ShieldAlert className="w-5 h-5 text-amber-600" />
										{mode === "simple"
											? "Services exposés"
											: "Ports ouverts"}
									</h3>
									<div className="space-y-3">
										{openPorts.map((p, i) => {
											const config =
												riskConfig[p.risk];
											const Icon = config.icon;
											return (
												<motion.div
													key={p.port}
													initial={{
														opacity: 0,
														y: 10,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													transition={{
														delay: i * 0.05,
													}}
													className={`glass-card p-4 rounded-xl border ${config.bg}`}
												>
													<div className="flex items-center justify-between mb-1">
														<div className="flex items-center gap-2">
															<Icon
																className={`w-4 h-4 ${config.color}`}
															/>
															<span className="text-sm text-gray-900 font-medium">
																{mode ===
																"simple"
																	? p.label
																	: `${p.port}/${p.service}`}
															</span>
														</div>
														<span
															className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
														>
															{mode ===
															"simple"
																? config.simpleLabel
																: config.label}
														</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														{mode === "simple"
															? p.simpleLabel
															: p.detail}
													</p>
													{mode === "expert" && (
														<div className="flex items-center gap-3 mt-2">
															{p.responseTime >
																0 && (
																<span className="text-xs font-mono text-gray-400">
																	{
																		p.responseTime
																	}
																	ms
																</span>
															)}
															{p.banner && (
																<span className="text-xs font-mono text-gray-400 bg-gray-100 rounded px-2 py-0.5 truncate max-w-[300px]">
																	{p.banner}
																</span>
															)}
														</div>
													)}
												</motion.div>
											);
										})}
									</div>
								</div>
							)}

							{/* Closed ports summary (expert only) */}
							{mode === "expert" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="glass-card p-4 rounded-xl border border-gray-200"
								>
									<p className="text-sm text-muted-foreground">
										<span className="text-emerald-600 font-medium">
											{result.ports.filter(
												(p) => p.status === "closed"
											).length}{" "}
											ports fermés
										</span>{" "}
										:{" "}
										{result.ports
											.filter(
												(p) => p.status === "closed"
											)
											.map((p) => p.port)
											.join(", ")}
									</p>
								</motion.div>
							)}

							{/* Advice */}
							{criticalOpen.length > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="glass-card p-6 rounded-2xl border border-gray-200"
								>
									<div className="flex items-start gap-3">
										<Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
										<div>
											<p className="text-gray-900 font-display font-semibold mb-2">
												{mode === "simple"
													? "Ce qu’il faut faire"
													: "Recommandations"}
											</p>
											<ul className="text-sm text-muted-foreground space-y-1.5">
												{criticalOpen.some(
													(p) => p.port === 3389
												) && (
													<li>
														{mode === "simple"
															? "Le bureau à distance est accessible depuis internet - c'est la porte d'entrée préférée des ransomwares. Fermez-le ou utilisez un VPN."
															: "RDP (3389) exposé - désactivez ou placez derrière un VPN/RDG. Risque BlueKeep/brute-force."}
													</li>
												)}
												{criticalOpen.some((p) =>
													[
														1433, 3306, 5432,
														27017, 6379, 1521,
													].includes(p.port)
												) && (
													<li>
														{mode === "simple"
															? "Une base de données est visible depuis internet - vos données sont potentiellement accessibles. Fermez ce port immédiatement."
															: "Base de données exposée - restreindre l'accès au réseau local ou via tunnel SSH."}
													</li>
												)}
												{criticalOpen.some((p) =>
													[139, 445].includes(
														p.port
													)
												) && (
													<li>
														{mode === "simple"
															? "Le partage de fichiers Windows est ouvert - quelqu'un pourrait accéder à vos fichiers. Bloquez les ports 139 et 445 sur votre pare-feu."
															: "SMB/NetBIOS exposé - bloquer ports 139/445 en entrée. Risque EternalBlue/WannaCry."}
													</li>
												)}
												{criticalOpen.some(
													(p) => p.port === 5900
												) && (
													<li>
														{mode === "simple"
															? "La prise de contrôle à distance (VNC) est ouverte - quelqu'un pourrait voir et contrôler votre écran."
															: "VNC (5900) exposé - souvent sans chiffrement ni auth forte. Tunneliser via SSH ou VPN."}
													</li>
												)}
											</ul>
										</div>
									</div>
								</motion.div>
							)}

							{/* CTA */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="text-center mt-6"
							>
								<p className="text-muted-foreground mb-4">
									Besoin d&apos;aide pour sécuriser votre réseau ?
								</p>
								<motion.div
									animate={{ opacity: [0.7, 1, 0.7] }}
									transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
								>
									<Link
										href="https://cyber-rgpd.com"
										className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200"
									>
										Contactez-nous pour un audit complet &rarr;
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
