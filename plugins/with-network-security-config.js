const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Plugin para configurar Network Security Config en Android
 * Permite tráfico HTTP para dominios específicos de streaming
 * y aplica configuraciones de seguridad optimizadas
 */
function withNetworkSecurityConfig(config) {
  // Crear el archivo network_security_config.xml
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
      
      // Crear directorio xml si no existe
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Contenido del network_security_config.xml
      // Permite HTTP para dominios de streaming comunes y configura seguridad
      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Configuración base segura -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    
    <!-- Dominios específicos que permiten tráfico HTTP (streaming) -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- Dominios comunes de streaming de radio -->
        <domain includeSubdomains="true">stream-url.com</domain>
        <domain includeSubdomains="true">radio-stream.com</domain>
        <domain includeSubdomains="true">live-radio.net</domain>
        <domain includeSubdomains="true">icecast.org</domain>
        <domain includeSubdomains="true">shoutcast.com</domain>
        <domain includeSubdomains="true">streamguys.com</domain>
        <domain includeSubdomains="true">radionet.de</domain>
        
        <!-- Permitir localhost para desarrollo -->
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        
        <!-- Configuración de pinning para dominios críticos -->
        <pin-set expiration="2025-12-31">
            <!-- Los pins se pueden agregar aquí para mayor seguridad -->
        </pin-set>
    </domain-config>
    
    <!-- Configuración específica para debugging (solo debug builds) -->
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

  // Actualizar AndroidManifest.xml para referenciar la configuración de red
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    
    // Asegurar que application tenga networkSecurityConfig
    if (!manifest.application) {
      manifest.application = {
        $: {},
      };
    }
    
    const application = manifest.application;
    if (!application.$) {
      application.$ = {};
    }
    
    // Agregar referencia al network security config
    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    
    // Asegurar que usesCleartextTraffic esté configurado apropiadamente
    // Lo dejamos como false por defecto, los dominios específicos se manejan en el XML
    if (!application.$["android:usesCleartextTraffic"]) {
      application.$["android:usesCleartextTraffic"] = "false";
    }
    
    return mod;
  });

  return config;
}

module.exports = withNetworkSecurityConfig;
