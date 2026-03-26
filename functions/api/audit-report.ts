import { Resend } from 'resend';

interface AuditReportData {
  email: string;
  domain: string;
  wantReport: boolean;
  wantContact: boolean;
  checks: { status: string; label: string; description: string }[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitize(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

function cleanSubject(str: string): string {
  return str.replace(/[\r\n]/g, '');
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const data: AuditReportData = await request.json();

    // Sanitize inputs
    data.email = sanitize(data.email || '', 254);
    data.domain = sanitize(data.domain || '', 253);
    if (data.checks) {
      data.checks = data.checks.slice(0, 50).map(c => ({
        status: sanitize(c.status || '', 10),
        label: escapeHtml(sanitize(c.label || '', 100)),
        description: escapeHtml(sanitize(c.description || '', 500)),
      }));
    }

    if (!data.email || !data.domain) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://dahouse.fr' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://dahouse.fr' } }
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const statusIcon = (s: string) =>
      s === 'pass' ? '✅' : s === 'fail' ? '❌' : s === 'warn' ? '⚠️' : 'ℹ️';

    const statusColor = (s: string) =>
      s === 'pass' ? '#10b981' : s === 'fail' ? '#ef4444' : s === 'warn' ? '#f59e0b' : '#3b82f6';

    const checksHtml = (data.checks || [])
      .map(
        (c) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:20px;text-align:center;width:40px">${statusIcon(c.status)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
            <strong style="color:#1f2937">${c.label}</strong>
            <div style="color:#6b7280;font-size:13px;margin-top:2px">${c.description}</div>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right">
            <span style="background:${statusColor(c.status)}15;color:${statusColor(c.status)};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600">
              ${c.status === 'pass' ? 'OK' : c.status === 'fail' ? 'KO' : c.status === 'warn' ? 'Attention' : 'Info'}
            </span>
          </td>
        </tr>`
      )
      .join('');

    const requestType = [
      data.wantReport ? '📋 Rapport demandé' : '',
      data.wantContact ? '📞 Souhaite être recontacté(e)' : '',
    ]
      .filter(Boolean)
      .join(' — ');

    // Email to oscar@dahouse.fr
    const internalHtml = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center">
            <h1 style="margin:0;font-size:22px">🔍 Audit Email — ${escapeHtml(data.domain)}</h1>
            <p style="margin:8px 0 0;opacity:0.9;font-size:14px">${requestType}</p>
          </div>
          <div style="padding:24px">
            <div style="margin-bottom:20px">
              <span style="font-weight:600;color:#4b5563;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Email</span>
              <div style="color:#1f2937;font-size:15px;margin-top:4px"><a href="mailto:${escapeHtml(data.email)}" style="color:#667eea">${escapeHtml(data.email)}</a></div>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <thead><tr style="background:#f9fafb">
                <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px" colspan="2">Vérification</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Statut</th>
              </tr></thead>
              <tbody>${checksHtml}</tbody>
            </table>
          </div>
          <div style="text-align:center;padding:16px 30px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb">
            Envoyé depuis l'outil Audit Email — dahouse.fr/outils/audit-email
          </div>
        </div>
      </body></html>`;

    // Send to oscar
    await resend.emails.send({
      from: 'DAHOUSE Outils <contact@dahouse.fr>',
      to: 'oscar@dahouse.fr',
      replyTo: data.email,
      subject: cleanSubject(`[Audit Email] ${data.domain} — ${requestType}`),
      html: internalHtml,
    });

    // If user wants report, send them a copy
    if (data.wantReport) {
      const userHtml = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5">
          <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#0B0F14 0%,#1a1f2e 100%);color:white;padding:30px;text-align:center">
              <img src="https://dahouse.fr/assets/logo-original.png" alt="DAHOUSE" style="height:36px;margin-bottom:16px" />
              <h1 style="margin:0;font-size:22px">Audit de configuration email</h1>
              <p style="margin:8px 0 0;opacity:0.9;font-size:14px">Domaine : ${escapeHtml(data.domain)}</p>
            </div>
            <div style="padding:24px">
              <p style="color:#4b5563;font-size:14px;margin-bottom:20px">Voici le résultat de l'audit de configuration email de votre domaine <strong>${escapeHtml(data.domain)}</strong>.</p>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
                <thead><tr style="background:#f9fafb">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px" colspan="2">Vérification</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Statut</th>
                </tr></thead>
                <tbody>${checksHtml}</tbody>
              </table>
              <p style="color:#6b7280;font-size:13px;margin-top:20px">Des questions sur ces résultats ? Répondez directement à cet email, notre équipe se fera un plaisir de vous aider.</p>
            </div>
            <div style="text-align:center;padding:16px 30px;color:#9ca3af;font-size:11px;border-top:1px solid #e5e7eb">
              <img src="https://dahouse.fr/assets/logo-original.png" alt="DAHOUSE" style="height:18px;margin-bottom:8px;opacity:0.4" /><br/>
              Rapport généré par <a href="https://dahouse.fr/outils/audit-email" style="color:#6366f1">dahouse.fr</a> — ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </body></html>`;

      await resend.emails.send({
        from: 'DAHOUSE Outils <contact@dahouse.fr>',
        to: data.email,
        replyTo: 'oscar@dahouse.fr',
        subject: cleanSubject(`Audit email de ${data.domain} — Résultats`),
        html: userHtml,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://dahouse.fr' } }
    );
  } catch (error) {
    console.error('Audit report error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'envoi' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://dahouse.fr' } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://dahouse.fr',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
