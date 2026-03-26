"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft, MapPin, Lock, Search, Activity, AlertTriangle,
	CheckCircle, XCircle, Clock, Radio, Shield, User, Code, Building,
} from "lucide-react";
import {
	geocodeAddress, runEligibilite,
	type GeocodedAddress, type EligibiliteResult, type EligProgress, type AntennaResult,
} from "@/lib/eligibilite";

// Dynamic imports for Leaflet (no SSR)
const AntennaMap = dynamic(() => import("@/components/ui/AntennaMap"), { ssr: false });
const FtthMap = dynamic(() => import("@/components/ui/FtthMap"), { ssr: false });

type ViewMode = "simple" | "expert";

const OPERATOR_COLORS: Record<string, string> = {
	"ORANGE": "#ff6600",
	"FREE MOBILE": "#999999",
	"BOUYGUES TELECOM": "#0055a4",
	"SFR": "#e4002b",
};

function getOperatorColor(name: string): string {
	const upper = name.toUpperCase();
	for (const [key, color] of Object.entries(OPERATOR_COLORS)) {
		if (upper.includes(key)) return color;
	}
	return "#8b5cf6"; // purple for unknown
}

function distanceLabel(m: number): string {
	if (m < 1000) return `${m} m`;
	return `${(m / 1000).toFixed(1)} km`;
}

