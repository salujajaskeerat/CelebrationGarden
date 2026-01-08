import { NextRequest, NextResponse } from 'next/server';
import { fetchStrapi } from '../../../../lib/strapi';

// Get list of all invitations with scrapbook entry counts
export async function GET(request: NextRequest) {
  try {
    // Fetch all invitations
    const invitationsResponse = await fetchStrapi<{
      data: Array<{
        id: number;
        slug: string;
        title: string;
        event_date: string;
        type: string;
      }> | null;
    }>('/invitation?sort=event_date:desc');

    if (!invitationsResponse.data) {
      return NextResponse.json({ success: true, data: [] });
    }

    const invitations = Array.isArray(invitationsResponse.data)
      ? invitationsResponse.data
      : [invitationsResponse.data];

    // Get entry counts for each invitation
    const invitationsWithCounts = await Promise.all(
      invitations.map(async (invitation) => {
        try {
          const entriesResponse = await fetchStrapi<{
            data: any[] | null;
          }>(`/scrapbook-entries?filters[invitation][id][$eq]=${invitation.id}`);

          const entryCount = Array.isArray(entriesResponse.data)
            ? entriesResponse.data.length
            : entriesResponse.data
            ? 1
            : 0;

          return {
            id: invitation.id,
            slug: invitation.slug,
            title: invitation.title,
            event_date: invitation.event_date,
            type: invitation.type,
            entryCount,
            isExpired: new Date(invitation.event_date) < new Date(),
          };
        } catch (error) {
          return {
            id: invitation.id,
            slug: invitation.slug,
            title: invitation.title,
            event_date: invitation.event_date,
            type: invitation.type,
            entryCount: 0,
            isExpired: new Date(invitation.event_date) < new Date(),
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: invitationsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

