"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	Mail,
	Search,
	Shield,
	ShieldCheck,
	ShieldAlert,
	ShieldX,
	Info,
	ChevronDown,
	ChevronUp,
	ArrowLeft,
	Loader2,
	Lock,
	MessageSquare,
	User,
	Code,
} from "lucide-react";
import {
	runFullAudit,
	extractDomain,
	type AuditResult,
	type CheckStatus,
	type CheckCategory,
} from "@/lib/dns-audit";

import { AlertTriangle, Lightbulb } from "lucide-react";

type ViewMode = "simple" | "expert";

const statusConfig: Record<
	CheckStatus,
	{
		icon: typeof ShieldCheck;
		color: string;
		bg: string;
		label: string;
		simpleLabel: string;
	}
> = {
	pass: {
		icon: ShieldCheck,
		color: "text-emerald-600",
		bg: "bg-emerald-50 border-emerald-200",
		label: "Validé",
		simpleLabel: "Tout va bien",
	},
	fail: {
		icon: ShieldX,
		color: "text-red-600",
		bg: "bg-red-50 border-red-200",
		label: "Absent",
		simpleLabel: "À corriger",
	},
	warn: {
		icon: ShieldAlert,
		color: "text-amber-600",
		bg: "bg-amber-50 border-amber-200",
		label: "Attention",
		simpleLabel: "À améliorer",
	},
	info: {
		icon: Info,
		color: "text-blue-600",
		bg: "bg-blue-50 border-blue-200",
		label: "Optionnel",
		simpleLabel: "Optionnel",
	},
};

function ModeToggle({
	mode,
	onChange,
}: {
	mode: ViewMode;
	onChange: (m: ViewMode) => void;
}) {
	return (
		<div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
			<button
				onClick={() => onChange("simple")}
				className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
					mode === "simple"
						? "bg-indigo-600 text-gray-900 shadow-lg shadow-indigo-200"
						: "text-muted-foreground hover:text-gray-900"
				}`}
			>
				<User className="w-3.5 h-3.5" />
				Utilisateur
			</button>
			<button
				onClick={() => onChange("expert")}
				className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
					mode === "expert"
						? "bg-indigo-600 text-gray-900 shadow-lg shadow-indigo-200"
						: "text-muted-foreground hover:text-gray-900"
				}`}
			>
				<Code className="w-3.5 h-3.5" />
				Expert
			</button>
		</div>
	);
}

