"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wrench, Mail, Video, Shield, Globe, MapPin, ClipboardCheck, Smartphone, Wifi, Signal, Lock, ArrowRight, Cable, ShieldAlert } from "lucide-react";
import SplitFlapCounter from "@/components/ui/SplitFlapCounter";
import ToolRating from "@/components/ui/ToolRating";

/* ------------------------------------------------------------------ */
/*  Base counts - valeurs de départ par outil                          */
/* ------------------------------------------------------------------ */

const BASE_COUNTS: Record<string, number> = {
	"audit-email": 0,
	"test-visio": 0,
	"scan-ports": 0,
	"dns-bench": 0,
	"eligibilite": 0,
	"diagnostic": 0,
	"easynetpulse": 0,
	"test-4g": 0,
	"comparateur-fibre": 0,
	"simulation-wifi": 0,
	"cyberarnaques": 0,
};

/* ------------------------------------------------------------------ */
/*  Outils                                                             */
/* ------------------------------------------------------------------ */

const tools = [
	{
		name: "Audit de configuration email",
		description:
			"Test rapide : vos emails sont-ils bien délivrés, sécurisés et protégés contre l'usurpation d'identité ?",
		href: "/outils/audit-email",
		icon: Mail,
		slug: "audit-email",
		tags: ["Délivrabilité", "Anti-spam", "Anti-usurpation", "Sécurité"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Test Visio",
		description:
			"Votre connexion est-elle prête pour Teams, Zoom ou Meet ? Testez la qualité réelle de votre liaison en 15 secondes.",
		href: "/outils/test-visio",
		icon: Video,
		slug: "test-visio",
		tags: ["Qualité d'appel", "Latence", "Stabilité", "Réseau"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Scan rapide d'exposition",
		description:
			"Vérifiez si des services sensibles (bureau à distance, bases de données) sont visibles depuis internet sur votre adresse IP.",
		href: "/outils/scan-ports",
		icon: Shield,
		slug: "scan-ports",
		tags: ["Ports ouverts", "Sécurité", "Exposition", "Réseau"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Bilan de surf Internet",
		description:
			"Débit, latence, chargement de sites - testez votre connexion et obtenez une note avec des conseils concrets.",
		href: "/outils/dns-bench",
		icon: Globe,
		slug: "dns-bench",
		tags: ["Débit", "Latence", "Performance", "Score"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Éligibilité Fibre & 4G/5G",
		description:
			"Tapez votre adresse pour savoir si la fibre est disponible et quelles antennes 4G/5G couvrent votre site.",
		href: "/outils/eligibilite",
		icon: MapPin,
		slug: "eligibilite",
		tags: ["Fibre", "4G", "5G", "Couverture"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Diagnostic IT 360°",
		description:
			"15 questions pour évaluer votre connexion, sécurité, sauvegardes et support. Score et conseils immédiats.",
		href: "/outils/diagnostic",
		icon: ClipboardCheck,
		slug: "diagnostic",
		tags: ["Sécurité", "Sauvegarde", "Support", "Score"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "EasyNetPulse",
		description:
			"Votre iPhone est-il connecté à Internet ? Une sonde simple qui vérifie la connectivité sans consommer de data inutilement.",
		href: "https://apps.apple.com/fr/app/easynetpulse/id6754982118",
		icon: Smartphone,
		slug: "easynetpulse",
		tags: ["iPhone", "Connectivité", "Sonde", "App Store"],
		privacy: "Aucune donnée collectée",
		external: true,
	},
	{
		name: "Test réception 4G / 5G",
		description:
			"Mesurez la qualité du signal 4G / 5G sur votre site avec votre smartphone. Mode opératoire guidé, saisie des valeurs, évaluation immédiate.",
		href: "/outils/test-4g",
		icon: Signal,
		slug: "test-4g",
		tags: ["4G", "5G", "RSRP", "SINR", "Couverture"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Comparateur Fibre Pro",
		description:
			"Orange, Free, Bouygues, LINKT : comparez les offres FTTH pro en un coup d'œil. Prix, services, GTR - pour choisir en connaissance de cause.",
		href: "/outils/comparateur-fibre",
		icon: Cable,
		slug: "comparateur-fibre",
		tags: ["FTTH", "Opérateurs", "Prix", "Comparatif"],
		privacy: "Aucune donnée collectée",
	},
	{
		name: "Simulation Wi-Fi",
		description:
			"Simulez la couverture Wi-Fi de vos locaux. Importez un plan, placez vos bornes et visualisez la couverture.",
		href: "https://auditwifi.dahouse.fr", // external tool
		icon: Wifi,
		slug: "simulation-wifi",
		tags: ["Wi-Fi", "Couverture", "Simulation", "1er plan gratuit"],
		privacy: "1 plan gratuit\nProjets illimités en premium",
		external: "site",
	},
	{
		name: "Cyberarnaques",
		description:
			"Apprenez à reconnaître les 5 signaux d'une arnaque et les réflexes pour vous en protéger. Parcours interactif de 3 minutes.",
		href: "/outils/cyberarnaques",
		icon: ShieldAlert,
		slug: "cyberarnaques",
		tags: ["Sécurité", "Sensibilisation", "Arnaque", "Prévention"],
		privacy: "Aucune donnée collectée",
	},
];

/* ------------------------------------------------------------------ */
/*  Hook - compteurs (API KV + fallback localStorage)                  */
/* ------------------------------------------------------------------ */

function useToolCounts() {
	const [counts, setCounts] = useState<Record<string, number> | null>(null);

	useEffect(() => {
		// Fetch from API first, fallback to localStorage only if API fails
		fetch("/api/tool-stats")
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data && !data.error) {
					const apiCounts: Record<string, number> = {};
					for (const slug of Object.keys(BASE_COUNTS)) {
						apiCounts[slug] = data[slug]?.usage ?? 0;
					}
					setCounts(apiCounts);
				} else {
					// API failed - fallback to localStorage
					const local: Record<string, number> = {};
					for (const [slug, base] of Object.entries(BASE_COUNTS)) {
						const extra = parseInt(localStorage.getItem(`tool-usage-${slug}`) || "0", 10);
						local[slug] = base + extra;
					}
					setCounts(local);
				}
			})
			.catch(() => {
				// Network error - fallback to localStorage
				const local: Record<string, number> = {};
				for (const [slug, base] of Object.entries(BASE_COUNTS)) {
					const extra = parseInt(localStorage.getItem(`tool-usage-${slug}`) || "0", 10);
					local[slug] = base + extra;
				}
				setCounts(local);
			});
	}, []);

	return counts;
}

/* ------------------------------------------------------------------ */
/*  Track usage on click                                               */
/* ------------------------------------------------------------------ */

function trackUsage(slug: string) {
	// localStorage
	const key = `tool-usage-${slug}`;
	const current = parseInt(localStorage.getItem(key) || "0", 10);
	localStorage.setItem(key, (current + 1).toString());

	// API (fire-and-forget)
	fetch("/api/tool-stats", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ action: "usage", tool: slug }),
	}).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OutilsPage() {
	const counts = useToolCounts();

	return (
		<main className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-5xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<Wrench className="w-4 h-4 text-indigo-600" />
						<span className="text-sm font-mono text-indigo-600">
							outils PME
						</span>
					</div>
					<h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
						Outils gratuits pour{" "}
						<span className="gradient-text">PME</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Des outils simples et concrets pour auditer, mesurer et
						améliorer votre infrastructure. Aucune inscription requise.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{tools.map((tool, i) => {
						const Icon = tool.icon;
						return (
							<motion.div
								key={tool.name}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 + i * 0.1 }}
							>
								<Link
									href={tool.href}
									{...("external" in tool && tool.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									onClick={() => trackUsage(tool.slug)}
									className="group glass-card p-6 rounded-2xl border border-gray-200 hover:border-indigo-200 flex flex-col gap-4 transition-all hover:scale-[1.02] block h-full"
								>
									<div className="flex items-start justify-between">
										<div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
											<Icon className="w-6 h-6 text-indigo-600" />
										</div>
										{counts !== null && <SplitFlapCounter value={counts[tool.slug] ?? 0} />}
									</div>
									<div>
										<h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
											{tool.name}
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											{tool.description}
										</p>
									</div>
									<div className="flex flex-wrap gap-1.5 mt-auto">
										{tool.tags.map((tag) => (
											<span
												key={tag}
												className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-muted-foreground"
											>
												{tag}
											</span>
										))}
									</div>
									<div className="flex items-center justify-between pt-2 border-t border-gray-100">
										<motion.span
											animate={{ opacity: [0.5, 1, 0.5] }}
											transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
											className="inline-flex items-center gap-1 text-xs text-emerald-600"
										>
											<Lock className="w-3 h-3" />
											<span className="whitespace-pre-line">{tool.privacy}</span>
										</motion.span>
										<div className="flex items-center gap-4">
											<ToolRating slug={tool.slug} />
											<span className="text-sm text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
												{"external" in tool ? (tool.external === "site" ? "Accéder" : "App Store") : "Lancer"}
												<ArrowRight className="w-3.5 h-3.5" />
											</span>
										</div>
									</div>
								</Link>
							</motion.div>
						);
					})}

					{/* Coming soon placeholder */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="glass-card p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center gap-4 opacity-40"
					>
						<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
							<Wrench className="w-6 h-6 text-muted-foreground" />
						</div>
						<h3 className="font-display font-semibold text-lg">
							Bientôt disponible
						</h3>
						<p className="text-sm text-muted-foreground">
							D&apos;autres outils arrivent. Dites-nous ce dont vous
							avez besoin.
						</p>
						<span className="text-sm text-indigo-600">
							Bientot...
						</span>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
