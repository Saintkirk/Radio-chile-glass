const fs = require("fs");
const path = require("path");
const { withAppBuildGradle, withDangerousMod, withMainApplication } = require("expo/config-plugins");

const PACKAGE_PATH = "com/app/radiochileglass";
const SOURCE_DIR = path.join(__dirname, "native");

function withRadioMediaControls(config) {
  config = withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes("androidx.media:media")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'implementation("com.facebook.react:react-android")',
        'implementation("com.facebook.react:react-android")\n    implementation("androidx.media:media:1.7.0")',
      );
    }
    return mod;
  });

  config = withMainApplication(config, (mod) => {
    if (!mod.modResults.contents.includes("RadioMediaControlsPackage()")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        "              // Packages that cannot be autolinked yet can be added manually here, for example:\n              // add(MyReactNativePackage())",
        "              add(RadioMediaControlsPackage())",
      );
    }
    return mod;
  });

  return withDangerousMod(config, ["android", async (mod) => {
    const destinationDir = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "java", PACKAGE_PATH);
    fs.mkdirSync(destinationDir, { recursive: true });
    for (const fileName of ["RadioMediaControlsModule.kt", "RadioMediaControlsPackage.kt"]) {
      fs.copyFileSync(path.join(SOURCE_DIR, fileName), path.join(destinationDir, fileName));
    }
    return mod;
  }]);
}

module.exports = withRadioMediaControls;
