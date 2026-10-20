from html.parser import HTMLParser
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
class Parse(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=[];self.tags=[];self.stack=[];self.svgs=[]
 def handle_starttag(self, tag, attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
  hidden=a.get('aria-hidden')=='true' or any(item[1] for item in self.stack)
  if tag=='svg':self.svgs.append((a,hidden))
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append((tag,hidden))
 def handle_endtag(self, tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:
    self.stack=self.stack[:i];break
 def handle_startendtag(self, tag, attrs):
  self.handle_starttag(tag,attrs)
  if self.stack and self.stack[-1][0]==tag:self.stack.pop()
p=Parse();text=(root/'index.html').read_text();p.feed(text)
assert len(p.ids)==len(set(p.ids)), 'Duplicate IDs'
for tag,a in p.tags:
 if tag=='a' and a.get('href','').startswith('#'):assert a['href'][1:] in p.ids,a
assert len([t for t,a in p.tags if t=='h1'])==1
assert not any(t=='img' and 'alt' not in a for t,a in p.tags)
assert '/*__' not in text and '__BODY_FONT__' not in text and '__DISPLAY_FONT__' not in text
assert 'creator-worlds' not in text and 'data-room=' not in text and 'localStorage' not in text
assert 'CONCEPT ROOM · NOT LIVE' in text and 'design preview, not a live stream' in text
assert 'Freq isn’t broadcasting yet.' in text and 'There’s no launch date to announce yet.' in text
assert 'not an account or a guarantee of early access' in text
assert 'prefers-reduced-motion' in text and ':focus-visible' in text
assert '#waitlistStatus:empty{display:none}' not in text
assert 'font-size:16px' in text
assert all(hidden for a,hidden in p.svgs), 'Decorative SVG must be aria-hidden directly or through an ancestor'
for asset in ['assets/fonts/Manrope.ttf','assets/fonts/Manrope-OFL.txt','assets/fonts/BarlowCondensed-ExtraBold.ttf','assets/fonts/Barlow-OFL.txt','assets/freq-social.png']:assert (root/asset).stat().st_size>0
from PIL import Image
assert Image.open(root/'assets/freq-social.png').size==(1200,630)
portable=(root/'Freq-Design-Review.html').read_text()
assert portable.count('data:font/ttf;base64,')==2
assert '/assets/fonts/Manrope.ttf' not in portable and '/assets/fonts/BarlowCondensed-ExtraBold.ttf' not in portable
assert '__BODY_FONT__' not in portable and '__DISPLAY_FONT__' not in portable
try:
 import tinycss2
 css=(root/'src/styles.css').read_text()
 assert not [r for r in tinycss2.parse_stylesheet(css,skip_whitespace=True,skip_comments=True) if r.type=='error']
 print('PASS CSS syntax parsing')
except ImportError:print('SKIP CSS parser unavailable')
print('PASS HTML structure, anchors, labels, metadata, concept/launch disclosures, assets and portable build')
