# 🌙 Ramadhan Checklist - Next.js App

## Setup Instructions

### 1. Google Cloud Console Setup

#### Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Sheets API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copy **Client ID** and **Client Secret**

#### Create Service Account
1. In **Credentials**, click **Create Credentials** → **Service Account**
2. Name it `ramadhan-sheets-access`
3. Click **Create and Continue**
4. Skip role assignment, click **Done**
5. Click on the service account email
6. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
7. Download the JSON file
8. Copy the `client_email` and `private_key` from the JSON

### 2. Share Spreadsheet with Service Account
1. Open your Master Spreadsheet
2. Click **Share**
3. Add the service account email (from step 1.5 above)
4. Give it **Editor** access
5. Click **Send**

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
- `GOOGLE_CLIENT_ID` - from OAuth credentials
- `GOOGLE_CLIENT_SECRET` - from OAuth credentials
- `NEXTAUTH_SECRET` - run: `openssl rand -base64 32`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - from service account JSON
- `GOOGLE_PRIVATE_KEY` - from service account JSON (keep the quotes and \n)

### 4. Run the App
```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

Update OAuth redirect URI to: `https://your-app.vercel.app/api/auth/callback/google`

## How It Works

- **Authentication**: Google OAuth via NextAuth
- **Data Access**: Service account reads/writes to your private spreadsheet
- **Security**: Users never access spreadsheet directly
- **Permissions**: Each user sees only their own submissions
