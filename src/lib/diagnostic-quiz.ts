// Diagnostic IT 360° PME - Quiz + rapport

export interface QuizQuestion {
	id: string;
	category: QuizCategory;
	question: string;
	detail?: string;
	type: "choice";
	choices: { value: string; label: string; score: number }[];
}

export type QuizCategory = "connectivite" | "securite" | "sauvegarde" | "support" | "applications";

export interface QuizAnswer {
	questionId: string;
	value: string;
	label: string;
	score: number;
}

export interface CategoryScore {
	category: QuizCategory;
	label: string;
	icon: string;
	score: number;
	maxScore: number;
	answers: QuizAnswer[];
	color: string;
}

export interface QuizResult {
	globalScore: number;
	grade: string;
	categories: CategoryScore[];
	connectionType: "adsl" | "fibre" | "unknown";
	downloadMbps: number;
	recommendations: ReportSection[];
}

export interface ReportSection {
	category: string;
	status: "good" | "warning" | "critical";
	title: string;
	finding: string;
	implication: string;
	effort: string;
	cost: string;
}

export const CATEGORY_LABELS: Record<QuizCategory, { label: string; icon: string; color: string }> = {
	connectivite: { label: "Connectivité", icon: "Wifi", color: "#6366f1" },
	securite: { label: "Sécurité", icon: "Shield", color: "#ef4444" },
	sauvegarde: { label: "Sauvegarde", icon: "HardDrive", color: "#f59e0b" },
	support: { label: "Support & maintenance", icon: "Headphones", color: "#10b981" },
	applications: { label: "Applications & infrastructure", icon: "Server", color: "#8b5cf6" },
};

export const GRADE_COLORS: Record<string, string> = {
	A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", E: "#ef4444", F: "#dc2626",
};

