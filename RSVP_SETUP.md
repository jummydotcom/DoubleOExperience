# RSVP Data Persistence Setup Guide

This guide explains how to set up RSVP data persistence using Google Sheets and Google Apps Script.

## Overview

The RSVP system works as follows:

1. **Guest fills RSVP form** on the website (`I am coming` or `I am not coming`)
2. **Form data is submitted** to `/api/rsvp` (Next.js API route)
3. **Server-side validation** ensures all required fields are present
4. **Data is sent to Google Sheets** via a Google Apps Script Web App
5. **Each submission appears as a new row** in your Google Sheet
6. **User receives confirmation** of successful submission

## Architecture

```
Website (Client)
    ↓
Next.js API Route (/api/rsvp)
    ↓
Google Apps Script Web App
    ↓
Google Sheet
```

## Step-by-Step Setup

### Part 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Create a new spreadsheet**
3. Name it: `DoubleOExperience RSVPs` (or your preferred name)
4. In the first row, create these column headers:
   - **A1**: `Full Name`
   - **B1**: `Phone Number`
   - **C1**: `Email`
   - **D1**: `Status` (Attending/Not Attending)
   - **E1**: `Message`
   - **F1**: `Submitted At`

5. Save the sheet and note the **Sheet ID** (found in the URL between `/d/` and `/edit`)
   - Example URL: `https://docs.google.com/spreadsheets/d/1ABC123XYZ789/edit`
   - Sheet ID: `1ABC123XYZ789`

### Part 2: Create Google Apps Script

1. With your Google Sheet open, click **Extensions** → **Apps Script**
2. Delete any default code and replace it with the code below
3. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID from Part 1

#### Google Apps Script Code

```javascript
// Configuration - CHANGE THIS
const SHEET_ID = "YOUR_SHEET_ID_HERE"; // Replace with your Google Sheet ID
const SHEET_NAME = "Sheet1"; // Change if you renamed the sheet

/**
 * Handle POST requests from the Next.js API
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const payload = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!payload.fullName || !payload.email || !payload.phoneNumber) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Missing required fields" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ 
          success: false, 
          error: "Sheet not found. Check SHEET_NAME configuration." 
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Append the data to the sheet
    const newRow = [
      payload.fullName,
      payload.phoneNumber,
      payload.email,
      payload.status === "attending" ? "Attending" : "Not Attending",
      payload.message || "",
      payload.submittedAt,
    ];

    sheet.appendRow(newRow);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: "RSVP recorded successfully" 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: error.toString() 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * Run this from the Apps Script editor to test
 */
function testDoPost() {
  const testPayload = {
    fullName: "John Doe",
    phoneNumber: "123-456-7890",
    email: "john@example.com",
    status: "attending",
    message: "Looking forward to it!",
    submittedAt: new Date().toISOString(),
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload),
    },
  };

  const result = doPost(mockEvent);
  console.log("Test result:", result.getContent());
}
```

### Part 3: Deploy Google Apps Script

1. In the Apps Script editor, click **Deploy** (top right)
2. Click **New deployment**
3. In the **Select type** dropdown, choose **Web app**
4. Set:
   - **Execute as**: Your Google account
   - **Who has access**: `Anyone`
5. Click **Deploy**
6. You'll see a popup with your deployment URL. Copy it.
   - Example: `https://script.google.com/macros/d/ABC123XYZ789/usercontent`
   - **Important**: The URL will end with `/usercontent`, not `/usercontent`

### Part 4: Configure Your Next.js App

1. Create a `.env.local` file in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace with your Google Apps Script URL:
   ```
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/ABC123XYZ789/usercontent
   ```

3. Save the file. The app will automatically use this URL when deploying to Vercel.

### Part 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Click the **RSVP** button to open the RSVP modal

4. Fill out the form with test data and click **I am coming** or submit a "not attending" message

5. You should see a success confirmation

6. Go to your Google Sheet and verify the new row was added

## Troubleshooting

### "Failed to save RSVP. Please try again."

**Possible causes:**
- Google Apps Script URL is incorrect or missing in `.env.local`
- Google Apps Script is not deployed as a web app
- Sheet ID in the script is wrong
- Sheet1 has been renamed but script still looks for "Sheet1"

**Solution:**
1. Verify your `.env.local` has the correct URL
2. In Google Apps Script editor, click **Deploy** to see your current deployments
3. Check the sheet ID in the Google Apps Script matches your Google Sheet
4. Run the `testDoPost()` function in Apps Script editor to test

### Data not appearing in Google Sheet

