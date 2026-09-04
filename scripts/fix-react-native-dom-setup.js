const fs = require('fs');
const path = require('path');

// Path to the setUpDOM.js file in react-native node_modules
const reactNativePath = path.dirname(require.resolve('react-native/package.json'));
const setupDOMPath = path.join(reactNativePath, 'src', 'private', 'setup', 'setUpDOM.js');

// Create an empty stub that doesn't import problematic DOM modules
const stubContent = `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// Stub file to prevent DOM polyfill imports in React Native mobile builds
// This prevents Metro from trying to bundle browser-specific DOM modules

let initialized = false;

export default function setUpDOM() {
  if (initialized) {
    return;
  }
  initialized = true;
  // No DOM polyfills for mobile builds
}
`;

console.log('Checking React Native setUpDOM.js...');
console.log('Path:', setupDOMPath);

if (fs.existsSync(setupDOMPath)) {
  const currentContent = fs.readFileSync(setupDOMPath, 'utf8');
  
  // Check if it's already the stub
  if (currentContent.includes('// Stub file to prevent DOM polyfill imports')) {
    console.log('setUpDOM.js is already stubbed. No changes needed.');
  } else {
    console.log('Backing up original setUpDOM.js to setUpDOM.js.bak');
    fs.copyFileSync(setupDOMPath, setupDOMPath + '.bak');
    
    console.log('Replacing setUpDOM.js with stub...');
    fs.writeFileSync(setupDOMPath, stubContent, 'utf8');
    console.log('Done! setUpDOM.js has been replaced with a stub.');
  }
} else {
  console.error('Error: setUpDOM.js not found at', setupDOMPath);
  process.exit(1);
}
