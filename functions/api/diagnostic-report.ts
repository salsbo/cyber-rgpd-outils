import { Resend } from 'resend';

function corsOrigin(request: Request): string {
  const origin = request.headers.get("Origin") || "";
  const allowed = ["https://dahouse.fr", "https://outils.cyber-rgpd.com"];
  return allowed.includes(origin) ? origin : allowed[0];
}

interface DiagnosticReportData {
  email: string;
  grade: string;
  globalScore: number;
  connectionType: string;
  downloadMbps: number;
  categories: { label: string; score: number; color: string }[];
  recommendations: {
    category: string;
    status: string;
    title: string;
    finding: string;
    implication: string;
    effort: string;
    cost: string;
  }[];
}

const LOGO_URL = 'https://dahouse.fr/assets/logo-original.png';

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', E: '#ef4444', F: '#dc2626',
};

const GRADE_LABELS: Record<string, string> = {
  A: 'Excellent', B: 'Bon', C: 'Correct', D: 'Moyen', E: 'Faible', F: 'Critique',
};

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
  const { request, env } = context;
  try {
    const data: DiagnosticReportData = await request.json();

    // Sanitize inputs
    data.email = sanitize(data.email || '', 254);
    data.grade = sanitize(data.grade || '', 1);
    if (data.categories) {
      data.categories = data.categories.slice(0, 20).map(c => ({
        label: escapeHtml(sanitize(c.label || '', 100)),
        score: Math.min(Math.max(Math.round(c.score || 0), 0), 100),
        color: sanitize(c.color || '', 20),
      }));
    }
    if (data.recommendations) {
      data.recommendations = data.recommendations.slice(0, 30).map(r => ({
        category: escapeHtml(sanitize(r.category || '', 100)),
        status: sanitize(r.status || '', 20),
        title: escapeHtml(sanitize(r.title || '', 200)),
        finding: escapeHtml(sanitize(r.finding || '', 500)),
        implication: escapeHtml(sanitize(r.implication || '', 500)),
        effort: escapeHtml(sanitize(r.effort || '', 100)),
        cost: escapeHtml(sanitize(r.cost || '', 100)),
      }));
    }

    if (!data.email || !data.grade) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin(request) } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin(request) } }
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const gradeColor = GRADE_COLORS[data.grade] || '#6b7280';
    const gradeLabel = GRADE_LABELS[data.grade] || '';
    const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    const statusIcon = (s: string) => s === 'good' ? '✅' : s === 'warning' ? '⚠️' : '🔴';
    const statusColor = (s: string) => s === 'good' ? '#10b981' : s === 'warning' ? '#f59e0b' : '#ef4444';

    // Category scores HTML
    const categoriesHtml = data.categories.map(c => {
      const barColor = c.score >= 70 ? '#10b981' : c.score >= 40 ? '#f59e0b' : '#ef4444';
      return `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#1f2937">${c.label}</td>
          <td style="padding:8px 12px;width:200px">
            <div style="background:#f3f4f6;border-radius:8px;height:12px;overflow:hidden">
              <div style="background:${barColor};height:100%;width:${c.score}%;border-radius:8px"></div>
            </div>
          </td>
          <td style="padding:8px 12px;font-weight:700;color:${barColor};text-align:right;font-size:14px">${c.score}/100</td>
        </tr>`;
    }).join('');

    // Recommendations HTML
    const recsHtml = data.recommendations.map(rec => `
      <div style="border:1px solid ${statusColor(rec.status)}30;border-radius:8px;padding:16px;margin-bottom:12px;background:${statusColor(rec.status)}08">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">${statusIcon(rec.status)}</span>
          <span style="font-size:11px;background:#f3f4f6;padding:2px 8px;border-radius:12px;color:#6b7280">${rec.category}</span>
          <strong style="color:#1f2937;font-size:14px">${rec.title}</strong>
        </div>
        <p style="color:#4b5563;font-size:13px;margin:4px 0">${rec.finding}</p>
        <table style="width:100%;margin-top:12px;border-collapse:collapse">
          <tr>
            <td style="padding:8px;background:#f9fafb;border-radius:6px;vertical-align:top;width:33%">
              <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Impact</div>
              <div style="font-size:12px;color:#374151">${rec.implication}</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:8px;background:#f9fafb;border-radius:6px;vertical-align:top;width:33%">
              <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Effort</div>
              <div style="font-size:12px;color:#374151">${rec.effort}</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:8px;background:#f9fafb;border-radius:6px;vertical-align:top;width:33%">
              <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Budget estimé</div>
              <div style="font-size:12px;color:#374151">${rec.cost}</div>
            </td>
          </tr>
        </table>
      </div>
    `).join('');

    // DPE visual using tables (email-compatible, no flex)
    const dpeGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
    const dpeHtml = dpeGrades.map((g, i) => {
      const isActive = g === data.grade;
      const color = GRADE_COLORS[g];
      const width = 35 + i * 10;
      return `<tr>
        <td style="padding:2px 0">
          <table cellpadding="0" cellspacing="0" style="width:${width}%"><tr>
            <td style="height:28px;background:${isActive ? color : color + '30'};border-radius:0 6px 6px 0;padding:0 12px;font-weight:700;font-size:14px;color:${isActive ? 'white' : '#9ca3af'}">${g}</td>
          </tr></table>
        </td>
        <td style="padding:2px 8px;font-weight:700;color:${isActive ? color : 'transparent'};font-size:13px">${isActive ? `◀ ${gradeLabel}` : ''}</td>
      </tr>`;
    }).join('');

    const criticalCount = data.recommendations.filter((r: any) => r.status === 'critical').length;
    const warningCount = data.recommendations.filter((r: any) => r.status === 'warning').length;

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5">
        <div style="max-width:640px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">

          <!-- Header with logo -->
          <div style="background:linear-gradient(135deg,#0B0F14 0%,#1a1f2e 100%);color:white;padding:30px;text-align:center">
            <img src="${LOGO_URL}" alt="DAHOUSE" style="height:40px;margin-bottom:16px" />
            <h1 style="margin:0;font-size:22px;font-weight:700">Diagnostic IT 360°</h1>
            <p style="margin:8px 0 0;opacity:0.7;font-size:14px">${date}</p>
          </div>

          <div style="padding:30px">

            <!-- Introduction text -->
            <p style="font-size:15px;color:#1f2937;line-height:1.6;margin-bottom:8px">Bonjour,</p>
            <p style="font-size:14px;color:#4b5563;line-height:1.6;margin-bottom:8px">
              Voici les résultats de votre diagnostic IT réalisé sur <a href="https://dahouse.fr/outils/diagnostic" style="color:#6366f1">dahouse.fr</a>.
              Votre infrastructure informatique a été évaluée sur 5 domaines : connectivité, sécurité, sauvegarde, support et applications.
            </p>
            <p style="font-size:14px;color:#4b5563;line-height:1.6;margin-bottom:24px">
              ${criticalCount > 0
                ? `<strong style="color:#ef4444">${criticalCount} point${criticalCount > 1 ? 's' : ''} critique${criticalCount > 1 ? 's' : ''}</strong> ${criticalCount > 1 ? 'ont été identifiés' : 'a été identifié'} et ${warningCount > 0 ? `${warningCount} point${warningCount > 1 ? 's' : ''} d'attention` : 'aucun point d\'attention supplémentaire'}.`
                : warningCount > 0
                  ? `${warningCount} point${warningCount > 1 ? 's' : ''} d'amélioration ${warningCount > 1 ? 'ont été identifiés' : 'a été identifié'}. Pas de point critique.`
                  : 'Votre infrastructure est bien gérée. Aucun point critique identifié.'
              }
              Retrouvez ci-dessous le détail avec nos recommandations.
            </p>

            <!-- DPE -->
            <h2 style="font-size:16px;color:#1f2937;margin-bottom:16px">Votre étiquette informatique</h2>
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:8px">
              ${dpeHtml}
            </table>
            <p style="text-align:center;margin:20px 0;color:#4b5563">Score global : <strong style="font-size:20px;color:#1f2937">${data.globalScore}/100</strong></p>

            <!-- Connection -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#166534">
              Connexion détectée : <strong>${data.connectionType === 'adsl' ? 'ADSL' : 'Fibre'}</strong> (~${data.downloadMbps} Mbps)
            </div>

            <!-- Categories -->
            <h2 style="font-size:16px;color:#1f2937;margin-bottom:12px">Score par domaine</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              ${categoriesHtml}
            </table>

            <!-- Recommendations -->
            <h2 style="font-size:16px;color:#1f2937;margin-bottom:12px">Rapport détaillé</h2>
            ${recsHtml}

            <!-- CTA -->
            <div style="text-align:center;margin-top:30px;padding:24px;background:#f8fafc;border-radius:8px">
              <p style="color:#4b5563;font-size:14px;margin:0 0 16px">Vous souhaitez approfondir ce diagnostic ?</p>
              <a href="https://dahouse.fr/contact" style="display:inline-block;background:#6366f1;color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:14px">
                Demander un audit IT sur mesure →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:16px 30px;color:#9ca3af;font-size:11px;border-top:1px solid #e5e7eb">
            <img src="${LOGO_URL}" alt="DAHOUSE" style="height:20px;margin-bottom:8px;opacity:0.5" /><br/>
            Rapport généré par <a href="https://dahouse.fr/outils/diagnostic" style="color:#6366f1">dahouse.fr</a> — ${date}
          </div>
        </div>
      </body></html>`;

    // Send to user
    await resend.emails.send({
      from: 'DAHOUSE Diagnostic <contact@dahouse.fr>',
      to: data.email,
      replyTo: 'oscar@dahouse.fr',
      subject: cleanSubject(`Votre Diagnostic IT 360° — Note ${data.grade} (${data.globalScore}/100)`),
      html,
    });

    // Copy to oscar
    await resend.emails.send({
      from: 'DAHOUSE Diagnostic <contact@dahouse.fr>',
      to: 'oscar@dahouse.fr',
      replyTo: data.email,
      subject: cleanSubject(`[Diagnostic IT] ${data.email} — Note ${data.grade} (${data.globalScore}/100)`),
      html,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin(request) } }
    );
  } catch (error) {
    console.error('Diagnostic report error:', error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi" }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin(request) } }
    );
  }
}

export async function onRequestOptions(context: any) {
  const { request } = context;
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
