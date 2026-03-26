"use client";

import { motion } from "framer-motion";
import {
	Camera, ClipboardCheck, GraduationCap, BarChart3,
	Building2, ShieldAlert, Hotel, Wifi,
	Lightbulb, Shield, Network,
	ArrowRight, Repeat, Code,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Exemples concrets — apps métier + missions                         */
/* ------------------------------------------------------------------ */

const examples = [
	{
		icon: <Camera className="w-6 h-6 text-indigo-400" />,
		type: "app" as const,
		title: "Installateur télécom — validation terrain",
		description: "Un prestataire télécom perdait du temps à ressaisir ses comptes rendus d’intervention. On lui a construit une app mobile : il photographie la PTO, l’app reconnaît la référence, valide l’environnement et génère le rapport. Tout part directement au donneur d’ordre.",
		result: "15 minutes gagnées par intervention, zéro ressaisie.",
	},
	{
		icon: <ClipboardCheck className="w-6 h-6 text-indigo-400" />,
		type: "app" as const,
		title: "Audit de site & rapport",
		description: "Audit terrain structuré : photos, mesures, constats, recommandations. Export PDF automatique, historique complet. Utilisé par des techniciens sans formation préalable.",
		result: "Temps d'intervention sur site réduit de 50 %.",
	},
	{
		icon: <GraduationCap className="w-6 h-6 text-indigo-400" />,
		type: "app" as const,
		title: "Cahier de réussites — Éducation",
		description: "Les enseignants photographient les réussites, l'app construit le cahier automatiquement. Partage avec les parents, progression consolidée, respect strict du RGPD.",
		result: "Des heures économisées sur la mise en page.",
	},
	{
		icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
		type: "app" as const,
		title: "Collecte terrain & dashboards",
		description: "Saisie mobile sur le terrain, synchronisation en temps réel, tableaux de bord automatisés.",
		result: "4h/semaine gagnées sur le reporting.",
	},
	{
		icon: <Wifi className="w-6 h-6 text-indigo-400" />,
		type: "app" as const,
		title: "Portail captif Wi-Fi — sur mesure",
		description: "Un firewall et du Wi-Fi suffisent. On déploie un portail captif personnalisé à votre image, hébergé et maintenu dans le cloud. Page d'accueil à vos couleurs, authentification par email ou CGU, réseau visiteurs isolé. Abonnement mensuel incluant exploitation et évolutions.",
		result: "Accueil Wi-Fi pro, maintenu en continu, à prix PME.",
	},
	{
		icon: <Building2 className="w-6 h-6 text-indigo-400" />,
		type: "mission" as const,
		title: "Concession auto — 2 sites",
		description: "Aucun IT interne. Réseau inter-sites sécurisé, Wi-Fi professionnel, supervision temps réel. Tout géré à distance.",
		result: "Zéro coupure réseau depuis 18 mois.",
	},
	{
		icon: <ShieldAlert className="w-6 h-6 text-indigo-400" />,
		type: "mission" as const,
		title: "Sous-traitant industriel",
		description: "Travaille avec des acteurs majeurs du secteur. Les attaques ciblent souvent les PME autour des grands groupes. Pentest externe commandé par la direction.",
		result: "Vulnérabilités corrigées avant exploitation.",
	},
	{
		icon: <Hotel className="w-6 h-6 text-indigo-400" />,
		type: "mission" as const,
		title: "Hôtel 3 étoiles",
		description: "Mot de passe de la direction trouvé sur le dark web. Audit de sécurité, vérification des fuites, remédiation email et accès exposés.",
		result: "7 failles corrigées, messagerie sécurisée.",
	},
];

/* ------------------------------------------------------------------ */
/*  Deux modèles économiques                                           */
/* ------------------------------------------------------------------ */

const models = [
	{
		icon: <Code className="w-5 h-5" />,
		title: "Développement au forfait",
		description: "On développe l'application, on vous la livre. Vous êtes propriétaire. En option, on assure le maintien en condition opérationnelle : mises à jour, corrections, surveillance, pour que l'outil continue de tourner sans que vous ayez à y penser.",
		tags: ["Propriété du code", "Livraison clé en main", "Maintenance en option"],
	},
	{
		icon: <Repeat className="w-5 h-5" />,
		title: "Abonnement mensuel",
		description: "On développe, on héberge, on maintient, on fait évoluer. Vous payez un usage, pas un projet.",
		tags: ["Pas d'investissement initial", "Évolutions incluses", "Hébergement inclus"],
	},
];

/* ------------------------------------------------------------------ */
/*  Activités d'appui                                                  */
/* ------------------------------------------------------------------ */

const support = [
	{
		icon: <Lightbulb className="w-5 h-5 text-white/60" />,
		title: "Conseil & cadrage",
		description: "Audit, architecture, IA, feuille de route.",
	},
	{
		icon: <Network className="w-5 h-5 text-white/60" />,
		title: "Réseau LAN & WAN",
		description: "Conception, Wi-Fi pro, VPN, fibre, 4G/5G.",
	},
	{
		icon: <Shield className="w-5 h-5 text-white/60" />,
		title: "Sécurité",
		description: "Pentest, messagerie, sauvegarde, conformité.",
	},
];

export default function Features() {
	return (
		<section id="ce-quon-fait" className="py-32 px-6 relative">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white"
					>
						Ce qu&apos;on fait <span className="text-white/40">concrètement.</span>
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-xl text-muted-foreground font-light max-w-2xl mx-auto"
					>
						Applications métier, infrastructure, sécurité — quelques exemples récents.
					</motion.p>
				</div>

				{/* Exemples concrets */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
					{examples.map((ex, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
							className="glass-card rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 flex flex-col"
						>
							<div className="flex items-start gap-3 mb-3">
								<div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
									{ex.icon}
								</div>
								<div>
									<h3 className="text-sm font-bold text-white font-display">
										{ex.title}
									</h3>
									<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
										{ex.type === "app" ? "Application métier" : "Mission"}
									</span>
								</div>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1">
								{ex.description}
							</p>
							{ex.result && (
								<div className="pt-3 mt-3 border-t border-white/5">
									<p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
										{ex.result}
									</p>
								</div>
							)}
						</motion.div>
					))}
				</div>

				{/* Deux modèles */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-16"
				>
					<h3 className="text-lg font-display font-semibold text-white text-center mb-8">
						Deux modèles, selon ce qui vous convient
					</h3>
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						{models.map((model, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.1 + i * 0.1 }}
								className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
							>
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white">
										{model.icon}
									</div>
									<h4 className="font-display font-semibold text-white">{model.title}</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-4 leading-relaxed">{model.description}</p>
								<div className="flex flex-wrap gap-2">
									{model.tags.map((tag, j) => (
										<span key={j} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
											{tag}
										</span>
									))}
								</div>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Appui : conseil, réseau, sécu */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<p className="text-sm text-muted-foreground text-center mb-6 font-light">
						En appui : conseil, réseau et sécurité — pour que vos outils tiennent dans la durée.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
						{support.map((s, i) => (
							<Link
								key={i}
								href="/offres"
								className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all group flex-1"
							>
								{s.icon}
								<div>
									<span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{s.title}</span>
									<p className="text-xs text-muted-foreground">{s.description}</p>
								</div>
								<ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors ml-auto shrink-0" />
							</Link>
						))}
					</div>
				</motion.div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					className="text-center mt-16"
				>
					<Link
						href="/contact"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors font-medium"
					>
						Un contexte similaire ? Parlons-en
						<ArrowRight className="w-4 h-4" />
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
