const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SDK_DIR = 'C:\\Users\\SAKSHAM\\AppData\\Local\\Android\\Sdk';
const PLATFORM_TOOLS_URL = 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip';
const CMDLINE_TOOLS_URL = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip';

async function downloadAndExtract(url, zipName, targetFolder) {
  const zipPath = path.join(SDK_DIR, zipName);
  console.log(`[Android Setup] Downloading ${zipName} via PowerShell/curl...`);

  // Download using curl or Invoke-WebRequest
  const downloadCmd = `powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${zipPath}'"`;
  execSync(downloadCmd, { stdio: 'inherit' });

  console.log(`[Android Setup] Extracting ${zipName} into ${SDK_DIR}...`);
  const extractCmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${SDK_DIR}' -Force"`;
  execSync(extractCmd, { stdio: 'inherit' });

  // Clean up zip file
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  console.log(`[Android Setup] ${zipName} setup complete!`);
}

async function main() {
  if (!fs.existsSync(SDK_DIR)) {
    fs.mkdirSync(SDK_DIR, { recursive: true });
  }

  try {
    // 1. Download & Extract Android Platform-Tools (adb, fastboot, etc.)
    await downloadAndExtract(PLATFORM_TOOLS_URL, 'platform-tools.zip', 'platform-tools');

    // 2. Download & Extract Android Command-Line Tools (sdkmanager, avdmanager)
    await downloadAndExtract(CMDLINE_TOOLS_URL, 'cmdlinetools.zip', 'cmdline-tools');

    // Reorganize cmdline-tools into latest folder structure expected by Android SDK
    const cmdlineSrc = path.join(SDK_DIR, 'cmdline-tools');
    const latestDir = path.join(SDK_DIR, 'cmdline-tools', 'latest');
    
    if (fs.existsSync(cmdlineSrc) && !fs.existsSync(latestDir)) {
      fs.mkdirSync(latestDir, { recursive: true });
      const items = fs.readdirSync(cmdlineSrc);
      for (const item of items) {
        if (item !== 'latest') {
          const oldPath = path.join(cmdlineSrc, item);
          const newPath = path.join(latestDir, item);
          fs.renameSync(oldPath, newPath);
        }
      }
    }

    console.log('\n====================================================');
    console.log('    ANDROID SDK PLATFORM-TOOLS SETUP COMPLETE       ');
    console.log('====================================================');
    console.log(`SDK Directory: ${SDK_DIR}`);
    console.log(`ADB Location: ${path.join(SDK_DIR, 'platform-tools', 'adb.exe')}`);
    console.log(`SDKManager Location: ${path.join(SDK_DIR, 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat')}`);
  } catch (err) {
    console.error('[Android Setup] Failed:', err);
  }
}

main();
