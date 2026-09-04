const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure minifier to handle Hermes compatibility
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
  output: {
    comments: false,
  },
};

// Exclude DOM polyfills from the bundle that cause Hermes compilation errors
// This fixes the HTMLCollection resolution error in React Native 0.81.5 / Expo SDK 54
config.resolver.blockList = [
  /node_modules\/.*\\/dom\/.*/,
  /node_modules\/react-native-dom\/.*/,
  /node_modules\/jsdom\/.*/,
  /node_modules\/react-native\/src\/private\/webapis\/dom\/oldstylecollections\/HTMLCollection/,
  /node_modules\/react-native\/src\/private\/webapis\/dom\/oldstylecollections\/NodeList/,
];

// Add resolver main fields to ensure correct module resolution
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
