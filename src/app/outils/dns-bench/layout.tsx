import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Bilan de surf Internet - Débit, latence et performance",
	description:
		"Testez votre connexion Internet : débit, latence, chargement de sites. Obtenez un score avec des conseils concrets pour améliorer votre navigation.",
	keywords: ["test débit", "test latence", "performance internet", "vitesse connexion", "DNS", "bilan surf"],
	openGraph: {
		title: "Bilan de surf Internet - Outils Cyber RGPD",
		description: "Débit, latence, chargement - testez votre connexion et obtenez un score avec des conseils.",
		url: "https://outils.cyber-rgpd.com/outils/dns-bench",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/dns-bench" },
};

export default function DnsBenchLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
