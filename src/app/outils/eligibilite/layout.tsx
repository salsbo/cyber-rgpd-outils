import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Éligibilité Fibre & 4G/5G - Vérifiez votre couverture",
	description:
		"Vérifiez si la fibre est disponible à votre adresse et quelles antennes 4G/5G couvrent votre site. Résultats instantanés par adresse.",
	keywords: ["éligibilité fibre", "couverture 4G", "couverture 5G", "antenne mobile", "fibre optique", "FTTH"],
	openGraph: {
		title: "Éligibilité Fibre & 4G/5G - Outils Cyber RGPD",
		description: "La fibre et la 4G/5G sont-elles disponibles chez vous ? Vérifiez en tapant votre adresse.",
		url: "https://outils.cyber-rgpd.com/outils/eligibilite",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/eligibilite" },
};

export default function EligibiliteLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
