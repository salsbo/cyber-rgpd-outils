import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Diagnostic IT 360° - Évaluez votre infrastructure en 15 questions",
	description:
		"15 questions pour évaluer connexion, sécurité, sauvegardes et support IT. Score et conseils personnalisés immédiats. Gratuit, sans inscription.",
	keywords: ["diagnostic IT", "audit infrastructure", "sécurité informatique", "sauvegarde", "PME", "score IT"],
	openGraph: {
		title: "Diagnostic IT 360° gratuit - Outils Cyber RGPD",
		description: "Évaluez votre infrastructure IT en 15 questions. Score et recommandations immédiats.",
		url: "https://outils.cyber-rgpd.com/outils/diagnostic",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/diagnostic" },
};

export default function DiagnosticLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
