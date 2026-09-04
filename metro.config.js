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

// Fix for React Native 0.81.5 DOM polyfills - allow React Native's internal webapis
// but block external DOM polyfills that cause conflicts
config.resolver.blockList = [
  /node_modules\/react-native-dom\/.*/,
  /node_modules\/jsdom\/.*/,
];

// Ensure React Native's internal webapis are properly resolved
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
