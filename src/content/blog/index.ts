export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number;
  content: string;
}

// Import all posts
import { post as spfDkimDmarc } from "./spf-dkim-dmarc-guide-pme";
import { post as faillePme } from "./5-failles-securite-pme";
import { post as wifiPro } from "./wifi-pro-vs-box";
import { post as fibreFtth } from "./passer-fibre-ftth-entreprise";
import { post as sauvegardeRansomware } from "./sauvegarde-ransomware-guide-pme";
import { post as risquesCyber } from "./risques-cyber-pme-2026";
import { post as budgetIt } from "./budget-it-pme-dirigeant";
import { post as digitaliser } from "./digitaliser-processus-manuels-pme";
import { post as commentPirates } from "./comment-les-pirates-attaquent-pme";

// Export sorted by date (newest first)
export const blogPosts: BlogPost[] = [
  spfDkimDmarc,
  faillePme,
  wifiPro,
  fibreFtth,
  sauvegardeRansomware,
  risquesCyber,
  budgetIt,
  digitaliser,
  commentPirates,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const categories = [
  { slug: "securite-email", label: "Sécurité email" },
  { slug: "cybersecurite", label: "Cybersécurité" },
  { slug: "reseau", label: "Réseau & Wi-Fi" },
  { slug: "productivite", label: "Productivité" },
] as const;
