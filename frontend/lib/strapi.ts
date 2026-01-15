// Strapi API client configuration
export const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
export const strapiApiToken = process.env.STRAPI_API_TOKEN || '';

// Helper function to fetch from Strapi with caching
export async function fetchStrapi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${strapiUrl}/api${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(strapiApiToken && { Authorization: `Bearer ${strapiApiToken}` }),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Not found');
    }
    // Try to get more detailed error message from response
    let errorMessage = `Strapi API error: ${response.statusText}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        const errorText = errorData.length > 200 ? errorData.substring(0, 200) : errorData;
        errorMessage = `Strapi API error (${response.status}): ${errorText}`;
      }
    } catch {
      // If we can't parse error, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Public helper for unauthenticated Strapi calls (client-safe)
export async function fetchStrapiPublic<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${strapiUrl}/api${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Not found');
    }
    throw new Error(`Strapi API error: ${response.statusText}`);
  }

  return response.json();
}
