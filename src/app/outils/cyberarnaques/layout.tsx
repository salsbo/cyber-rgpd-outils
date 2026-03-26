import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Cyberarnaques - Les signaux d'alerte et les bons réflexes",
	description:
		"Apprenez à reconnaître les signaux d'une cyberarnaque et adoptez les bons réflexes. Parcours interactif gratuit, aucune donnée collectée.",
	keywords: ["cyberarnaque", "arnaque", "phishing", "sensibilisation", "sécurité", "prévention", "ingénierie sociale"],
	openGraph: {
		title: "Cyberarnaques - Outils Cyber RGPD",
		description: "Parcours interactif pour reconnaître et déjouer les cyberarnaques.",
		url: "https://outils.cyber-rgpd.com/outils/cyberarnaques",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/cyberarnaques" },
};

export default function CyberarnaqueLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
