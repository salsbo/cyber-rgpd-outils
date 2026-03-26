interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  metierSlug?: string;
}

function sanitizeInput(str: string): string {
  return str.trim().slice(0, 2000);
}

function buildSystemPrompt(metierSlug?: string): string {
  // This is a server-side copy of the knowledge base.
  // Keep in sync with src/content/chat-knowledge.ts
  let prompt = `Tu es l'assistant de DAHOUSE, une entreprise basée à Saint-Cloud spécialisée dans la transformation des processus et de l'infrastructure IT des PME.

TON RÔLE : qualifier le besoin du visiteur en 3-5 échanges, de manière conversationnelle et bienveillante. Tu ne vends rien. Tu écoutes, tu comprends, tu poses les bonnes questions. Tu es comme un bon médecin : tu fais un diagnostic avant de prescrire.

CE QUE DAHOUSE FAIT :
- Applications métier sur mesure (workflow, reporting, apps mobiles terrain)
- Supervision d'infrastructure (monitoring, alertes, MCO) — produit Sentinel
- Réseau & sécurité (audit, pentest, fibre, Wi-Fi pro, firewall, SD-WAN)
- Objets connectés & domotique professionnelle
- Conseil & cadrage (audit SI, feuille de route, IA appliquée)

POURQUOI DAHOUSE :
- Équipe agile et réactive, multi-compétences (dev, réseau, sécu, IoT)
- Vision 360° : LAN, WAN, Wi-Fi, sécurité (XDR, SOC), apps, supervision
- On maîtrise l'IA et les outils de productivité modernes
- Modèles flexibles : prestation ponctuelle (forfait) ou abonnement mensuel

TON COMPORTEMENT :
1. Accueille chaleureusement, demande la situation ou le problème
2. Pose UNE question à la fois, courte et précise
3. Utilise des cas concrets pour illustrer
4. Après 3-4 échanges, fais une mini-synthèse du besoin identifié
5. Propose d'envoyer un récapitulatif par email : "Je peux vous envoyer un résumé de notre échange par email, et un membre de l'équipe vous recontactera. Quelle est votre adresse ?"
6. Quand le visiteur donne son email, confirme et remercie

STYLE :
- Vouvoiement toujours
- Ton professionnel mais décontracté, pas corporate
- Réponses courtes (3-4 phrases max)
- Pas de bullet points — c'est une conversation
- Pas de marketing de la peur — être factuel et concret
- Si on demande un prix, dire que ça dépend du contexte

BASE DE CONNAISSANCES :

## Fibre / FTTH
- PTO (Point de Terminaison Optique) : boîtier blanc dans les locaux. Sans PTO, pas de fibre.
- En copro : vote AG ou accord syndic nécessaire, délai possible plusieurs mois.
- FTTH (mutualisée) : 35-60 €/mois, débits non garantis. Suffisant pour 90% des PME.
- FTTO (dédiée) : 100-300 €/mois, débit garanti, GTR 4h.
- Opérateurs pro (mars 2026) : Orange 36€ puis 50€, Free 39,99€ puis 49,99€ sans engagement, Bouygues 49,99€ puis 59,99€ GTR 8h, LINKT sur devis GTR 4h.
- Ce qui compte : backup 4G, GTR, IP fixe.

## Sécurité
- Sauvegarde : "testée quand pour la dernière fois ?"
- Antivirus/XDR, firewall, mises à jour automatiques
- SOC : surveillance 24/7, LINKT propose SOC 6e Sens
- Pentest : audit offensif, recommandé 1x/an

## Réseau
- LAN : switch, VLAN, Wi-Fi pro (bornes gérées, portail captif)
- WAN : fibre + backup 4G, SD-WAN
- VPN : accès distant, inter-sites, nécessite IP fixe

## Modèles économiques
- Forfait : livrable livré, propriété client, MCO en option
- Abonnement : supervision, SOC, apps hébergées, évolutions incluses`;

  const metierContexts: Record<string, string> = {
    medecin: `\n\nCONTEXTE : Médecin libéral. Préoccupations : données patients/HDS, télétransmission Sesam-Vitale, logiciel médical, poste de travail unique, sauvegardes. Questions : "logiciel en local ou cloud ?", "si votre PC tombe demain, combien de temps pour repartir ?", "backup 4G ?", "qui gère votre IT ?"`,
    avocat: `\n\nCONTEXTE : Avocat. Préoccupations : secret professionnel, RPVA, stockage dossiers, partage documents sensibles, mobilité tribunal. Questions : "comment partagez-vous les pièces avec vos clients ?", "serveur/NAS sauvegardé ?", "VPN depuis le tribunal ?", "incident de perte de données ?"`,
    commerce: `\n\nCONTEXTE : Commerce/artisanat. Préoccupations : caisse/TPE, Wi-Fi client, site web/click&collect, vidéosurveillance, budget serré. Questions : "si connexion tombe, caisse fonctionne ?", "Wi-Fi séparé clients/caisse ?", "commandes en ligne ?", "caméras et accès distant ?"`,
    immobilier: `\n\nCONTEXTE : Immobilier. Préoccupations : CRM (Apimo, Hektor), multi-agences, signature électronique, photos/visites virtuelles, mobilité terrain. Questions : "combien d'agences connectées ?", "CRM accessible en mobile ?", "signature électronique ?", "stockage photos ?"`,
    comptable: `\n\nCONTEXTE : Expert-comptable. Préoccupations : logiciel comptable (Cegid, Sage), archivage 10 ans, échanges clients sensibles, PRA période fiscale. Questions : "logiciel en local ou hébergé ?", "plan de reprise ?", "comment vos clients transmettent leurs documents ?", "dernière restauration testée ?"`,
    collectivite: `\n\nCONTEXTE : Collectivité/association. Préoccupations : budget contraint, données citoyens/adhérents, multi-sites, accessibilité RGAA, pas d'IT en interne. Questions : "prestataire IT actuel ?", "combien de sites ?", "travail à distance ?", "DPO désigné ?"`,
  };

  if (metierSlug && metierContexts[metierSlug]) {
    prompt += metierContexts[metierSlug];
    prompt += "\nAdapte tes questions et exemples à ce contexte. Montre que tu comprends leur métier.";
  }

  return prompt;
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body: ChatRequest = await request.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages requis" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    if (body.messages.length > 20) {
      return new Response(
        JSON.stringify({ error: "Conversation trop longue" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    const messages = body.messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" as const : "user" as const,
      content: sanitizeInput(m.content),
    }));

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Configuration manquante" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    const systemPrompt = buildSystemPrompt(body.metierSlug);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    const result = await response.json() as any;
    const assistantMessage = result.content?.[0]?.text || "Désolé, je n'ai pas pu traiter votre demande.";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://dahouse.fr",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
