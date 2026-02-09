/**
 * Utility functions for RSVP form submission
 */

export interface RSVPFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  message?: string;
  status: 'attending' | 'not-attending';
}

export interface RSVPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Submit RSVP data to the server
 * @param formData The RSVP form data to submit
 * @returns Promise with success/error status
 */
export async function submitRSVP(formData: RSVPFormData): Promise<RSVPResponse> {
  const controller = new AbortController();
  // Increased timeout to 60 seconds as backup (though API should respond quickly now)
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }
    } else {
      // If response is not JSON, treat as error
      return {
        success: false,
        error: 'Invalid response from server. Please try again.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to submit RSVP',
      };
    }

    return {
      success: true,
      message: data.message || 'RSVP submitted successfully!',
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('RSVP submission timeout:', error);
      return {
        success: false,
        error: 'Request timed out. Please try again.',
      };
    }
    
    console.error('RSVP submission error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}
