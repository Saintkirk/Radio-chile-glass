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
config.resolver.blockList = [
  /node_modules\/.*\/dom\/.*/,
  /node_modules\/react-native-dom\/.*/,
  /node_modules\/jsdom\/.*/,
  /node_modules\/react-native\/src\/private\/setup\/setUpDOM\.js/,
  /node_modules\/react-native\/src\/private\/setup\/setUpDefaultReactNativeEnvironment\.js/,
  /node_modules\/react-native\/src\/webapis\/dom\/.*/,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
