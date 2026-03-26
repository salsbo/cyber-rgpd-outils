"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft, Check, X, Minus, ChevronDown, ArrowRight,
	Wifi, Shield, Phone, Smartphone, Clock, Headphones, Zap, Building2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Données comparatives - mars 2026                                   */
/* ------------------------------------------------------------------ */

interface Operateur {
	id: string;
	nom: string;
	couleur: string;
	offre: string;
	type: "grand-public" | "operateur-pro";
	prixPromo: string;
	prixNormal: string;
	promoduree: string;
	engagement: string;
	debitDown: string;
	debitUp: string;
	wifi: string;
	telephonie: string;
	mobile: string;
	backup4g: string;
	cybersecurite: string;
	gtr: string;
	ipFixe: string;
	support: string;
	avantages: string[];
	limites: string[];
	verdict: string;
	lien: string;
}

const operateurs: Operateur[] = [
	{
		id: "orange",
		nom: "Orange Pro",
		couleur: "orange",
		offre: "Livebox Pro Fibre",
		type: "grand-public",
		prixPromo: "36 € HT/mois",
		prixNormal: "50 € HT/mois",
		promoduree: "6 mois",
		engagement: "12 mois",
		debitDown: "8 Gb/s",
		debitUp: "8 Gb/s",
		wifi: "Wi-Fi 7",
		telephonie: "Illimité fixe + mobiles FR",
		mobile: "En option (Open Pro)",
		backup4g: "En option (Airbox)",
		cybersecurite: "Non incluse",
		gtr: "J+1",
		ipFixe: "Sur demande",
		support: "7j/7",
		avantages: [
			"Réseau fibre le plus étendu de France",
			"Débits symétriques 8 Gb/s",
			"-30% pour les créateurs d’entreprise",
		],
		limites: [
			"IP fixe payante en option",
			"Backup 4G payant",
			"Prix qui double après la promo",
		],
		verdict: "Le choix sûr pour une PME qui veut un réseau stable sans se poser de questions. Mais les options s’additionnent vite.",
		lien: "https://boutiquepro.orange.fr/internet",
	},
	{
		id: "free",
		nom: "Free Pro",
		couleur: "red",
		offre: "Freebox Pro",
		type: "grand-public",
		prixPromo: "39,99 € HT/mois",
		prixNormal: "49,99 € HT/mois",
		promoduree: "12 mois",
		engagement: "Sans engagement",
		debitDown: "8 Gb/s",
		debitUp: "8 Gb/s",
		wifi: "Wi-Fi 7",
		telephonie: "2 lignes fixes illimitées",
		mobile: "1 forfait 5G 150 Go inclus",
		backup4g: "Inclus (automatique)",
		cybersecurite: "Firewall + analyse flux inclus",
		gtr: "Non garanti",
		ipFixe: "Incluse",
		support: "Lun-Sam",
		avantages: [
			"Meilleur rapport qualité/prix du marché",
			"Sans engagement",
			"Mobile 5G + backup 4G + cybersécurité inclus",
			"1 To de stockage NVMe intégré",
		],
		limites: [
			"Pas de GTR (pas de délai d’intervention garanti)",
			"Support moins accessible que les concurrents",
			"Réseau fibre FTTH mutualisé (débits non garantis)",
		],
		verdict: "Le meilleur package tout-en-un pour une PME. Imbattable sur les services inclus. Mais sans GTR, si la fibre tombe un vendredi soir, personne ne vient le samedi matin.",
		lien: "https://pro.free.fr/freebox-pro/",
	},
	{
		id: "bouygues",
		nom: "Bouygues Pro",
		couleur: "blue",
		offre: "Bbox Pro Évolutive",
		type: "grand-public",
		prixPromo: "49,99 € HT/mois",
		prixNormal: "59,99 € HT/mois",
		promoduree: "12 mois",
		engagement: "12 mois",
		debitDown: "8 Gb/s",
		debitUp: "8 Gb/s",
		wifi: "Wi-Fi 6",
		telephonie: "Standard téléphonique inclus",
		mobile: "En option",
		backup4g: "200 Go inclus",
		cybersecurite: "Fortinet intégré (firewall + antivirus)",
		gtr: "8h ouvrées",
		ipFixe: "Incluse",
		support: "7j/7 8h-20h",
		avantages: [
			"GTR 8h - le seul à garantir un délai d’intervention",
			"Cybersécurité Fortinet intégrée",
			"Backup 4G 200 Go inclus dès la souscription",
		],
		limites: [
			"Le plus cher des quatre",
			"Wi-Fi 6 (pas Wi-Fi 7)",
			"Mobile en supplément",
		],
		verdict: "L’offre la plus professionnelle des grands opérateurs. La GTR 8h et le firewall Fortinet intégré en font le choix logique pour une PME qui ne peut pas se permettre de coupure.",
		lien: "https://www.bouyguestelecom-pro.fr/acces-internet/fibre-optique/ftth",
	},
	{
		id: "linkt",
		nom: "LINKT",
		couleur: "emerald",
		offre: "Fibre FTTH / FTTO",
		type: "operateur-pro",
		prixPromo: "Sur devis",
		prixNormal: "Sur devis",
		promoduree: " -",
		engagement: "36 mois",
		debitDown: "Jusqu’à 1 Gb/s",
		debitUp: "Jusqu’à 1 Gb/s",
		wifi: "Wi-Fi pro géré (Fortinet)",
		telephonie: "VoIP / Teams SIP Trunk",
		mobile: "Forfaits pro sur devis",
		backup4g: "Inclus + agrégation multi-lien",
		cybersecurite: "SOC 6e Sens + anti-DDoS",
		gtr: "4h (FTTO)",
		ipFixe: "Incluse",
		support: "Interlocuteur dédié",
		avantages: [
			"Opérateur dédié B2B (pas de grand public)",
			"Interlocuteur unique, accompagnement sur mesure",
			"GTR 4h sur fibre dédiée FTTO",
			"SOC souverain français",
			"SD-WAN, VPN, agrégation multi-lien",
		],
		limites: [
			"Prix non affichés (nécessite un devis)",
			"Engagement 36 mois",
			"Moins adapté aux très petites structures (<5 postes)",
		],
		verdict: "L’alternative pour les PME qui veulent un vrai partenaire télécom, pas juste une box. Accès fibre dédiée, SOC, SD-WAN - un niveau de service que les box pro ne proposent pas.",
		lien: "https://www.linkt.fr/",
	},
];

