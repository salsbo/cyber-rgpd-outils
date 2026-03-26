import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "5-failles-securite-pme",
  title: "5 portes ouvertes que les pirates trouvent dans toutes les PME",
  description:
    "Ce ne sont pas des attaques sophistiquées. Ce sont des oublis de configuration que n'importe qui peut exploiter. Voici les plus courants.",
  date: "2026-03-15",
  category: "cybersecurite",
  readTime: 5,
  content: `
## Ce ne sont pas des films d'espionnage

Quand on pense "piratage informatique", on imagine un génie du code dans un sous-sol. La réalité est beaucoup plus banale. La majorité des attaques contre les PME exploitent des choses simples : un mot de passe qui traîne, une porte d'entrée oubliée, un réglage jamais fait.

Après plusieurs dizaines d'audits en PME, ce sont toujours les mêmes problèmes qui reviennent. Aucun n'est compliqué à corriger. Mais personne ne regarde, alors personne ne corrige.

## 1. La télécommande de votre réseau est accessible à tout le monde

Votre firewall — l'équipement qui protège votre réseau — a une interface d'administration. C'est comme le tableau de bord de votre alarme maison. Dans beaucoup de PME, cette interface est accessible depuis Internet, sans restriction. N'importe qui peut essayer de s'y connecter.

C'est comme si vous laissiez le boîtier de votre alarme sur le trottoir, avec un post-it "code par défaut : 1234".

**La correction** : restreindre cet accès pour qu'il ne soit joignable que depuis votre réseau interne. Ça se fait en 10 minutes.

## 2. Des mots de passe de vos collaborateurs circulent sur Internet

Quand un site web se fait pirater — un réseau social, une boutique en ligne, un forum — les mots de passe de ses utilisateurs finissent dans des bases de données qui circulent librement. Si un de vos collaborateurs a utilisé son email professionnel et le même mot de passe pour s'inscrire sur un de ces sites, cet identifiant est dans la nature.

Et si ce mot de passe est le même que celui du VPN de l'entreprise ou de la messagerie, c'est une porte grande ouverte.

**La correction** : vérifier si des identifiants ont fuité, forcer le changement des mots de passe compromis, et activer la double authentification (le code par SMS ou par application en plus du mot de passe).

## 3. Votre messagerie ne dit pas qui a le droit d'envoyer en votre nom

Sans les bons réglages sur votre domaine, n'importe qui peut envoyer un email en se faisant passer pour votre entreprise. Vos clients reçoivent une fausse facture avec votre logo et votre adresse email — impossible pour eux de faire la différence.

**La correction** : configurer les protections de votre messagerie. Ça prend 30 minutes et c'est gratuit. [Testez votre domaine ici](/outils/audit-email) pour savoir où vous en êtes.

## 4. Votre site web donne trop d'informations techniques

Quand quelqu'un visite votre site, les réponses envoyées par le serveur contiennent souvent des informations techniques invisibles pour l'utilisateur normal, mais précieuses pour un attaquant : la version du logiciel, le type de serveur, le langage utilisé. C'est comme afficher sur votre porte d'entrée la marque et le modèle de votre serrure.

**La correction** : supprimer ces informations superflues dans la configuration du site. Votre développeur ou hébergeur peut le faire en quelques minutes.

## 5. Personne n'a vérifié depuis la mise en place

L'erreur la plus fréquente n'est pas technique, c'est organisationnelle. Le réseau a été installé il y a 3 ans par un prestataire, tout fonctionnait, et personne n'a regardé depuis. Entre-temps, des failles ont été découvertes, des mises à jour n'ont pas été faites, des accès temporaires n'ont jamais été supprimés.

**La correction** : faire vérifier son installation par un regard extérieur au moins une fois par an. Un audit de sécurité prend quelques jours et coûte beaucoup moins cher qu'un incident.

## Le point commun

Aucune de ces failles ne demande un budget important pour être corrigée. Ce sont des réglages, de la configuration, de l'hygiène. Le vrai risque, c'est de ne pas savoir qu'elles sont là.

Vous voulez savoir où vous en êtes ? [Contactez-nous](/contact) pour un audit rapide, ou commencez par [tester votre messagerie](/outils/audit-email) et [scanner vos ports exposés](/outils/scan-ports) gratuitement.
`,
};
