import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Outils gratuits pour professionnels de la santé - Audit, Mesure, Diagnostic",
	description:
		"Outils gratuits pour les professionnels de la santé : audit email, test visio, scan de sécurité, éligibilité fibre/4G, diagnostic IT 360. Aucune inscription.",
	keywords: [
		"outils gratuits santé",
		"audit email",
		"test visio",
		"scan ports",
		"eligibilite fibre",
		"diagnostic IT",
		"test 4G 5G",
		"securite informatique",
	],
	openGraph: {
		title: "Outils gratuits pour professionnels de la santé - Cyber RGPD",
		description:
			"Des outils simples et concrets pour auditer, mesurer et ameliorer votre infrastructure. Aucune inscription requise.",
		url: "https://outils.cyber-rgpd.com/outils",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils" },
};

export default function OutilsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
