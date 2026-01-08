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

    // Upload photo to Strapi if provided
    let photoId: number | null = null;
    if (photo && photo.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append('files', photo);
      photoFormData.append('ref', 'api::scrapbook-entry.scrapbook-entry');
      photoFormData.append('field', 'photo');

      const uploadResponse = await fetch(`${strapiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
        },
        body: photoFormData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        photoId = uploadData[0]?.id || null;
      }
    }

    // Create scrapbook entry in Strapi
    const entryData: any = {
      data: {
        name,
        message,
        phone: phone || null,
        invitation: invitation.id,
        submitted_at: new Date().toISOString(),
        ...(photoId && { photo: photoId }),
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

