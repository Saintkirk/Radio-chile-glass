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
