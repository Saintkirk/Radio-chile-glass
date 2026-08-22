import fs from "node:fs";

const path = "app/radio/[id].tsx";
let source = fs.readFileSync(path, "utf8");
source = source.replace('import { StationLogo } from "@/components/station-logo";\n', 'import { StationLogo } from "@/components/station-logo";\nimport { CoverFlowCarousel } from "@/components/cover-flow-carousel";\n');
source = source.replace(/  const artworkResponder = useMemo\(\(\) => PanResponder\.create\([\s\S]*?\n  \}, \[changeRadio\]\);\n/, "");
const oldArtwork = /<View \{\.\.\.artworkResponder\.panHandlers\}[\s\S]*?<\/View><\/Animated\.View><View style=\{styles\.liveMeta\}>/;
const replacement = '<View ref={artworkRef} collapsable={false} onLayout={measureArtworkOrigin} style={styles.artworkFlowWrap}><CoverFlowCarousel radios={radios} activeIndex={currentIndex} onChange={changeRadio} onPlay={() => currentRadio?.id === radio.id ? togglePlay() : playRadio(radio)} isPlaying={isPlaying} currentRadioId={currentRadio?.id} lightMode={lightMode} /></View></Animated.View><View style={styles.liveMeta}>';
if (!oldArtwork.test(source)) throw new Error("No se encontró la carátula antigua del detalle");
source = source.replace(oldArtwork, replacement);
fs.writeFileSync(path, source);
console.log("Detail Flow Cover applied");
