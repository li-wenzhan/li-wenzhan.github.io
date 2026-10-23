"""Optional share-card typesetting. Requires Pillow and fonttools[woff]."""
from pathlib import Path
from io import BytesIO
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
def font(name, size):
    parsed = TTFont(root / 'assets/fonts' / name)
    parsed.flavor = None
    buf = BytesIO()
    parsed.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)

image = Image.new('RGB', (1200, 630), '#f7f6f1')
draw = ImageDraw.Draw(image)
green, muted, orange = '#203c32', '#647067', '#ad572c'
draw.line((60, 64, 1140, 64), fill='#d9ded4', width=2)
draw.text((62, 89), 'EMBODIED AI / ROBOT LEARNING', font=font('ibm-plex-mono.woff2', 14), fill=muted)
draw.text((58, 163), 'Wenzhan Li.', font=font('newsreader.woff2', 99), fill=green)
draw.text((63, 307), 'World-action models.', font=font('newsreader-italic.woff2', 40), fill=orange)
draw.text((63, 357), 'Robot learning.', font=font('newsreader-italic.woff2', 40), fill=orange)
draw.text((64, 462), 'Ph.D. student | Sun Yat-sen University / SLAI', font=font('manrope.woff2', 17), fill=green)
draw.text((64, 554), 'li-wenzhan.github.io', font=font('ibm-plex-mono.woff2', 16), fill=muted)
photo = Image.open(root / 'assets/images/portrait.png').convert('RGB')
photo.thumbnail((326, 326), Image.Resampling.LANCZOS)
draw.rectangle((774, 148, 1124, 523), fill='#fffefb', outline='#d9ded4', width=2)
image.paste(photo, (786, 160))
draw.text((790, 500), 'Wenzhan, in the real world.', font=font('ibm-plex-mono.woff2', 10), fill=muted)
image.save(root / 'assets/images/social-preview.png', optimize=True)
