# Guide SEO - DAHOUSE.fr

## ✅ Optimisations SEO mises en place

### 1. Fichiers SEO de base

#### sitemap.xml (public/sitemap.xml)
- ✅ Sitemap XML complet avec toutes les pages
- ✅ Priorités définies (Homepage: 1.0, Offres: 0.8, etc.)
- ✅ Fréquences de mise à jour (weekly, monthly, yearly)
- 📍 Accessible sur: https://dahouse.fr/sitemap.xml

#### robots.txt (public/robots.txt)
- ✅ Permet l'indexation complète du site
- ✅ Référence le sitemap
- ✅ Bloque les dossiers techniques (_next, api, functions)
- 📍 Accessible sur: https://dahouse.fr/robots.txt

### 2. Metadata optimisées

#### Balises meta principales (src/app/layout.tsx)
- ✅ **Title template** : Permet des titres personnalisés par page
- ✅ **Description** : Optimisée avec mots-clés pertinents
- ✅ **Keywords** : applications métier, IoT, supervision, transformation digitale, etc.
- ✅ **metadataBase** : URL canonique du site
- ✅ **Robots directives** : Index + Follow activés

#### Open Graph (partage réseaux sociaux)
- ✅ Type: website
- ✅ Locale: fr_FR
- ✅ URL canonique
- ✅ Images partagées (logo)
- ✅ Title & Description optimisés

#### Twitter Cards
- ✅ Format: summary_large_image
- ✅ Title & Description
- ✅ Image de preview

### 3. Données structurées (JSON-LD)

#### Composant StructuredData (src/components/seo/StructuredData.tsx)

**Organization Schema**:
- Nom: DAHOUSE
- URL: https://dahouse.fr
- Logo
- Adresse (Paris, France)
- Contact: contact@dahouse.fr

**Service Schema**:
- Type: Développement de logiciels et conseil IT
- 4 services catalogués:
  1. Applications métier sur-mesure
  2. Conseil & cadrage
  3. Supervision & maintien opérationnel
  4. Objets connectés (IoT)

**WebSite Schema**:
- Nom du site
- URL
- SearchAction (pour Google)

### 4. Optimisations techniques

#### Performance
- ✅ Static export Next.js (ultra-rapide)
- ✅ Images optimisées (unoptimized pour static)
- ✅ Fonts Google optimisées (Inter, Sora, JetBrains Mono)
- ✅ CSS-in-JS avec Tailwind (purge automatique)

#### Accessibilité & SEO
- ✅ Langue déclarée: `<html lang="fr">`
- ✅ Scroll smooth pour l'UX
- ✅ Semantic HTML (nav, main, footer, etc.)
- ✅ Alt text sur les images

### 5. Google Analytics
- ✅ GA4 configuré: G-RTCVK15RF0
- ✅ Cookie consent RGPD compliant
- ✅ Chargement conditionnel (après consentement)

---

## 📊 Prochaines étapes recommandées

### 1. Google Search Console
**Importance**: ⭐⭐⭐⭐⭐

1. Aller sur [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `dahouse.fr`
3. Vérifier la propriété (DNS ou fichier HTML)
4. Soumettre le sitemap: `https://dahouse.fr/sitemap.xml`

**Bénéfices**:
- Voir les performances de recherche
- Identifier les erreurs d'indexation
- Surveiller les Core Web Vitals
- Recevoir des alertes Google

### 2. Vérifier l'indexation
**Commande Google**:
```
site:dahouse.fr
```
Permet de voir toutes les pages indexées par Google.

### 3. Tester les données structurées
**Outil Google**:
- [Rich Results Test](https://search.google.com/test/rich-results)
- Tester l'URL: https://dahouse.fr
- Vérifier que les 3 schemas (Organization, Service, WebSite) sont détectés

### 4. Optimisations avancées (optionnel)

#### A. Ajouter une image OpenGraph dédiée
Créer une image 1200x630px avec:
- Logo DAHOUSE
- Slogan: "Des systèmes utiles. Qui tournent."
- Visuel moderne et pro

Puis mettre à jour `src/app/layout.tsx`:
```typescript
images: [
  {
    url: "/og-image.png",
    width: 1200,
    height: 630,
  }
]
```

#### B. Créer un blog (SEO long terme)
- Dossier `/blog` avec articles techniques
- Topics: IoT, transformation digitale, best practices
- Génère du trafic organique à long terme

#### C. Backlinks
- Être référencé sur des annuaires IT français
- Participer à des événements tech (avec lien retour)
- Collaborations avec partenaires

#### D. Schema Article pour les use cases
Transformer la section "Use Cases" en articles structurés avec schema Article.

---

## 🔍 Outils de vérification SEO

### Gratuits
1. **Google Search Console** (indispensable)
2. **Google Analytics** (déjà installé)
3. **PageSpeed Insights** : https://pagespeed.web.dev/
4. **Google Rich Results Test** : https://search.google.com/test/rich-results
5. **Lighthouse** (intégré dans Chrome DevTools)

### Payants (optionnel)
1. **Ahrefs** - Audit SEO complet
2. **SEMrush** - Analyse concurrence + keywords
3. **Screaming Frog** - Crawl technique du site

---

## 📈 Métriques à suivre

### Core Web Vitals (Google)
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1

### Trafic
- Visiteurs uniques / mois
- Pages vues
- Taux de rebond
- Durée moyenne session

### Conversions
- Nombre de contacts via formulaire
- Taux de conversion formulaire
- Pages les plus visitées avant contact

---

## ✅ Checklist déploiement SEO

- [x] sitemap.xml créé
- [x] robots.txt créé
- [x] Metadata optimisées
- [x] OpenGraph configuré
- [x] Twitter Cards configurées
- [x] Structured Data (JSON-LD) ajoutées
- [x] Google Analytics configuré
- [ ] Google Search Console configuré (à faire)
- [ ] Sitemap soumis à Google (à faire)
- [ ] Tester avec Rich Results Test (à faire)
- [ ] Vérifier indexation avec site:dahouse.fr (à faire)

---

**Le SEO technique est maintenant optimal !** 🚀

La prochaine étape cruciale est de **configurer Google Search Console** et de **soumettre le sitemap**.
