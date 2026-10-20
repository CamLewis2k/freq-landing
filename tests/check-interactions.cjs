'use strict';
// Dependency-free waitlist regression tests. All network calls and timers are mocked.
// Visual/browser checks are separate; these tests never submit an actual address.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../src/index.template.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../src/styles.css'), 'utf8');
const audience = {u:'c9d1c6436ce253c18651cf98d', id:'af8427abca', f_id:'00b41ce1f0'};

function setup(options = {}) {
  class Element {
    constructor(){this.dataset={};this.attributes={};this.handlers={};this.textContent='';this.innerHTML='';this.value='';this.disabled=false;this.children=[];this.classes=new Set();this.classList={toggle:(name,force)=>{const enabled=force===undefined?!this.classes.has(name):force;if(enabled)this.classes.add(name);else this.classes.delete(name);return enabled;},contains:name=>this.classes.has(name)};}
    setAttribute(name,value){this.attributes[name]=String(value);}
    getAttribute(name){return this.attributes[name]??null;}
    addEventListener(name, fn){(this.handlers[name]??=[]).push(fn);}
    fire(name){for(const fn of this.handlers[name]??[])fn({target:this,preventDefault(){}});}
    append(element){this.children.push(element);element.parent=this;}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);}
  }
  const elements={};
  const get=id=>elements[id]??=new Element();
  const modeButtons=['music','gaming','talk'].map(mode=>{const button=new Element();button.dataset.mode=mode;button.setAttribute('aria-pressed',String(mode==='music'));return button;});
  get('roomApp').dataset.mode='music';
  get('motionToggle').setAttribute('aria-pressed','false');
  const document={getElementById:get,querySelectorAll:selector=>selector==='.mode-button'?modeButtons:[],head:new Element(),createElement:()=>new Element()};
  let resets=0;
  get('waitlistForm').reportValidity=()=>options.valid!==false;
  get('waitlistForm').reset=()=>{resets++;get('waitlistEmail').value='';get('companyWebsite').value='';};
  get('waitlistButton').textContent='Keep me posted';
  const timers=new Map();let timerID=0;let now=1700000000000;
  const context={document,URL,URLSearchParams,console,Date:{now:()=>options.sameMillisecond?now:now++},
    clearTimeout:id=>timers.delete(id),setTimeout:(fn,ms)=>{timers.set(++timerID,{fn,ms});return timerID;}};
  context.window=context;
  vm.createContext(context);vm.runInContext(source,context);
  const submit=(address='synthetic@example.invalid')=>{get('waitlistEmail').value=address;get('waitlistForm').fire('submit');};
  const request=()=>{const script=document.head.children.at(-1);assert.ok(script,'Expected a mocked JSONP request');const url=new URL(script.src);return {script,url,callback:url.searchParams.get('c')};};
  const response=value=>{const req=request();context[req.callback](value);return req;};
  const runTimer=ms=>{const entry=[...timers].find(([,t])=>t.ms===ms);assert.ok(entry,`Missing ${ms}ms timer`);timers.delete(entry[0]);entry[1].fn();};
  return {get,modeButtons,document,context,timers,submit,request,response,runTimer,resets:()=>resets};
}

let count=0;let failures=0;
function test(name, fn){try{fn();console.log(`PASS ${++count}: ${name}`);}catch(error){failures++;console.error(`FAIL: ${name}\n${error.stack}`);}}

