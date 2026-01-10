import { NextRequest, NextResponse } from 'next/server';
import { fetchStrapi, strapiUrl } from '../../../../lib/strapi';

// This endpoint generates a PDF scrapbook for an invitation
export async function POST(request: NextRequest) {
  try {
    const { invitationSlug } = await request.json();

    if (!invitationSlug) {
      return NextResponse.json(
        { error: 'invitationSlug is required' },
        { status: 400 }
      );
    }

    // Get invitation details
    const invitationResponse = await fetchStrapi<{
      data: { id: number; title: string; event_date: string } | { id: number; title: string; event_date: string }[] | null;
    }>(`/invitation?filters[slug][$eq]=${encodeURIComponent(invitationSlug)}`);

    if (!invitationResponse.data) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = Array.isArray(invitationResponse.data) 
      ? invitationResponse.data[0] 
      : invitationResponse.data;

    // Get all scrapbook entries for this invitation
    const entriesResponse = await fetchStrapi<{
      data: Array<{
        id: number;
        name: string;
        message: string;
        phone?: string;
        photo?: {
          data?: {
            attributes?: {
              url: string;
            };
          } | null;
        };
        submitted_at: string;
      }> | null;
    }>(`/scrapbook-entries?filters[invitation][id][$eq]=${invitation.id}&populate=photo&sort=submitted_at:asc`);

    const entries = entriesResponse.data || [];

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No scrapbook entries found for this invitation' },
        { status: 404 }
      );
    }

    // Generate PDF HTML
    const pdfHtml = generatePDFHTML(invitation, entries);

    // For now, return HTML that can be converted to PDF
    // In production, you'd use a library like puppeteer, pdfkit, or jspdf
    return NextResponse.json({
      success: true,
      html: pdfHtml,
      message: 'PDF HTML generated. Use a PDF generation service to convert to PDF.',
      // In production, you would generate the actual PDF here
      // For now, return the HTML structure
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(
  invitation: { title: string; event_date: string },
  entries: Array<{
    name: string;
    message: string;
    phone?: string;
    photo?: {
      data?: {
        attributes?: {
          url: string;
        };
      } | null;
    };
    submitted_at: string;
  }>
): string {
  const photoUrl = (photo: any) => {
    if (!photo?.data?.attributes?.url) return null;
    return `${strapiUrl}${photo.data.attributes.url}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', serif;
      color: #1a1a1a;
      line-height: 1.6;
      background: #F9F8F3;
    }
    .cover {
      text-align: center;
      padding: 4cm 2cm;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 3.5em;
      font-style: italic;
      margin-bottom: 0.5em;
      color: #1a1a1a;
    }
    .cover .subtitle {
      font-size: 1.2em;
      color: #C5A059;
      margin-top: 2em;
    }
    .entry {
      page-break-inside: avoid;
      margin-bottom: 3em;
      padding: 2em;
      background: white;
      border: 1px solid #e5e5e5;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .entry-header {
      display: flex;
      align-items: center;
      margin-bottom: 1em;
      gap: 1em;
    }
    .entry-photo {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 50%;
      border: 3px solid #C5A059;
    }
    .entry-name {
      font-size: 1.5em;
      font-weight: bold;
      color: #1a1a1a;
    }
    .entry-message {
      font-size: 1.1em;
      line-height: 1.8;
      color: #333;
      font-style: italic;
      margin-top: 1em;
    }
    .entry-date {
      font-size: 0.9em;
      color: #999;
      margin-top: 1em;
    }
    .no-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 2em;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${invitation.title}</h1>
    <p class="subtitle">Digital Scrapbook</p>
    <p class="subtitle">${new Date(invitation.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  
  ${entries.map(entry => `
    <div class="entry">
      <div class="entry-header">
        ${photoUrl(entry.photo) 
          ? `<img src="${photoUrl(entry.photo)}" alt="${entry.name}" class="entry-photo" />`
          : `<div class="no-photo">${entry.name.charAt(0).toUpperCase()}</div>`
        }
        <div>
          <div class="entry-name">${entry.name}</div>
          <div class="entry-date">${new Date(entry.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
      <div class="entry-message">${entry.message}</div>
    </div>
  `).join('')}
</body>
</html>
  `.trim();
}

