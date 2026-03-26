import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "risques-cyber-pme-2026",
  title: "Cybersécurité : les 6 menaces que toute PME devrait connaître",
  description:
    "Pas besoin d'être une grande entreprise pour être ciblé. Voici les risques les plus courants pour les PME, et ce qu'on peut faire concrètement pour s'en protéger.",
  date: "2026-03-13",
  category: "cybersecurite",
  readTime: 6,
  content: `
## Pourquoi les PME ?

"On est trop petits pour intéresser les pirates." C'est la phrase qu'on entend le plus souvent. Et c'est exactement pour ça que les PME représentent plus de 40 % des victimes de cyberattaques en France.

Les pirates ne ciblent pas les PME parce qu'elles ont des secrets militaires. Ils les ciblent parce qu'elles ont des données exploitables — clients, factures, comptes bancaires — et rarement les protections d'un grand groupe. C'est le meilleur rapport effort/résultat.

## 1. L'email piégé

C'est le point d'entrée numéro un. Un email qui ressemble à celui de votre banque, de votre fournisseur, ou de Microsoft. Un lien vers une fausse page de connexion. Vous tapez votre mot de passe, et c'est fini.

Ce qui a changé : ces emails sont de plus en plus crédibles. Fini les fautes d'orthographe. Aujourd'hui, ils sont personnalisés avec le nom de votre entreprise, de vos collègues, et rédigés dans un français parfait.

**Se protéger** : activer la double authentification sur tous les comptes (le fameux code par SMS ou application). C'est la protection la plus efficace : même si le mot de passe est volé, le compte reste protégé.

## 2. Le ransomware

Vos fichiers sont chiffrés, on vous demande une rançon. L'attaque dure quelques minutes, la récupération peut prendre des semaines. On en parle en détail dans [notre article dédié](/blog/sauvegarde-ransomware-guide-pme).

**Se protéger** : des sauvegardes régulières, stockées en dehors de votre réseau, et testées. C'est la seule vraie assurance.

## 3. Les mots de passe qui traînent

Des milliards d'identifiants circulent sur Internet, issus de piratages de sites tiers. Si un collaborateur a utilisé son email pro et le même mot de passe sur un site qui s'est fait pirater, cet identifiant est dans la nature. Et si c'est le même mot de passe que pour le VPN ou la messagerie de l'entreprise, la porte est ouverte.

**Se protéger** : utiliser un gestionnaire de mots de passe (pour ne jamais réutiliser le même), et activer la double authentification partout.

## 4. Les outils non maîtrisés

Dropbox personnel pour échanger des documents. WhatsApp pour discuter de projets clients. Un logiciel en ligne souscrit avec la carte bleue perso. C'est ce qu'on appelle le "shadow IT" : des outils utilisés sans que la direction ou l'IT le sache.

Le problème : ces outils ne sont ni sauvegardés, ni sécurisés, ni conformes au RGPD. Et quand le collaborateur quitte l'entreprise, les données partent avec.

**Se protéger** : fournir des outils officiels simples et pratiques. Si les outils internes sont pénibles à utiliser, les gens contournent — c'est humain.

## 5. L'usurpation d'identité par email

Sans les bons réglages sur votre domaine de messagerie, n'importe qui peut envoyer un email en se faisant passer pour votre entreprise. Le cas le plus courant : un faux email du dirigeant au comptable, demandant un virement urgent. C'est l'arnaque au président, et elle coûte encore des millions chaque année.

**Se protéger** : configurer les protections de messagerie (c'est gratuit et ça se fait une seule fois). [Vérifiez votre domaine ici](/outils/audit-email).

## 6. Les équipements oubliés sur Internet

L'interface d'administration du firewall, une caméra IP, un NAS de sauvegarde, une imprimante — beaucoup d'équipements sont accessibles depuis Internet sans que personne ne le sache. Il suffit d'un scan automatique pour les trouver, et beaucoup ont encore leur mot de passe par défaut.

**Se protéger** : [vérifier quels ports sont exposés](/outils/scan-ports) et restreindre les accès.

## Le plan minimum

Aucune de ces protections n'est hors de portée d'une PME :

- **Double authentification** sur tous les comptes — c'est la mesure la plus efficace
- **Sauvegardes** testées, avec une copie hors site
- **Mises à jour** appliquées rapidement
- **Messagerie** correctement configurée
- **Un regard extérieur** une fois par an (audit de sécurité)

Le coût d'un audit est négligeable comparé au coût d'un incident. [Parlons-en](/contact).
`,
};
