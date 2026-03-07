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

  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s for cold start
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-RSVP/1.0',
        },
        body: JSON.stringify(rsvpData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  try {
    try {
      await doFetch();
    } catch (firstError) {
      // Retry once on connection errors (e.g. "other side closed", cold start)
      const msg = firstError instanceof Error ? firstError.message + (firstError.cause ? ` ${String(firstError.cause)}` : '') : String(firstError);
      if (msg.includes('closed') || msg.includes('fetch failed') || (firstError instanceof Error && firstError.name === 'AbortError')) {
        await new Promise((r) => setTimeout(r, 2000));
        await doFetch();
      } else {
        throw firstError;
      }
    }
  } catch (error) {
    console.error('Error sending RSVP to Google Sheet (background):', error);
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

    // Await the Google Sheets submission before responding
    // (On serverless platforms, fire-and-forget calls get killed when the response is sent)
    try {
      await sendToGoogleSheet(rsvpSubmission);
    } catch (error) {
      console.error('Google Sheet submission error:', error);
    }

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
