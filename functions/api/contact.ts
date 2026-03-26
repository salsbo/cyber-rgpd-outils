import { Resend } from 'resend';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  metier?: string;
  turnstileToken?: string;
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
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

    // Parse request body
    const data: ContactFormData = await request.json();

    // Sanitize inputs
    data.firstName = sanitize(data.firstName || '', 50);
    data.lastName = sanitize(data.lastName || '', 50);
    data.email = sanitize(data.email || '', 254);
    data.company = sanitize(data.company || '', 100);
    data.subject = sanitize(data.subject || '', 100);
    data.message = sanitize(data.message || '', 5000);
    data.metier = sanitize(data.metier || '', 50);

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://dahouse.fr'
          }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://dahouse.fr'
          }
        }
      );
    }

    // Validate Turnstile token
    if (!data.turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Vérification de sécurité manquante' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://dahouse.fr'
          }
        }
      );
    }

    // Verify Turnstile token with Cloudflare
    const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const turnstileResponse = await fetch(turnstileVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: data.turnstileToken,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    });

    const turnstileResult: TurnstileResponse = await turnstileResponse.json();

    if (!turnstileResult.success) {
      console.error('Turnstile verification failed:', turnstileResult['error-codes']);
      return new Response(
        JSON.stringify({ error: 'Échec de la vérification de sécurité' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://dahouse.fr'
          }
        }
      );
    }

    // Initialize Resend with API key from environment variable
    const resend = new Resend(env.RESEND_API_KEY);

    // Construct email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .field {
              margin-bottom: 24px;
            }
            .label {
              font-weight: 600;
              color: #4b5563;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 6px;
              display: block;
            }
            .value {
              color: #1f2937;
              font-size: 15px;
              line-height: 1.5;
            }
            .message-box {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              margin-top: 8px;
              white-space: pre-wrap;
            }
            .footer {
              text-align: center;
              padding: 20px 30px;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
            }
            a {
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Nouveau message de contact</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Contact</span>
                <div class="value"><strong>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</strong></div>
              </div>

              <div class="field">
                <span class="label">Email</span>
                <div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
              </div>

              ${data.company ? `
              <div class="field">
                <span class="label">Entreprise</span>
                <div class="value">${escapeHtml(data.company)}</div>
              </div>
              ` : ''}

              <div class="field">
                <span class="label">Sujet</span>
                <div class="value">${escapeHtml(data.subject)}</div>
              </div>

              ${data.metier ? `
              <div class="field">
                <span class="label">Métier</span>
                <div class="value">${escapeHtml(data.metier)}</div>
              </div>
              ` : ''}

              <div class="field">
                <span class="label">Message</span>
                <div class="message-box">${escapeHtml(data.message)}</div>
              </div>
            </div>
            <div class="footer">
              <p>Ce message a été envoyé via le formulaire de contact de dahouse.fr</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'DAHOUSE Contact <contact@dahouse.fr>',
      to: 'oscar@dahouse.fr',
      replyTo: data.email,
      subject: cleanSubject(`[${data.subject}] ${data.firstName} ${data.lastName}`),
      html: emailHtml,
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return new Response(
        JSON.stringify({
          error: 'Erreur lors de l\'envoi de l\'email',
          details: emailResult.error
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://dahouse.fr'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message envoyé avec succès',
        id: emailResult.data?.id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://dahouse.fr'
        }
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({
        error: 'Une erreur est survenue lors de l\'envoi du message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://dahouse.fr'
        }
      }
    );
  }
}

// Handle CORS preflight
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
