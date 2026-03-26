// src/content/metiers.ts

export interface Enjeu {
  icon: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

export interface Solution {
  title: string;
  description: string;
  linkTo?: string;
}

export interface Metier {
  slug: string;
  label: string;
  icon: string;
  accentColor: string;
  hero: {
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  enjeux: Enjeu[];
  solutions: Solution[];
  cta: {
    title: string;
    placeholder: string;
  };
}

export const metiers: Metier[] = [
  {
    slug: "medecin",
    label: "Médecin libéral",
    icon: "Stethoscope",
    accentColor: "sky",
    hero: {
      title: "Vos données patients",
      titleAccent: "ne peuvent pas attendre.",
      subtitle: "Télétransmission, sauvegarde, conformité HDS — on sécurise votre cabinet."
    },
    enjeux: [
      {
        icon: "ShieldCheck",
        title: "Données patients",
        description: "Sauvegarde chiffrée quotidienne, conformité HDS, accès contrôlé au dossier médical.",
        severity: "critical"
      },
      {
        icon: "Wifi",
        title: "Télétransmission",
        description: "Connexion fiable pour Sesam-Vitale, plan de reprise en cas de panne internet.",
        severity: "critical"
      },
      {
        icon: "Monitor",
        title: "Poste de travail",
        description: "Antivirus, mises à jour automatiques, verrouillage de session — votre poste est votre outil principal.",
        severity: "warning"
      },
      {
        icon: "ClipboardCheck",
        title: "Conformité réglementaire",
        description: "RGPD, HDS, traçabilité des accès — les obligations ne sont pas optionnelles.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Sauvegarde chiffrée",
        description: "Vos données patients sauvegardées chaque nuit, chiffrées, testées chaque mois.",
        linkTo: "/offres"
      },
      {
        title: "Supervision connexion",
        description: "Alerte en temps réel si votre lien internet tombe. Bascule 4G automatique.",
        linkTo: "/sentinel"
      },
      {
        title: "Sécurisation poste",
        description: "Antivirus géré, mises à jour planifiées, verrouillage USB. Sans rien toucher à vos habitudes."
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet de 3 médecins, logiciel Doctolib, NAS Synology, connexion fibre Orange..."
    }
  },
  {
    slug: "avocat",
    label: "Avocat",
    icon: "Scale",
    accentColor: "amber",
    hero: {
      title: "Vos dossiers clients",
      titleAccent: "méritent mieux qu'un NAS sous le bureau.",
      subtitle: "Confidentialité, partage sécurisé, conformité RGPD — on protège votre cabinet."
    },
    enjeux: [
      {
        icon: "Lock",
        title: "Confidentialité dossiers",
        description: "Secret professionnel = obligation. Chiffrement, accès restreint, traçabilité complète.",
        severity: "critical"
      },
      {
        icon: "FolderLock",
        title: "Stockage & partage",
        description: "Partager des pièces avec un client sans WeTransfer ni clé USB. Sécurisé, traçable.",
        severity: "critical"
      },
      {
        icon: "MailCheck",
        title: "Messagerie sécurisée",
        description: "Emails chiffrés, anti-phishing, protection contre l'usurpation d'identité.",
        severity: "warning"
      },
      {
        icon: "FileCheck",
        title: "Conformité RGPD",
        description: "Registre de traitement, durées de conservation, droit d'accès — tout doit être carré.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Coffre-fort numérique",
        description: "Stockage chiffré avec partage par lien sécurisé. Vos clients accèdent à leurs documents, rien de plus.",
        linkTo: "/offres"
      },
      {
        title: "Messagerie protégée",
        description: "Anti-spam, anti-phishing, chiffrement TLS. Vos échanges restent confidentiels.",
        linkTo: "/offres"
      },
      {
        title: "Supervision accès",
        description: "Qui a accédé à quoi, quand. Journal d'audit complet pour votre conformité.",
        linkTo: "/sentinel"
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet individuel, 2 collaborateurs, RPVA, serveur local, échanges par email..."
    }
  },
  {
    slug: "commerce",
    label: "Commerce & artisanat",
    icon: "Store",
    accentColor: "orange",
    hero: {
      title: "Votre caisse plante ?",
      titleAccent: "Vos clients ne vont pas attendre.",
      subtitle: "TPE, Wi-Fi, commandes en ligne — on fiabilise votre outil de travail."
    },
    enjeux: [
      {
        icon: "CreditCard",
        title: "Caisse & TPE",
        description: "Terminal de paiement, logiciel de caisse, connexion — si l'un tombe, vous ne vendez plus.",
        severity: "critical"
      },
      {
        icon: "WifiHigh",
        title: "Wi-Fi client",
        description: "Un Wi-Fi fiable pour vos clients et séparé de votre réseau pro. Obligatoire.",
        severity: "warning"
      },
      {
        icon: "Globe",
        title: "Site & commandes",
        description: "Click & collect, prise de commande en ligne — votre vitrine numérique doit tourner.",
        severity: "warning"
      },
      {
        icon: "Camera",
        title: "Vidéosurveillance",
        description: "Caméras IP, enregistrement local ou cloud, accès distant sécurisé.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Réseau fiable",
        description: "Wi-Fi pro séparé du Wi-Fi client, bascule 4G automatique, zéro interruption.",
        linkTo: "/offres"
      },
      {
        title: "Supervision caisse",
        description: "Alerte si votre TPE ou votre caisse ne répond plus. Intervention rapide.",
        linkTo: "/sentinel"
      },
      {
        title: "Site web & commandes",
        description: "Application de prise de commande adaptée à votre activité. Simple, rapide, fiable.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre commerce en quelques lignes.",
      placeholder: "Ex : boulangerie, 2 points de vente, caisse Lightspeed, click & collect, Wi-Fi client..."
    }
  },
  {
    slug: "immobilier",
    label: "Immobilier",
    icon: "House",
    accentColor: "emerald",
    hero: {
      title: "Vos mandats sont partout.",
      titleAccent: "Vos outils devraient suivre.",
      subtitle: "CRM, signature électronique, multi-agences — on connecte votre activité."
    },
    enjeux: [
      {
        icon: "BarChart3",
        title: "CRM & mandats",
        description: "Gestion des biens, suivi acquéreurs, pipeline de vente — tout dans un seul outil.",
        severity: "critical"
      },
      {
        icon: "Building2",
        title: "Multi-agences",
        description: "Plusieurs sites, une seule base. Accès distant sécurisé, données synchronisées.",
        severity: "critical"
      },
      {
        icon: "PenTool",
        title: "Signature électronique",
        description: "Compromis, baux, mandats — signez à distance en toute conformité.",
        severity: "warning"
      },
      {
        icon: "ScanEye",
        title: "Visites virtuelles",
        description: "Photos HDR, visites 360° — votre vitrine en ligne doit être irréprochable.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Apps métier connectées",
        description: "CRM, signature, diffusion annonces — on intègre vos outils pour qu'ils se parlent.",
        linkTo: "/offres"
      },
      {
        title: "Interconnexion agences",
        description: "VPN sécurisé entre vos sites, accès distant pour les agents terrain.",
        linkTo: "/offres"
      },
      {
        title: "Supervision réseau",
        description: "Chaque agence supervisée. Alerte et intervention avant que ça impacte vos ventes.",
        linkTo: "/sentinel"
      }
    ],
    cta: {
      title: "Décrivez votre agence en quelques lignes.",
      placeholder: "Ex : 3 agences, logiciel Apimo, 8 négociateurs terrain, signature Yousign..."
    }
  },
  {
    slug: "comptable",
    label: "Expert-comptable",
    icon: "Calculator",
    accentColor: "violet",
    hero: {
      title: "Vos clients vous confient leurs chiffres.",
      titleAccent: "Pas le droit à l'erreur.",
      subtitle: "Archivage légal, échanges sécurisés, PRA — on protège votre cabinet."
    },
    enjeux: [
      {
        icon: "ShieldAlert",
        title: "Échanges sécurisés",
        description: "Vos clients vous envoient des bulletins de paie par email. C'est un problème.",
        severity: "critical"
      },
      {
        icon: "Archive",
        title: "Archivage légal",
        description: "10 ans de conservation minimum. Intégrité, horodatage, accès contrôlé.",
        severity: "critical"
      },
      {
        icon: "Server",
        title: "Logiciel hébergé",
        description: "Cegid, Sage, ACD — en local ou en cloud, la disponibilité est non négociable.",
        severity: "warning"
      },
      {
        icon: "RotateCcw",
        title: "Plan de reprise",
        description: "Si votre serveur tombe en période fiscale, combien de temps pouvez-vous attendre ?",
        severity: "warning"
      }
    ],
    solutions: [
      {
        title: "Portail client sécurisé",
        description: "Échange de documents chiffré. Fini les pièces jointes sensibles par email.",
        linkTo: "/offres"
      },
      {
        title: "Sauvegarde certifiée",
        description: "Archivage conforme, restauration testée, historique complet sur 10 ans.",
        linkTo: "/offres"
      },
      {
        title: "PRA en 4 heures",
        description: "Plan de reprise d'activité : votre cabinet repart en moins de 4 heures.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre cabinet en quelques lignes.",
      placeholder: "Ex : cabinet 12 collaborateurs, Cegid en local, 800 dossiers, serveur vieillissant..."
    }
  },
  {
    slug: "collectivite",
    label: "Collectivité & association",
    icon: "Landmark",
    accentColor: "blue",
    hero: {
      title: "Budget serré.",
      titleAccent: "Exigences maximales.",
      subtitle: "Données citoyens, accessibilité, multi-sites — on adapte les solutions à vos moyens."
    },
    enjeux: [
      {
        icon: "Users",
        title: "Données citoyens",
        description: "État civil, listes électorales, aides sociales — des données sensibles à protéger.",
        severity: "critical"
      },
      {
        icon: "Network",
        title: "Multi-sites",
        description: "Mairie, annexes, associations — interconnecter sans exploser le budget.",
        severity: "warning"
      },
      {
        icon: "Accessibility",
        title: "Accessibilité RGAA",
        description: "Vos services en ligne doivent être accessibles à tous. Obligation légale.",
        severity: "warning"
      },
      {
        icon: "PiggyBank",
        title: "Budget contraint",
        description: "Chaque euro compte. Les solutions doivent être dimensionnées, pas surdimensionnées.",
        severity: "info"
      }
    ],
    solutions: [
      {
        title: "Mutualisation",
        description: "Partage d'infrastructure entre services ou communes. Plus fiable, moins cher.",
        linkTo: "/offres"
      },
      {
        title: "Supervision centralisée",
        description: "Un tableau de bord pour tous vos sites. Alertes, état du réseau, interventions.",
        linkTo: "/sentinel"
      },
      {
        title: "Conformité RGPD",
        description: "Registre, DPO externalisé, sensibilisation agents — on vous accompagne.",
        linkTo: "/offres"
      }
    ],
    cta: {
      title: "Décrivez votre structure en quelques lignes.",
      placeholder: "Ex : commune 5 000 hab., 3 sites, 40 postes, pas d'informaticien en interne..."
    }
  }
];

export function getMetierBySlug(slug: string): Metier | undefined {
  return metiers.find((m) => m.slug === slug);
}
