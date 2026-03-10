import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';
import { generateApplicationPDF } from '@/app/lib/generateApplicationPDF';
import { createZohoLead, formatApplicationForZoho } from '@/app/lib/zoho';

function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;
  return value
    .replace(/\t/g, ' ')
    .replace(/[\r\n]/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeFormData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeString(data) as T;
  if (Array.isArray(data)) return data.map(item => sanitizeFormData(item)) as T;
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeFormData(value);
    }
    return sanitized as T;
  }
  return data;
}

export const maxDuration = 60;

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number }> {
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!apiKey || !projectId) {
    console.warn('RECAPTCHA_API_KEY or RECAPTCHA_PROJECT_ID not configured, skipping verification');
    return { success: true };
  }

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: token,
            expectedAction: 'submit_application',
            siteKey: siteKey,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('reCAPTCHA Enterprise API error:', data.error);
      return { success: false };
    }

    const score = data.riskAnalysis?.score;
    const tokenValid = data.tokenProperties?.valid;

    if (!tokenValid) {
      console.warn('reCAPTCHA token invalid:', data.tokenProperties?.invalidReason);
      return { success: false, score };
    }

    return { success: score >= 0.5, score };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false };
  }
}

let resend: Resend | null = null;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const formatCurrency = (value: string): string => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseInt(value));
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let step = 'initializing';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let applicationData: any = undefined;

  try {
    step = 'parsing_form_data';
    console.log('[Submit] Starting application submission');
    const formData = await request.formData();

    step = 'parsing_json_data';
    const rawApplicationData = JSON.parse(formData.get('formData') as string);
    applicationData = sanitizeFormData(rawApplicationData);
    const signature = formData.get('signature') as string;
    const secondSignature = formData.get('secondSignature') as string;
    const recaptchaToken = formData.get('recaptchaToken') as string;
    const submissionDate = formData.get('submissionDate') as string;
    console.log(`[Submit] Parsed application for: ${applicationData.legalBusinessName}`);

    step = 'verifying_recaptcha';
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      console.log(`[Submit] reCAPTCHA result: success=${recaptchaResult.success}, score=${recaptchaResult.score}`);
      if (!recaptchaResult.success) {
        console.warn(`[Submit] reCAPTCHA failed for ${applicationData.legalBusinessName}, score: ${recaptchaResult.score}`);
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400 }
        );
      }
    } else {
      console.log('[Submit] No reCAPTCHA token provided, skipping verification');
    }

    step = 'collecting_bank_statements';
    const bankStatementAttachments: { filename: string; content: Buffer }[] = [];
    const bankStatementNames: string[] = [];

    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 5 * 1024 * 1024;
    let totalFileSize = 0;

    for (let i = 0; i < 4; i++) {
      const file = formData.get(`bankStatement${i}`) as File | null;
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          const userMsg = `"${file.name}" is too large. Please compress your PDF files.`;
          Sentry.captureMessage(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`, {
            level: 'warning',
            tags: { feature: 'file-upload', error_type: 'file_too_large' },
            extra: {
              fileName: file.name,
              fileSize: file.size,
              businessName: applicationData.legalBusinessName,
              contactEmail: applicationData.ownerEmail,
            },
          });
          return NextResponse.json(
            { error: userMsg },
            { status: 400 }
          );
        }

        totalFileSize += file.size;

        if (totalFileSize > MAX_TOTAL_SIZE) {
          const userMsg = `Total file size is too large. Please compress your PDF files or upload fewer statements.`;
          Sentry.captureMessage(`Total file size exceeded: ${(totalFileSize / 1024 / 1024).toFixed(1)}MB`, {
            level: 'warning',
            tags: { feature: 'file-upload', error_type: 'total_size_exceeded' },
            extra: {
              totalSize: totalFileSize,
              businessName: applicationData.legalBusinessName,
              contactEmail: applicationData.ownerEmail,
            },
          });
          return NextResponse.json(
            { error: userMsg },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        bankStatementAttachments.push({
          filename: file.name,
          content: buffer,
        });
        bankStatementNames.push(file.name);
      }
    }
    console.log(`[Submit] Collected ${bankStatementAttachments.length} bank statements (${(totalFileSize / 1024 / 1024).toFixed(2)}MB total)`);

    step = 'generating_pdf';
    console.log('[Submit] Generating PDF...');
    const pdfBuffer = await generateApplicationPDF(
      applicationData,
      signature || null,
      secondSignature || null,
      submissionDate,
      bankStatementNames
    );
    console.log(`[Submit] PDF generated successfully (${pdfBuffer.length} bytes)`);

    const sanitizedBusinessName = applicationData.legalBusinessName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const pdfFilename = `Application_${sanitizedBusinessName}_${new Date().toISOString().split('T')[0]}.pdf`;

    const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/prud-cap-logo.png`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.6;
      color: #1a1a2e;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f8fafc;
    }
    .container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 30px 20px;
      background: linear-gradient(135deg, #0a2540 0%, #0f3d6b 100%);
    }
    .header img {
      max-width: 200px;
      height: auto;
    }
    .title-bar {
      background-color: #0f79be;
      color: white;
      text-align: center;
      padding: 15px 20px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
    }
    .intro {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 25px;
      text-align: center;
    }
    .card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #0f79be;
    }
    .card-label {
      color: #0f79be;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .card-value {
      color: #0a2540;
      font-size: 18px;
      font-weight: bold;
    }
    .card-sub {
      color: #64748b;
      font-size: 13px;
      margin-top: 5px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e2e8f0, transparent);
      margin: 25px 0;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #0a2540;
      color: #94a3b8;
      font-size: 12px;
    }
    .footer-brand {
      color: #0f79be;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Prudential Capital" />
    </div>

    <div class="title-bar">
      NEW FUNDING APPLICATION
    </div>

    <div class="content">
      <p class="intro">A new business funding application has been submitted. The complete application is attached as a PDF document.</p>

      <div class="card">
        <div class="card-label">Business Name</div>
        <div class="card-value">${applicationData.legalBusinessName}</div>
        ${applicationData.dba ? `<div class="card-sub">DBA: ${applicationData.dba}</div>` : ''}
      </div>

      <div class="card">
        <div class="card-label">Amount Requested</div>
        <div class="card-value">${formatCurrency(applicationData.amountRequested)}</div>
        <div class="card-sub">Use of Funds: ${applicationData.useOfFunds}</div>
      </div>

      <div class="card">
        <div class="card-label">Primary Contact</div>
        <div class="card-value">${applicationData.ownerFirstName} ${applicationData.ownerLastName}</div>
        <div class="card-sub">${applicationData.ownerEmail}</div>
        <div class="card-sub">${applicationData.ownerPhoneCountry} ${applicationData.ownerPhone}</div>
      </div>

      ${applicationData.fundingSpecialistName ? `
      <div class="card">
        <div class="card-label">Funding Specialist</div>
        <div class="card-value">${applicationData.fundingSpecialistName}</div>
      </div>
      ` : ''}

      ${bankStatementNames.length > 0 ? `
      <div class="divider"></div>
      <div class="card">
        <div class="card-label">Attached Bank Statements</div>
        <div style="margin-top: 10px;">
          ${bankStatementNames.map(name => `<div class="card-sub">• ${name}</div>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <div class="footer-brand">Prudential Capital</div>
      <div>Business Funding Solutions</div>
      <div style="margin-top: 10px;">Application submitted on ${submissionDate}</div>
    </div>
  </div>
</body>
</html>
    `;

    const allAttachments: Array<{
      filename: string;
      content: Buffer;
      contentType?: string;
    }> = [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
      ...bankStatementAttachments.map(att => {
        const ext = att.filename.toLowerCase().split('.').pop();
        let contentType = 'application/octet-stream';
        if (ext === 'pdf') contentType = 'application/pdf';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';

        return {
          filename: att.filename,
          content: att.content,
          contentType,
        };
      }),
    ];

    step = 'sending_email';
    const resendClient = getResend();
    if (!resendClient) {
      const configError = new Error('Email service not configured - RESEND_API_KEY missing');
      Sentry.captureException(configError, {
        tags: {
          feature: 'email-send',
          error_type: 'configuration',
        },
        extra: {
          businessName: applicationData.legalBusinessName,
          amountRequested: applicationData.amountRequested,
          contactEmail: applicationData.ownerEmail,
        },
      });
      console.error('[Submit] Resend client not configured - RESEND_API_KEY missing');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log(`[Submit] Sending email with ${allAttachments.length} attachments (total size: ${allAttachments.reduce((acc, att) => acc + att.content.length, 0)} bytes)`);
    const { data, error } = await resendClient.emails.send({
      from: 'Prudential Capital <applications@prudentialcap.com>',
      to: ['info@prudentialcap.com'],
      subject: `[PC] New Funding Application - ${applicationData.legalBusinessName} - ${formatCurrency(applicationData.amountRequested)}`,
      html: emailHtml,
      attachments: allAttachments,
    });

    if (error) {
      Sentry.captureException(new Error(`Email send failed: ${error.message}`), {
        tags: {
          feature: 'email-send',
          error_type: 'send_failure',
        },
        extra: {
          resendError: error,
          businessName: applicationData.legalBusinessName,
          amountRequested: applicationData.amountRequested,
          contactEmail: applicationData.ownerEmail,
          contactPhone: `${applicationData.ownerPhoneCountry} ${applicationData.ownerPhone}`,
          contactName: `${applicationData.ownerFirstName} ${applicationData.ownerLastName}`,
          attachmentCount: allAttachments.length,
          totalAttachmentSize: allAttachments.reduce((acc, att) => acc + att.content.length, 0),
        },
      });
      console.error(`[Submit] Resend email failed:`, error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }
    console.log(`[Submit] Email sent successfully, messageId: ${data?.id}`);

    step = 'creating_zoho_lead';
    let zohoLeadId: string | undefined;
    try {
      const zohoLeadData = formatApplicationForZoho(applicationData);

      const zohoAttachments = bankStatementAttachments.map(att => {
        const ext = att.filename.toLowerCase().split('.').pop();
        let contentType = 'application/octet-stream';
        if (ext === 'pdf') contentType = 'application/pdf';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';

        return {
          filename: att.filename,
          content: att.content,
          contentType,
        };
      });

      const zohoResult = await createZohoLead(zohoLeadData, zohoAttachments, applicationData.fundingSpecialistName);
      if (zohoResult.success) {
        zohoLeadId = zohoResult.leadId;
        console.log('Zoho lead created:', zohoLeadId, 'Assigned to:', zohoResult.assignedTo);
      } else {
        const isValidationError = zohoResult.validationErrors && zohoResult.validationErrors.length > 0;
        Sentry.captureException(new Error(`Zoho lead creation failed: ${zohoResult.error}`), {
          tags: {
            feature: 'zoho-lead-creation',
            error_type: isValidationError ? 'validation_failure' : 'lead_creation_failure',
          },
          extra: {
            zohoError: zohoResult.error,
            zohoRawResponse: zohoResult.rawResponse,
            validationErrors: zohoResult.validationErrors || [],
            applicantName: `${applicationData.ownerFirstName} ${applicationData.ownerLastName}`,
            applicantEmail: applicationData.ownerEmail,
            applicantPhone: `${applicationData.ownerPhoneCountry || ''} ${applicationData.ownerPhone}`.trim(),
            businessName: applicationData.legalBusinessName,
            amountRequested: applicationData.amountRequested,
            fundingSpecialist: applicationData.fundingSpecialistName || 'N/A',
            zohoLeadData: zohoLeadData,
          },
        });
        console.error('Failed to create Zoho lead:', zohoResult.error);
      }
    } catch (zohoError) {
      Sentry.captureException(zohoError, {
        tags: {
          feature: 'zoho-lead-creation',
          error_type: 'zoho_exception',
        },
        extra: {
          applicantName: `${applicationData.ownerFirstName} ${applicationData.ownerLastName}`,
          applicantEmail: applicationData.ownerEmail,
          businessName: applicationData.legalBusinessName,
          amountRequested: applicationData.amountRequested,
        },
      });
      console.error('Zoho CRM integration error:', zohoError);
    }

    const duration = Date.now() - startTime;
    console.log(`[Submit] Application submitted successfully in ${duration}ms for ${applicationData.legalBusinessName}`);
    return NextResponse.json({ success: true, messageId: data?.id, zohoLeadId });
  } catch (error) {
    const duration = Date.now() - startTime;
    const applicantInfo = applicationData ? {
      contactName: `${applicationData.ownerFirstName || ''} ${applicationData.ownerLastName || ''}`.trim(),
      contactEmail: applicationData.ownerEmail,
      contactPhone: `${applicationData.ownerPhoneCountry || ''} ${applicationData.ownerPhone || ''}`.trim(),
      businessName: applicationData.legalBusinessName,
      amountRequested: applicationData.amountRequested,
    } : {};

    Sentry.captureException(error, {
      tags: {
        feature: 'application-submit',
        failed_step: step,
      },
      extra: {
        duration,
        step,
        ...applicantInfo,
      },
    });
    console.error(`[Submit] Failed at step "${step}" after ${duration}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to process application', details: error instanceof Error ? error.message : String(error), step },
      { status: 500 }
    );
  }
}