test('native email validation blocks invalid submissions',()=>{const t=setup({valid:false});t.submit();assert.equal(t.document.head.children.length,0);assert.equal(t.get('waitlistButton').disabled,false);});
test('honeypot silently blocks submissions without changing the form',()=>{const t=setup();t.get('companyWebsite').value='bot';t.submit();assert.equal(t.document.head.children.length,0);assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.get('waitlistStatus').textContent,'');});
test('pending request disables the submit button and prevents duplicates',()=>{const t=setup();t.submit();t.submit();assert.equal(t.document.head.children.length,1);assert.equal(t.get('waitlistButton').disabled,true);assert.equal(t.get('waitlistButton').textContent,'Joining…');assert.equal(t.get('waitlistStatus').textContent,'');assert.equal(t.get('waitlistStatus').dataset.state,'');assert.equal(t.resets(),0);});
test('JSONP endpoint and original Mailchimp audience remain unchanged',()=>{const t=setup();t.submit('  test+tag@example.invalid  ');const {url}=t.request();assert.equal(url.origin+url.pathname,'https://app.us11.list-manage.com/subscribe/post-json');for(const [key,value] of Object.entries(audience))assert.equal(url.searchParams.get(key),value);assert.equal(url.searchParams.get('EMAIL'),'test+tag@example.invalid');assert.match(url.searchParams.get('c'),/^freqSignup_\d+_\d+$/);});
test('only a provider success callback displays success and resets the form',()=>{const t=setup();t.submit();assert.notEqual(t.get('waitlistStatus').dataset.state,'success');t.response({result:'success'});assert.equal(t.get('waitlistStatus').dataset.state,'success');assert.match(t.get('waitlistStatus').textContent,/You’re on the list/);assert.equal(t.get('waitlistEmail').value,'');assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.get('waitlistButton').textContent,'Keep me posted');assert.equal(t.document.head.children.length,0);assert.equal(t.resets(),1);assert.ok(![...t.timers.values()].some(t=>t.ms===12000));});
test('provider rejection strips HTML, preserves the email, and permits correction',()=>{const t=setup();t.submit();t.response({result:'error',msg:'0 - <b>Invalid email</b>'});assert.equal(t.get('waitlistStatus').textContent,'Invalid email');assert.equal(t.get('waitlistStatus').dataset.state,'error');assert.equal(t.get('waitlistEmail').value,'synthetic@example.invalid');assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.resets(),0);});
test('already-subscribed response is a success and clearly identifies the existing subscription',()=>{const t=setup();t.submit();t.response({result:'error',msg:'synthetic@example.invalid is already subscribed'});assert.match(t.get('waitlistStatus').textContent,/already on the list. You’re all set/);assert.equal(t.get('waitlistStatus').dataset.state,'success');assert.equal(t.get('waitlistEmail').value,'');assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.resets(),1);});
for(const response of [null,undefined,{}, {result:'error'}, {result:'unexpected',msg:42}])test(`malformed or unrecognized response shows a truthful failure (${JSON.stringify(response)})`,()=>{const t=setup();t.submit();t.response(response);assert.equal(t.get('waitlistStatus').dataset.state,'error');assert.match(t.get('waitlistStatus').textContent,/couldn’t add/);assert.equal(t.resets(),0);});
test('network failure removes the pending script and permits retry',()=>{const t=setup();t.submit();t.request().script.onerror();assert.match(t.get('waitlistStatus').textContent,/couldn’t reach/);assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.document.head.children.length,0);t.submit();assert.equal(t.document.head.children.length,1);assert.equal(t.get('waitlistStatus').textContent,'');});
test('timeout reports uncertainty rather than claiming rejection or success',()=>{const t=setup();t.submit();t.runTimer(12000);assert.equal(t.get('waitlistStatus').dataset.state,'error');assert.match(t.get('waitlistStatus').textContent,/couldn’t confirm/);assert.equal(t.get('waitlistButton').disabled,false);assert.equal(t.get('waitlistEmail').value,'synthetic@example.invalid');assert.equal(t.document.head.children.length,0);});
test('late callback after timeout is harmless and never fabricates success',()=>{const t=setup();t.submit();const old=t.request().callback;t.runTimer(12000);const before=t.get('waitlistStatus').textContent;t.context[old]({result:'success'});assert.equal(t.get('waitlistStatus').textContent,before);assert.equal(t.get('waitlistStatus').dataset.state,'error');assert.equal(t.resets(),0);});
test('late callback cannot overwrite a newer pending signup or its success',()=>{const t=setup();t.submit();const old=t.request().callback;t.runTimer(12000);t.submit('second@example.invalid');const fresh=t.request().callback;assert.notEqual(fresh,old);t.context[old]({result:'success'});assert.equal(t.get('waitlistButton').disabled,true);assert.equal(t.get('waitlistStatus').textContent,'');t.response({result:'success'});t.context[old]({result:'error',msg:'stale failure'});assert.equal(t.get('waitlistStatus').dataset.state,'success');assert.equal(t.resets(),1);});
test('same-millisecond retry has a unique callback and ignores stale responses',()=>{const t=setup({sameMillisecond:true});t.submit();const old=t.request();old.script.onerror();t.submit('retry@example.invalid');const fresh=t.request();assert.notEqual(fresh.callback,old.callback);assert.equal(fresh.callback.split('_')[1],old.callback.split('_')[1]);t.context[old.callback]({result:'success'});assert.equal(t.get('waitlistButton').disabled,true);assert.equal(t.get('waitlistEmail').value,'retry@example.invalid');assert.equal(t.get('waitlistStatus').textContent,'');t.response({result:'success'});assert.equal(t.get('waitlistStatus').dataset.state,'success');t.context[old.callback]({result:'error',msg:'stale failure'});assert.equal(t.get('waitlistStatus').dataset.state,'success');assert.equal(t.resets(),1);});
test('duplicate callback and late error cannot alter a completed success',()=>{const t=setup();t.submit();const req=t.request();t.response({result:'success'});t.context[req.callback]({result:'error',msg:'Duplicate'});req.script.onerror();assert.equal(t.get('waitlistStatus').dataset.state,'success');assert.equal(t.resets(),1);});
test('callback stub is cleaned up after the late-response grace period',()=>{const t=setup();t.submit();const {callback}=t.request();t.response({result:'success'});assert.equal(typeof t.context[callback],'function');t.runTimer(60000);assert.equal(t.context[callback],undefined);});

