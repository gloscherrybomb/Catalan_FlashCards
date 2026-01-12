# Firebase Setup Guide for Catalan FlashCards

This guide will help you configure Firebase authentication for the Catalan FlashCards application.

## Current Status: Demo Mode

Your application is currently running in **demo mode** because Firebase credentials are not configured. In demo mode:
- ✅ The app works with local storage only
- ❌ No real Google sign-in (simulated demo user)
- ❌ No cloud data synchronization
- ❌ Progress not saved across devices

## Prerequisites

- A Google account
- Node.js and npm installed
- This project cloned locally

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select an existing project)
3. Enter a project name (e.g., "catalan-flashcards")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Catalan FlashCards Web")
3. **DO NOT** check "Set up Firebase Hosting" (unless you want to use it)
4. Click **"Register app"**
5. You'll see your Firebase configuration - **keep this page open**

## Step 3: Get Your Firebase Credentials

From the Firebase configuration screen, copy these values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // Copy this
  authDomain: "project.firebaseapp.com",  // Copy this
  projectId: "project-id",       // Copy this
  storageBucket: "project.appspot.com",   // Copy this
  messagingSenderId: "123456789", // Copy this
  appId: "1:123:web:abc"         // Copy this
};
```

## Step 4: Enable Google Authentication

1. In Firebase Console, go to **"Build"** → **"Authentication"**
2. Click **"Get started"** (if first time)
3. Go to the **"Sign-in method"** tab
4. Click on **"Google"**
5. Toggle **"Enable"**
6. Enter a public-facing name for your project
7. Choose a support email
8. Click **"Save"**

## Step 5: Add Authorized Domains

1. Still in **Authentication** → **"Settings"** tab
2. Scroll to **"Authorized domains"**
3. Add your development domain (usually already includes `localhost`)
4. If deploying, add your production domain (e.g., `your-app.com`)

## Step 6: Enable Firestore Database

1. In Firebase Console, go to **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - **Note:** Change security rules before production!
4. Select a Cloud Firestore location
5. Click **"Enable"**

## Step 7: Create Your .env File

1. In the project root directory, create a new file named `.env`
2. Copy the contents from `.env.example`:

```bash
cp .env.example .env
```

3. Edit `.env` and replace the placeholder values with your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Step 8: Restart the Development Server

**Important:** Vite only loads environment variables at startup.

1. Stop the development server (Ctrl+C)
2. Restart it:

```bash
npm run dev
```

## Step 9: Test Sign-In

1. Open your application in the browser
2. Click the **"Sign In"** button in the header
3. A Google sign-in popup should appear
4. Select your Google account
5. Grant permissions
6. You should be signed in!

## Troubleshooting

### Issue: "Demo Mode" alert still appears

**Solution:**
- Verify `.env` file exists in the project root
- Check that all variables start with `VITE_`
- Restart the dev server

### Issue: "Popup blocked" error

**Solution:**
- Allow popups for localhost in your browser settings
- Try again

### Issue: "Unauthorized domain" error

**Solution:**
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain (e.g., `localhost`)

### Issue: Sign-in popup closes immediately

**Solution:**
- Check browser console for errors
- Verify your Firebase API key is correct
- Ensure Google sign-in is enabled in Firebase Console

### Issue: "Missing or insufficient permissions" in Firestore

**Solution:**
- Go to Firestore Database → Rules
- For development, use:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

## Security Notes

### ⚠️ Important: Before Production

1. **Update Firestore Security Rules:**
   - Replace test mode rules with proper authentication rules
   - See [Firebase Security Rules documentation](https://firebase.google.com/docs/firestore/security/get-started)

2. **Restrict API Key:**
   - In Firebase Console → Project Settings → General
   - Under "Your apps", configure API key restrictions

3. **Review Authorized Domains:**
   - Only include domains you control
   - Remove any test/development domains from production

4. **Never commit .env file:**
   - The `.env` file is already in `.gitignore`
   - Never commit Firebase credentials to version control

## File Structure

```
Catalan_FlashCards/
├── .env                 # Your Firebase credentials (DO NOT COMMIT)
├── .env.example         # Template for credentials
├── FIREBASE_SETUP.md    # This file
├── src/
│   └── services/
│       └── firebase.ts  # Firebase configuration and functions
```

## Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review Firebase Console logs
3. Verify all configuration steps above
4. Consult [Firebase Documentation](https://firebase.google.com/docs)

## Demo Mode vs Production Mode

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| Sign-in | Simulated | Real Google OAuth |
| Data storage | Local only | Cloud Firestore |
| Multi-device sync | ❌ No | ✅ Yes |
| User profiles | Demo only | Real user data |
| Progress persistence | Browser only | Cloud synced |

---

**Need more help?** Open an issue on the project repository.
