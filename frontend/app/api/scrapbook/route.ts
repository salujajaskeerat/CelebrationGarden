import { NextRequest, NextResponse } from 'next/server';
import { fetchStrapi, strapiUrl } from '../../../lib/strapi';

interface ScrapbookEntryData {
  name: string;
  message: string;
  phone?: string;
  photo?: File;
  invitationSlug: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const phone = formData.get('phone') as string;
    const relation = formData.get('relation') as string;
    const invitationSlug = formData.get('invitationSlug') as string;
    const imageUrl = formData.get('imageUrl') as string | null; // Cloudinary URL from client

    if (!name || !message || !phone || !relation || !invitationSlug) {
      return NextResponse.json(
        { error: 'Name, message, phone, relation, and invitation slug are required' },
        { status: 400 }
      );
    }

    // First, get the invitation ID from Strapi
    const invitationResponse = await fetchStrapi<{
      data: { id: number } | { id: number }[] | null;
    }>(`/invitations?filters[slug][$eq]=${encodeURIComponent(invitationSlug)}`);

    if (!invitationResponse.data) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = Array.isArray(invitationResponse.data) 
      ? invitationResponse.data[0] 
      : invitationResponse.data;

    if (!invitation.id) {
      return NextResponse.json(
        { error: 'Invitation ID not found' },
        { status: 500 }
      );
    }

    // Image is already uploaded to Cloudinary by the client
    // Create a Strapi media entry so it shows up in admin panel for easy viewing/management
    let photoId: number | null = null;
    if (imageUrl) {
      try {
        // Fetch the image from Cloudinary
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          // Convert to blob
          const imageBlob = await imageResponse.blob();
          
          // Create FormData for Strapi upload
          const uploadFormData = new FormData();
          uploadFormData.append('files', imageBlob, 'scrapbook-image.jpg');
          uploadFormData.append('ref', 'api::scrapbook-entry.scrapbook-entry');
          uploadFormData.append('field', 'image');

          // Upload to Strapi media library (Strapi will handle Cloudinary storage via its provider)
          const uploadResponse = await fetch(`${strapiUrl}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
            },
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (Array.isArray(uploadData) && uploadData.length > 0) {
              photoId = uploadData[0].id;
            } else if (uploadData.id) {
              photoId = uploadData.id;
            }
            console.log('Image added to Strapi media library:', photoId);
          } else {
            const errorText = await uploadResponse.text();
            console.warn('Failed to add image to Strapi media library:', errorText);
            // Continue without media entry - image URL is still stored
          }
        }
      } catch (error) {
        console.warn('Error creating Strapi media entry:', error);
        // Continue without media entry - image URL is still stored as backup
      }
    }

    // Create scrapbook entry in Strapi
    const entryData: any = {
      data: {
        name,
        message,
        phone,
        relation,
        invitation: invitation.id,
        submitted_at: new Date().toISOString(),
        ...(photoId && { image: photoId }), // Link to Strapi media entry (shows preview in admin)
        ...(imageUrl && { image_url: imageUrl }), // Also store URL as backup/reference
      },
    };

    const createResponse = await fetch(`${strapiUrl}/api/scrapbook-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
      },
      body: JSON.stringify(entryData),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('Strapi error:', error);
      return NextResponse.json(
        { error: 'Failed to save scrapbook entry', details: error },
        { status: createResponse.status }
      );
    }

    const result = await createResponse.json();

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Scrapbook entry saved successfully',
    });
  } catch (error) {
    console.error('Error saving scrapbook entry:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch scrapbook entries for an invitation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationSlug = searchParams.get('invitationSlug');

    if (!invitationSlug) {
      return NextResponse.json(
        { error: 'invitationSlug parameter is required' },
        { status: 400 }
      );
    }

    // Get invitation ID
    const invitationResponse = await fetchStrapi<{
      data: { id: number } | { id: number }[] | null;
    }>(`/invitations?filters[slug][$eq]=${encodeURIComponent(invitationSlug)}`);

    if (!invitationResponse.data) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = Array.isArray(invitationResponse.data) 
      ? invitationResponse.data[0] 
      : invitationResponse.data;

    // Fetch scrapbook entries with image populated
    const entriesResponse = await fetchStrapi<{
      data: any[] | null;
    }>(`/scrapbook-entries?filters[invitation][id][$eq]=${invitation.id}&populate=image`);

    return NextResponse.json({
      success: true,
      data: entriesResponse.data || [],
    });
  } catch (error) {
    console.error('Error fetching scrapbook entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

