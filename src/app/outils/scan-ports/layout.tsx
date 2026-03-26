import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Scan rapide d'exposition - Ports ouverts et services exposés",
	description:
		"Vérifiez si des services sensibles (RDP, bases de données, admin) sont visibles depuis Internet sur votre adresse IP. Scan rapide et gratuit.",
	keywords: ["scan ports", "sécurité réseau", "ports ouverts", "exposition internet", "RDP", "pentest", "vulnérabilité"],
	openGraph: {
		title: "Scan rapide d'exposition - Outils Cyber RGPD",
		description: "Des services sensibles sont-ils exposés sur votre IP ? Vérifiez gratuitement.",
		url: "https://outils.cyber-rgpd.com/outils/scan-ports",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/scan-ports" },
};

export default function ScanPortsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
