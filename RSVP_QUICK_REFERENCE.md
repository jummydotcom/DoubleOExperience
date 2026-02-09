# RSVP Data Persistence - Quick Reference

## What Was Added

Three new pieces to enable RSVP data saving:

1. **API Route** (`app/api/rsvp/route.ts`)
   - Validates form data
   - Sends to Google Sheets via Google Apps Script
   - Returns success/error messages

2. **Utility Function** (`app/utils/rsvp.ts`)
   - `submitRSVP()` function
   - Handles API communication from the client
   - Manages loading and error states

3. **Updated RSVP Modal** (`app/page.tsx`)
   - New states: `success` and `error`
   - Shows loading indicator ("Submitting...")
   - Displays error messages with retry option
   - Displays success confirmation

## Quick Setup

### 1. Create Google Sheet (5 minutes)

- Go to [sheets.google.com](https://sheets.google.com)
- Create new spreadsheet: `DoubleOExperience RSVPs`
- Add headers in row 1:
  ```
  A1: Full Name | B1: Phone Number | C1: Email | D1: Status | E1: Message | F1: Submitted At
  ```
- Copy your **Sheet ID** from the URL

### 2. Create Google Apps Script (5 minutes)

- With your sheet open: **Extensions** → **Apps Script**
- Paste the code from `RSVP_SETUP.md` (section "Google Apps Script Code")
- Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID
- Click **Deploy** → **New deployment** → **Web app**
- Copy the deployment URL

### 3. Configure Next.js (2 minutes)

- Create `.env.local` file:
  ```bash
  cp .env.local.example .env.local
  ```
- Edit `.env.local`:
  ```
  NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/YOUR_ID/usercontent
  ```
- Replace `YOUR_ID` with your Google Apps Script deployment ID

### 4. Test Locally (2 minutes)

```bash
npm run dev
```

- Open http://localhost:3000
- Click RSVP button
- Fill form and submit
- Check your Google Sheet for the new row

## Environment Variables

**File**: `.env.local`

```env
# Your Google Apps Script Web App URL
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent
```

### How to find your Google Apps Script URL

1. Open Google Apps Script editor
2. Click **Deploy** (top right)
3. Find your "Web app" deployment
4. The URL format is: `https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent`
5. Copy the entire URL and paste into `.env.local`

## Form Data Structure

When someone submits the RSVP form, the following data is captured:

```typescript
{
  fullName: string;        // e.g., "John Doe"
  phoneNumber: string;     // e.g., "555-123-4567"
  email: string;           // e.g., "john@example.com"
  message?: string;        // Only for "not attending"
  status: "attending" | "not-attending";
  submittedAt: string;     // ISO timestamp
}
```

This data is sent to your Google Sheet as a new row.

## API Route Details

**Endpoint**: `POST /api/rsvp`

**Request body**:
```json
{
  "fullName": "Jane Smith",
  "phoneNumber": "555-987-6543",
  "email": "jane@example.com",
  "message": "Can't make it this time!",
  "status": "not-attending"
}
```

**Success response** (200):
```json
{
  "success": true,
  "message": "RSVP submitted successfully!"
}
```

**Error response** (400/500):
```json
{
  "error": "Full name is required"
}
```

## Viewing RSVPs

### In Google Sheets

1. Open [https://sheets.google.com](https://sheets.google.com)
2. Click on "DoubleOExperience RSVPs"
3. See all submissions as rows

### Sorting by Date (Latest First)

- Click **Submitted At** column header
- Click sort icon → **Sort Z → A**

### Filtering by Status

- Click filter icon in **Status** column
- Select "Attending" to see only confirmations

### Downloading Data

- **File** → **Download** → Choose format (CSV, Excel, PDF)

## Deployment to Vercel

### Add Environment Variable to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
   - **Value**: Your Google Apps Script URL
5. Click **Save**
6. Redeploy your project

### Verify It Works

- Open your Vercel deployment URL
- Test the RSVP form
- Check your Google Sheet for new entries

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to save RSVP" | Check `.env.local` has the correct Google Apps Script URL |
| Data not in Google Sheet | Verify column headers are in row 1 of your sheet |
| Script won't deploy | Make sure you set the Apps Script deployment to "Web app" type |
| Can't find Google Apps Script URL | Go to Apps Script Editor → **Deploy** → View deployments |

## Files Changed/Added

```
app/
  ├── api/
  │   └── rsvp/
  │       └── route.ts (NEW - API handler)
  ├── utils/
  │   └── rsvp.ts (NEW - Utility functions)
  └── page.tsx (MODIFIED - Updated RSVP Modal)

.env.local (NEW - Configuration)
.env.local.example (NEW - Template)
RSVP_SETUP.md (NEW - Detailed setup guide)
```

## Next: Additional Features

Consider adding:
- Email confirmations to guests
- Email notifications to couple when RSVP received
- Automatic filtering of duplicates
- Guest count tracking
- Dietary restrictions field
- Photo upload after event

See "Advanced: Customize Google Apps Script" in `RSVP_SETUP.md` for examples.

---

**Questions?** See the full guide at `RSVP_SETUP.md` or check the Troubleshooting section.
