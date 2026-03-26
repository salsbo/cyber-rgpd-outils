import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Audit Email - SPF, DKIM, DMARC, anti-usurpation",
	description:
		"Testez gratuitement la configuration email de votre domaine : SPF, DKIM, DMARC, blacklists, MTA-STS. Résultats instantanés, aucune inscription.",
	keywords: ["audit email", "SPF", "DKIM", "DMARC", "délivrabilité", "anti-spam", "usurpation email", "sécurité email"],
	openGraph: {
		title: "Audit Email gratuit - Outils Cyber RGPD",
		description: "Vérifiez la sécurité et la délivrabilité de vos emails en quelques secondes.",
		url: "https://outils.cyber-rgpd.com/outils/audit-email",
	},
	alternates: { canonical: "https://outils.cyber-rgpd.com/outils/audit-email" },
};

export default function AuditEmailLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
