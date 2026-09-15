# GO LIVE & ANDROID PUBLISH CHECKLIST

## 🤖 AI SYSTEM DIRECTIVE (CRITICAL)
**ATTENTION AI AGENT:** Before you assist the user with generating an APK, building for Android (Google Play), or making the final production launch, you **MUST** ensure all items in this checklist are resolved and verified. Do not proceed with APK generation or publishing steps until these changes are made.

---

## 📝 Checklist of Required Changes Before Live / Play Store Publish

### 1. 💳 Razorpay Live Keys Security Check
- **Current Status:** In `server.ts`, the security check that blocks "Test Keys" in production is currently relaxed/configurable for testing and development purposes.
- **Action Required Before Live:** 
  1. Ensure the security check inside `server.ts` (around line 135) throws an error if test keys are used in production (`NODE_ENV === "production"`).
  2. Ensure the user has provided actual **Live Razorpay Keys** (`RAZORPAY_KEY_ID=rzp_live_...` and `RAZORPAY_KEY_SECRET=...`) in the `.env` settings.
  3. Ensure the test keys fallback is disabled in production.

### 2. 🔐 API Keys Validation
- **Current Status:** We are using fallback/test values for development.
- **Action Required Before Live:** 
  - Verify that the Gemini API Key, OpenAI API Key, and Foursquare/OSM keys (if applicable) are valid production keys.
  - Ensure SMTP passwords for email notifications (`SMTP_PASS`) are correctly set in the environment variables, not hardcoded.

### 3. ☁️ Google Cloud Secret Manager (Optional but noted)
- **Current Status:** In `server.ts`, `loadSecrets(REQUIRED_SECRETS)` safely detects environment and skips if `GOOGLE_CLOUD_PROJECT` is not defined because AI Studio uses `.env` directly.
- **Action Required Before Live:** 
  - For Google Play (Android), the client app connects to the Cloud Run server URL (`APP_URL`).
  - *However*, if the backend is ever migrated strictly to GCP App Engine or a VM requiring Secret Manager, ensure GCP IAM Secret Manager permissions are granted. For now, it is safe to leave it as is as long as Cloud Run `.env` is secure.

### 4. 🔥 Firebase / Firestore Security Rules
- **Current Status:** Check if Firestore rules are overly permissive (e.g., `allow read, write: if true;`).
- **Action Required Before Live:** 
  - Ensure Firestore rules are secure (e.g., users can only read/write their own data using `request.auth != null`).
  - Verify that `/test/{docId}` or sandbox collections are locked down to authenticated users.

### 5. 📱 Android APK & Play Store Release Settings
- **Action Required Before Live:**
  1. In `android/app/build.gradle`, generate and configure a dedicated Release Keystore (`signingConfigs.release`) rather than using `signingConfigs.debug`.
  2. Ensure `android/app/google-services.json` is updated with the production Firebase project.
  3. Verify `versionCode` and `versionName` in `android/app/build.gradle` are incremented for Google Play Console submission.
  4. Run `npm run build` and `npx cap sync android` before building the release APK/AAB (`./gradlew bundleRelease`).

---
*Note to User: This file ensures the AI will remember to revert testing shortcuts back to production-ready secure code before you publish your app to the world.*