**Possible causes:**
- Different sheet name (script looks for "Sheet1")
- Column headers are missing or misaligned
- Script doesn't have permission to edit the sheet

**Solution:**
1. Check your Google Sheet has the correct column headers in row 1
2. Rename your sheet to "Sheet1" or update the script's `SHEET_NAME` variable
3. Ensure the Apps Script is deployed with "Execute as" set to your account

### CORS or "no-cors" errors in browser console

**This is normal and expected.** The API uses `mode: 'no-cors'` to avoid CORS issues with Google Apps Script. Errors in the console don't indicate failure. Check your Google Sheet to confirm data was saved.

## Viewing RSVP Data

### In Google Sheets

1. Open your Google Sheet: [https://sheets.google.com](https://sheets.google.com)
2. Find and open `DoubleOExperience RSVPs`
3. Each row represents one RSVP submission
4. Columns show:
   - **Full Name**: Guest's name
   - **Phone Number**: Guest's phone
   - **Email**: Guest's email address
   - **Status**: "Attending" or "Not Attending"
   - **Message**: Goodwill message (if not attending)
   - **Submitted At**: ISO timestamp of submission

### Features

- **Sort/Filter**: Click the filter icon (⊂) in any column header
  - Sort by date: Click **Submitted At** column → **Sort sheet Z → A** (latest first)
  - Filter by status: Click **Status** column → select "Attending" to see only confirmations
  
- **Charts**: Create charts from your RSVP data
  - Select data → **Insert** → **Chart**
  - Create a pie chart of Attending vs Not Attending

- **Download data**: Click **File** → **Download** → Choose format (CSV, Excel, PDF, etc.)

## Security Considerations

- **No sensitive keys are exposed**: API keys are stored only on the server
- **All validation happens server-side**: The client can't bypass validation
- **Google Apps Script handles the actual sheet write**: Your sheet is protected by Google's security
- **Submissions are logged with timestamps**: You can track when each RSVP was submitted

## Moving to Production (Vercel Deployment)

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add RSVP data persistence"
   git push
   ```

2. **Add environment variable to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Select your project → **Settings** → **Environment Variables**
   - Add: `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` with your Apps Script URL
   - Redeploy

3. **Test on Vercel deployment**: Fill out the RSVP form and verify data appears in your Google Sheet

## Advanced: Customize Google Apps Script

You can enhance the script with additional features:

### Send email confirmation to guest

Add this to the Google Apps Script (after the `appendRow` line):

```javascript
// Send confirmation email
GmailApp.sendEmail(
  payload.email,
  "RSVP Confirmation",
  `Hi ${payload.fullName},\n\nThank you for your RSVP!\n\nWe're excited to see you at the wedding.\n\nBest regards,\nThe Couple`
);
```

### Add automatic email notification to couple

Add this after the `appendRow` line:

```javascript
// Notify couple of new RSVP
GmailApp.sendEmail(
  "couple@example.com", // Replace with couple's email
  `New RSVP from ${payload.fullName}`,
  `Status: ${payload.status === "attending" ? "Attending" : "Not Attending"}\nEmail: ${payload.email}\nPhone: ${payload.phoneNumber}`
);
```

### Log to Google Sheets with metadata

Add this to track additional info:

```javascript
// Add a separate log sheet
const logSheet = spreadsheet.getSheetByName("Logs") || spreadsheet.insertSheet("Logs");
logSheet.appendRow([
  new Date(),
  payload.email,
  "Submission successful",
  `Row ${sheet.getLastRow()}`
]);
```

## FAQ

**Q: Can I customize which columns appear?**
A: Yes! Add/remove columns in the Google Sheet and update the `newRow` array in the Google Apps Script to match.

**Q: What if someone submits the form twice?**
A: Both submissions will be saved. Add a check in the Google Apps Script to deduplicate by email if needed.

**Q: Can I send automated emails to guests?**
A: Yes, use `GmailApp.sendEmail()` in the Google Apps Script (see Advanced section).

**Q: Is my data backed up?**
A: Yes! Google Sheets automatically saves revisions. Click **File** → **Version history** to see past versions.

**Q: How long does Google Sheets keep my data?**
A: Indefinitely, unless you delete it. Google Sheets has no automatic deletion policy.

## Next Steps

1. ✅ Set up Google Sheet
2. ✅ Create Google Apps Script
3. ✅ Deploy Google Apps Script
4. ✅ Configure `.env.local`
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. 📊 Share the Google Sheet with family members who need to view RSVPs
8. 🎉 Start accepting RSVPs!

---

**Need help?** Check the Troubleshooting section or review your Google Apps Script logs in the Apps Script editor.
