"""Refresh CJK subsets after Chinese content changes. Requires fonttools[woff]."""
from pathlib import Path
from io import BytesIO
import json
import re
import urllib.parse
import urllib.request
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
text = ''.join((root / name).read_text(encoding='utf-8') for name in ['_data/profile.zh.json', '_data/i18n.json', '_data/honors.json', '_data/languages.json', '_data/links.json'])
characters = ''.join(sorted({c for c in text if ord(c) >= 0x3000}))
for family, slug in [('Noto Sans SC', 'noto-sans-sc'), ('Noto Serif SC', 'noto-serif-sc')]:
    query = urllib.parse.urlencode({'family': family + ':wght@400', 'text': characters, 'display': 'swap'})
    request = urllib.request.Request('https://fonts.googleapis.com/css2?' + query, headers={'User-Agent': 'Mozilla/5.0'})
    css = urllib.request.urlopen(request, timeout=35).read().decode()
    urls = re.findall(r'url\(([^)]+)\)', css)
    assert urls, 'No font returned for ' + family
    raw = urllib.request.urlopen(urls[-1], timeout=35).read()
    font = TTFont(BytesIO(raw))
    font.flavor = 'woff2'
    output = BytesIO()
    font.save(output)
    (root / 'assets/fonts' / (slug + '.woff2')).write_bytes(output.getvalue())
    license_url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/' + slug.replace('-', '') + '/OFL.txt'
    (root / 'assets/fonts' / (slug + '-OFL.txt')).write_bytes(urllib.request.urlopen(license_url, timeout=30).read())
    print(json.dumps({'font': family, 'characters': len(characters), 'bytes': len(output.getvalue())}))
