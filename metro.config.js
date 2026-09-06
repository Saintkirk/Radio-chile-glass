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
// Block React Native internal DOM setup files that reference non-existent modules
config.resolver.blockList = [
  // Block React Native's internal DOM setup which references HTMLCollection and other DOM modules
  /node_modules[\\/]react-native[\\/]src[\\/]private[\\/]setup[\\/]setUpDOM\.js$/,
  /node_modules[\\/]react-native[\\/]src[\\/]private[\\/]setup[\\/]setUpDefaultReactNativeEnvironment\.js$/,
  // Block any DOM-related modules that shouldn't be in mobile bundles
  /node_modules[\\/].*?[\\/]dom[\\/].*?/,
  /node_modules[\\/]react-native-dom[\\/].*?/,
  /node_modules[\\/]jsdom[\\/].*?/,
  // Block oldstylecollections specifically mentioned in the error
  /node_modules[\\/]react-native[\\/]src[\\/]webapis[\\/]dom[\\/]oldstylecollections[\\/].*?/,
];

// Prevent React Native from auto-importing DOM setup via package exports
// This is critical for RN 0.81+ which has conditional exports for DOM modules
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
