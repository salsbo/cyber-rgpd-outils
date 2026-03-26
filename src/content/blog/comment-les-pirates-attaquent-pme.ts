import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "comment-les-pirates-attaquent-pme",
  title: "Votre entreprise est un coffre-fort. Voici comment on l'ouvre.",
  description:
    "Vos données sont votre bien le plus précieux. Les pirates le savent. Comprendre comment ils entrent, ce qu'ils font, et comment vous protéger — expliqué comme un braquage.",
  date: "2026-03-09",
  category: "cybersecurite",
  readTime: 8,
  content: `
## Votre entreprise est un bâtiment. Vos données sont dedans.

Imaginez votre entreprise comme un immeuble. À l'intérieur, il y a tout ce qui a de la valeur : vos fichiers clients, votre comptabilité, vos devis, vos contrats, vos mots de passe, les données personnelles de vos collaborateurs. C'est le coffre-fort.

Dans le monde physique, un cambrioleur a trois options : forcer la porte, convaincre quelqu'un de lui ouvrir, ou trouver une fenêtre oubliée. Dans le monde numérique, c'est exactement la même chose. Et une fois à l'intérieur, il peut voler, prendre en otage, ou vandaliser.

Comprendre une attaque informatique, c'est comprendre trois choses : **comment on entre**, **ce qu'on fait une fois dedans**, et **ce que ça coûte**.

---

## Partie 1 — Comment on entre : les voies d'accès

### La manipulation : on vous convainc d'ouvrir la porte

C'est la méthode la plus courante. Pas besoin de forcer quoi que ce soit — il suffit de manipuler quelqu'un pour qu'il ouvre la porte lui-même.

**L'arnaque au président.** Un escroc se fait passer pour le dirigeant de l'entreprise. Il envoie un email à la comptable : "Bonjour Marie, je suis en déplacement. Il faut faire un virement urgent de 18 000 €. C'est confidentiel." L'email a la bonne adresse, le bon ton, la bonne signature. Marie exécute. L'argent disparaît.

Dans le monde physique, c'est l'équivalent de quelqu'un qui appelle le gardien en se faisant passer pour le propriétaire : "Ouvrez au plombier, c'est urgent, je ne peux pas me déplacer."

**Le faux email de connexion.** Vous recevez un message de Microsoft ou de votre banque : "Votre compte va être bloqué, reconnectez-vous ici." Le lien mène à une copie parfaite du site. Vous tapez votre mot de passe. L'attaquant le récupère.

C'est l'équivalent du faux agent EDF qui sonne à votre porte avec un badge qui ressemble au vrai, et à qui vous montrez votre compteur — sauf qu'il en profite pour repérer l'alarme.

### Le cheval de Troie : on vous fait entrer l'intrus vous-même

**La pièce jointe piégée.** Un email avec une facture, un bon de commande, un CV. Le document s'ouvre normalement. Mais en arrière-plan, un programme invisible s'installe. L'attaquant peut maintenant voir votre écran, lire vos fichiers, et se déplacer sur votre réseau — sans que vous ne remarquiez quoi que ce soit. Il peut rester tapi pendant des semaines.

**La clé USB abandonnée.** Une clé USB "oubliée" dans le parking, à l'accueil ou dans la salle d'attente. Par curiosité, quelqu'un la branche. Un programme se lance automatiquement. Plus de la moitié des clés trouvées dans un parking sont branchées par la personne qui les ramasse.

Dans le monde physique, c'est le colis piégé ou le cadeau empoisonné : vous faites entrer l'intrus vous-même parce qu'il est emballé dans quelque chose d'anodin.

### La fenêtre ouverte : on trouve un accès que personne n'a sécurisé

**L'accès oublié.** L'interface d'administration du firewall accessible depuis Internet. Un ancien compte collaborateur jamais supprimé. Un mot de passe par défaut jamais changé. Un accès bureau à distance ouvert sur le réseau.

Ce n'est même pas du piratage au sens propre. C'est un cambrioleur qui fait le tour du bâtiment et qui trouve une fenêtre ouverte au rez-de-chaussée.

**Les mots de passe déjà connus.** Des milliards d'identifiants circulent librement sur Internet, issus de piratages de sites tiers. Si un collaborateur a utilisé le même mot de passe pour un site compromis et pour le VPN de l'entreprise, l'attaquant n'a même pas besoin de deviner : il a déjà la clé.

C'est l'équivalent du double de clé laissé sous le paillasson. Tout le quartier sait qu'il est là.

---

## Partie 2 — Ce qu'on fait une fois dedans : les trois scénarios

Une fois dans votre réseau, l'attaquant a le choix. Et ces choix peuvent se combiner.

### Le vol : on prend et on s'en va

L'attaquant copie vos données et disparaît. Fichiers clients, base de données, mots de passe, documents confidentiels, données personnelles des collaborateurs.

**Dans le monde physique**, c'est un cambriolage classique. On entre, on prend ce qui a de la valeur, on repart. Vous ne vous en apercevez parfois que des jours ou des semaines plus tard.

**L'impact** : les données volées sont revendues, utilisées pour du chantage, ou exploitées pour d'autres arnaques. Si ce sont des données personnelles de clients, vous avez une obligation légale de les prévenir et de déclarer l'incident à la CNIL — avec les conséquences d'image que ça implique.

### La prise d'otage : le ransomware

L'attaquant chiffre tous vos fichiers. Tout devient illisible. Un message apparaît : "Payez X bitcoins dans les 72 heures pour récupérer vos données."

**Dans le monde physique**, ce n'est pas un vol — c'est une prise d'otage. On ne vous prend rien, mais on vous empêche d'accéder à ce qui vous appartient tant que vous ne payez pas.

Le ransomware peut arriver par n'importe quelle voie d'accès : une pièce jointe piégée, une clé USB, un mot de passe volé, un accès mal protégé. C'est souvent la dernière étape : l'attaquant est entré depuis des jours ou des semaines, il a repéré les sauvegardes accessibles sur le réseau et les a supprimées, puis il déclenche le chiffrement — souvent un vendredi soir ou un week-end, quand personne n'est là pour réagir.

**L'impact** est immédiat et total :
- Plus de devis, plus de factures, plus de comptabilité
- Les clients appellent, personne ne peut accéder à leur dossier
- La production s'arrête si elle dépend d'un logiciel
- La paie peut être bloquée
- L'arrêt d'activité peut durer des jours, parfois des semaines

Le coût moyen pour une PME dépasse les 100 000 € — et 60 % des petites entreprises touchées ne s'en remettent pas dans les 18 mois.

**Faut-il payer ?** Non. Il n'y a aucune garantie de récupérer vos données. Et payer finance directement l'attaque suivante. La seule protection réelle, c'est une [sauvegarde fiable, hors réseau, et testée](/blog/sauvegarde-ransomware-guide-pme).

### L'usurpation : on se fait passer pour vous

L'attaquant utilise vos accès pour agir en votre nom. Il envoie de fausses factures à vos clients depuis votre adresse email. Il passe des commandes chez vos fournisseurs. Il redirige des paiements vers ses comptes.

**Dans le monde physique**, c'est un escroc qui vole votre identité, ouvre des comptes à votre nom, et signe des contrats en se faisant passer pour vous.

**L'impact** : perte financière directe, mais surtout perte de confiance. Quand vos clients reçoivent une fausse facture avec votre logo et vos coordonnées, c'est votre réputation qui prend le coup — même si vous n'y êtes pour rien.

---

## Partie 3 — Comment protéger le coffre-fort

La bonne nouvelle, c'est que toutes ces protections sont à la portée d'une PME. Aucune n'est coûteuse ni complexe.

### Empêcher l'entrée

- **Double authentification partout** — même si le mot de passe est volé, le compte reste protégé. C'est un verrou supplémentaire sur chaque porte.
- **Ne jamais ouvrir un fichier ou une clé USB dont on ne connaît pas la provenance** — le réflexe le plus simple et le plus efficace.
- **Confirmer par téléphone tout virement urgent ou inhabituel** — la parade contre l'arnaque au président.
- **[Vérifier que sa messagerie est correctement configurée](/outils/audit-email)** — pour empêcher quelqu'un d'envoyer des emails en votre nom.

### Limiter les dégâts si quelqu'un entre

- **Sauvegardes régulières, hors réseau, testées** — [la règle 3-2-1](/blog/sauvegarde-ransomware-guide-pme). C'est votre assurance incendie numérique.
- **Mises à jour rapides** — chaque mise à jour corrige des failles que les attaquants connaissent.
- **Surveiller les accès** — savoir qui se connecte, d'où, et quand. Comme les caméras de surveillance dans un bâtiment.

### Vérifier régulièrement

- **Un audit de sécurité par an** — un regard extérieur qui cherche les fenêtres ouvertes que vous ne voyez plus.
- **Sensibiliser les équipes** — pas une formation de 3 heures, mais des rappels simples et réguliers. Les réflexes se construisent avec la répétition.

---

## En résumé

| Dans le monde physique | Dans le monde numérique |
|----------------------|------------------------|
| Cambriolage | Vol de données |
| Prise d'otage | Ransomware |
| Usurpation d'identité | Fraude par email |
| Faux agent qui sonne à la porte | Email piégé (phishing) |
| Colis piégé | Pièce jointe ou clé USB piégée |
| Fenêtre ouverte au rez-de-chaussée | Accès mal protégé sur Internet |
| Double de clé sous le paillasson | Mot de passe réutilisé ou fuité |

Votre entreprise a probablement une alarme, une assurance, et une porte fermée à clé. Vos données méritent la même attention.

Vous voulez savoir où vous en êtes ? [Contactez-nous](/contact) pour un audit adapté aux PME, ou commencez par [tester votre messagerie](/outils/audit-email) gratuitement.
`,
};
