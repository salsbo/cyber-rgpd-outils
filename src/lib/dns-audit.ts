const DOH_URL = "https://cloudflare-dns.com/dns-query";

export type CheckStatus = "pass" | "fail" | "warn" | "info";
export type CheckCategory = "critical" | "recommended";

export interface CheckResult {
	name: string;
	label: string;
	simpleLabel: string;
	category: CheckCategory;
	status: CheckStatus;
	description: string;
	simpleDescription: string;
	records: string[];
	recommendation: string;
	simpleRecommendation: string;
}

export interface AuditResult {
	domain: string;
	checks: CheckResult[];
	timestamp: number;
}

interface DnsAnswer {
	name: string;
	type: number;
	TTL: number;
	data: string;
}

interface DnsResponse {
	Status: number;
	Answer?: DnsAnswer[];
}

async function queryDNS(name: string, type: string): Promise<DnsResponse> {
	const res = await fetch(
		`${DOH_URL}?name=${encodeURIComponent(name)}&type=${type}`,
		{ headers: { Accept: "application/dns-json" } }
	);
	if (!res.ok) throw new Error(`DNS query failed: ${res.status}`);
	return res.json();
}

export function extractDomain(input: string): string {
	const trimmed = input.trim().toLowerCase();
	if (trimmed.includes("@")) return trimmed.split("@")[1];
	return trimmed.replace(/^https?:\/\//, "").split("/")[0];
}

// ============================================================
// CRITICAL CHECKS
// ============================================================

// --- MX ---
async function checkMX(
	domain: string
): Promise<{ result: CheckResult; hosts: string[] }> {
	const data = await queryDNS(domain, "MX");
	const answers = (data.Answer || []).filter((r) => r.type === 15);

	if (answers.length === 0) {
		return {
			result: {
				name: "mx",
				label: "Records MX",
				simpleLabel: "Réception d'emails",
				category: "critical",
				status: "fail",
				description: "Aucun serveur mail configuré.",
				simpleDescription:
					"Votre domaine ne peut pas recevoir d'emails. C'est comme avoir une adresse postale sans boîte aux lettres.",
				records: [],
				recommendation:
					"Ajoutez des records MX pour recevoir des emails sur ce domaine.",
				simpleRecommendation:
					"Contactez votre hébergeur ou fournisseur email pour activer la réception d'emails.",
			},
			hosts: [],
		};
	}

	const parsed = answers
		.map((r) => {
			const parts = r.data.split(" ");
			return {
				priority: parseInt(parts[0]),
				server: parts[1]?.replace(/\.$/, "") || "",
			};
		})
		.sort((a, b) => a.priority - b.priority);

	let provider = "";
	let providerSimple = "";
	const first = parsed[0].server.toLowerCase();
	if (first.includes("google") || first.includes("gmail")) {
		provider = " (Google Workspace)";
		providerSimple = " via Google";
	} else if (first.includes("outlook") || first.includes("microsoft")) {
		provider = " (Microsoft 365)";
		providerSimple = " via Microsoft";
	} else if (first.includes("protonmail") || first.includes("proton")) {
		provider = " (Proton Mail)";
		providerSimple = " via Proton Mail";
	} else if (first.includes("ovh")) {
		provider = " (OVH)";
		providerSimple = " via OVH";
	} else if (first.includes("gandi")) {
		provider = " (Gandi)";
		providerSimple = " via Gandi";
	} else if (first.includes("zoho")) {
		provider = " (Zoho)";
		providerSimple = " via Zoho";
	}

	return {
		result: {
			name: "mx",
			label: "Records MX",
			simpleLabel: "Réception d'emails",
			category: "critical",
			status: "pass",
			description: `${parsed.length} serveur(s) mail configuré(s)${provider}.`,
			simpleDescription: `Votre domaine est bien configuré pour recevoir des emails${providerSimple}. Les messages arrivent correctement.`,
			records: parsed.map(
				(r) => `Priorité ${r.priority} → ${r.server}`
			),
			recommendation: "",
			simpleRecommendation: "",
		},
		hosts: parsed.map((r) => r.server),
	};
}

// --- SPF ---
async function checkSPF(domain: string): Promise<CheckResult> {
	const data = await queryDNS(domain, "TXT");
	const txtRecords = (data.Answer || [])
		.filter((r) => r.type === 16)
		.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

	const spfRecords = txtRecords.filter((r) => r.startsWith("v=spf1"));

	if (spfRecords.length === 0) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "fail",
			description: "Aucun record SPF trouvé.",
			simpleDescription:
				"N'importe qui peut envoyer un email en se faisant passer pour vous. C'est comme si quelqu'un pouvait mettre votre nom sur n'importe quelle enveloppe.",
			records: [],
			recommendation:
				"Ajoutez un record TXT avec v=spf1 pour empêcher l'usurpation de votre domaine.",
			simpleRecommendation:
				"Demandez à votre prestataire informatique d'ajouter une protection SPF. C'est une des bases de la sécurité email.",
		};
	}

	if (spfRecords.length > 1) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "fail",
			description:
				"Plusieurs records SPF détectés (invalide selon RFC 7208).",
			simpleDescription:
				"Votre protection anti-usurpation est cassée car il y a des réglages en double qui se contredisent.",
			records: spfRecords,
			recommendation:
				"Fusionnez vos records SPF en un seul. Plusieurs records SPF invalident la vérification.",
			simpleRecommendation:
				"Contactez votre prestataire pour fusionner ces réglages en un seul.",
		};
	}

	const spf = spfRecords[0];
	const records = [spf];

	if (spf.includes("+all")) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "fail",
			description:
				"SPF avec +all : tout le monde peut envoyer au nom de votre domaine.",
			simpleDescription:
				"Votre configuration autorise tout le monde à envoyer des emails en votre nom. C'est très dangereux.",
			records,
			recommendation:
				"Remplacez +all par -all ou ~all pour restreindre les expéditeurs autorisés.",
			simpleRecommendation:
				"Contactez immédiatement votre prestataire pour corriger cette faille.",
		};
	}

	if (spf.includes("~all")) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "warn",
			description: "SPF configuré en mode softfail (~all).",
			simpleDescription:
				"Vos serveurs autorisés sont bien listés, mais les imposteurs ne sont pas totalement bloqués - juste signalés comme suspects.",
			records,
			recommendation:
				"Passez de ~all à -all (hardfail) pour une protection maximale, une fois le DMARC en place.",
			simpleRecommendation:
				"Demandez à votre prestataire de passer en mode strict pour bloquer les imposteurs au lieu de les signaler.",
		};
	}

	if (spf.includes("-all")) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "pass",
			description:
				"SPF configuré correctement avec politique stricte (-all).",
			simpleDescription:
				"Seuls vos serveurs autorisés peuvent envoyer des emails en votre nom. Les imposteurs sont bloqués.",
			records,
			recommendation: "",
			simpleRecommendation: "",
		};
	}

	if (spf.includes("?all")) {
		return {
			name: "spf",
			label: "SPF",
			simpleLabel: "Anti-usurpation",
			category: "critical",
			status: "warn",
			description:
				"SPF configuré en mode neutre (?all) - aucune protection.",
			simpleDescription:
				"La protection anti-usurpation est présente mais désactivée. C'est comme avoir un antivol sans le brancher.",
			records,
			recommendation:
				"Remplacez ?all par -all pour protéger votre domaine.",
			simpleRecommendation:
				"Demandez à votre prestataire d'activer réellement la protection.",
		};
	}

	return {
		name: "spf",
		label: "SPF",
		simpleLabel: "Anti-usurpation",
		category: "critical",
		status: "pass",
		description: "SPF configuré.",
		simpleDescription:
			"Une protection anti-usurpation est en place sur votre domaine.",
		records,
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- DMARC ---
async function checkDMARC(domain: string): Promise<CheckResult> {
	const data = await queryDNS(`_dmarc.${domain}`, "TXT");
	const answers = (data.Answer || [])
		.filter((r) => r.type === 16)
		.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

	const dmarc = answers.find((r) => r.startsWith("v=DMARC1"));

	if (!dmarc) {
		return {
			name: "dmarc",
			label: "DMARC",
			simpleLabel: "Anti-phishing",
			category: "critical",
			status: "fail",
			description: "Aucun record DMARC trouvé.",
			simpleDescription:
				"Aucune consigne pour les faux emails. Les boîtes mail de vos destinataires ne savent pas s'il faut les bloquer ou les accepter.",
			records: [],
			recommendation:
				"Ajoutez un record TXT _dmarc.domain avec v=DMARC1 pour protéger contre le phishing.",
			simpleRecommendation:
				"Demandez à votre prestataire de mettre en place cette protection. C'est indispensable aujourd'hui.",
		};
	}

	const records = [dmarc];
	const policyMatch = dmarc.match(/;\s*p=(\w+)/);
	const policy = policyMatch ? policyMatch[1].toLowerCase() : "none";
	const hasRua = dmarc.includes("rua=");
	const hasRuf = dmarc.includes("ruf=");

	let reportNote = "";
	if (!hasRua && !hasRuf) {
		reportNote = " Aucune adresse de rapport configurée.";
	} else if (hasRua && !hasRuf) {
		reportNote = " Rapports agrégés (rua) activés.";
	} else if (hasRua && hasRuf) {
		reportNote =
			" Rapports agrégés (rua) et forensiques (ruf) activés.";
	}

	if (policy === "none") {
		return {
			name: "dmarc",
			label: "DMARC",
			simpleLabel: "Anti-phishing",
			category: "critical",
			status: "warn",
			description: `DMARC en mode observation (p=none).${reportNote}`,
			simpleDescription:
				"Vous surveillez les faux emails mais ne les bloquez pas encore. C'est comme avoir une caméra de surveillance sans alarme.",
			records,
			recommendation:
				"Passez progressivement à p=quarantine puis p=reject après analyse des rapports.",
			simpleRecommendation:
				"Une fois que tout fonctionne, demandez à votre prestataire d'activer le blocage automatique des faux emails.",
		};
	}

	if (policy === "quarantine") {
		return {
			name: "dmarc",
			label: "DMARC",
			simpleLabel: "Anti-phishing",
			category: "critical",
			status: "pass",
			description: `DMARC en quarantaine (p=quarantine).${reportNote}`,
			simpleDescription:
				"Les faux emails envoyés en votre nom sont mis en spam chez vos destinataires. Bonne protection.",
			records,
			recommendation:
				"Bon niveau de protection. Envisagez p=reject pour un maximum de sécurité.",
			simpleRecommendation:
				"Pour aller plus loin, votre prestataire peut passer au rejet total des faux emails.",
		};
	}

	if (policy === "reject") {
		return {
			name: "dmarc",
			label: "DMARC",
			simpleLabel: "Anti-phishing",
			category: "critical",
			status: "pass",
			description: `DMARC en rejet strict (p=reject).${reportNote}`,
			simpleDescription:
				"Les faux emails envoyés en votre nom sont automatiquement rejetés. Protection maximale.",
			records,
			recommendation: "",
			simpleRecommendation: "",
		};
	}

	return {
		name: "dmarc",
		label: "DMARC",
		simpleLabel: "Anti-phishing",
		category: "critical",
		status: "info",
		description: `DMARC configuré (p=${policy}).${reportNote}`,
		simpleDescription:
			"Une politique anti-phishing est en place sur votre domaine.",
		records,
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- DKIM ---

// Try to query a DKIM selector - returns the record if found
async function probeDKIM(
	selector: string,
	domain: string
): Promise<{ selector: string; record: string } | null> {
	try {
		const data = await queryDNS(
			`${selector}._domainkey.${domain}`,
			"TXT"
		);
		const answers = (data.Answer || [])
			.filter((r) => r.type === 16 || r.type === 5)
			.map((r) =>
				r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, "")
			);
		const dkim = answers.find(
			(r) => r.includes("v=DKIM1") || r.includes("p=")
		);
		if (dkim) {
			return {
				selector,
				record:
					dkim.substring(0, 80) +
					(dkim.length > 80 ? "..." : ""),
			};
		}
		// Check if there's a CNAME pointing to a provider (counts as configured)
		const cname = answers.find(
			(r) =>
				r.includes("._domainkey.") &&
				!r.includes("v=DKIM1")
		);
		if (cname) {
			return {
				selector,
				record: `CNAME → ${cname.substring(0, 80)}${cname.length > 80 ? "..." : ""}`,
			};
		}
	} catch {
		// ignore
	}
	return null;
}

// Discover OVH DKIM selectors by probing CNAME records
// OVH uses: ovhmo{accountID}-selector{1,2}._domainkey.{domain}
// The accountID can sometimes be extracted from CNAME targets
async function discoverOVHSelectors(
	domain: string
): Promise<{ selector: string; record: string }[]> {
	const found: { selector: string; record: string }[] = [];

	// Try to discover OVH DKIM via CNAME on common patterns
	// Some OVH setups use just "ovhmo-selector1" without account ID
	const ovhPrefixes = ["ovhmo", "ovhex"];
	const ovhSuffixes = ["-selector1", "-selector2"];

	for (const prefix of ovhPrefixes) {
		for (const suffix of ovhSuffixes) {
			const sel = `${prefix}${suffix}`;
			const result = await probeDKIM(sel, domain);
			if (result) found.push(result);
		}
	}

	if (found.length > 0) return found;

	// Try to find OVH account ID by querying for CNAME records
	// that might exist with numeric IDs (try a CNAME lookup approach)
	for (const prefix of ovhPrefixes) {
		try {
			// Query for the prefix alone - some configs use just "ovhmo" or "ovhex"
			const result = await probeDKIM(prefix, domain);
			if (result) {
				found.push(result);
				continue;
			}

			// Try to discover via CNAME at a known entry point
			const data = await queryDNS(
				`${prefix}-selector1._domainkey.${domain}`,
				"CNAME"
			);
			const cnames = (data.Answer || [])
				.filter((r: DnsAnswer) => r.type === 5)
				.map((r: DnsAnswer) => r.data.replace(/\.$/, ""));

			if (cnames.length > 0) {
				// Extract account ID from CNAME target: ovhmo{ID}-selector1._domainkey.{ID}.mx.ovh.net
				const match = cnames[0].match(
					/(ovh(?:mo|ex)\d+)-selector/
				);
				if (match) {
					const accountPrefix = match[1]; // e.g. "ovhmo1145110"
					for (const suffix of ovhSuffixes) {
						const sel = `${accountPrefix}${suffix}`;
						const result = await probeDKIM(sel, domain);
						if (result) found.push(result);
					}
				}
			}
		} catch {
			// ignore
		}
	}

	return found;
}

// Discover Proofpoint DKIM selectors from MX hostname
// Proofpoint MX: {customer}.pphosted.com → selector s1024-{customer}
function extractProofpointSelectors(mxHosts: string[]): string[] {
	const selectors: string[] = [];
	for (const host of mxHosts) {
		const match = host.toLowerCase().match(/^([^.]+)\.pphosted\.com$/);
		if (match) {
			selectors.push(`s1024-${match[1]}`);
			selectors.push(`s2048-${match[1]}`);
		}
	}
	return selectors;
}

async function checkDKIM(
	domain: string,
	mxHosts: string[]
): Promise<CheckResult> {
	// Standard selectors covering major providers
	const selectors = [
		// Generic / common
		"default",
		"dkim",
		"mail",
		"smtp",
		"email",
		// Microsoft 365
		"selector1",
		"selector2",
		// Google Workspace
		"google",
		// Proton Mail
		"protonmail",
		"protonmail2",
		"protonmail3",
		// Mailchimp / Mandrill
		"k1",
		"k2",
		"k3",
		"mandrill",
		// SendGrid
		"sendgrid",
		"s1",
		"s2",
		// Amazon SES
		"amazonses",
		// Mimecast
		"mimecast",
		"mimecast20200116",
		// Brevo (ex-Sendinblue)
		"brevo",
		"sendinblue",
		"mail._domainkey" /* some Brevo setups */,
		// Postmark
		"postmark",
		"pm",
		// Campaign Monitor
		"cm",
		// Mailgun
		"mg",
		"mailo",
		// Resend
		"resend",
		// Zoho
		"zoho",
		"zmail",
		// Fastmail
		"fm1",
		"fm2",
		"fm3",
		// IONOS / 1&1
		"s1-ionos",
		"s2-ionos",
	];

	const mxLower = mxHosts.join(" ").toLowerCase();
	const isOVH = mxLower.includes("ovh");
	const isProofpoint = mxLower.includes("pphosted");

	// Add Gandi selectors if Gandi MX detected
	if (mxLower.includes("gandi")) selectors.push("gm1", "gm2", "gm3");

	// Add Proofpoint dynamic selectors extracted from MX hostname
	if (isProofpoint) {
		selectors.push(...extractProofpointSelectors(mxHosts));
	}

	const found: { selector: string; record: string }[] = [];

	// Probe all standard selectors in parallel
	const checks = selectors.map(async (sel) => {
		const result = await probeDKIM(sel, domain);
		if (result) found.push(result);
	});

	await Promise.all(checks);

	// If OVH detected and nothing found yet, try OVH-specific discovery
	if (isOVH && found.length === 0) {
		const ovhResults = await discoverOVHSelectors(domain);
		found.push(...ovhResults);
	}

	if (found.length === 0) {
		// Adapt message based on provider
		let extraNote = "";
		let extraSimpleNote = "";
		if (isOVH) {
			extraNote =
				" OVH utilise des sélecteurs avec un identifiant de compte unique - vérifiez dans votre espace client OVH (Emails > Domaine > DKIM).";
			extraSimpleNote =
				" Si vous êtes chez OVH, la signature existe peut-être mais utilise un identifiant propre à votre compte. Vérifiez dans votre espace client OVH.";
		} else if (isProofpoint) {
			extraNote =
				" Proofpoint utilise des sélecteurs dynamiques - vérifiez dans votre console Proofpoint.";
			extraSimpleNote =
				" Si vous utilisez Proofpoint, la signature utilise un identifiant propre à votre compte.";
		}

		return {
			name: "dkim",
			label: "DKIM",
			simpleLabel: "Signature des emails",
			category: "critical",
			status: "warn",
			description: `Aucun sélecteur DKIM courant détecté (${selectors.length} testés).${extraNote}`,
			simpleDescription: `Vos emails ne portent pas de signature numérique détectable. C'est comme envoyer une lettre officielle sans cachet - le destinataire ne peut pas prouver que c'est vous.${extraSimpleNote}`,
			records: [],
			recommendation: `Activez DKIM chez votre fournisseur email.${extraNote}`,
			simpleRecommendation: `Demandez à votre fournisseur email d'activer la signature de vos emails.${extraSimpleNote}`,
		};
	}

	return {
		name: "dkim",
		label: "DKIM",
		simpleLabel: "Signature des emails",
		category: "critical",
		status: "pass",
		description: `${found.length} sélecteur(s) DKIM trouvé(s).`,
		simpleDescription:
			"Vos emails portent une signature numérique unique. Les destinataires peuvent vérifier qu'ils viennent bien de vous, comme un cachet officiel.",
		records: found.map(
			(f) => `${f.selector}._domainkey → ${f.record}`
		),
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- Spoofing Vulnerability (composite) ---
function checkSpoofing(
	spf: CheckResult,
	dmarc: CheckResult,
	dkim: CheckResult
): CheckResult {
	const spfOk = spf.status === "pass";
	const spfWarn = spf.status === "warn";
	const dmarcOk = dmarc.status === "pass";
	const dmarcWarn = dmarc.status === "warn";
	const dkimOk = dkim.status === "pass";

	// Worst case: no SPF and no DMARC
	if (spf.status === "fail" && dmarc.status === "fail") {
		return {
			name: "spoofing",
			label: "Test de spoofing",
			simpleLabel: "Usurpation d'identité",
			category: "critical",
			status: "fail",
			description:
				"Domaine hautement vulnérable au spoofing : ni SPF ni DMARC configurés.",
			simpleDescription:
				"N'importe qui peut envoyer un email en se faisant passer pour vous, et personne ne le bloquera. Votre domaine est une cible facile pour les escrocs.",
			records: [
				"SPF : absent",
				"DMARC : absent",
				`DKIM : ${dkimOk ? "présent" : "absent"}`,
			],
			recommendation:
				"Configurez en urgence SPF puis DMARC (p=quarantine minimum) pour empêcher l'usurpation de votre domaine.",
			simpleRecommendation:
				"C'est urgent. Demandez immédiatement à votre prestataire de protéger votre domaine contre l'usurpation.",
		};
	}

	// SPF present but no DMARC
	if (dmarc.status === "fail") {
		return {
			name: "spoofing",
			label: "Test de spoofing",
			simpleLabel: "Usurpation d'identité",
			category: "critical",
			status: "warn",
			description:
				"Spoofing partiellement possible : SPF présent mais DMARC absent - pas de politique d'application.",
			simpleDescription:
				"Votre domaine a un début de protection, mais sans politique DMARC, les faux emails ne sont pas bloqués automatiquement.",
			records: [
				`SPF : ${spfOk ? "strict" : "partiel"}`,
				"DMARC : absent",
				`DKIM : ${dkimOk ? "présent" : "absent"}`,
			],
			recommendation:
				"Ajoutez un record DMARC pour compléter la chaîne d'authentification SPF/DKIM/DMARC.",
			simpleRecommendation:
				"Demandez à votre prestataire d'ajouter la brique DMARC manquante pour que la protection soit complète.",
		};
	}

	// DMARC p=none (monitoring only)
	if (dmarcWarn) {
		return {
			name: "spoofing",
			label: "Test de spoofing",
			simpleLabel: "Usurpation d'identité",
			category: "critical",
			status: "warn",
			description:
				"Spoofing détecté mais non bloqué : DMARC en mode observation (p=none).",
			simpleDescription:
				"Les tentatives d'usurpation sont surveillées mais pas bloquées. C'est un bon début, mais les escrocs peuvent encore passer.",
			records: [
				`SPF : ${spfOk ? "strict" : spfWarn ? "partiel" : "absent"}`,
				"DMARC : observation seule (p=none)",
				`DKIM : ${dkimOk ? "présent" : "absent"}`,
			],
			recommendation:
				"Passez DMARC à p=quarantine ou p=reject après analyse des rapports rua.",
			simpleRecommendation:
				"Demandez à votre prestataire d'activer le blocage des faux emails, pas juste la surveillance.",
		};
	}

	// Full protection
	if (dmarcOk && (spfOk || spfWarn) && dkimOk) {
		return {
			name: "spoofing",
			label: "Test de spoofing",
			simpleLabel: "Usurpation d'identité",
			category: "critical",
			status: "pass",
			description:
				"Protection anti-spoofing complète : SPF + DKIM + DMARC alignés avec politique d'application.",
			simpleDescription:
				"Votre domaine est bien protégé. Les tentatives d'usurpation sont détectées et bloquées automatiquement.",
			records: [
				`SPF : ${spfOk ? "strict (-all)" : "partiel (~all)"}`,
				"DMARC : actif avec blocage",
				"DKIM : présent et signé",
			],
			recommendation: "",
			simpleRecommendation: "",
		};
	}

	// DMARC OK but missing DKIM
	if (dmarcOk && !dkimOk) {
		return {
			name: "spoofing",
			label: "Test de spoofing",
			simpleLabel: "Usurpation d'identité",
			category: "critical",
			status: "warn",
			description:
				"Protection partielle : DMARC actif mais DKIM absent - l'authentification repose uniquement sur SPF.",
			simpleDescription:
				"La protection fonctionne mais n'est pas complète. Sans signature DKIM, elle est plus fragile.",
			records: [
				`SPF : ${spfOk ? "strict" : spfWarn ? "partiel" : "absent"}`,
				"DMARC : actif",
				"DKIM : absent",
			],
			recommendation:
				"Activez DKIM pour renforcer l'alignement DMARC et améliorer la délivrabilité.",
			simpleRecommendation:
				"Demandez à votre fournisseur email d'activer la signature DKIM pour compléter la protection.",
		};
	}

	// Fallback
	return {
		name: "spoofing",
		label: "Test de spoofing",
		simpleLabel: "Usurpation d'identité",
		category: "critical",
		status: "warn",
		description: "Protection anti-spoofing incomplète.",
		simpleDescription:
			"Votre domaine a une protection partielle contre l'usurpation. Des améliorations sont possibles.",
		records: [
			`SPF : ${spfOk ? "OK" : spfWarn ? "partiel" : "absent"}`,
			`DMARC : ${dmarcOk ? "OK" : dmarcWarn ? "observation" : "absent"}`,
			`DKIM : ${dkimOk ? "OK" : "absent"}`,
		],
		recommendation:
			"Complétez la chaîne SPF + DKIM + DMARC (p=quarantine/reject) pour une protection totale.",
		simpleRecommendation:
			"Demandez à votre prestataire de compléter la protection de votre domaine.",
	};
}

// ============================================================
// RECOMMENDED CHECKS
// ============================================================

// --- Reverse DNS (PTR) ---
async function checkPTR(mxHosts: string[]): Promise<CheckResult> {
	if (mxHosts.length === 0) {
		return {
			name: "ptr",
			label: "DNS inverse (PTR)",
			simpleLabel: "Identité des serveurs",
			category: "recommended",
			status: "info",
			description: "Aucun serveur MX à vérifier.",
			simpleDescription: "Pas de serveur mail à vérifier.",
			records: [],
			recommendation: "",
			simpleRecommendation: "",
		};
	}

	const results: { host: string; ip: string; ptr: string }[] = [];

	for (const host of mxHosts.slice(0, 3)) {
		try {
			const aData = await queryDNS(host, "A");
			const ips = (aData.Answer || [])
				.filter((r: DnsAnswer) => r.type === 1)
				.map((r: DnsAnswer) => r.data);

			for (const ip of ips.slice(0, 2)) {
				const reversed =
					ip.split(".").reverse().join(".") + ".in-addr.arpa";
				const ptrData = await queryDNS(reversed, "PTR");
				const ptrs = (ptrData.Answer || [])
					.filter((r: DnsAnswer) => r.type === 12)
					.map((r: DnsAnswer) => r.data.replace(/\.$/, ""));

				results.push({
					host,
					ip,
					ptr: ptrs.length > 0 ? ptrs[0] : "(aucun)",
				});
			}
		} catch {
			results.push({ host, ip: "?", ptr: "(erreur)" });
		}
	}

	const hasMissing = results.some(
		(r) => r.ptr === "(aucun)" || r.ptr === "(erreur)"
	);
	const records = results.map(
		(r) => `${r.host} → ${r.ip} → PTR: ${r.ptr}`
	);

	if (hasMissing) {
		return {
			name: "ptr",
			label: "DNS inverse (PTR)",
			simpleLabel: "Identité des serveurs",
			category: "recommended",
			status: "warn",
			description:
				"Certains serveurs mail n'ont pas de DNS inverse.",
			simpleDescription:
				"Certains de vos serveurs mail ne sont pas clairement identifiés, ce qui peut faire atterrir vos emails dans les spams.",
			records,
			recommendation:
				"Configurez le reverse DNS (PTR) pour vos serveurs mail. Cela améliore la délivrabilité.",
			simpleRecommendation:
				"Demandez à votre hébergeur de configurer l'identité de vos serveurs mail pour améliorer la délivrabilité.",
		};
	}

	return {
		name: "ptr",
		label: "DNS inverse (PTR)",
		simpleLabel: "Identité des serveurs",
		category: "recommended",
		status: "pass",
		description: "DNS inverse configuré pour les serveurs mail.",
		simpleDescription:
			"Vos serveurs mail sont bien identifiés sur internet. Ça rassure les destinataires de vos emails.",
		records,
		recommendation: "",
		simpleRecommendation: "",
	};
}


// --- MTA-STS ---
async function checkMTASTS(domain: string): Promise<CheckResult> {
	const data = await queryDNS(`_mta-sts.${domain}`, "TXT");
	const answers = (data.Answer || [])
		.filter((r) => r.type === 16)
		.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

	const mtaSts = answers.find((r) => r.startsWith("v=STSv1"));

	if (!mtaSts) {
		return {
			name: "mta-sts",
			label: "MTA-STS",
			simpleLabel: "Chiffrement du transport",
			category: "recommended",
			status: "info",
			description: "MTA-STS non configuré (optionnel).",
			simpleDescription:
				"Le chiffrement de vos emails en transit n'est pas imposé. C'est optionnel mais recommandé pour les données sensibles.",
			records: [],
			recommendation:
				"MTA-STS force le chiffrement TLS pour les emails entrants. Recommandé mais pas critique.",
			simpleRecommendation:
				"Si vous échangez des données confidentielles par email, demandez à votre prestataire de mettre ça en place.",
		};
	}

	return {
		name: "mta-sts",
		label: "MTA-STS",
		simpleLabel: "Chiffrement du transport",
		category: "recommended",
		status: "pass",
		description: "MTA-STS configuré - chiffrement TLS forcé.",
		simpleDescription:
			"Vos emails sont obligatoirement chiffrés pendant leur transport, comme un courrier sous pli scellé.",
		records: [mtaSts],
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- TLS-RPT ---
async function checkTLSRPT(domain: string): Promise<CheckResult> {
	const data = await queryDNS(`_smtp._tls.${domain}`, "TXT");
	const answers = (data.Answer || [])
		.filter((r) => r.type === 16)
		.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

	const tlsrpt = answers.find((r) => r.startsWith("v=TLSRPTv1"));

	if (!tlsrpt) {
		return {
			name: "tls-rpt",
			label: "TLS-RPT",
			simpleLabel: "Rapports de chiffrement",
			category: "recommended",
			status: "info",
			description: "TLS-RPT non configuré (optionnel).",
			simpleDescription:
				"Vous ne recevez pas de rapport si le chiffrement de vos emails échoue. C'est optionnel.",
			records: [],
			recommendation:
				"TLS-RPT permet de recevoir des rapports sur les échecs de chiffrement TLS.",
			simpleRecommendation:
				"Pour les organisations sensibles, ces rapports aident à détecter les problèmes de sécurité.",
		};
	}

	return {
		name: "tls-rpt",
		label: "TLS-RPT",
		simpleLabel: "Rapports de chiffrement",
		category: "recommended",
		status: "pass",
		description: "TLS-RPT configuré - rapports TLS activés.",
		simpleDescription:
			"Vous recevez des rapports quand le chiffrement de vos emails échoue. Bonne pratique de sécurité.",
		records: [tlsrpt],
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- BIMI ---
async function checkBIMI(domain: string): Promise<CheckResult> {
	const data = await queryDNS(`default._bimi.${domain}`, "TXT");
	const answers = (data.Answer || [])
		.filter((r) => r.type === 16)
		.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

	const bimi = answers.find((r) => r.startsWith("v=BIMI1"));

	if (!bimi) {
		return {
			name: "bimi",
			label: "BIMI",
			simpleLabel: "Logo dans les emails",
			category: "recommended",
			status: "info",
			description: "BIMI non configuré (optionnel).",
			simpleDescription:
				"Votre logo ne s'affiche pas dans les boîtes email de vos destinataires. C'est cosmétique mais renforce la confiance.",
			records: [],
			recommendation:
				"BIMI affiche votre logo dans les clients mail compatibles. Nécessite DMARC p=quarantine ou reject.",
			simpleRecommendation:
				"Si votre image de marque est importante, demandez à votre prestataire de configurer l'affichage de votre logo.",
		};
	}

	return {
		name: "bimi",
		label: "BIMI",
		simpleLabel: "Logo dans les emails",
		category: "recommended",
		status: "pass",
		description:
			"BIMI configuré - votre logo peut s'afficher dans les clients mail.",
		simpleDescription:
			"Votre logo s'affiche dans la boîte de réception de vos destinataires, à côté de vos emails. Ça renforce votre image de marque.",
		records: [bimi],
		recommendation: "",
		simpleRecommendation: "",
	};
}

// --- DANE/TLSA ---
async function checkDANE(mxHosts: string[]): Promise<CheckResult> {
	if (mxHosts.length === 0) {
		return {
			name: "dane",
			label: "DANE / TLSA",
			simpleLabel: "Sécurité avancée",
			category: "recommended",
			status: "info",
			description: "Aucun serveur MX à vérifier.",
			simpleDescription: "Pas de serveur mail à vérifier.",
			records: [],
			recommendation: "",
			simpleRecommendation: "",
		};
	}

	const found: string[] = [];
	for (const host of mxHosts.slice(0, 3)) {
		try {
			const data = await queryDNS(`_25._tcp.${host}`, "TLSA");
			const answers = (data.Answer || []).filter(
				(r: DnsAnswer) => r.type === 52
			);
			if (answers.length > 0) {
				found.push(
					...answers.map(
						(r: DnsAnswer) =>
							`_25._tcp.${host} → ${r.data.substring(0, 60)}...`
					)
				);
			}
		} catch {
			// ignore
		}
	}

	if (found.length === 0) {
		return {
			name: "dane",
			label: "DANE / TLSA",
			simpleLabel: "Sécurité avancée",
			category: "recommended",
			status: "info",
			description: "DANE non configuré (avancé, optionnel).",
			simpleDescription:
				"Un mécanisme de sécurité très avancé n'est pas activé. C'est normal, très peu d'organisations l'utilisent.",
			records: [],
			recommendation:
				"DANE lie les certificats TLS au DNS via DNSSEC. Très avancé, peu déployé.",
			simpleRecommendation:
				"C'est un mécanisme très avancé, pas nécessaire pour la plupart des PME.",
		};
	}

	return {
		name: "dane",
		label: "DANE / TLSA",
		simpleLabel: "Sécurité avancée",
		category: "recommended",
		status: "pass",
		description:
			"DANE/TLSA configuré - certificats liés au DNS.",
		simpleDescription:
			"Un mécanisme de sécurité avancé protège les échanges entre serveurs mail. C'est du très haut niveau.",
		records: found,
		recommendation: "",
		simpleRecommendation: "",
	};
}

// ============================================================
// FULL AUDIT
// ============================================================

export async function runFullAudit(
	domain: string
): Promise<AuditResult> {
	const mxResult = await checkMX(domain);

	const [spf, dmarc, dkim, mtaSts, tlsrpt, bimi] =
		await Promise.all([
			checkSPF(domain),
			checkDMARC(domain),
			checkDKIM(domain, mxResult.hosts),
			checkMTASTS(domain),
			checkTLSRPT(domain),
			checkBIMI(domain),
		]);

	const spoofing = checkSpoofing(spf, dmarc, dkim);

	const [ptr, dane] = await Promise.all([
		checkPTR(mxResult.hosts),
		checkDANE(mxResult.hosts),
	]);

	return {
		domain,
		checks: [
			// Critical
			mxResult.result,
			spf,
			dmarc,
			dkim,
			spoofing,
			// Recommended
			ptr,
			mtaSts,
			tlsrpt,
			bimi,
			dane,
		],
		timestamp: Date.now(),
	};
}