export default function EligibilitePage() {
	const [mode, setMode] = useState<ViewMode>("simple");
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
	const [progress, setProgress] = useState<EligProgress>({ phase: "idle", progress: 0, message: "" });
	const [result, setResult] = useState<EligibiliteResult | null>(null);
	const [error, setError] = useState("");

	const isRunning = !["idle", "done", "error"].includes(progress.phase);

	const handleSearch = useCallback(async (value: string) => {
		setQuery(value);
		if (value.length < 5) { setSuggestions([]); return; }
		try {
			const results = await geocodeAddress(value);
			setSuggestions(results);
		} catch { setSuggestions([]); }
	}, []);

	async function handleSelect(addr: GeocodedAddress) {
		setSuggestions([]);
		setQuery(addr.label);
		setResult(null);
		setError("");

		try {
			const data = await runEligibilite(addr, setProgress);
			setResult(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur inattendue");
			setProgress({ phase: "error", progress: 0, message: "" });
		}
	}

	// Determine FTTH status
	const ftthStatus = result?.ftth.available
		? "eligible"
		: result?.ftth.otherTechs?.some(t => t.technology === "FO")
			? "deploying"
			: "not_eligible";

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				<Link href="/outils" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8">
					<ArrowLeft className="w-4 h-4" /> Retour aux outils
				</Link>

				{/* Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<MapPin className="w-4 h-4 text-indigo-600" />
						<span className="text-sm font-mono text-indigo-600">éligibilité</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
						La fibre et la 4G/5G sont-elles disponibles chez vous ?
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Tapez votre adresse pour connaître votre éligibilité fibre optique
						et voir les antennes 4G/5G à proximité.
					</p>
				</motion.div>

				{/* Toggle */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
					<div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
						<button onClick={() => setMode("simple")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === "simple" ? "bg-indigo-600 text-gray-900 shadow-lg shadow-indigo-200" : "text-muted-foreground hover:text-gray-900"}`}>
							<User className="w-3.5 h-3.5" /> Utilisateur
						</button>
						<button onClick={() => setMode("expert")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === "expert" ? "bg-indigo-600 text-gray-900 shadow-lg shadow-indigo-200" : "text-muted-foreground hover:text-gray-900"}`}>
							<Code className="w-3.5 h-3.5" /> Expert
						</button>
					</div>
				</motion.div>

				{/* Address search */}
				<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative mb-8">
					<div className="flex items-center gap-3 glass-card p-2 rounded-2xl border border-gray-200">
						<Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
						<input
							type="text"
							value={query}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder="Tapez votre adresse (ex: 12 rue de la Paix, Paris)"
							className="flex-1 bg-transparent text-gray-900 placeholder:text-muted-foreground outline-none py-3 text-sm"
						/>
					</div>
					<AnimatePresence>
						{suggestions.length > 0 && (
							<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-20 w-full mt-1 glass-card rounded-xl border border-gray-200 overflow-hidden">
								{suggestions.map((addr, i) => (
									<button key={i} onClick={() => handleSelect(addr)} className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0">
										<MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
										{addr.label}
									</button>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Privacy */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 mb-10">
					<motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">Données publiques ARCEP et ANFR. Aucune information conservée.</span>
					</motion.div>
				</motion.div>

				{/* Progress */}
				<AnimatePresence mode="wait">
					{isRunning && (
						<motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 rounded-2xl border border-gray-200 mb-8">
							<div className="flex items-center gap-3 mb-2">
								<Activity className="w-5 h-5 text-indigo-600" />
								<span className="text-gray-900 font-medium">{progress.message}</span>
							</div>
							{progress.detail && <p className="text-sm text-muted-foreground mb-3 ml-8">{progress.detail}</p>}
							<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
								<motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${progress.progress}%` }} transition={{ duration: 0.3 }} />
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Error */}
				<AnimatePresence>
					{error && !isRunning && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 rounded-2xl border border-red-200 bg-red-50 mb-8">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
								<p className="text-sm text-muted-foreground">{error}</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				<AnimatePresence mode="wait">
					{result && progress.phase === "done" && (
						<motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

							{/* FTTH Status - simplified */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
								className={`glass-card p-6 rounded-2xl border ${
									ftthStatus === "eligible" ? "border-emerald-200 bg-emerald-50" :
									ftthStatus === "deploying" ? "border-amber-200 bg-amber-400/5" :
									"border-red-200 bg-red-50"
								}`}
							>
								<div className="flex items-center gap-3 mb-3">
									{ftthStatus === "eligible" ? (
										<CheckCircle className="w-8 h-8 text-emerald-600" />
									) : ftthStatus === "deploying" ? (
										<Clock className="w-8 h-8 text-amber-600" />
									) : (
										<XCircle className="w-8 h-8 text-red-600" />
									)}
									<div>
										<h2 className="text-xl font-display font-bold text-gray-900">
											{ftthStatus === "eligible" ? "Éligible fibre optique (FTTH)" :
											 ftthStatus === "deploying" ? "Fibre optique (FTTH) en cours de déploiement" :
											 "Non éligible fibre optique (FTTH)"}
										</h2>
										<p className="text-sm text-muted-foreground">
											{ftthStatus === "eligible"
												? `${result.ftth.operators.length} opérateur${result.ftth.operators.length > 1 ? "s" : ""} disponible${result.ftth.operators.length > 1 ? "s" : ""}`
												: ftthStatus === "deploying"
													? "Le raccordement est en cours dans votre zone"
													: "Aucun déploiement fibre détecté à cette adresse"
											}
										</p>
									</div>
								</div>

								{/* Building details */}
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
									{result.ftth.imbCode && (
										<div>
											<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Code IMB / EPE</p>
											<p className="text-sm font-mono text-gray-900">{result.ftth.imbCode}</p>
										</div>
									)}
									{result.ftth.nbLogements && (
										<div>
											<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Locaux modélisés</p>
											<p className="text-sm text-gray-900">{result.ftth.nbLogements}</p>
										</div>
									)}
									{mode === "expert" && result.ftth.imbType && (
										<div>
											<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
											<p className="text-sm text-gray-900">{result.ftth.imbType === "IM" ? "Immeuble" : result.ftth.imbType === "PA" ? "Pavillon" : result.ftth.imbType}</p>
										</div>
									)}
									{mode === "expert" && result.ftth.imbSource && (
										<div>
											<p className="text-[10px] text-muted-foreground uppercase tracking-wider">État PM</p>
											<p className="text-sm text-gray-900">{result.ftth.imbSource === "fo" ? "Déployé" : result.ftth.imbSource === "cu" ? "Cuivre uniquement" : result.ftth.imbSource}</p>
										</div>
									)}
									<div className="col-span-2 sm:col-span-3">
										<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Adresse</p>
										<p className="text-sm text-gray-900">{result.ftth.imbAddress || result.address.label}</p>
									</div>
								</div>

								{/* FTTH location map */}
								<div className="rounded-xl overflow-hidden mt-3" style={{ height: 200 }}>
									<FtthMap center={[result.address.lat, result.address.lon]} imbCode={result.ftth.imbCode} />
								</div>

								{/* Expert: other techs */}
								{mode === "expert" && result.ftth.otherTechs && result.ftth.otherTechs.length > 0 && (
									<div className="mt-3 pt-3 border-t border-gray-200">
										<p className="text-xs text-muted-foreground mb-2">Autres technologies :</p>
										<div className="flex flex-wrap gap-2">
											{[...new Set(result.ftth.otherTechs.map(t => t.technologyLabel))].map((tech) => (
												<span key={tech} className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-muted-foreground">{tech}</span>
											))}
										</div>
									</div>
								)}
							</motion.div>

							{/* Antenna Map */}
							{result.antennas.length > 0 && (
								<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-2xl border border-gray-200">
									<h3 className="text-gray-900 font-display font-semibold mb-4 flex items-center gap-2">
										<Radio className="w-5 h-5 text-indigo-600" />
										{mode === "simple" ? "Antennes à proximité" : "Stations de base 4G/5G"}
									</h3>

									{/* Map */}
									<div className="rounded-xl overflow-hidden mb-4" style={{ height: 350 }}>
										<AntennaMap
											center={[result.address.lat, result.address.lon]}
											antennas={result.antennas}
											getColor={getOperatorColor}
										/>
									</div>

									{/* Legend */}
									<div className="flex flex-wrap gap-3 mb-4">
										{Object.entries(OPERATOR_COLORS).map(([name, color]) => (
											<div key={name} className="flex items-center gap-1.5">
												<div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
												<span className="text-xs text-muted-foreground">{name.charAt(0) + name.slice(1).toLowerCase()}</span>
											</div>
										))}
										<div className="flex items-center gap-1.5">
											<div className="w-3 h-3 rounded-full bg-white border border-gray-1000" />
											<span className="text-xs text-muted-foreground">Votre site</span>
										</div>
									</div>

									{/* Antenna list */}
									<div className="space-y-2">
										{result.antennas.map((ant, i) => (
											<div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-100">
												<div className="flex items-center gap-2">
													<div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getOperatorColor(ant.operator) }} />
													<span className="text-sm text-gray-900">{ant.operator}</span>
													{ant.generation.split("+").map((g) => (
														<span key={g} className={`text-xs px-1.5 py-0.5 rounded ${g === "5G" ? "bg-purple-100 text-purple-600" : "bg-indigo-100 text-indigo-600"}`}>{g}</span>
													))}
													{mode === "expert" && <span className="text-xs text-muted-foreground">{ant.technology}</span>}
												</div>
												<div className="text-right">
													<span className="text-sm font-mono text-gray-900">{distanceLabel(ant.distance)}</span>
													{mode === "expert" && <span className="text-xs text-muted-foreground ml-2">H:{ant.height}m</span>}
												</div>
											</div>
										))}
									</div>
								</motion.div>
							)}

							{/* Summary */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl border border-gray-200">
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-gray-900 font-display font-semibold mb-2">En résumé</p>
										<ul className="text-sm text-muted-foreground space-y-1.5">
											{ftthStatus === "eligible" && <li>Votre adresse est éligible à la fibre optique.</li>}
											{ftthStatus === "deploying" && <li>La fibre est en cours de déploiement dans votre zone.</li>}
											{ftthStatus === "not_eligible" && <li>La fibre n&apos;est pas encore disponible à votre adresse.</li>}
											{result.antennas.some(a => a.generation === "5G") && <li>Des antennes 5G sont disponibles à proximité.</li>}
											{result.antennas.some(a => a.generation === "4G") && !result.antennas.some(a => a.generation === "5G") && <li>Votre zone est couverte en 4G.</li>}
											{result.antennas.length > 0 && (
												<li>L&apos;antenne la plus proche est à {distanceLabel(result.antennas[0].distance)} ({result.antennas[0].operator}).</li>
											)}
										</ul>
									</div>
								</div>
							</motion.div>

							{/* CTA */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center mt-6">
								<p className="text-muted-foreground mb-4">Vous souhaitez aller plus loin ?</p>
								<motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
									<Link href="https://cyber-rgpd.com" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200">
										Demander une étude d&apos;éligibilité sur mesure &rarr;
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
