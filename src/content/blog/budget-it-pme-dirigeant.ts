import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "budget-it-pme-dirigeant",
  title: "Budget informatique : combien dépenser quand on est une PME ?",
  description:
    "Entre le strict minimum et le sur-investissement, comment arbitrer ses dépenses IT quand on n'est pas un expert du sujet.",
  date: "2026-03-11",
  category: "productivite",
  readTime: 5,
  content: `
## La question que personne n'ose poser

"Est-ce qu'on dépense trop ? Pas assez ? Est-ce qu'on dépense au bon endroit ?" Quand on dirige une PME, l'informatique est un poste de dépense difficile à évaluer. On sait que c'est important, mais on ne sait pas toujours si les euros investis servent à quelque chose.

La moyenne pour une PME se situe entre 3 et 7 % du chiffre d'affaires. Mais ce chiffre seul ne veut rien dire. Une PME qui dépense 5 % dans du matériel surdimensionné et des licences inutilisées est moins bien lotie qu'une qui dépense 3 % au bon endroit.

## Ce qui est non négociable

Il y a un socle incompressible, comme le loyer ou l'assurance :

- **Les postes de travail** — des ordinateurs qui fonctionnent, renouvelés tous les 4-5 ans
- **La messagerie et les outils de base** — Office 365, Google Workspace, ou équivalent
- **La connexion Internet** — fibre si possible ([voici pourquoi](/blog/passer-fibre-ftth-entreprise))
- **La sécurité** — antivirus, firewall, double authentification
- **La sauvegarde** — [c'est votre assurance en cas de catastrophe](/blog/sauvegarde-ransomware-guide-pme)

Pour 20 personnes, ce socle représente environ 1 500 à 2 500 € par mois. C'est le minimum pour fonctionner de manière sécurisée et productive.

## L'erreur classique : le pic puis le vide

Certaines PME investissent 50 000 € une année dans un gros projet IT, puis 0 € les trois années suivantes. Le matériel vieillit, les licences expirent, les sauvegardes ne sont plus vérifiées, et on se retrouve avec une infrastructure fragile.

La bonne approche, c'est un budget régulier et prévisible. Pas de pic, pas de trou. L'informatique, c'est de l'entretien continu, comme une flotte de véhicules.

## Comment savoir si on dépense bien ?

Quelques questions simples :

**Est-ce que vos collaborateurs perdent du temps à cause de l'informatique ?** PC lents, connexion qui rame, logiciels inadaptés. Si oui, le budget est probablement mal réparti — pas forcément insuffisant.

**Est-ce que vos données sont sauvegardées ?** Si vous ne pouvez pas répondre avec certitude, c'est la priorité numéro un.

**Est-ce que quelqu'un surveille ?** Si personne ne regarde les alertes, l'état des sauvegardes, ou les mises à jour en attente — personne ne verra le problème venir.

**Est-ce que vous payez pour des choses inutilisées ?** Des licences logicielles pour des collaborateurs partis, un serveur surdimensionné, un contrat de maintenance sur du matériel remplacé. Un audit rapide permet souvent de récupérer 10 à 20 % du budget.

## Faut-il embaucher ou externaliser ?

Une PME de 20 personnes n'a pas besoin d'un responsable informatique à temps plein. Mais elle a besoin de quelqu'un qui surveille, qui intervient quand ça casse, et qui anticipe les renouvellements.

C'est le rôle d'un prestataire externe : supervision quotidienne, gestion des incidents, conseil sur les investissements. Le coût typique se situe entre 500 et 2 000 € par mois selon le périmètre — bien moins qu'un salaire temps plein, avec une disponibilité souvent meilleure.

## Par où commencer ?

Notre [diagnostic IT](/outils/diagnostic) évalue gratuitement votre situation sur 5 axes : connectivité, sécurité, sauvegarde, support et applications. Vous obtenez un score et des recommandations concrètes, sans engagement.

C'est un bon point de départ pour savoir si vous dépensez au bon endroit — ou si certains postes méritent d'être ajustés. [Faites le test](/outils/diagnostic) ou [contactez-nous](/contact) pour en discuter.
`,
};