/* ------------------------------------------------------------------ */
/*  Couleurs par opérateur                                              */
/* ------------------------------------------------------------------ */

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
	orange: {
		bg: "bg-orange-50",
		border: "border-orange-200",
		text: "text-orange-600",
		badge: "bg-orange-100 text-orange-600",
	},
	red: {
		bg: "bg-red-50",
		border: "border-red-200",
		text: "text-red-600",
		badge: "bg-red-100 text-red-600",
	},
	blue: {
		bg: "bg-blue-50",
		border: "border-blue-200",
		text: "text-blue-600",
		badge: "bg-blue-100 text-blue-600",
	},
	emerald: {
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		text: "text-emerald-600",
		badge: "bg-emerald-500/20 text-emerald-600",
	},
};

/* ------------------------------------------------------------------ */
/*  Composants                                                          */
/* ------------------------------------------------------------------ */

function FeatureIcon({ value }: { value: string }) {
	if (value.toLowerCase().startsWith("inclus") || value.toLowerCase().startsWith("2 ligne") || value.toLowerCase().startsWith("1 forfait"))
		return <Check className="w-4 h-4 text-emerald-600 shrink-0" />;
	if (value.toLowerCase().startsWith("non") || value === " -")
		return <X className="w-4 h-4 text-red-600 shrink-0" />;
	if (value.toLowerCase().startsWith("en option") || value.toLowerCase().startsWith("sur de"))
		return <Minus className="w-4 h-4 text-amber-600 shrink-0" />;
	return <Check className="w-4 h-4 text-emerald-600 shrink-0" />;
}

