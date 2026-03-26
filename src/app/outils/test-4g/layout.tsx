import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Test réception 4G / 5G - Mesurez votre signal",
	description:
		"Mesurez la qualité du signal 4G/5G sur votre site avec votre smartphone. Mode opératoire guidé Android et iPhone, évaluation RSRP/SINR immédiate.",
	keywords: ["test 4G", "test 5G", "RSRP", "SINR", "RSRQ", "réception mobile", "couverture 4G", "signal 5G"],
	openGraph: {
		title: "Test réception 4G / 5G - Outils Cyber RGPD",
		description: "Mesurez la qualité du signal mobile sur votre site. Aucune app à installer.",
		url: "https://outils.cyber-rgpd.com/outils/test-4g",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/test-4g" },
};

export default function Test4GLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
