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

// Block only true DOM polyfills that break Hermes.
// Do NOT use /node_modules\/.*/dom\/.*/ — that also matches expo/dom,
// which expo-router needs (useDomComponentNavigation → expo/dom/global).
config.resolver.blockList = [
  /node_modules\/jsdom\//,
  /node_modules\/react-native-dom\//,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
