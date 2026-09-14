import fs from 'fs';
import path from 'path';

/**
 * Validates the presence of android/app/google-services.json before native Android builds.
 * Prevents silent notification and analytics failures on native devices.
 */
function validateAndroidEnvironment() {
  const rootDir = process.cwd();
  const androidAppDir = path.join(rootDir, 'android', 'app');
  const googleServicesJson = path.join(androidAppDir, 'google-services.json');
  const googleServicesExample = path.join(androidAppDir, 'google-services.json.example');

  if (!fs.existsSync(androidAppDir)) {
    // Non-Android build environment
    return;
  }

  if (fs.existsSync(googleServicesJson)) {
    console.log('✅ [validate-android-env] android/app/google-services.json is present and verified.');
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.error('❌ [FATAL ANDROID BUILD ERROR]: android/app/google-services.json is MISSING!');
    console.error('A valid Google Services configuration file is strictly required for native production push notifications.');
    process.exit(1);
  } else {
    console.warn('⚠️ [validate-android-env] Notice: android/app/google-services.json not found in development.');
    if (fs.existsSync(googleServicesExample)) {
      fs.copyFileSync(googleServicesExample, googleServicesJson);
      console.log('ℹ️ [validate-android-env] Seeded developer template from google-services.json.example for sandbox builds.');
    }
  }
}

validateAndroidEnvironment();
