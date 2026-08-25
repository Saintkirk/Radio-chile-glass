from pathlib import Path
from PIL import Image

source = Path('assets/images/santiago-radio-hero.jpg')
temporary = source.with_suffix('.optimized.jpg')
image = Image.open(source).convert('RGB')
max_width = 900
if image.width > max_width:
    height = round(image.height * max_width / image.width)
    image = image.resize((max_width, height), Image.Resampling.LANCZOS)
image.save(temporary, format='JPEG', quality=78, optimize=True, progressive=True)
temporary.replace(source)
print(f'{source}: {image.width}x{image.height}, {source.stat().st_size} bytes')
