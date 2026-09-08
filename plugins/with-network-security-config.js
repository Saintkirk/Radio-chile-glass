const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Plugin para configurar Network Security Config en Android.
 * Permite cleartext solo en dominios de streaming conocidos;
 * base-config sigue sin cleartext por defecto.
 *
 * No incluir <pin-set> vacío: Android Lint lo trata como error fatal en release.
 */
function withNetworkSecurityConfig(config) {
  config = withDangerousMod(config, [
    "android",
    async (mod) => {
      const resDir = path.join(
        mod.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res"
      );
      const xmlDir = path.join(resDir, "xml");

      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // No empty <pin-set>: Lint [NetworkSecurityConfig] requires <pin> children.
      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>

    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">stream-url.com</domain>
        <domain includeSubdomains="true">radio-stream.com</domain>
        <domain includeSubdomains="true">live-radio.net</domain>
        <domain includeSubdomains="true">icecast.org</domain>
        <domain includeSubdomains="true">shoutcast.com</domain>
        <domain includeSubdomains="true">streamguys.com</domain>
        <domain includeSubdomains="true">radionet.de</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>

    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>
`;

      const configPath = path.join(xmlDir, "network_security_config.xml");
      fs.writeFileSync(configPath, networkSecurityConfig, "utf8");

      return mod;
    },
  ]);

  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    if (!manifest.application) {
      manifest.application = { $: {} };
    }

    const application = manifest.application;
    if (!application.$) {
      application.$ = {};
    }

    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";

    if (!application.$["android:usesCleartextTraffic"]) {
      application.$["android:usesCleartextTraffic"] = "false";
    }

    return mod;
  });

  return config;
}

module.exports = withNetworkSecurityConfig;
