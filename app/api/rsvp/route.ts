import { NextRequest, NextResponse } from 'next/server';

// Type definition for RSVP submission
interface RSVPSubmission {
  fullName: string;
  phoneNumber: string;
  email: string;
  message?: string;
  status: 'attending' | 'not-attending';
  submittedAt: string;
}

// Validate required fields
function validateRSVP(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const status = data.status as string;
  const isNotAttending = status === 'not-attending';
  
  // Full name is always required
  if (!data.fullName?.toString().trim()) {
    return { valid: false, error: 'Full name is required' };
  }
  
  // For attending, phone and email are required
  if (!isNotAttending) {
    if (!data.phoneNumber?.toString().trim()) {
      return { valid: false, error: 'Phone number is required' };
    }
    if (!data.email?.toString().trim()) {
      return { valid: false, error: 'Email address is required' };
    }
    // Basic email validation for attending
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email?.toString() || '')) {
      return { valid: false, error: 'Invalid email address' };
    }
  }
  
  // For not-attending, message is required
  if (isNotAttending && !data.message?.toString().trim()) {
    return { valid: false, error: 'Message is required' };
  }
  
  return { valid: true };
}

// Send data to Google Apps Script Web App (non-blocking)
async function sendToGoogleSheet(rsvpData: RSVPSubmission): Promise<void> {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('GOOGLE_APPS_SCRIPT_URL environment variable is not set');
    return;
  }

  try {
    // Fire and forget - don't wait for response
    // This prevents timeout issues while still saving data
    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires no-cors mode
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvpData),
    }).catch((error) => {
      // Log error but don't block the response
      console.error('Error sending RSVP to Google Sheet (background):', error);
    });
  } catch (error) {
    // Log error but don't block the response
    console.error('Error initiating Google Sheet submission:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate RSVP data
    const validation = validateRSVP(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Prepare RSVP submission
    const isNotAttending = body.status === 'not-attending';
    const rsvpSubmission: RSVPSubmission = {
      fullName: body.fullName.trim(),
      // For not-attending, send "N/A" to satisfy Google Apps Script validation
      // If script validation is updated (see RSVP_SETUP.md), empty strings will also work
      phoneNumber: isNotAttending ? 'N/A' : (body.phoneNumber?.trim() || ''),
      email: isNotAttending ? 'N/A' : (body.email?.trim() || ''),
      message: body.message?.trim() || '',
      status: body.status,
      submittedAt: new Date().toISOString(),
    };

    // Send to Google Sheet in the background (non-blocking)
    // This prevents timeout issues - we return success immediately
    // and let Google Sheets save happen asynchronously
    sendToGoogleSheet(rsvpSubmission).catch((error) => {
      console.error('Background Google Sheet submission error:', error);
    });

    // Return success immediately - Google Sheets will save in background
    return NextResponse.json(
      { 
        success: true, 
        message: 'RSVP submitted successfully!' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('RSVP API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
