import type { BlogPost } from "./index";

export const post: BlogPost = {
  slug: "spf-dkim-dmarc-guide-pme",
  title: "Pourquoi vos emails finissent en spam (et comment y remédier)",
  description:
    "Vos emails n'arrivent pas à destination ou quelqu'un se fait passer pour vous ? Le problème vient souvent d'un réglage que personne n'a fait.",
  date: "2026-03-17",
  category: "securite-email",
  readTime: 5,
  content: `
## "Je vous ai envoyé un email, vous ne l'avez pas reçu ?"

Si vous avez déjà entendu cette phrase — de la part d'un client, d'un fournisseur ou d'un collaborateur — il y a de fortes chances que le problème ne vienne ni de votre connexion, ni de votre boîte mail. Il vient de la façon dont votre messagerie est **identifiée** sur Internet.

Quand vous envoyez un email, le serveur du destinataire fait une vérification rapide : "est-ce que cet email vient vraiment de cette entreprise, ou est-ce que quelqu'un se fait passer pour elle ?" Si la réponse n'est pas claire, votre message finit en spam. Ou il est tout simplement rejeté.

## Le fond du problème

Sur Internet, n'importe qui peut envoyer un email en se faisant passer pour n'importe qui. C'est comme si quelqu'un pouvait écrire une lettre avec votre en-tête et votre signature, et la poster sans que La Poste ne vérifie rien.

Pour résoudre ça, trois mécanismes ont été inventés. Ils portent des noms barbares — SPF, DKIM, DMARC — mais leur principe est simple :

- **Le premier** dit : "voici la liste des serveurs qui ont le droit d'envoyer des emails en mon nom." C'est comme déposer une liste de personnes autorisées à signer vos courriers.

- **Le deuxième** ajoute un sceau numérique à chaque email. Si le sceau est intact à l'arrivée, c'est que le message n'a pas été falsifié.

- **Le troisième** dit aux destinataires quoi faire quand un email suspect arrive : le laisser passer, le mettre en spam, ou le bloquer complètement.

## Pourquoi ça vous concerne

Si ces réglages ne sont pas en place sur votre domaine de messagerie, deux choses se passent :

**Vos emails légitimes n'arrivent pas.** Gmail, Outlook et les autres deviennent de plus en plus stricts. Sans ces configurations, vos devis, vos factures et vos relances risquent de finir dans les spams de vos clients. Vous attendez une réponse qui ne viendra jamais.

**Quelqu'un peut se faire passer pour vous.** Un arnaqueur peut envoyer un email à votre comptable en imitant votre adresse, lui demandant de faire un virement urgent. C'est l'arnaque au président — et elle fonctionne encore très bien en 2026.

## Ce qui se passe quand on ne fait rien

Une PME de 30 personnes nous a contactés parce que ses emails commerciaux n'arrivaient plus chez ses clients depuis 3 semaines. Personne ne s'en était rendu compte — les commerciaux pensaient simplement que les prospects ne répondaient pas. En réalité, tous leurs emails partaient en spam. Le problème ? Un réglage DNS manquant, corrigé en 15 minutes.

Une autre entreprise a découvert qu'un escroc envoyait des fausses factures à ses clients en se faisant passer pour leur service comptabilité. L'arnaque a duré 2 mois avant qu'un client méfiant ne les appelle. Là encore, un réglage DNS aurait empêché l'usurpation.

## La bonne nouvelle

Ces configurations sont **gratuites**. Ce sont des réglages à faire une seule fois chez votre hébergeur de nom de domaine (OVH, Cloudflare, IONOS, Gandi...). Ça prend entre 15 et 30 minutes quand on sait quoi faire, et ensuite c'est en place pour toujours.

Votre prestataire informatique peut s'en charger. Si vous n'en avez pas, on peut le faire avec vous.

## Par où commencer ?

Le plus simple est de vérifier où vous en êtes. Notre [outil d'audit email](/outils/audit-email) analyse votre domaine en quelques secondes et vous dit exactement ce qui est en place et ce qui manque. C'est gratuit, sans inscription, et aucune donnée n'est collectée.

Si tout est au vert, parfait. Si des points sont à corriger, vous saurez lesquels — et vous pourrez les transmettre à votre prestataire ou [nous contacter](/contact) pour qu'on s'en occupe.
`,
};
