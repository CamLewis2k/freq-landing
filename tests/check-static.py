from html.parser import HTMLParser
from pathlib import Path
import re, base64
root=Path(__file__).resolve().parents[1]
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.tags=[]
 def handle_starttag(self, tag, attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
p=Parse();text=(root/'index.html').read_text();p.feed(text)
assert len(p.ids)==len(set(p.ids)), 'Duplicate IDs'
for tag,a in p.tags:
 if tag=='a' and a.get('href','').startswith('#'):assert a['href'][1:] in p.ids,a
assert len([t for t,a in p.tags if t=='h1'])==1
assert not any(t=='img' and 'alt' not in a for t,a in p.tags)
assert '/*__' not in text and '__BODY_FONT__' not in text
assert 'creator-worlds' not in text and 'data-room' not in text and 'localStorage' not in text
assert 'Freq isn’t live yet.' in text and 'There’s no launch date to announce yet.' in text
assert 'prefers-reduced-motion' in text and ':focus-visible' in text
assert '#waitlistStatus:empty{display:none}' not in text
assert 'font-size:16px' in text
for tag,a in p.tags:
 if tag=='svg':assert a.get('aria-hidden')=='true'
for asset in ['assets/fonts/Manrope.ttf','assets/fonts/Manrope-OFL.txt','assets/freq-social.png']:assert (root/asset).stat().st_size>0
from PIL import Image
assert Image.open(root/'assets/freq-social.png').size==(1200,630)
portable=(root/'Freq-Design-Review.html').read_text()
assert 'data:font/ttf;base64,' in portable
assert '/assets/fonts/Manrope.ttf' not in portable
try:
 import tinycss2
 css=(root/'src/styles.css').read_text()
 assert not [r for r in tinycss2.parse_stylesheet(css,skip_whitespace=True,skip_comments=True) if r.type=='error']
 print('PASS CSS syntax parsing')
except ImportError:print('SKIP CSS parser unavailable')
print('PASS HTML structure, anchors, labels, metadata, launch disclosures, assets and portable build')
