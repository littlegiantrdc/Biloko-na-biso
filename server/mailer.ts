/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface MailerResult {
  dispatched: boolean;
  messageId?: string;
  error?: string;
  reason?: string;
}

/**
 * Creates a nodemailer transport if credentials exist in environment variables.
 * Supports standard SMTP (Sendgrid, Resend, Mailgun, Amazon SES, or Gmail App Passwords).
 */
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Gmail direct configuration shortcut
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null;
}

/**
 * Sends the contact email to Little Giants (littlegiantrdc@gmail.com).
 */
export async function sendContactEmail(payload: ContactMessagePayload): Promise<MailerResult> {
  const targetEmail = process.env.CONTACT_RECEIVER_EMAIL || 'littlegiantrdc@gmail.com';
  const transporter = createTransport();

  const formattedDate = new Date().toLocaleString('fr-FR', {
    timeZone: 'Africa/Kinshasa',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const textBody = `
Nouveau message de contact reçu sur Biloko Na Biso
--------------------------------------------------
Expéditeur : ${payload.name}
E-mail : ${payload.email}
Téléphone / WhatsApp : ${payload.phone || 'Non précisé'}
Date : ${formattedDate} (Heure de Kinshasa)
Objet : ${payload.subject}

Message :
${payload.message}

--------------------------------------------------
Plateforme Nationale Biloko Na Biso
Un produit de Little Giants (https://littlegiantrdc.netlify.app/)
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouveau message Biloko Na Biso</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917; background-color: #f5f5f4; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header banner -->
    <div style="background-color: #064e3b; color: #ffffff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">BILOKO NA BISO</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #f59e0b; font-weight: bold; text-transform: uppercase;">
        Le savoir-faire congolais, à portée du monde
      </p>
    </div>

    <!-- Notification Header -->
    <div style="padding: 24px 24px 0 24px;">
      <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; font-weight: bold; color: #065f46;">
          Nouveau message reçu depuis le formulaire de contact
        </p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">
          ${formattedDate} (Kinshasa)
        </p>
      </div>

      <!-- Sender Info Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f5f5f4;">
          <td style="padding: 8px 0; color: #78716c; width: 140px; font-weight: bold;">Nom :</td>
          <td style="padding: 8px 0; color: #1c1917; font-weight: 600;">${escapeHtml(payload.name)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f4;">
          <td style="padding: 8px 0; color: #78716c; font-weight: bold;">E-mail :</td>
          <td style="padding: 8px 0;">
            <a href="mailto:${escapeHtml(payload.email)}" style="color: #059669; text-decoration: underline; font-weight: 600;">
              ${escapeHtml(payload.email)}
            </a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f5f5f4;">
          <td style="padding: 8px 0; color: #78716c; font-weight: bold;">Téléphone :</td>
          <td style="padding: 8px 0; color: #1c1917;">${escapeHtml(payload.phone || 'Non renseigné')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716c; font-weight: bold;">Objet :</td>
          <td style="padding: 8px 0; color: #1c1917; font-weight: 700;">${escapeHtml(payload.subject)}</td>
        </tr>
      </table>

      <!-- Message Content Box -->
      <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.5px;">
          Contenu du message :
        </p>
        <p style="margin: 0; font-size: 14px; color: #292524; white-space: pre-line; line-height: 1.6;">
          ${escapeHtml(payload.message)}
        </p>
      </div>

      <!-- Quick Reply Action -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="mailto:${escapeHtml(payload.email)}?subject=Re:%20${encodeURIComponent(payload.subject)}"
           style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 10px;">
          Répondre directement à ${escapeHtml(payload.name)}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1c1917; color: #a8a29e; padding: 16px 24px; text-align: center; font-size: 11px;">
      <p style="margin: 0;">« Biloko Na Biso est un produit officiel de Little Giants. »</p>
      <p style="margin: 4px 0 0 0;">
        <a href="https://littlegiantrdc.netlify.app/" style="color: #fbbf24; text-decoration: none;">littlegiantrdc.netlify.app</a>
        • WhatsApp : +243 858 960 478
      </p>
    </div>

  </div>
</body>
</html>
`;

  if (!transporter) {
    console.log('\n======================================================');
    console.log('[BILOKO NA BISO CONTACT EMAIL LOG - SMTP NOT CONFIGURED]');
    console.log(`Destinataire prévu : ${targetEmail}`);
    console.log(`Expéditeur : ${payload.name} <${payload.email}> (${payload.phone || 'Pas de tél'})`);
    console.log(`Objet : ${payload.subject}`);
    console.log(`Message :\n${payload.message}`);
    console.log('======================================================\n');

    return {
      dispatched: false,
      reason: 'SMTP non configuré dans les variables d’environnement. Message enregistré en base de données.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Biloko Na Biso" <contact@bilokonabiso.cd>`,
      to: targetEmail,
      replyTo: `${payload.name} <${payload.email}>`,
      subject: `[Biloko Na Biso] Contact : ${payload.subject}`,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[MAIL DISPATCHED] Email sent to ${targetEmail} (Message ID: ${info.messageId})`);
    return {
      dispatched: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[MAIL ERROR] Failed to send email via SMTP:', err?.message || err);
    return {
      dispatched: false,
      error: err?.message || 'Erreur SMTP',
    };
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
