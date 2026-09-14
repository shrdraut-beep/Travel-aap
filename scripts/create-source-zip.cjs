const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '..');
const publicZipPath = path.join(rootDir, 'public', 'routripo-project.zip');
const rootZipPath = path.join(rootDir, 'routripo-source.zip');

console.log('[Zip Creator] Starting source zip generation...');

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

    // Glob patterns to include while excluding build caches and heavy dependencies
    archive.glob('**/*', {
      cwd: rootDir,
      dot: true, // include dotfiles like .env.example, .gitignore
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '.gradle/**',
        '**/.gradle/**',
        'android/build/**',
        'android/.gradle/**',
        'android/app/build/**',
        'android/app/src/main/assets/public/**',
        'public/*.zip',
        '*.zip',
        '*.tar.gz',
        '*.log',
        '**/*.log',
        '_build_archive/**',
        '_archive_mocks/**',
        'coverage/**',
        'graphify-out/**'
      ]
    });

    archive.finalize();
  });
}

async function main() {
  try {
    // 1. Create public/routripo-project.zip
    console.log('[Zip Creator] Writing to public/routripo-project.zip ...');
    await createZip(publicZipPath);

    // 2. Copy or create routripo-source.zip at root
    console.log('[Zip Creator] Copying to root routripo-source.zip ...');
    fs.copyFileSync(publicZipPath, rootZipPath);
    console.log(`[Zip Creator] Successfully created root zip: ${rootZipPath}`);

    console.log('[Zip Creator] Done! Both zips are ready and synchronized.');
  } catch (err) {
    console.error('[Zip Creator Error]', err);
    process.exit(1);
  }
}

main();
