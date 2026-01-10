import { notFound } from 'next/navigation';
import { getInvitation } from '../../../lib/getInvitation';
import ClientInvitation from '../../../components/ClientInvitation';
import BackButton from '../../../components/BackButton';

export default async function InvitationPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Fetch data on the server - instant rendering, no loading state needed
  const invitationData = await getInvitation(params.slug);

  // If not found, show 404 immediately (fast!)
  if (!invitationData) {
    notFound();
  }

  return (
    <div className="relative">
      <BackButton />
      <ClientInvitation data={invitationData} />
    </div>
  );
}