function ScoreBadge({
	checks,
	mode,
}: {
	checks: AuditResult["checks"];
	mode: ViewMode;
}) {
	const critical = checks.filter((c) =>
		["mx", "spf", "dmarc"].includes(c.name)
	);
	const criticalFails = critical.filter((c) => c.status === "fail").length;
	const totalFails = checks.filter((c) => c.status === "fail").length;
	const totalWarns = checks.filter((c) => c.status === "warn").length;

	let label: string;
	let simpleLabel: string;
	let color: string;
	let bg: string;

	if (criticalFails > 0) {
		label = "Problèmes critiques détectés";
		simpleLabel = "Votre messagerie a des failles importantes";
		color = "text-red-600";
		bg = "bg-red-50 border-red-200";
	} else if (totalFails > 0 || totalWarns > 1) {
		label = "Améliorations recommandées";
		simpleLabel = "Quelques points à améliorer";
		color = "text-amber-600";
		bg = "bg-amber-50 border-amber-200";
	} else if (totalWarns > 0) {
		label = "Bonne configuration";
		simpleLabel = "Votre messagerie est bien protégée";
		color = "text-emerald-600";
		bg = "bg-emerald-50 border-emerald-200";
	} else {
		label = "Excellente configuration";
		simpleLabel = "Votre messagerie est parfaitement sécurisée";
		color = "text-emerald-600";
		bg = "bg-emerald-50 border-emerald-200";
	}

	return (
		<div
			className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${bg}`}
		>
			<Shield className={`w-4 h-4 ${color}`} />
			<span className={`text-sm font-semibold ${color}`}>
				{mode === "simple" ? simpleLabel : label}
			</span>
		</div>
	);
}

function CheckCard({
	check,
	mode,
}: {
	check: AuditResult["checks"][0];
	mode: ViewMode;
}) {
	const [expanded, setExpanded] = useState(false);
	const config = statusConfig[check.status];
	const Icon = config.icon;

	const label = mode === "simple" ? check.simpleLabel : check.label;
	const description =
		mode === "simple" ? check.simpleDescription : check.description;
	const recommendation =
		mode === "simple" ? check.simpleRecommendation : check.recommendation;
	const statusLabel =
		mode === "simple" ? config.simpleLabel : config.label;

	const hasDetails =
		(mode === "expert" && check.records.length > 0) || recommendation;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`rounded-xl border p-5 transition-all ${config.bg}`}
		>
			<div
				className={`flex items-start justify-between ${hasDetails ? "cursor-pointer" : ""}`}
				onClick={() => hasDetails && setExpanded(!expanded)}
			>
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.color}`} />
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h3 className="font-display font-semibold text-gray-900">
								{label}
							</h3>
							<span
								className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}
							>
								{statusLabel}
							</span>
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{description}
						</p>
					</div>
				</div>
				{hasDetails && (
					<button className="text-muted-foreground hover:text-gray-900 ml-2 shrink-0">
						{expanded ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</button>
				)}
			</div>

			<AnimatePresence>
				{expanded && hasDetails && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
							{mode === "expert" && check.records.length > 0 && (
								<div>
									<p className="text-xs font-mono text-muted-foreground mb-2">
										Records trouvés :
									</p>
									<div className="space-y-1">
										{check.records.map((r, i) => (
											<p
												key={i}
												className="text-xs font-mono text-gray-600 bg-gray-100 rounded px-3 py-1.5 break-all"
											>
												{r}
											</p>
										))}
									</div>
								</div>
							)}
							{recommendation && (
								<div className="flex items-start gap-2 text-sm">
									<span className="text-amber-600 shrink-0">→</span>
									<p className="text-gray-700">{recommendation}</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

export default function AuditEmailPage() {
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AuditResult | null>(null);
	const [error, setError] = useState("");
	const [mode, setMode] = useState<ViewMode>("simple");
	const [wantReport, setWantReport] = useState(false);
	const [wantContact, setWantContact] = useState(false);
	const [optinSending, setOptinSending] = useState(false);
	const [optinSent, setOptinSent] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setResult(null);

		const domain = extractDomain(input);
		if (!domain || !domain.includes(".")) {
			setError("Entrez une adresse email ou un nom de domaine valide.");
			return;
		}

		setLoading(true);
		try {
			const audit = await runFullAudit(domain);
			setResult(audit);
		} catch {
			setError(
				"Erreur lors de l'analyse. Vérifiez le domaine et réessayez."
			);
		} finally {
			setLoading(false);
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
					Tous les outils
				</Link>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-10"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
						<Mail className="w-4 h-4 text-indigo-600" />
						<span className="text-sm font-mono text-indigo-600">
							audit email
						</span>
					</div>
					<h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
						Audit de configuration email
					</h1>
					<p className="text-muted-foreground">
						Vérifiez en un clic si vos emails arrivent bien à
						destination et si votre domaine est protégé contre le spam
						et l&apos;usurpation d&apos;identité.
					</p>
				</motion.div>

				{/* Mode toggle + Form */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.6 }}
					className="space-y-4 mb-6"
				>
					<div className="flex justify-center">
						<ModeToggle mode={mode} onChange={setMode} />
					</div>

					<form onSubmit={handleSubmit}>
						<div className="flex gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="contact@example.com ou example.com"
									className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
									disabled={loading}
								/>
							</div>
							<button
								type="submit"
								disabled={loading || !input.trim()}
								className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Analyse...
									</>
								) : (
									"Analyser"
								)}
							</button>
						</div>
						{error && (
							<p className="text-red-600 text-sm mt-2">{error}</p>
						)}
					</form>
				</motion.div>

				{/* Privacy notice - golden slow pulse */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="flex items-center justify-center gap-2 mb-10"
				>
					<motion.div
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
					>
						<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-sm text-emerald-600 font-medium">
							Cet outil fonctionne entièrement dans votre navigateur.
							Aucun log n&apos;est collecté, aucune adresse email
							n&apos;est conservée.
						</span>
					</motion.div>
				</motion.div>

				{/* Results */}
				<AnimatePresence mode="wait">
					{loading && (
						<motion.div
							key="loading"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="text-center py-16"
						>
							<Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
							<p className="text-muted-foreground">
								{mode === "simple"
									? "Vérification de votre messagerie en cours..."
									: "Interrogation des serveurs DNS..."}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{mode === "simple"
									? "On vérifie que vos emails sont bien protégés."
									: "Vérification de 20+ sélecteurs DKIM, records MX, SPF, DMARC, PTR..."}
							</p>
						</motion.div>
					)}

					{result && !loading && (
						<motion.div
							key="results"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							{/* Summary */}
							<div className="flex items-center justify-between mb-6 flex-wrap gap-3">
								<div>
									<h2 className="text-xl font-display font-bold">
										{mode === "simple"
											? "Résultats pour "
											: "Résultats pour "}
										<span className="text-indigo-600">
											{result.domain}
										</span>
									</h2>
									<p className="text-xs text-muted-foreground mt-1">
										Analysé le{" "}
										{new Date(
											result.timestamp
										).toLocaleString("fr-FR")}
									</p>
								</div>
								<ScoreBadge checks={result.checks} mode={mode} />
							</div>

							{/* Critical checks */}
							<div className="mb-8">
								<div className="flex items-center gap-2 mb-4">
									<AlertTriangle className="w-4 h-4 text-red-600" />
									<h3 className="font-display font-semibold text-gray-900">
										{mode === "simple"
											? "Vérifications essentielles"
											: "Checks critiques"}
									</h3>
									<span className="text-xs px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600">
										{mode === "simple" ? "Important" : "Critique"}
									</span>
								</div>
								<div className="space-y-3">
									{result.checks
										.filter((c) => c.category === "critical")
										.map((check, i) => (
											<motion.div
												key={check.name}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.05 }}
											>
												<CheckCard check={check} mode={mode} />
											</motion.div>
										))}
								</div>
							</div>

							{/* Recommended checks */}
							<div className="mb-12">
								<div className="flex items-center gap-2 mb-4">
									<Lightbulb className="w-4 h-4 text-blue-600" />
									<h3 className="font-display font-semibold text-gray-900">
										{mode === "simple"
											? "Améliorations possibles"
											: "Checks recommandés"}
									</h3>
									<span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
										{mode === "simple" ? "Optionnel" : "Recommandé"}
									</span>
								</div>
								<div className="space-y-3">
									{result.checks
										.filter((c) => c.category === "recommended")
										.map((check, i) => (
											<motion.div
												key={check.name}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.25 + i * 0.05 }}
											>
												<CheckCard check={check} mode={mode} />
											</motion.div>
										))}
								</div>
							</div>

							{/* Opt-in checkboxes */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4 mb-6"
							>
								<label className="flex items-start gap-3 cursor-pointer group">
									<input
										type="checkbox"
										checked={wantReport}
										onChange={(e) => setWantReport(e.target.checked)}
										className="mt-1 w-4 h-4 rounded border-gray-200 bg-gray-100 accent-indigo-600 shrink-0"
									/>
									<div>
										<span className="text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
											Recevoir ce rapport par email
										</span>
										<p className="text-xs text-muted-foreground mt-0.5">
											Le rapport sera envoyé à l&apos;adresse saisie ci-dessus.
										</p>
									</div>
								</label>

								<label className="flex items-start gap-3 cursor-pointer group">
									<input
										type="checkbox"
										checked={wantContact}
										onChange={(e) => setWantContact(e.target.checked)}
										className="mt-1 w-4 h-4 rounded border-gray-200 bg-gray-100 accent-indigo-600 shrink-0"
									/>
									<div>
										<span className="text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
											Je souhaite être recontacté(e) pour du support
										</span>
										<AnimatePresence>
											{wantContact && (
												<motion.p
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: [0.5, 1, 0.5], height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													transition={{ opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
													className="text-xs text-emerald-600 mt-1.5 leading-relaxed"
												>
													Votre adresse email est uniquement utilisée pour
													les échanges électroniques liés à cette demande.
													Elle n&apos;est pas utilisée à des fins de
													prospection commerciale, cession à des tiers, ni
													aucune autre utilisation.
												</motion.p>
											)}
										</AnimatePresence>
									</div>
								</label>

								{(wantReport || wantContact) && (
									<motion.div
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className="pt-2"
									>
										<button
											disabled={optinSending || optinSent || !input.includes("@")}
											onClick={async () => {
												setOptinSending(true);
												try {
													await fetch("/api/audit-report", {
														method: "POST",
														headers: { "Content-Type": "application/json" },
														body: JSON.stringify({
															email: input.trim(),
															domain: result?.domain || "",
															wantReport,
															wantContact,
															checks: result?.checks.map((c) => ({
																status: c.status,
																label: c.label,
																description: c.description,
															})) || [],
														}),
													});
													setOptinSent(true);
													// Google Ads conversion tracking
													if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
														(window as any).gtag("event", "conversion", {
															send_to: "AW-17887383937/Wq3UCN6i9OwbEIGjr9FC",
															value: 1.0,
															currency: "EUR",
														});
													}
												} catch {
													// silent
												} finally {
													setOptinSending(false);
												}
											}}
											className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
												optinSent
													? "bg-emerald-600/20 border border-emerald-200 text-emerald-600"
													: "bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99]"
											}`}
										>
											{optinSent ? (
												<>
													<ShieldCheck className="w-4 h-4" />
													Envoyé
												</>
											) : optinSending ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													Envoi...
												</>
											) : !input.includes("@") ? (
												"Saisissez une adresse email pour envoyer"
											) : (
												"Envoyer"
											)}
										</button>
									</motion.div>
								)}
							</motion.div>

							{/* Contact CTA */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center"
							>
								<MessageSquare className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
								<h3 className="font-display font-semibold text-lg mb-2">
									{mode === "simple"
										? "Besoin d'aide ?"
										: "Besoin d'aide pour corriger ces points ?"}
								</h3>
								<p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
									{mode === "simple"
										? "Notre équipe peut sécuriser votre messagerie professionnelle et s'assurer que vos emails arrivent bien à destination."
										: "Notre équipe peut configurer et sécuriser votre messagerie professionnelle : SPF, DKIM, DMARC, délivrabilité."}
								</p>
								<motion.div
									animate={{ opacity: [0.7, 1, 0.7] }}
									transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
								>
									<Link
										href="https://cyber-rgpd.com"
										className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-display font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
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
