module.exports = function (api) {
  api.cache(true);

  // Do NOT re-register @babel/plugin-transform-class-properties,
  // private-methods, or private-property-in-object here.
  // babel-preset-expo already enables them with a consistent loose mode.
  // Registering them again with different options causes:
  //   "'loose' mode configuration must be the same for ..."
  // and breaks :app:createBundleReleaseJsAndAssets (Hermes).

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Must be listed last (reanimated / worklets requirement)
      "react-native-worklets/plugin",
    ],
  };
};