export const QUESTIONS: QuizQuestion[] = [
	// --- Connectivité ---
	{
		id: "fibre_interest",
		category: "connectivite",
		question: "Seriez-vous intéressé par une évolution vers la fibre optique ?",
		detail: "Nous avons détecté que votre connexion actuelle est de type ADSL.",
		type: "choice",
		choices: [
			{ value: "already_fibre", label: "Je suis déjà en fibre", score: 20 },
			{ value: "interested", label: "Oui, ça m'intéresse", score: 10 },
			{ value: "not_eligible", label: "Je ne suis pas éligible", score: 5 },
			{ value: "not_interested", label: "Non, l'ADSL me suffit", score: 5 },
		],
	},
	{
		id: "fibre_ok",
		category: "connectivite",
		question: "Êtes-vous satisfait de votre connexion internet actuelle ?",
		detail: "Votre connexion semble être en fibre optique.",
		type: "choice",
		choices: [
			{ value: "very_satisfied", label: "Très satisfait", score: 20 },
			{ value: "ok", label: "Ça va, quelques lenteurs parfois", score: 12 },
			{ value: "not_satisfied", label: "Non, c'est souvent lent ou instable", score: 5 },
		],
	},
	{
		id: "wifi_managed",
		category: "connectivite",
		question: "Qui gère votre réseau Wi-Fi et vos équipements réseau (switch, bornes Wi-Fi) ?",
		type: "choice",
		choices: [
			{ value: "prestataire", label: "Un prestataire informatique", score: 20 },
			{ value: "interne", label: "Quelqu'un en interne", score: 15 },
			{ value: "fai", label: "La box du fournisseur internet, c'est tout", score: 5 },
			{ value: "nobody", label: "Personne, ça marche tout seul", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "telephony",
		category: "connectivite",
		question: "Comment est gérée votre téléphonie ?",
		type: "choice",
		choices: [
			{ value: "voip_managed", label: "Téléphonie IP gérée par un prestataire", score: 20 },
			{ value: "teams_zoom", label: "On utilise Teams / Zoom pour tout", score: 15 },
			{ value: "box_tel", label: "Les lignes de la box internet", score: 8 },
			{ value: "mobile_only", label: "Uniquement les mobiles", score: 5 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	// --- Sécurité ---
	{
		id: "firewall",
		category: "securite",
		question: "Avez-vous un pare-feu (firewall) pour protéger votre réseau ?",
		detail: "Un pare-feu filtre les connexions entrantes et sortantes de votre réseau.",
		type: "choice",
		choices: [
			{ value: "dedicated", label: "Oui, un boîtier dédié (FortiGate, Stormshield...)", score: 20 },
			{ value: "box", label: "Celui intégré dans la box internet", score: 8 },
			{ value: "software", label: "Un logiciel sur les PC", score: 5 },
			{ value: "none", label: "Non", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "endpoint_protection",
		category: "securite",
		question: "Avez-vous une protection sur les postes de travail ?",
		detail: "Antivirus, EDR, solution de sécurité...",
		type: "choice",
		choices: [
			{ value: "edr", label: "Solution professionnelle (EDR, Sentinel, CrowdStrike...)", score: 20 },
			{ value: "antivirus", label: "Antivirus classique (Norton, Avast, Kaspersky...)", score: 12 },
			{ value: "windows_defender", label: "Windows Defender uniquement", score: 8 },
			{ value: "none", label: "Rien de particulier", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "email_security",
		category: "securite",
		question: "Avez-vous une protection sur votre messagerie professionnelle ?",
		detail: "Anti-spam, anti-phishing, filtrage des pièces jointes...",
		type: "choice",
		choices: [
			{ value: "gateway", label: "Passerelle de sécurité (Barracuda, Vade...)", score: 20 },
			{ value: "office365", label: "Protections Microsoft 365 / Google Workspace", score: 12 },
			{ value: "antispam_basic", label: "Anti-spam basique", score: 8 },
			{ value: "none", label: "Non", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "logs",
		category: "securite",
		question: "Archivez-vous les journaux (logs) de votre réseau ?",
		detail: "Les logs permettent de comprendre ce qui s'est passé en cas d'incident.",
		type: "choice",
		choices: [
			{ value: "centralized", label: "Oui, centralisés et supervisés", score: 20 },
			{ value: "local", label: "Oui, sur chaque équipement", score: 10 },
			{ value: "no", label: "Non", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	// --- Sauvegarde ---
	{
		id: "backup_exists",
		category: "sauvegarde",
		question: "Avez-vous des sauvegardes de vos données ?",
		type: "choice",
		choices: [
			{ value: "auto_tested", label: "Oui, automatiques et testées régulièrement", score: 20 },
			{ value: "auto", label: "Oui, automatiques mais jamais testées", score: 12 },
			{ value: "manual", label: "Oui, manuelles (clé USB, disque externe)", score: 5 },
			{ value: "none", label: "Non, pas de sauvegarde", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "backup_location",
		category: "sauvegarde",
		question: "Où sont stockées vos sauvegardes ?",
		type: "choice",
		choices: [
			{ value: "offsite_cloud", label: "Cloud + copie hors site", score: 20 },
			{ value: "cloud", label: "Dans le cloud uniquement", score: 15 },
			{ value: "onsite", label: "Sur place (serveur, NAS, disque externe)", score: 8 },
			{ value: "same_pc", label: "Sur le même PC / serveur", score: 2 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "backup_verify",
		category: "sauvegarde",
		question: "Qui vérifie que les sauvegardes fonctionnent ?",
		type: "choice",
		choices: [
			{ value: "prestataire", label: "Un prestataire avec rapport régulier", score: 20 },
			{ value: "interne", label: "Quelqu'un en interne, de temps en temps", score: 10 },
			{ value: "nobody", label: "Personne", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	// --- Support ---
	{
		id: "it_contact",
		category: "support",
		question: "Avez-vous quelqu'un à appeler en cas de panne informatique ?",
		type: "choice",
		choices: [
			{ value: "contract", label: "Prestataire avec contrat de maintenance", score: 20 },
			{ value: "someone", label: "Quelqu'un qu'on appelle au cas par cas", score: 10 },
			{ value: "interne", label: "On se débrouille en interne", score: 5 },
			{ value: "nobody", label: "Non, on improvise", score: 0 },
		],
	},
	{
		id: "inventory",
		category: "support",
		question: "Avez-vous un inventaire de vos équipements informatiques ?",
		detail: "PC, serveurs, imprimantes, licences logicielles...",
		type: "choice",
		choices: [
			{ value: "complete", label: "Oui, à jour et documenté", score: 20 },
			{ value: "partial", label: "Plus ou moins, pas forcément à jour", score: 10 },
			{ value: "none", label: "Non", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	// --- Applications ---
	{
		id: "servers",
		category: "applications",
		question: "Avez-vous des serveurs sur site dans vos locaux ?",
		type: "choice",
		choices: [
			{ value: "managed", label: "Oui, gérés par un prestataire", score: 18 },
			{ value: "yes_internal", label: "Oui, gérés en interne", score: 12 },
			{ value: "cloud_only", label: "Non, tout est dans le cloud", score: 20 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
	{
		id: "user_rights",
		category: "applications",
		question: "Avez-vous une politique de gestion des droits utilisateurs ?",
		detail: "Qui a accès à quoi, gestion des départs, mots de passe...",
		type: "choice",
		choices: [
			{ value: "active_directory", label: "Annuaire (Active Directory, Google Admin...)", score: 20 },
			{ value: "informal", label: "Plus ou moins, de manière informelle", score: 8 },
			{ value: "none", label: "Non, tout le monde a accès à tout", score: 0 },
			{ value: "dunno", label: "Je ne sais pas", score: 2 },
		],
	},
];

// --- Speed test ---
export async function quickSpeedTest(): Promise<{ mbps: number; type: "adsl" | "fibre" | "unknown" }> {
	try {
		const start = performance.now();
		const res = await fetch("https://speed-test.dahouse.fr/download?_=" + Date.now(), { cache: "no-store" });
		const blob = await res.blob();
		const durationMs = performance.now() - start;
		const mbps = Math.round(((blob.size * 8) / (durationMs / 1000)) / 1_000_000 * 10) / 10;
		return { mbps, type: mbps < 25 ? "adsl" : mbps > 40 ? "fibre" : "unknown" };
	} catch {
		return { mbps: 0, type: "unknown" };
	}
}

// --- Scoring ---
export function computeResult(answers: QuizAnswer[], connectionType: "adsl" | "fibre" | "unknown", downloadMbps: number): QuizResult {
	const categories: CategoryScore[] = [];

	for (const [cat, meta] of Object.entries(CATEGORY_LABELS)) {
		const catAnswers = answers.filter(a => QUESTIONS.find(q => q.id === a.questionId)?.category === cat);
		const score = catAnswers.reduce((sum, a) => sum + a.score, 0);
		const maxScore = QUESTIONS.filter(q => q.category === cat).reduce((sum, q) => sum + Math.max(...q.choices.map(c => c.score)), 0);

		categories.push({
			category: cat as QuizCategory,
			label: meta.label,
			icon: meta.icon,
			score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
			maxScore,
			answers: catAnswers,
			color: meta.color,
		});
	}

	const globalScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
	const grade = globalScore >= 80 ? "A" : globalScore >= 65 ? "B" : globalScore >= 50 ? "C" : globalScore >= 35 ? "D" : globalScore >= 20 ? "E" : "F";

	const recommendations = generateReport(answers, categories, connectionType, downloadMbps);

	return { globalScore, grade, categories, connectionType, downloadMbps, recommendations };
}

// --- Report generation ---
function generateReport(answers: QuizAnswer[], categories: CategoryScore[], connectionType: string, mbps: number): ReportSection[] {
	const sections: ReportSection[] = [];
	const answerMap = new Map(answers.map(a => [a.questionId, a]));

	// Connectivité
	if (connectionType === "adsl") {
		sections.push({
			category: "Connectivité", status: "warning", title: "Connexion ADSL détectée",
			finding: `Votre débit mesuré est d'environ ${mbps} Mbps, caractéristique d'une ligne ADSL.`,
			implication: "L'ADSL limite la visioconférence, le travail collaboratif cloud et les transferts de fichiers volumineux.",
			effort: "Vérifier l'éligibilité fibre, contacter un opérateur, planifier la migration.",
			cost: "Abonnement fibre : 30-50€/mois. Installation généralement gratuite.",
		});
	}

	const wifi = answerMap.get("wifi_managed");
	if (wifi && (wifi.value === "nobody" || wifi.value === "fai")) {
		sections.push({
			category: "Connectivité", status: "warning", title: "Réseau Wi-Fi non géré",
			finding: `Votre réseau repose sur ${wifi.value === "fai" ? "la box internet sans équipement dédié" : "aucune gestion active"}.`,
			implication: "Couverture Wi-Fi limitée, pas de segmentation réseau, performances dégradées quand le nombre d'utilisateurs augmente.",
			effort: "Audit Wi-Fi, installation de bornes professionnelles, configuration du réseau.",
			cost: "Bornes Wi-Fi pro : 300-800€/unité. Mise en place : 500-1500€.",
		});
	}

	const tel = answerMap.get("telephony");
	if (tel && (tel.value === "mobile_only" || tel.value === "dunno")) {
		sections.push({
			category: "Connectivité", status: "critical", title: "Téléphonie non structurée",
			finding: tel.value === "dunno" ? "Vous ne savez pas comment votre téléphonie est gérée." : "Vous n'utilisez que les mobiles.",
			implication: "Pas de numéro fixe professionnel, pas de standard, pas de traçabilité des appels.",
			effort: "Mise en place d'une solution de téléphonie IP (Teams Phone, 3CX, etc.).",
			cost: "Téléphonie IP : 5-15€/utilisateur/mois. Mise en place : 500-2000€.",
		});
	}

	// Sécurité
	const fw = answerMap.get("firewall");
	if (fw && (fw.value === "none" || fw.value === "dunno" || fw.value === "box")) {
		sections.push({
			category: "Sécurité", status: fw.value === "none" || fw.value === "dunno" ? "critical" : "warning",
			title: fw.value === "box" ? "Pare-feu limité (box internet)" : "Pas de pare-feu identifié",
			finding: fw.value === "box" ? "Le pare-feu de la box offre une protection minimale." : "Aucun pare-feu dédié n'a été identifié.",
			implication: "Votre réseau est exposé aux intrusions, ransomwares et accès non autorisés.",
			effort: "Installation d'un pare-feu dédié (FortiGate, Stormshield) avec configuration des règles.",
			cost: "Boîtier firewall PME : 500-2000€. Licence annuelle : 300-800€. Mise en place : 500-1500€.",
		});
	}

	const ep = answerMap.get("endpoint_protection");
	if (ep && (ep.value === "none" || ep.value === "dunno" || ep.value === "windows_defender")) {
		sections.push({
			category: "Sécurité", status: ep.value === "none" ? "critical" : "warning",
			title: "Protection des postes insuffisante",
			finding: ep.value === "windows_defender" ? "Windows Defender seul offre une protection de base." : "Aucune protection identifiée sur les postes.",
			implication: "Risque de malware, ransomware, vol de données. Un seul poste compromis peut infecter tout le réseau.",
			effort: "Déploiement d'une solution EDR/antivirus managée sur tous les postes.",
			cost: "EDR managé : 3-8€/poste/mois. Déploiement : 500-1000€.",
		});
	}

	const email = answerMap.get("email_security");
	if (email && (email.value === "none" || email.value === "dunno")) {
		sections.push({
			category: "Sécurité", status: "critical", title: "Messagerie non protégée",
			finding: "Aucune protection avancée sur votre messagerie professionnelle.",
			implication: "90% des cyberattaques commencent par un email. Sans protection, le phishing et les ransomwares passent facilement.",
			effort: "Activation d'une passerelle de sécurité email.",
			cost: "Protection email : 2-5€/boîte/mois. Mise en place : 500€.",
		});
	}

	const logs = answerMap.get("logs");
	if (logs && (logs.value === "no" || logs.value === "dunno")) {
		sections.push({
			category: "Sécurité", status: "warning", title: "Pas d'archivage des logs",
			finding: "Les journaux de votre réseau ne sont pas conservés.",
			implication: "En cas d'incident, impossible de savoir ce qui s'est passé ni quand. Obligation légale dans certains secteurs.",
			effort: "Mise en place d'une centralisation des logs (syslog, SIEM léger).",
			cost: "Solution de logs PME : 50-200€/mois. Mise en place : 500-1500€.",
		});
	}

	// Sauvegarde
	const bk = answerMap.get("backup_exists");
	if (bk && (bk.value === "none" || bk.value === "dunno")) {
		sections.push({
			category: "Sauvegarde", status: "critical", title: "Aucune sauvegarde identifiée",
			finding: bk.value === "dunno" ? "Vous ne savez pas si vos données sont sauvegardées." : "Vous n'avez pas de sauvegarde.",
			implication: "En cas de panne, ransomware ou erreur humaine, vos données sont définitivement perdues.",
			effort: "Mise en place d'une sauvegarde automatique avec copie externalisée.",
			cost: "Sauvegarde cloud PME : 30-100€/mois. Mise en place : 500-1000€.",
		});
	} else if (bk && bk.value === "manual") {
		sections.push({
			category: "Sauvegarde", status: "warning", title: "Sauvegardes manuelles",
			finding: "Vos sauvegardes dépendent d'une action humaine (clé USB, disque externe).",
			implication: "Risque d'oubli, de perte du support, de sauvegarde incomplète ou obsolète.",
			effort: "Automatiser les sauvegardes avec un logiciel dédié.",
			cost: "Solution automatisée : 30-80€/mois.",
		});
	}

	const bkloc = answerMap.get("backup_location");
	if (bkloc && (bkloc.value === "same_pc" || bkloc.value === "onsite")) {
		sections.push({
			category: "Sauvegarde", status: bkloc.value === "same_pc" ? "critical" : "warning",
			title: bkloc.value === "same_pc" ? "Sauvegarde sur le même support" : "Sauvegarde uniquement sur site",
			finding: bkloc.value === "same_pc" ? "La sauvegarde est sur le même PC/serveur que les données." : "La sauvegarde est uniquement dans vos locaux.",
			implication: bkloc.value === "same_pc" ? "Si le disque lâche ou si un ransomware chiffre la machine, la sauvegarde est perdue aussi." : "En cas d'incendie, vol ou dégât des eaux, données et sauvegardes sont perdues ensemble.",
			effort: "Externaliser une copie de sauvegarde dans le cloud ou un site distant.",
			cost: "Stockage cloud sécurisé : 20-80€/mois.",
		});
	}

	const bkv = answerMap.get("backup_verify");
	if (bkv && (bkv.value === "nobody" || bkv.value === "dunno")) {
		sections.push({
			category: "Sauvegarde", status: "warning", title: "Sauvegardes non vérifiées",
			finding: "Personne ne vérifie que les sauvegardes fonctionnent.",
			implication: "Vous pourriez découvrir le jour de la panne que la sauvegarde ne fonctionne plus depuis des mois.",
			effort: "Test de restauration trimestriel + rapport de supervision.",
			cost: "Inclus dans un contrat de maintenance (50-200€/mois).",
		});
	}

	// Support
	const it = answerMap.get("it_contact");
	if (it && (it.value === "nobody" || it.value === "interne")) {
		sections.push({
			category: "Support", status: it.value === "nobody" ? "critical" : "warning",
			title: it.value === "nobody" ? "Aucun support informatique" : "Support informatique informel",
			finding: it.value === "nobody" ? "Vous n'avez personne à appeler en cas de panne." : "Vous vous débrouillez en interne sans prestataire.",
			implication: "Temps d'arrêt prolongé en cas de panne, perte de productivité, risque d'aggraver le problème.",
			effort: "Mise en place d'un contrat de maintenance avec un prestataire local.",
			cost: "Contrat MCO PME : 100-500€/mois selon le nombre de postes.",
		});
	}

	const inv = answerMap.get("inventory");
	if (inv && (inv.value === "none" || inv.value === "dunno")) {
		sections.push({
			category: "Support", status: "warning", title: "Pas d'inventaire IT",
			finding: "Vous n'avez pas d'inventaire de vos équipements informatiques.",
			implication: "Impossible de planifier les renouvellements, gérer les licences, ou intervenir rapidement en cas de panne.",
			effort: "Réalisation d'un inventaire complet (matériel, logiciel, licences).",
			cost: "Audit inventaire : 500-1500€ (ponctuel).",
		});
	}

	// Applications
	const rights = answerMap.get("user_rights");
	if (rights && (rights.value === "none" || rights.value === "dunno")) {
		sections.push({
			category: "Applications", status: rights.value === "none" ? "critical" : "warning",
			title: "Pas de gestion des droits utilisateurs",
			finding: rights.value === "none" ? "Tout le monde a accès à tout." : "Vous ne savez pas comment les droits sont gérés.",
			implication: "Risque de fuite de données, d'erreur humaine, non-conformité RGPD. Un employé qui part garde potentiellement ses accès.",
			effort: "Mise en place d'un annuaire (Active Directory, Google Admin) et d'une politique de droits.",
			cost: "Configuration AD/Google Admin : 500-2000€. Licence incluse dans Microsoft 365.",
		});
	}

	// Si tout va bien
	if (sections.length === 0) {
		sections.push({
			category: "Général", status: "good", title: "Infrastructure bien gérée",
			finding: "Votre informatique est correctement gérée sur l'ensemble des domaines évalués.",
			implication: "Continuez à maintenir ce niveau. Pensez à réévaluer chaque année.",
			effort: "Audit annuel de maintien.",
			cost: "Audit annuel : 500-1500€.",
		});
	}

	return sections;
}

// --- Get questions for connection type ---
export function getQuestions(connectionType: "adsl" | "fibre" | "unknown"): QuizQuestion[] {
	return QUESTIONS.filter(q => {
		if (q.id === "fibre_interest" && connectionType !== "adsl") return false;
		if (q.id === "fibre_ok" && connectionType === "adsl") return false;
		return true;
	});
}
