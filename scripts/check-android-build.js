import fs from 'fs';
import path from 'path';

const androidConfigPath = path.resolve(process.cwd(), 'android/app/google-services.json');

if (!fs.existsSync(androidConfigPath)) {
    console.error(`🚨 [Android Build Error] Missing ${androidConfigPath}!`);
    console.error("Firebase Cloud Messaging requires this file for push notifications on native Android devices.");
    console.error("Please download it from the Firebase Console and place it at 'android/app/google-services.json'.");
    process.exit(1);
} else {
    console.log(`✅ [Android Build Check] Found ${androidConfigPath}.`);
}
