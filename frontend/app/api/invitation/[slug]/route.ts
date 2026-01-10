import { NextRequest, NextResponse } from 'next/server';
import { getInvitation } from '../../../../lib/getInvitation';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Use the shared utility function for consistency
  const invitationData = await getInvitation(slug);

  if (!invitationData) {
    return NextResponse.json(
      { error: 'Invitation not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(invitationData);
}

