import { strapiUrl, strapiApiToken } from './strapi';

/**
 * Upload PDF blob to Cloudinary via Strapi's upload endpoint
 * Strapi automatically handles Cloudinary upload due to plugin configuration
 */
export async function uploadPDFToCloudinary(
  pdfBlob: Blob,
  filename: string
): Promise<string> {
  const formData = new FormData();
  formData.append('files', pdfBlob, filename);

  const headers: HeadersInit = {};
  if (strapiApiToken) {
    headers['Authorization'] = `Bearer ${strapiApiToken}`;
  }

  const response = await fetch(`${strapiUrl}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload PDF to Cloudinary: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // Strapi returns an array of uploaded files
  const uploadedFile = Array.isArray(result) ? result[0] : result;
  
  // Get the Cloudinary URL from the uploaded file
  // Strapi with Cloudinary returns the URL directly in the file object
  // The URL is already a Cloudinary URL (absolute)
  const url = uploadedFile?.url;
  
  if (!url) {
    console.error('Upload response:', JSON.stringify(result, null, 2));
    throw new Error('No URL returned from PDF upload. Response: ' + JSON.stringify(result));
  }

  // Cloudinary URLs are already absolute, but handle both cases
  return url.startsWith('http') ? url : `${strapiUrl}${url}`;
}

/**
 * Update invitation with PDF URL
 */
export async function updateInvitationWithPDFUrl(
  invitationId: number,
  pdfUrl: string,
  documentId?: string
): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (strapiApiToken) {
    headers['Authorization'] = `Bearer ${strapiApiToken}`;
  }

  const payload = JSON.stringify({
    data: {
      scrapbook_pdf_url: pdfUrl,
    },
  });

  // Try documentId first if provided (Strapi v5 can use documentId)
  const primaryId = documentId || String(invitationId);
  const primaryResponse = await fetch(`${strapiUrl}/api/invitations/${encodeURIComponent(primaryId)}`, {
    method: 'PUT',
    headers,
    body: payload,
  });

  if (primaryResponse.ok) {
    return;
  }

  // If documentId failed and we have an id to fallback to
  if (documentId && String(invitationId) !== documentId) {
    const fallbackResponse = await fetch(`${strapiUrl}/api/invitations/${invitationId}`, {
      method: 'PUT',
      headers,
      body: payload,
    });

    if (fallbackResponse.ok) {
      return;
    }

    const fallbackError = await fallbackResponse.text();
    throw new Error(`Failed to update invitation with PDF URL: ${fallbackResponse.statusText} - ${fallbackError}`);
  }

  const errorText = await primaryResponse.text();
  throw new Error(`Failed to update invitation with PDF URL: ${primaryResponse.statusText} - ${errorText}`);
}

/**
 * Get PDF blob from a URL (for downloading)
 */
export async function getPDFBlobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
  }
  
  return response.blob();
}
