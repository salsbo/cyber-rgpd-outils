import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Outils gratuits pour PME - Audit, Mesure, Diagnostic",
	description:
		"Outils gratuits pour auditer et ameliorer votre infrastructure : audit email, test visio, scan de securite, eligibilite fibre/4G, diagnostic IT 360. Aucune inscription.",
	keywords: [
		"outils gratuits PME",
		"audit email",
		"test visio",
		"scan ports",
		"eligibilite fibre",
		"diagnostic IT",
		"test 4G 5G",
		"securite informatique",
	],
	openGraph: {
		title: "Outils gratuits pour PME - Outils Cyber RGPD",
		description:
			"Des outils simples et concrets pour auditer, mesurer et ameliorer votre infrastructure. Aucune inscription requise.",
		url: "https://outils.cyber-rgpd.com/outils",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils" },
};

export default function OutilsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
