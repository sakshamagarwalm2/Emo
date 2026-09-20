const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GRADLE_ZIP_URL = 'https://services.gradle.org/distributions/gradle-8.6-bin.zip';
const GRADLE_USER_HOME = 'C:\\Users\\SAKSHAM\\.gradle';
const DISTS_DIR = path.join(GRADLE_USER_HOME, 'wrapper', 'dists');

async function setupGradleZip() {
  if (!fs.existsSync(DISTS_DIR)) {
    fs.mkdirSync(DISTS_DIR, { recursive: true });
  }

  // Find or create the hash folder under dists/gradle-8.6-bin/
  const gradleBinDir = path.join(DISTS_DIR, 'gradle-8.6-bin');
  if (!fs.existsSync(gradleBinDir)) {
    fs.mkdirSync(gradleBinDir, { recursive: true });
  }

  // Check if any hash subfolder exists
  let hashDirs = fs.readdirSync(gradleBinDir);
  let targetHashDir = '';
  if (hashDirs.length > 0) {
    targetHashDir = path.join(gradleBinDir, hashDirs[0]);
  } else {
    targetHashDir = path.join(gradleBinDir, '2a537...latest');
    fs.mkdirSync(targetHashDir, { recursive: true });
  }

  const zipPath = path.join(targetHashDir, 'gradle-8.6-bin.zip');
  console.log(`[Gradle Setup] Downloading gradle-8.6-bin.zip to ${zipPath}...`);

  const downloadCmd = `powershell -Command "Invoke-WebRequest -Uri '${GRADLE_ZIP_URL}' -OutFile '${zipPath}'"`;
  execSync(downloadCmd, { stdio: 'inherit' });

  console.log('[Gradle Setup] Download complete! Extracting zip...');
  const extractCmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetHashDir}' -Force"`;
  execSync(extractCmd, { stdio: 'inherit' });

  // Touch .ok file so Gradle wrapper knows it's complete
  fs.writeFileSync(path.join(targetHashDir, 'gradle-8.6-bin.zip.ok'), '');
  console.log('[Gradle Setup] Gradle 8.6 is ready!');
}

setupGradleZip();