function OperateurCard({ op }: { op: Operateur }) {
	const [isOpen, setIsOpen] = useState(false);
	const c = colorMap[op.couleur];

	const features = [
		{ label: "Téléphonie", value: op.telephonie, icon: Phone },
		{ label: "Mobile", value: op.mobile, icon: Smartphone },
		{ label: "Backup 4G", value: op.backup4g, icon: Wifi },
		{ label: "Cybersécurité", value: op.cybersecurite, icon: Shield },
		{ label: "GTR", value: op.gtr, icon: Clock },
		{ label: "IP fixe", value: op.ipFixe, icon: Zap },
		{ label: "Support", value: op.support, icon: Headphones },
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			className={cn(
				"bg-gray-50 border rounded-2xl overflow-hidden transition-all",
				c.border,
				isOpen && "ring-1 ring-white/10"
			)}
		>
			{/* Header */}
			<div className="p-6">
				<div className="flex items-start justify-between mb-4">
					<div>
						<h3 className={cn("text-xl font-display font-bold", c.text)}>{op.nom}</h3>
						<p className="text-sm text-muted-foreground">{op.offre}</p>
					</div>
					{op.type === "operateur-pro" && (
						<span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full", c.badge)}>
							Opérateur B2B
						</span>
					)}
				</div>

				{/* Prix */}
				<div className="mb-4">
					<span className="text-2xl font-bold text-gray-900">{op.prixPromo}</span>
					{op.prixNormal !== op.prixPromo && (
						<span className="text-sm text-muted-foreground ml-2">
							puis {op.prixNormal}
						</span>
					)}
					{op.promoduree !== " -" && op.prixNormal !== op.prixPromo && (
						<span className="text-xs text-muted-foreground ml-1">({op.promoduree})</span>
					)}
				</div>

				{/* Débits & engagement */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="bg-gray-100 rounded-xl p-3 text-center">
						<p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Débit</p>
						<p className="text-sm font-semibold text-gray-900">{op.debitDown}</p>
					</div>
					<div className="bg-gray-100 rounded-xl p-3 text-center">
						<p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Wi-Fi</p>
						<p className="text-sm font-semibold text-gray-900">{op.wifi}</p>
					</div>
					<div className="bg-gray-100 rounded-xl p-3 text-center">
						<p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Engagement</p>
						<p className="text-sm font-semibold text-gray-900">{op.engagement}</p>
					</div>
				</div>

				{/* Services */}
				<div className="space-y-2 mb-4">
					{features.map((f) => (
						<div key={f.label} className="flex items-center gap-3 text-sm">
							<FeatureIcon value={f.value} />
							<span className="text-muted-foreground w-24 shrink-0">{f.label}</span>
							<span className="text-gray-700">{f.value}</span>
						</div>
					))}
				</div>

				{/* Expand */}
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
				>
					{isOpen ? "Moins de détails" : "Voir le verdict"}
					<ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
				</button>
			</div>

			{/* Expanded */}
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="border-t border-gray-100 p-6 space-y-4"
				>
					{/* Avantages */}
					<div>
						<p className="text-xs font-mono uppercase tracking-wider text-emerald-600 mb-2">Avantages</p>
						<ul className="space-y-1">
							{op.avantages.map((a) => (
								<li key={a} className="flex items-start gap-2 text-sm text-gray-700">
									<Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
									{a}
								</li>
							))}
						</ul>
					</div>

					{/* Limites */}
					<div>
						<p className="text-xs font-mono uppercase tracking-wider text-amber-600 mb-2">Limites</p>
						<ul className="space-y-1">
							{op.limites.map((l) => (
								<li key={l} className="flex items-start gap-2 text-sm text-gray-700">
									<AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
									{l}
								</li>
							))}
						</ul>
					</div>

					{/* Verdict */}
					<div className={cn("rounded-xl p-4", c.bg)}>
						<p className="text-sm text-gray-800 leading-relaxed">{op.verdict}</p>
					</div>

					{/* Lien */}
					<a
						href={op.lien}
						target="_blank"
						rel="noopener noreferrer"
						className={cn("inline-flex items-center gap-2 text-sm font-medium hover:underline", c.text)}
					>
						Voir l&apos;offre <ArrowRight className="w-4 h-4" />
					</a>
				</motion.div>
			)}
		</motion.div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ComparateurFibrePage() {
	return (
		<main className="pt-32 pb-20 px-6 min-h-screen">
			<div className="max-w-5xl mx-auto">
				{/* Back */}
				<Link
					href="/outils"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-8"
				>
					<ArrowLeft className="w-4 h-4" />
					Tous les outils
				</Link>

				{/* Hero */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-16"
				>
					<h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
						Quelle fibre pro choisir<br />
						<span className="text-muted-foreground">pour votre PME ?</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
						Orange, Free, Bouygues, LINKT : on compare les offres FTTH pro pour que vous choisissiez en connaissance de cause. Prix, débits, services inclus, et surtout ce qui compte vraiment quand ça tombe en panne.
					</p>
				</motion.div>

				{/* Encart pédagogique */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 mb-12"
				>
					<h2 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Building2 className="w-5 h-5 text-indigo-600" />
						FTTH, FTTO, box pro : c&apos;est quoi la différence ?
					</h2>
					<div className="grid md:grid-cols-3 gap-6 text-sm">
						<div>
							<p className="font-semibold text-gray-900 mb-1">FTTH mutualisée</p>
							<p className="text-muted-foreground leading-relaxed">
								La fibre est partagée entre plusieurs utilisateurs. Débits annoncés = maximum théorique, pas garanti. C&apos;est ce que proposent Orange, Free et Bouygues dans leurs box pro. Parfait pour 90% des PME.
							</p>
						</div>
						<div>
							<p className="font-semibold text-gray-900 mb-1">FTTO dédiée</p>
							<p className="text-muted-foreground leading-relaxed">
								La fibre est réservée à votre entreprise. Débit garanti contractuellement, GTR 4h, SLA. Prix plus élevé (100-300 €/mois). Pour les entreprises où une coupure = perte de chiffre d&apos;affaires.
							</p>
						</div>
						<div>
							<p className="font-semibold text-gray-900 mb-1">Ce qui compte vraiment</p>
							<p className="text-muted-foreground leading-relaxed">
								Le débit, tout le monde l&apos;a. Ce qui fait la différence : le <strong className="text-gray-900">backup 4G</strong> (si la fibre tombe), la <strong className="text-gray-900">GTR</strong> (en combien de temps on vous dépanne), et l&apos;<strong className="text-gray-900">IP fixe</strong> (indispensable pour le VPN ou la vidéosurveillance).
							</p>
						</div>
					</div>
				</motion.div>

				{/* Grille opérateurs */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
					{operateurs.map((op) => (
						<OperateurCard key={op.id} op={op} />
					))}
				</div>

				{/* Recommandation */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-gray-200 rounded-2xl p-6 md:p-8 mb-12"
				>
					<h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
						Notre recommandation selon votre profil
					</h2>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
								<Zap className="w-4 h-4 text-red-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900">Vous êtes une TPE / freelance (&lt;5 postes)</p>
								<p className="text-sm text-muted-foreground">Prenez <strong className="text-red-600">Free Pro</strong>. Sans engagement, mobile inclus, backup 4G, et le prix le plus compétitif. Vous n&apos;avez pas besoin de GTR.</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
								<Shield className="w-4 h-4 text-blue-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900">Vous êtes une PME (5-50 postes) et la continuité est critique</p>
								<p className="text-sm text-muted-foreground">Prenez <strong className="text-blue-600">Bouygues Pro</strong>. GTR 8h, firewall Fortinet, backup 4G inclus. C&apos;est 10€ de plus par mois, mais c&apos;est le seul à garantir un délai de réparation.</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
								<Building2 className="w-4 h-4 text-emerald-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900">Vous avez plusieurs sites ou des besoins spécifiques</p>
								<p className="text-sm text-muted-foreground">Parlez à <strong className="text-emerald-600">LINKT</strong>. Fibre dédiée, SD-WAN, VPN inter-sites, SOC sécurité - un vrai opérateur B2B avec un interlocuteur dédié. Ce n&apos;est plus une box, c&apos;est un service.</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Disclaimer */}
				<div className="text-center text-xs text-muted-foreground/60 mb-8">
					<p>Tarifs relevés en mars 2026 sur les sites officiels des opérateurs. Prix HT, hors frais d&apos;installation.</p>
					<p>Les débits annoncés sont des maximums théoriques pour les offres FTTH mutualisées.</p>
				</div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<p className="text-lg text-muted-foreground mb-4">Besoin d&apos;aide pour choisir ?</p>
					<Link
						href="https://cyber-rgpd.com"
						className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
					>
						On vous conseille gratuitement
						<ArrowRight className="w-4 h-4" />
					</Link>
				</motion.div>
			</div>
		</main>
	);
}
