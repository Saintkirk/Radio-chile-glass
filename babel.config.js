module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push("react-native-worklets/plugin");
  // Add plugins to transpile private fields for Hermes compatibility
  plugins.push("@babel/plugin-transform-private-methods");
  plugins.push("@babel/plugin-transform-class-properties");
  plugins.push("@babel/plugin-proposal-decorators", { legacy: true });

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
      ["@babel/preset-env", { targets: { android: "current" } }]
    ],
    plugins,
  };
};
