import { NextRequest, NextResponse } from 'next/server';
import { strapiUrl, strapiApiToken } from '../../lib/strapi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.desired_date || !body.guest_count || !body.preferred_lawn) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required fields including phone number.' },
        { status: 400 }
      );
    }

    // Prepare data for Strapi
    const inquiryData = {
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        preferred_lawn: body.preferred_lawn,
        desired_date: body.desired_date,
        guest_count: body.guest_count,
        submitted_at: new Date().toISOString(),
        status: 'new',
      }
    };

    // Submit to Strapi
    const response = await fetch(`${strapiUrl}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(strapiApiToken && { Authorization: `Bearer ${strapiApiToken}` }),
      },
      body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Strapi API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Inquiry submitted successfully',
        data: result 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
