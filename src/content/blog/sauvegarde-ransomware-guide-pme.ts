import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "sauvegarde-ransomware-guide-pme",
  title: "Ransomware : combien de jours de travail êtes-vous prêt à perdre ?",
  description:
    "Lundi matin, vos fichiers sont chiffrés. Tout est bloqué. La seule question qui compte : à quand remonte votre dernière sauvegarde, et combien de temps faut-il pour tout remettre en marche ?",
  date: "2026-03-14",
  category: "cybersecurite",
  readTime: 6,
  content: `
## Le scénario que personne n'imagine

Lundi matin, 8h. Vous allumez votre ordinateur. Tous vos fichiers ont une extension bizarre. Un message à l'écran demande une rançon en cryptomonnaie. Votre serveur de fichiers, vos devis, votre comptabilité, vos emails — tout est bloqué.

Ce n'est pas de la science-fiction. En France, une PME est touchée par un ransomware toutes les quelques minutes. Et 60 % des petites entreprises qui subissent une attaque de ce type déposent le bilan dans les 18 mois.

La différence entre une entreprise qui se relève en quelques heures et une qui perd des semaines de travail tient à une seule chose : **la sauvegarde**.

## Les deux questions à se poser

### Combien de travail je perds ?

Si votre dernière sauvegarde date d'hier soir et que l'attaque a lieu à 17h, vous perdez une journée complète de travail. Si elle date de la semaine dernière, vous perdez une semaine. Si vous n'avez pas de sauvegarde... vous perdez tout.

C'est ce qu'on appelle le "point de récupération". Plus vos sauvegardes sont fréquentes, moins vous perdez de données.

**Pour la plupart des PME** : une sauvegarde quotidienne est le minimum. Pour une base de données critique (comptabilité, ERP), toutes les quelques heures est préférable.

### Combien de temps je suis à l'arrêt ?

Avoir une sauvegarde, c'est bien. Pouvoir tout remettre en route rapidement, c'est mieux. Si la restauration prend une semaine, c'est une semaine de chiffre d'affaires en moins, de clients sans réponse, de projets en retard.

C'est le "temps de remise en marche". L'objectif pour une PME : quelques heures pour les systèmes critiques, une journée maximum pour le reste.

## Les erreurs les plus fréquentes

**"On sauvegarde sur un disque branché au serveur."** Si le disque est connecté en permanence, le ransomware le chiffre en même temps que le reste. C'est comme ranger vos doubles de clés dans la même boîte que les originaux.

**"On est en RAID, on est protégé."** Le RAID protège contre la panne d'un disque dur. Pas contre une attaque. Si le ransomware chiffre vos fichiers, le RAID chiffre consciencieusement les deux copies.

**"On sauvegarde dans le cloud."** Oui, mais est-ce que le cloud garde les versions précédentes des fichiers ? Si le ransomware chiffre vos fichiers et que le cloud synchronise les versions chiffrées par-dessus les bonnes, vous perdez tout quand même.

**"On n'a jamais testé la restauration."** C'est l'erreur la plus courante et la plus dangereuse. Beaucoup d'entreprises découvrent le jour de l'incident que leur sauvegarde est incomplète, corrompue, ou trop longue à restaurer.

## La règle d'or

Elle est simple et elle porte un nom : la règle 3-2-1.

- **3 copies** de vos données : l'original plus deux sauvegardes
- **2 supports différents** : par exemple un disque local et un service cloud
- **1 copie hors de vos locaux** : cloud, datacenter distant, ou coffre-fort

Le point crucial, c'est le "hors site". Un ransomware chiffre tout ce qui est accessible sur votre réseau. Si votre sauvegarde est sur un disque dans le même bureau, elle sera chiffrée aussi. Une copie dans le cloud, déconnectée de votre réseau, reste intacte.

## Combien ça coûte ?

Une solution de sauvegarde cloud pour une PME de 10 à 50 personnes coûte entre 50 et 200 € par mois. C'est le prix d'un déjeuner d'équipe. Le coût moyen d'un ransomware pour une PME, en revanche, dépasse les 100 000 € (arrêt d'activité + reconstruction + perte de données + image).

## Que faire si ça arrive ?

1. **Débrancher** immédiatement les machines du réseau — câble et Wi-Fi
2. **Ne pas payer** — aucune garantie de récupération, et ça finance l'attaque suivante
3. **Restaurer** depuis la dernière sauvegarde saine
4. **Comprendre** comment l'attaque est entrée (souvent un email piégé ou un accès mal protégé)
5. **Signaler** sur cybermalveillance.gouv.fr et déposer plainte

## Par où commencer ?

La première étape est de savoir où vous en êtes. Posez-vous ces questions :
- Est-ce que mes données sont sauvegardées tous les jours ?
- Est-ce qu'une copie existe en dehors de mes locaux ?
- Est-ce que quelqu'un a déjà testé la restauration ?

Si vous répondez "non" ou "je ne sais pas" à l'une de ces questions, c'est le moment d'agir. Notre [diagnostic IT](/outils/diagnostic) évalue votre situation en quelques minutes. Et si vous voulez aller plus loin, [contactez-nous](/contact).
`,
};
