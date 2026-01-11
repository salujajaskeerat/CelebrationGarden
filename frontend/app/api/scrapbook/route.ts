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
    // Strapi v5 returns both id and documentId
    console.log(`Fetching invitation with slug: ${invitationSlug}`);
    const invitationResponse = await fetchStrapi<{
      data: { id: number; documentId?: string } | { id: number; documentId?: string }[] | null;
    }>(`/invitations?filters[slug][$eq]=${encodeURIComponent(invitationSlug)}`);

    console.log('Invitation response:', JSON.stringify(invitationResponse, null, 2));

    if (!invitationResponse.data) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = Array.isArray(invitationResponse.data) 
      ? invitationResponse.data[0] 
      : invitationResponse.data;

    console.log('Parsed invitation object:', JSON.stringify(invitation, null, 2));
    console.log('Invitation keys:', Object.keys(invitation || {}));

    // Get the invitation ID - in Strapi v5, use id for relations (not documentId)
    // The id field is required for setting relations in Strapi
    const invitationId = invitation?.id;
    const invitationDocumentId = invitation?.documentId;
    
    console.log('Invitation ID check:', {
      hasId: !!invitationId,
      idValue: invitationId,
      idType: typeof invitationId,
      hasDocumentId: !!invitationDocumentId,
      documentIdValue: invitationDocumentId,
    });
    
    if (!invitationId || typeof invitationId !== 'number') {
      console.error('Invitation response structure:', JSON.stringify(invitation, null, 2));
      console.error('Available fields:', Object.keys(invitation || {}));
      return NextResponse.json(
        { 
          error: 'Invitation ID not found or invalid in response', 
          details: { 
            invitation,
            hasId: !!invitation?.id,
            idType: typeof invitation?.id,
            idValue: invitation?.id,
            hasDocumentId: !!invitation?.documentId,
            documentIdValue: invitation?.documentId,
          } 
        },
        { status: 500 }
      );
    }

    console.log(`✓ Found invitation with ID: ${invitationId} (type: ${typeof invitationId}) for slug: ${invitationSlug}`);

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
    // IMPORTANT: invitation field is REQUIRED and must always be set
    // In Strapi v5, for manyToOne relations, pass the ID directly as a number
    const entryData: any = {
      data: {
        name,
        message,
        phone,
        relation,
        invitation: invitationId, // CRITICAL: This must always be set - it's a required foreign key
        submitted_at: new Date().toISOString(),
        ...(photoId && { image: photoId }), // Link to Strapi media entry (shows preview in admin)
        ...(imageUrl && { image_url: imageUrl }), // Also store URL as backup/reference
      },
    };

    // Validate that invitation is set before sending
    if (!entryData.data.invitation) {
      console.error('CRITICAL ERROR: invitation field is missing from entry data!');
      return NextResponse.json(
        { error: 'Internal error: invitation field not set' },
        { status: 500 }
      );
    }

    console.log('Creating scrapbook entry with data:', {
      name,
      phone,
      relation,
      invitationId: entryData.data.invitation,
      invitationType: typeof entryData.data.invitation,
      hasImage: !!photoId,
      hasImageUrl: !!imageUrl,
    });

    console.log('Sending request to Strapi:', {
      url: `${strapiUrl}/api/scrapbook-entries`,
      payload: JSON.stringify(entryData, null, 2),
    });

    const createResponse = await fetch(`${strapiUrl}/api/scrapbook-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
      },
      body: JSON.stringify(entryData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      console.error('Strapi error creating scrapbook entry:', error);
      console.error('Request payload was:', JSON.stringify(entryData, null, 2));
      console.error('Response status:', createResponse.status);
      console.error('Response statusText:', createResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to save scrapbook entry', details: error },
        { status: createResponse.status }
      );
    }

    const result = await createResponse.json();
    console.log('Strapi response (raw):', JSON.stringify(result, null, 2));
    
    // Fetch the created entry with invitation populated to verify it was set
    const entryId = result.data?.id || result.data?.documentId;
    if (entryId) {
      try {
        const verifyResponse = await fetch(
          `${strapiUrl}/api/scrapbook-entries/${entryId}?populate=invitation`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
            },
          }
        );
        
        if (verifyResponse.ok) {
          const verifiedEntry = await verifyResponse.json();
          console.log('Verified entry with populated invitation:', JSON.stringify(verifiedEntry, null, 2));
          
          if (!verifiedEntry.data?.invitation) {
            console.error('CRITICAL: Entry created but invitation is NOT set in database!');
            console.error('Verified entry data:', JSON.stringify(verifiedEntry.data, null, 2));
          } else {
            console.log('SUCCESS: Invitation is properly set:', {
              entryId: verifiedEntry.data?.id,
              invitationId: verifiedEntry.data?.invitation?.id || verifiedEntry.data?.invitation,
              invitationData: verifiedEntry.data?.invitation,
            });
          }
        }
      } catch (verifyError) {
        console.warn('Could not verify entry:', verifyError);
      }
    }
    
    // Verify that the invitation was set in the response
    const createdInvitationId = result.data?.invitation;
    if (!createdInvitationId) {
      console.error('WARNING: Scrapbook entry created but invitation field is missing in response!');
      console.error('Response data:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('Scrapbook entry created successfully:', {
        entryId: result.data?.id,
        invitationId: createdInvitationId,
        invitationIdType: typeof createdInvitationId,
      });
    }

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
      data: { id: number; documentId?: string } | { id: number; documentId?: string }[] | null;
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

    const invitationId = invitation?.id;
    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID not found' },
        { status: 500 }
      );
    }

    // Fetch scrapbook entries with image populated
    const entriesResponse = await fetchStrapi<{
      data: any[] | null;
    }>(`/scrapbook-entries?filters[invitation][id][$eq]=${invitationId}&populate=image`);

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

