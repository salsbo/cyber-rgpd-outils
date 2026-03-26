import { Resend } from 'resend';

interface RecapRequest {
  email: string;
  conversation: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body: RecapRequest = await request.json();

    if (!body.email || !body.conversation) {
      return new Response(
        JSON.stringify({ error: "Email et conversation requis" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const conversationHtml = body.conversation
      .split('\n\n')
      .map((line: string) => {
        const escaped = escapeHtml(line);
        if (escaped.startsWith('Vous:')) {
          return `<div style="margin-bottom:12px;padding:10px 14px;background:#f0f4ff;border-radius:12px;border-bottom-right-radius:4px;margin-left:40px;"><strong style="color:#4f46e5;">Vous</strong><br/><span style="color:#374151;">${escaped.replace('Vous: ', '')}</span></div>`;
        }
        if (escaped.startsWith('DAHOUSE:')) {
          return `<div style="margin-bottom:12px;padding:10px 14px;background:#f9fafb;border-radius:12px;border-bottom-left-radius:4px;margin-right:40px;border-left:3px solid #6366f1;"><strong style="color:#6366f1;">DAHOUSE</strong><br/><span style="color:#374151;">${escaped.replace('DAHOUSE: ', '')}</span></div>`;
        }
        return `<p style="color:#6b7280;margin-bottom:8px;">${escaped}</p>`;
      })
      .join('');

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f5f5f5;}</style></head><body>
      <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:24px 30px;text-align:center;">
          <h1 style="margin:0;font-size:20px;">Récapitulatif de votre échange</h1>
          <p style="margin:6px 0 0;opacity:0.9;font-size:14px;">DAHOUSE — Assistant IA</p>
        </div>
        <div style="padding:24px 30px;">
          <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">Voici le résumé de votre conversation avec notre assistant. Un membre de l'équipe vous recontactera prochainement pour approfondir.</p>
          ${conversationHtml}
        </div>
        <div style="text-align:center;padding:16px 30px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;">
          <p>DAHOUSE — Saint-Cloud | <a href="https://dahouse.fr" style="color:#6366f1;">dahouse.fr</a> | contact@dahouse.fr</p>
        </div>
      </div></body></html>`;

    const result = await resend.emails.send({
      from: 'DAHOUSE <contact@dahouse.fr>',
      to: body.email,
      subject: 'Votre échange avec DAHOUSE — récapitulatif',
      html: emailHtml,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return new Response(
        JSON.stringify({ error: "Erreur d'envoi" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://dahouse.fr" } }
    );
  } catch (error) {
    console.error('Recap error:', error);
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
