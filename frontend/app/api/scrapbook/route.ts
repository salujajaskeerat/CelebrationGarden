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
    const phone = formData.get('phone') as string | null;
    const invitationSlug = formData.get('invitationSlug') as string;
    const photo = formData.get('photo') as File | null;

    if (!name || !message || !invitationSlug) {
      return NextResponse.json(
        { error: 'Name, message, and invitation slug are required' },
        { status: 400 }
      );
    }

    // First, get the invitation ID from Strapi
    const invitationResponse = await fetchStrapi<{
      data: { id: number } | { id: number }[] | null;
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

    // Upload photo directly to Cloudinary with low resolution optimization
    let cloudinaryImageUrl: string | null = null;
    if (photo && photo.size > 0) {
      try {
        const cloudName = process.env.CLOUDINARY_NAME;
        const apiKey = process.env.CLOUDINARY_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
          console.error('Cloudinary credentials not configured');
          return NextResponse.json(
            { error: 'Image upload service not configured' },
            { status: 500 }
          );
        }

        // Convert File to base64 data URI for Cloudinary upload
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const dataUri = `data:${photo.type};base64,${base64Image}`;

        // Create form data for Cloudinary upload
        // Use unsigned upload with upload_preset (recommended for server-side)
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', dataUri);
        cloudinaryFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default');
        cloudinaryFormData.append('folder', `${process.env.CLOUDINARY_FOLDER || 'celebration-garden'}/scrapbook`);
        // Low resolution optimization settings - applied as transformation parameter
        // q_auto:low = automatic low quality, f_auto = auto format, w_800/h_800 = max dimensions, c_limit = don't crop
        cloudinaryFormData.append('transformation', 'q_auto:low,f_auto,w_800,h_800,c_limit');

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: cloudinaryFormData,
          }
        );

        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();
          cloudinaryImageUrl = cloudinaryData.secure_url || cloudinaryData.url;
        } else {
          const errorText = await cloudinaryResponse.text();
          console.error('Cloudinary upload failed:', errorText);
        }
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        // Continue without image if upload fails
      }
    }

    // Create scrapbook entry in Strapi
    // Store image URL as text field (since we're storing Cloudinary URL directly)
    const entryData: any = {
      data: {
        name,
        message,
        phone: phone || null,
        invitation: invitation.id,
        submitted_at: new Date().toISOString(),
        ...(cloudinaryImageUrl && { image: cloudinaryImageUrl }), // Store Cloudinary URL
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

    // Fetch scrapbook entries
    const entriesResponse = await fetchStrapi<{
      data: any[] | null;
    }>(`/scrapbook-entries?filters[invitation][id][$eq]=${invitation.id}&populate=photo`);

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

