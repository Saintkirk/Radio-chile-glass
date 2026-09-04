const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

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
  /node_modules\/react-native\/src\/private\/setup\/setUpDOM\.js/, // Block React Native's DOM setup
];

// Ensure React Native's internal src directory is resolvable
// This fixes module resolution for setUpDefaultReactNativeEnvironment and other internal modules
const reactNativePath = path.dirname(require.resolve("react-native/package.json"));
config.resolver.nodeModulesPaths = [
  path.join(reactNativePath, "src"),
  ...(config.resolver.nodeModulesPaths || []),
];

// Add resolver extraNodeModules to ensure expo/dom/* can be resolved
const expoPath = path.dirname(require.resolve("expo/package.json"));
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo/dom": path.join(expoPath, "dom"),
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules.
  forceWriteFileSystem: true,
});
