"use client";

import { motion } from "framer-motion";
import { Building2, ShieldAlert, Hotel, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

const cases = [
	{
		icon: <BarChart3 className="w-6 h-6 text-white" />,
		sector: "Logistique & terrain",
		context: "Tout sur Excel et emails",
		what: "Application métier de collecte terrain, dashboards automatisés, exports PDF. Développée sur mesure, utilisée au quotidien.",
		result: "4h/semaine gagnées sur le reporting.",
		resultColor: "text-emerald-400",
	},
	{
		icon: <Building2 className="w-6 h-6 text-white" />,
		sector: "Concession auto — 2 sites",
		context: "Aucun IT interne",
		what: "Réseau inter-sites sécurisé, Wi-Fi professionnel, supervision temps réel. Tout géré à distance.",
		result: "Zéro coupure réseau depuis 18 mois.",
		resultColor: "text-emerald-400",
	},
	{
		icon: <ShieldAlert className="w-6 h-6 text-white" />,
		sector: "Sous-traitant industriel",
		context: "Travaille avec des acteurs majeurs du secteur",
		what: "Pentest externe commandé par la direction. Les attaques ciblent souvent les PME autour des grands groupes, pas les grands groupes eux-mêmes.",
		result: "Vulnérabilités identifiées et corrigées avant qu'elles ne soient exploitées.",
		resultColor: "text-emerald-400",
	},
	{
		icon: <Hotel className="w-6 h-6 text-white" />,
		sector: "Hôtel 3 étoiles",
		context: "Mot de passe de la direction sur le dark web",
		what: "Audit de sécurité externe, vérification des fuites d'identifiants, remédiation email et accès exposés.",
		result: "7 failles corrigées, messagerie sécurisée.",
		resultColor: "text-emerald-400",
	},
];

export default function UseCases() {
	return (
		<section className="py-32 px-6 relative border-t border-white/5">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
					<div>
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white"
						>
							Ce qu&apos;on a fait <span className="text-white/40">concrètement.</span>
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
							className="text-xl text-muted-foreground font-light max-w-2xl"
						>
							Quelques missions récentes, anonymisées. Même approche : on écoute, on construit, on livre.
						</motion.p>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{cases.map((c, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
							className="glass-card p-8 rounded-3xl flex flex-col h-full bg-white/[0.02] border border-white/10 group transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20"
						>
							{/* Header */}
							<div className="flex items-start gap-4 mb-6">
								<div className="p-3 rounded-full bg-white/5 border border-white/5 shrink-0">
									{c.icon}
								</div>
								<div>
									<h3 className="text-lg font-bold text-white font-display">
										{c.sector}
									</h3>
									<p className="text-sm text-muted-foreground font-mono">
										{c.context}
									</p>
								</div>
							</div>

							{/* What was done */}
							<p className="text-sm text-white/70 leading-relaxed mb-6 flex-1">
								{c.what}
							</p>

							{/* Result */}
							<div className="pt-4 border-t border-white/5">
								<p className={`text-sm font-semibold ${c.resultColor} flex items-center gap-2`}>
									<span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
									{c.result}
								</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4 }}
					className="text-center mt-12"
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
