const fs = require('fs');
const path = require('path');

// Path to the React Native setup file
const setupFilePath = path.join(
  __dirname,
  '../node_modules/react-native/src/private/setup/setUpDefaultReactNativeEnvironment.js'
);

try {
  if (fs.existsSync(setupFilePath)) {
    let content = fs.readFileSync(setupFilePath, 'utf8');
    
    // Replace the setUpDOM require with a no-op for non-web environments
    // This fixes the module resolution error during Android builds
    const originalLine = "require('./setUpDOM').default();";
    const replacementLine = "// require('./setUpDOM').default(); - DOM setup not needed for Android";
    
    if (content.includes(originalLine)) {
      content = content.replace(originalLine, replacementLine);
      fs.writeFileSync(setupFilePath, content, 'utf8');
      console.log('✓ Fixed React Native DOM setup - commented out setUpDOM require');
    } else {
      console.log('ℹ setUpDOM require already modified or not found, skipping...');
    }
  } else {
    console.warn('⚠ Setup file not found at:', setupFilePath);
    console.warn('Continuing build as this may be expected in some environments...');
  }
} catch (error) {
  console.error('Error fixing React Native setup:', error.message);
  // Don't fail the build on this error, just warn
  console.warn('Continuing build despite DOM setup fix failure...');
}

// Also fix metro.config.js to not block React Native's internal DOM polyfills
const metroConfigPath = path.join(__dirname, '../metro.config.js');

try {
  if (fs.existsSync(metroConfigPath)) {
    let metroContent = fs.readFileSync(metroConfigPath, 'utf8');
    
    // Check if the overly broad blockList pattern exists that blocks React Native's internal DOM modules
    if (metroContent.includes('/node_modules/') && metroContent.includes('/dom/')) {
      // Replace with a more specific pattern that only blocks jsdom
      const newBlockList = `config.resolver.blockList = [
  /node_modules\\/jsdom\\/.*/,
];`;
      
      metroContent = metroContent.replace(
        /config\.resolver\.blockList\s*=\s*\[[\s\S]*?\];/,
        newBlockList
      );
      fs.writeFileSync(metroConfigPath, metroContent, 'utf8');
      console.log('✓ Fixed Metro config - removed overly broad DOM blocklist');
    } else {
      console.log('ℹ Metro config blockList already modified or not found, skipping...');
    }
  }
} catch (error) {
  console.error('Error fixing Metro config:', error.message);
  console.warn('Continuing despite Metro config fix failure...');
}
