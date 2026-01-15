import { NextRequest, NextResponse } from 'next/server';
import { strapiApiToken, strapiUrl } from '../../../../lib/strapi';
import { uploadPDFToCloudinary, updateInvitationWithPDFUrl } from '../../../../lib/pdf-storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const invitationSlug = formData.get('invitationSlug') as string | null;
    const invitationId = formData.get('invitationId') 
      ? parseInt(formData.get('invitationId') as string)
      : null;
    const pdfFile = formData.get('pdf') as File | null;

    if (!invitationSlug && !invitationId) {
      return NextResponse.json(
        { error: 'invitationSlug or invitationId is required' },
        { status: 400 }
      );
    }

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // Fetch invitation to get ID, slug, and documentId (Strapi v5)
    let invitation: { id: number; slug: string; documentId?: string } | null = null;
    
    const authHeaders: HeadersInit = strapiApiToken
      ? { Authorization: `Bearer ${strapiApiToken}` }
      : {};

    if (invitationId) {
      const res = await fetch(`${strapiUrl}/api/invitations/${invitationId}`, {
        headers: authHeaders,
      });
      const json = await res.json();
      if (json?.data) {
        const data = json.data;
        const attributes = data?.attributes || data;
        invitation = {
          id: data.id,
          slug: attributes.slug,
          documentId: data.documentId || attributes.documentId,
        };
      }
    } else if (invitationSlug) {
      const res = await fetch(
        `${strapiUrl}/api/invitations?filters[slug][$eq]=${encodeURIComponent(invitationSlug)}`,
        { headers: authHeaders }
      );
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data[0] : json?.data;
      if (data) {
        const attributes = data?.attributes || data;
        invitation = {
          id: data.id,
          slug: attributes.slug,
          documentId: data.documentId || attributes.documentId,
        };
      }
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Convert File to Blob
    const pdfBlob = new Blob([await pdfFile.arrayBuffer()], { type: 'application/pdf' });
    
    // Generate filename
    const filename = `${invitation.slug}-scrapbook.pdf`;

    // Upload PDF to Cloudinary via Strapi
    const cloudinaryUrl = await uploadPDFToCloudinary(pdfBlob, filename);

    // Update invitation with PDF URL
    await updateInvitationWithPDFUrl(invitation.id, cloudinaryUrl, invitation.documentId);

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl: cloudinaryUrl,
        invitationId: invitation.id,
        invitationSlug: invitation.slug,
      },
    });
  } catch (error) {
    console.error('Error generating and uploading PDF:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
