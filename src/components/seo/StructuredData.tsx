"use client";

export default function StructuredData() {
	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "Outils Cyber RGPD",
		"url": "https://outils.cyber-rgpd.com",
	};

	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [
			{
				"@type": "Question",
				"name": "Quels outils gratuits proposez-vous pour les PME ?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Nous proposons des outils gratuits sans inscription : audit email (SPF, DKIM, DMARC), test visio, scan de securite, bilan de surf, eligibilite fibre/4G/5G, diagnostic IT 360 et test de reception 4G/5G.",
				},
			},
			{
				"@type": "Question",
				"name": "Vos outils collectent-ils des donnees personnelles ?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Non. Tous nos outils fonctionnent directement dans votre navigateur. Aucune donnee personnelle n'est collectee ni stockee sur nos serveurs.",
				},
			},
		],
	};

	// Safe: all content is hardcoded static JSON-LD with no user input involved.
	// This is the standard Next.js pattern for structured data.
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>
		</>
	);
}
