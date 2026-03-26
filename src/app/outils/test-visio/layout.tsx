import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Test Visio - Votre connexion est-elle prête pour Teams, Zoom, Meet ?",
	description:
		"Testez la qualité de votre connexion pour la visioconférence en 15 secondes. Latence, stabilité, score MOS. Gratuit, sans inscription.",
	keywords: ["test visio", "Teams", "Zoom", "Meet", "latence", "qualité appel", "MOS", "visioconférence"],
	openGraph: {
		title: "Test Visio gratuit - Outils Cyber RGPD",
		description: "Votre connexion tient-elle la visio ? Testez en 15 secondes.",
		url: "https://outils.cyber-rgpd.com/outils/test-visio",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/test-visio" },
};

export default function TestVisioLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
