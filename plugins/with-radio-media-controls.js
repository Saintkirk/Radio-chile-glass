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
        'implementation("com.facebook.react:react-android")\n    implementation("androidx.media:media:1.7.0")\n    implementation("androidx.core:core-ktx:1.13.1")',
      );
    } else if (!mod.modResults.contents.includes("androidx.core:core-ktx")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'implementation("androidx.media:media:1.7.0")',
        'implementation("androidx.media:media:1.7.0")\n    implementation("androidx.core:core-ktx:1.13.1")',
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
    for (const fileName of ["RadioMediaControlsModule.kt", "RadioMediaControlsPackage.kt", "RadioMediaActionReceiver.kt", "RadioKeepAliveService.kt"]) {
      fs.copyFileSync(path.join(SOURCE_DIR, fileName), path.join(destinationDir, fileName));
    }
    const manifestPath = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "AndroidManifest.xml");
    if (fs.existsSync(manifestPath)) {
      let manifest = fs.readFileSync(manifestPath, "utf8");
      const receiver = '    <receiver android:name=".RadioMediaActionReceiver" android:exported="false" />';
      if (!manifest.includes("RadioMediaActionReceiver")) {
        manifest = manifest.replace(/(<application\b[^>]*>)/, `$1\n${receiver}`);
      }
      if (!manifest.includes("RadioKeepAliveService")) {
        manifest = manifest.replace(/(<application\b[^>]*>)/, `$1\n    <service android:name=".RadioKeepAliveService" android:exported="false" android:foregroundServiceType="mediaPlayback" />`);
      }
      fs.writeFileSync(manifestPath, manifest);
    }
    return mod;
  }]);
}

module.exports = withRadioMediaControls;
