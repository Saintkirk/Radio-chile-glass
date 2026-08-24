from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/radio-chile-glass-logo-antenna.png')
assets = Path('/home/ubuntu/radio-chile-glass/assets/images')
image = Image.open(source).convert('RGB')
image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
compressed = image.quantize(colors=192, method=Image.Quantize.MEDIANCUT)
for name in ('icon.png', 'splash-icon.png', 'android-icon-foreground.png'):
    compressed.save(assets / name, format='PNG', optimize=True)
compressed.resize((512, 512), Image.Resampling.LANCZOS).save(assets / 'favicon.png', format='PNG', optimize=True)