test('no-JavaScript fallback is a direct POST to the unchanged Mailchimp form',()=>{const form=html.match(/<form\b[^>]*id="waitlistForm"[^>]*>/)?.[0];assert.ok(form);assert.match(form,/method="post"/i);const action=form.match(/action="([^"]+)"/)?.[1].replace(/&amp;/g,'&');const url=new URL(action);assert.equal(url.origin+url.pathname,'https://app.us11.list-manage.com/subscribe/post');for(const [key,value] of Object.entries(audience))assert.equal(url.searchParams.get(key),value);assert.match(html,/<input\b(?=[^>]*id="waitlistEmail")(?=[^>]*name="EMAIL")(?=[^>]*type="email")(?=[^>]*required)[^>]*>/);assert.match(html,/<button\b(?=[^>]*id="waitlistButton")(?=[^>]*type="submit")[^>]*>/);assert.match(html,/name="b_c9d1c6436ce253c18651cf98d_af8427abca"/);});
test('visible form label, native details, and status semantics are present',()=>{assert.match(html,/<label for="waitlistEmail">Your email address<\/label>/);assert.match(html,/id="waitlistStatus" role="status" aria-live="polite"/);assert.match(html,/<details>\s*<summary>What am I signing up for\?<\/summary>/);});
test('old fictional room and following features have been removed',()=>{assert.doesNotMatch(source+html,/Kairo|Val Arcade|Nia Afterhours|data-room=|data-vote=|followCreator|previewDialog|localStorage|creator-worlds-v3/);});
test('prelaunch disclosures and no-account waitlist description remain visible in source',()=>{assert.match(html,/CONCEPT ROOM · NOT LIVE/);assert.match(html,/design preview, not a live stream/);assert.match(html,/Freq isn’t (?:live|broadcasting) yet/);assert.match(html,/not an account or a guarantee of early access/);assert.match(html,/There’s no launch date to announce yet/);});

test('mode controls use native keyboard-operable buttons in a named group',()=>{
  assert.match(html,/<div\b(?=[^>]*class="room-switcher")(?=[^>]*role="group")(?=[^>]*aria-label="Choose a concept room")[^>]*>/);
  const buttons=[...html.matchAll(/<button\b(?=[^>]*class="mode-button")[^>]*>/g)].map(match=>match[0]);
  assert.equal(buttons.length,3);
  for(const [index,mode] of ['music','gaming','talk'].entries()){
    assert.match(buttons[index],/type="button"/);
    assert.ok(buttons[index].includes(`data-mode="${mode}"`));
    assert.ok(buttons[index].includes(`aria-pressed="${index===0}"`));
    assert.doesNotMatch(buttons[index],/disabled|tabindex="-1"/);
  }
});
test('all concept modes update artwork state, explanatory copy, and one selected control',()=>{
  const t=setup();
  const expected={music:['MUSIC / AFTER DARK','AFTER<br />HOURS.','Music room concept'],gaming:['GAMING / NO BACKSEAT RULE','ONE MORE<br />ROUND.','Gaming room concept'],talk:['JUST TALKING / NO SCRIPT','STAY A<br />MINUTE.','Conversation room concept']};
  for(const mode of ['gaming','talk','music']){
    t.modeButtons.find(button=>button.dataset.mode===mode).fire('click');
    assert.equal(t.get('roomApp').dataset.mode,mode);
    assert.equal(t.get('sceneCategory').textContent,expected[mode][0]);
    assert.equal(t.get('sceneTitle').innerHTML,expected[mode][1]);
    assert.ok(t.get('roomMood').textContent.length>0);
    assert.ok(t.get('roomContext').textContent.length>0);
    const description=t.get('roomScene').getAttribute('aria-label');
    assert.ok(description.startsWith(expected[mode][2]));
    assert.match(description,/Not a real broadcast/);
    assert.equal(t.get('roomStatus').textContent,description);
    for(const button of t.modeButtons)assert.equal(button.getAttribute('aria-pressed'),String(button.dataset.mode===mode));
    assert.equal(t.document.head.children.length,0,'Changing a concept must not send a signup or stream request');
  }
});
test('repeated and rapid concept changes leave the final requested mode selected without timers',()=>{
  const t=setup();
  for(const mode of ['gaming','gaming','talk','music','talk'])t.modeButtons.find(button=>button.dataset.mode===mode).fire('click');
  assert.equal(t.get('roomApp').dataset.mode,'talk');
  assert.equal(t.modeButtons.filter(button=>button.getAttribute('aria-pressed')==='true').length,1);
  assert.equal(t.timers.size,0);
  assert.equal(t.document.head.children.length,0);
  assert.equal(t.get('waitlistButton').disabled,false);
});
test('an unknown mode is ignored without corrupting the active concept',()=>{
  const t=setup();t.modeButtons[1].fire('click');
  const before=t.get('sceneTitle').innerHTML;
  t.modeButtons[2].dataset.mode='invalid';t.modeButtons[2].fire('click');
  assert.equal(t.get('roomApp').dataset.mode,'gaming');
  assert.equal(t.get('sceneTitle').innerHTML,before);
});
test('pause and resume expose state and retain the pause across concept switches',()=>{
  const t=setup(), toggle=t.get('motionToggle');toggle.fire('click');
  assert.equal(toggle.getAttribute('aria-pressed'),'true');
  assert.equal(toggle.getAttribute('aria-label'),'Resume decorative animation');
  assert.equal(toggle.textContent,'Resume motion');
  assert.equal(t.get('roomApp').classList.contains('motion-paused'),true);
  t.modeButtons[1].fire('click');
  assert.equal(t.get('roomApp').classList.contains('motion-paused'),true);
  toggle.fire('click');
  assert.equal(toggle.getAttribute('aria-pressed'),'false');
  assert.equal(toggle.getAttribute('aria-label'),'Pause decorative animation');
  assert.equal(toggle.textContent,'Pause motion');
  assert.equal(t.get('roomApp').classList.contains('motion-paused'),false);
  assert.equal(t.document.head.children.length,0);
});
test('concept switching remains independent from a pending waitlist request',()=>{
  const t=setup();t.submit();const callback=t.request().callback;t.modeButtons[2].fire('click');
  assert.equal(t.get('roomApp').dataset.mode,'talk');
  assert.equal(t.get('waitlistButton').disabled,true);
  assert.equal(t.document.head.children.length,1);
  assert.equal(t.request().callback,callback);
  t.response({result:'success'});
  assert.equal(t.get('waitlistStatus').dataset.state,'success');
  assert.equal(t.get('roomApp').dataset.mode,'talk');
});
test('scene semantics keep its pause button accessible and announce concept changes',()=>{
  assert.match(html,/<div\b(?=[^>]*id="roomScene")(?=[^>]*role="group")[^>]*>/);
  assert.match(html,/<button\b(?=[^>]*id="motionToggle")(?=[^>]*type="button")(?=[^>]*aria-pressed="false")(?=[^>]*aria-label="Pause decorative animation")[^>]*>/);
  assert.match(html,/<p\b(?=[^>]*id="roomStatus")(?=[^>]*role="status")(?=[^>]*aria-live="polite")[^>]*>/);
});
test('reduced motion disables animations, transitions, and smooth scrolling; manual pause remains available otherwise',()=>{
  const reduced=css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)$/)?.[1];
  assert.ok(reduced);assert.match(reduced,/scroll-behavior:\s*auto/);assert.match(reduced,/animation:\s*none!important/);assert.match(reduced,/transition:\s*none!important/);
  assert.match(css,/\.room-app\.motion-paused\s*\*\s*\{animation-play-state:\s*paused!important/);
  assert.match(css,/:focus-visible/);
});

console.log(`\n${count} checks passed; ${failures} failed. All requests mocked. No real signup sent.`);
if(failures)process.exitCode=1;
