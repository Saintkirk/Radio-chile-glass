module.exports = function (api) {
  api.cache(true);

  // All class-feature plugins MUST share the same `loose` value or Metro/Hermes
  // fails with: "'loose' mode configuration must be the same for ..."
  const classFeatures = { loose: true };

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["@babel/plugin-transform-class-properties", classFeatures],
      ["@babel/plugin-transform-private-methods", classFeatures],
      ["@babel/plugin-transform-private-property-in-object", classFeatures],
      // worklets/reanimated must be listed last
      "react-native-worklets/plugin",
    ],
  };
};
