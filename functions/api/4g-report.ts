import { Resend } from 'resend';

function corsOrigin(request: Request): string {
  const origin = request.headers.get("Origin") || "";
  const allowed = ["https://dahouse.fr", "https://outils.cyber-rgpd.com"];
  return allowed.includes(origin) ? origin : allowed[0];
}

interface Report4GData {
  email: string;
  reference: string;
  location: string;
  platform: string;
  rsrp: number;
  sinr: number;
  rsrq: number | null;
  rsrpGrade: string;
  sinrGrade: string;
  rsrqGrade: string | null;
  overall: string;
}

const LOGO_URL = 'https://dahouse.fr/assets/logo-original.png';

const GRADE_COLORS: Record<string, string> = {
  excellent: '#10b981',
  bon: '#3b82f6',
  juste: '#f59e0b',
  pauvre: '#ef4444',
};

const GRADE_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  bon: 'Bon',
  juste: 'Juste',
  pauvre: 'Pauvre',
};

const CONNECTIVITY: Record<string, string> = {
  excellent: 'Vitesses rapides sans perte. Conditions idéales pour tous les usages (visio, cloud, VoIP).',
  bon: 'Vitesses rapides, connexion fiable. Convient pour la plupart des usages professionnels.',
  juste: 'Connexion fonctionnelle mais latence plus longue. Débits corrects, quelques ralentissements possibles en visio.',
  pauvre: 'Vitesses très réduites, déconnexions régulières. Peut ne pas maintenir une connexion stable.',
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
    const data: Report4GData = await request.json();

    // Sanitize inputs
    data.email = sanitize(data.email || '', 254);
    data.reference = sanitize(data.reference || '', 200);

    if (!data.email || !data.rsrp || !data.sinr || !data.overall) {
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
    const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const overallColor = GRADE_COLORS[data.overall] || '#6b7280';
    const overallLabel = GRADE_LABELS[data.overall] || data.overall;
    const locationLabel = data.location === 'outdoor' ? 'Extérieur' : 'Intérieur';
    const platformLabel = data.platform === 'android' ? 'Android' : 'iPhone';
    const refLabel = escapeHtml(data.reference || 'Non renseignée');

    function gradeCell(grade: string) {
      const color = GRADE_COLORS[grade] || '#6b7280';
      const label = GRADE_LABELS[grade] || grade;
      return `<span style="background:${color}15;color:${color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">${label}</span>`;
    }

    // Reference grid
    const gridRows = [
      { rsrp: '≥ −84', rsrq: '≥ −5', sinr: '≥ 12,5', grade: 'excellent' },
      { rsrp: '−85 à −102', rsrq: '−5 à −9', sinr: '12 à 10', grade: 'bon' },
      { rsrp: '−103 à −111', rsrq: '−9 à −12', sinr: '10 à 7', grade: 'juste' },
      { rsrp: '≤ −112', rsrq: '≤ −12', sinr: '≤ 7', grade: 'pauvre' },
    ];

    const gridHtml = gridRows.map(row => {
      const isActive = row.grade === data.overall;
      const color = GRADE_COLORS[row.grade];
      const label = GRADE_LABELS[row.grade];
      return `<tr style="${isActive ? `background:${color}10` : ''}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1f2937;font-family:monospace">${row.rsrp}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1f2937;font-family:monospace">${row.rsrq}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1f2937;font-family:monospace">${row.sinr}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">
          <span style="background:${color}15;color:${color};padding:3px 10px;border-radius:16px;font-size:11px;font-weight:600${isActive ? ';outline:2px solid ' + color : ''}">${label}</span>
        </td>
      </tr>`;
    }).join('');

    // RSRQ row (optional)
    const rsrqRow = data.rsrq !== null && data.rsrqGrade ? `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
          <strong style="color:#1f2937;font-size:14px">RSRQ</strong>
          <div style="color:#6b7280;font-size:12px">Qualité du signal</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;font-family:monospace;font-size:15px;color:#1f2937">${data.rsrq} dB</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right">${gradeCell(data.rsrqGrade)}</td>
      </tr>` : '';

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5">
        <div style="max-width:640px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">

          <!-- Header with logo -->
          <div style="background:linear-gradient(135deg,#0B0F14 0%,#1a1f2e 100%);color:white;padding:30px;text-align:center">
            <img src="${LOGO_URL}" alt="DAHOUSE" style="height:40px;margin-bottom:16px" />
            <h1 style="margin:0;font-size:22px;font-weight:700">Test de réception 4G</h1>
            <p style="margin:8px 0 0;opacity:0.7;font-size:14px">${date}</p>
          </div>

          <div style="padding:30px">

            <!-- Context -->
            <table style="width:100%;margin-bottom:24px;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Référence</td>
                <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:600">${refLabel}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px">Localisation</td>
                <td style="padding:8px 0;color:#1f2937;font-size:14px">${locationLabel}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px">Téléphone</td>
                <td style="padding:8px 0;color:#1f2937;font-size:14px">${platformLabel}</td>
              </tr>
            </table>

            <!-- Overall grade -->
            <div style="text-align:center;padding:24px;background:${overallColor}08;border:2px solid ${overallColor}30;border-radius:12px;margin-bottom:24px">
              <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Qualité globale</p>
              <p style="font-size:36px;font-weight:800;color:${overallColor};margin:0">${overallLabel}</p>
              <p style="font-size:13px;color:#4b5563;margin:12px 0 0;max-width:400px;display:inline-block">${CONNECTIVITY[data.overall] || ''}</p>
            </div>

            <!-- Detail per indicator -->
            <h2 style="font-size:16px;color:#1f2937;margin-bottom:12px">Détail des mesures</h2>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px">
              <thead><tr style="background:#f9fafb">
                <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Indicateur</th>
                <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Valeur</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Qualité</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
                    <strong style="color:#1f2937;font-size:14px">RSRP</strong>
                    <div style="color:#6b7280;font-size:12px">Puissance du signal</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;font-family:monospace;font-size:15px;color:#1f2937">${data.rsrp} dBm</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right">${gradeCell(data.rsrpGrade)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
                    <strong style="color:#1f2937;font-size:14px">SINR</strong>
                    <div style="color:#6b7280;font-size:12px">Rapport signal/bruit</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;font-family:monospace;font-size:15px;color:#1f2937">${data.sinr} dB</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right">${gradeCell(data.sinrGrade)}</td>
                </tr>
                ${rsrqRow}
              </tbody>
            </table>

            <!-- Reference grid -->
            <h2 style="font-size:16px;color:#1f2937;margin-bottom:12px">Grille de référence — Signal 4G LTE</h2>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px">
              <thead><tr style="background:#f9fafb">
                <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280">RSRP</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280">RSRQ</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280">SINR</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280">Qualité</th>
              </tr></thead>
              <tbody>${gridHtml}</tbody>
            </table>

            <!-- Glossary -->
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="font-size:12px;color:#6b7280;margin:0 0 8px"><strong style="color:#374151">RSRP</strong> — Puissance du signal reçu. Indicateur principal de la force du signal 4G.</p>
              <p style="font-size:12px;color:#6b7280;margin:0 0 8px"><strong style="color:#374151">RSRQ</strong> — Qualité du signal reçu. Utile quand le RSRP seul ne suffit pas à décider.</p>
              <p style="font-size:12px;color:#6b7280;margin:0"><strong style="color:#374151">SINR</strong> — Rapport signal/bruit. Indique la clarté du signal par rapport aux interférences.</p>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-top:30px;padding:24px;background:#f8fafc;border-radius:8px">
              <p style="color:#4b5563;font-size:14px;margin:0 0 16px">Besoin d'améliorer votre couverture mobile ?</p>
              <a href="https://dahouse.fr/contact" style="display:inline-block;background:#6366f1;color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:14px">
                Nous contacter →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:16px 30px;color:#9ca3af;font-size:11px;border-top:1px solid #e5e7eb">
            <img src="${LOGO_URL}" alt="DAHOUSE" style="height:20px;margin-bottom:8px;opacity:0.5" /><br/>
            Rapport généré par <a href="https://dahouse.fr/outils/test-4g" style="color:#6366f1">dahouse.fr</a> — ${date}
          </div>
        </div>
      </body></html>`;

    const subjectRef = data.reference ? ` — ${data.reference}` : '';

    // Send to user
    await resend.emails.send({
      from: 'DAHOUSE Outils <contact@dahouse.fr>',
      to: data.email,
      replyTo: 'oscar@dahouse.fr',
      subject: cleanSubject(`Test 4G${subjectRef} — ${overallLabel} (${locationLabel})`),
      html,
    });

    // Copy to oscar
    await resend.emails.send({
      from: 'DAHOUSE Outils <contact@dahouse.fr>',
      to: 'oscar@dahouse.fr',
      replyTo: data.email,
      subject: cleanSubject(`[Test 4G] ${data.email}${subjectRef} — ${overallLabel} (${locationLabel})`),
      html,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin(request) } }
    );
  } catch (error) {
    console.error('4G report error:', error);
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
