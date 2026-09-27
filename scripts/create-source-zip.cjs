const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '..');
const publicZipPath = path.join(rootDir, 'public', 'RoutTripo_Complete_App.zip');
const rootZipPath = path.join(rootDir, 'RoutTripo_Complete_App.zip');

console.log('[Zip Creator] Starting full application zip generation...');

// Ensure public directory exists
if (!fs.existsSync(path.join(rootDir, 'public'))) {
  fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
}

function createZip(outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`[Zip Creator] Created: ${outputPath} (${sizeMB} MB, ${archive.pointer()} bytes)`);
      resolve();
    });

    output.on('end', () => {
      console.log('[Zip Creator] Data drained');
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[Zip Creator Warning]', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Glob patterns to include all project files, .env, dist, and configs while excluding heavy 3rd-party caches
    archive.glob('**/*', {
      cwd: rootDir,
      dot: true, // include dotfiles like .env, .env.example, .gitignore
      ignore: [
        'node_modules/**',
        '**/node_modules/**',
        'dist/**',
        '**/.git/**',
        '.git/**',
        '.gradle/**',
        '**/.gradle/**',
        'android/build/**',
        'android/.gradle/**',
        'android/app/build/**',
        'android/app/src/main/assets/public/**',
        '**/*.zip',
        '*.zip',
        '*.tar.gz',
        '**/*.tar.gz',
        '*.log',
        '**/*.log',
        '_build_archive/**',
        '_archive_mocks/**',
        'coverage/**',
        'graphify-out/**',
        'scratch/**',
        'staging_new_folder/**',
        'app_screenshots/**'
      ]
    });

    archive.finalize();
  });
}

async function main() {
  try {
    // 1. Create public/RoutTripo_Complete_App.zip
    console.log('[Zip Creator] Writing to public/RoutTripo_Complete_App.zip ...');
    await createZip(publicZipPath);

    // 2. Copy to root RoutTripo_Complete_App.zip
    console.log('[Zip Creator] Copying to root RoutTripo_Complete_App.zip ...');
    fs.copyFileSync(publicZipPath, rootZipPath);
    console.log(`[Zip Creator] Successfully created root zip: ${rootZipPath}`);

    // Also sync old alias names so existing download links continue to work
    const legacyPublicZip = path.join(rootDir, 'public', 'routripo-project.zip');
    const legacyRootZip = path.join(rootDir, 'routripo-source.zip');
    fs.copyFileSync(publicZipPath, legacyPublicZip);
    fs.copyFileSync(publicZipPath, legacyRootZip);

    console.log('[Zip Creator] Done! All complete project zips are synchronized.');
  } catch (err) {
    console.error('[Zip Creator Error]', err);
    process.exit(1);
  }
}

main();
