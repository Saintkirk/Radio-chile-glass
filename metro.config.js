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

// Set target for Hermes compiler to ensure proper transpilation
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Exclude DOM polyfills from the bundle that cause Hermes compilation errors
config.resolver.blockList = [
  /node_modules\/.*\/dom\/.*/,
  /node_modules\/react-native-dom\/.*/,
  /node_modules\/jsdom\/.*/,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
