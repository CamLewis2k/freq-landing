
'use strict';
// This changes an illustrated concept only. It never connects to a stream or sends a vote.
const concepts = {
  music: {category:'MUSIC / AFTER DARK', title:'AFTER<br />HOURS.', mood:'No playlist. Just good taste.', context:'A set, a room, and whatever comes next.', label:'Music room concept: an illustrated record spins above the words After hours. Not a real broadcast.'},
  gaming: {category:'GAMING / NO BACKSEAT RULE', title:'ONE MORE<br />ROUND.', mood:'Great company. Questionable strategy.', context:'The best part isn’t always winning.', label:'Gaming room concept: an illustrated controller and the words One more round. Not a real broadcast.'},
  talk: {category:'JUST TALKING / NO SCRIPT', title:'STAY A<br />MINUTE.', mood:'You had to hear the whole story.', context:'A conversation that goes wherever it goes.', label:'Conversation room concept: illustrated speech bubbles and the words Stay a minute. Not a real broadcast.'}
};
const roomApp=document.getElementById('roomApp');
const modeButtons=document.querySelectorAll('.mode-button');
function chooseConcept(mode){
  const concept=concepts[mode];
  if(!Object.prototype.hasOwnProperty.call(concepts,mode) || !roomApp)return;
  roomApp.dataset.mode=mode;
  document.getElementById('sceneCategory').textContent=concept.category;
  document.getElementById('sceneTitle').innerHTML=concept.title;
  document.getElementById('roomMood').textContent=concept.mood;
  document.getElementById('roomContext').textContent=concept.context;
  document.getElementById('roomScene').setAttribute('aria-label',concept.label);
  modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  document.getElementById('roomStatus').textContent=concept.label;
}
modeButtons.forEach(button=>button.addEventListener('click',()=>chooseConcept(button.dataset.mode)));
const motionToggle=document.getElementById('motionToggle');
if(motionToggle)motionToggle.addEventListener('click',()=>{
  const paused=motionToggle.getAttribute('aria-pressed')!=='true';
  roomApp.classList.toggle('motion-paused',paused);
  motionToggle.setAttribute('aria-pressed',String(paused));
  motionToggle.setAttribute('aria-label',paused?'Resume decorative animation':'Pause decorative animation');
  motionToggle.textContent=paused?'Resume motion':'Pause motion';
});
// Keep the original Mailchimp audience. Report success only after its callback.
const form = document.getElementById("waitlistForm"),
  email = document.getElementById("waitlistEmail"),
  submit = document.getElementById("waitlistButton"),
  status = document.getElementById("waitlistStatus");
let signupAttempt = 0;
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (submit.disabled || !form.reportValidity()) return;
  if (document.getElementById("companyWebsite").value) return;
  const callback = "freqSignup_" + Date.now() + "_" + (++signupAttempt);
  const script = document.createElement("script");
  let done = false;
  submit.disabled = true;
  submit.textContent = "Joining…";
  status.textContent = "";
  status.dataset.state = "";
  const finish = (ok, message) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    script.remove();
    window[callback] = () => {};
    setTimeout(() => {
      delete window[callback];
    }, 60000);
    submit.disabled = false;
    submit.textContent = "Keep me posted";
    status.dataset.state = ok ? "success" : "error";
    status.textContent = message;
    if (ok) form.reset();
  };
  const timer = setTimeout(
    () =>
      finish(
        false,
        "We couldn’t confirm your signup. Please try again in a moment.",
      ),
    12000,
  );
  window[callback] = (response) => {
    if (response && response.result === "success")
      finish(
        true,
        "You’re on the list. Check your inbox for any confirmation email.",
      );
    else {
      const text =
        typeof response?.msg === "string"
          ? response.msg.replace(/<[^>]*>/g, "").replace(/^\d+\s*-\s*/, "")
          : "";
      const alreadySubscribed = /already subscribed/i.test(text);
      finish(
        alreadySubscribed,
        alreadySubscribed
          ? "This email is already on the list. You’re all set."
          : text || "We couldn’t add your email. Please try again.",
      );
    }
  };
  script.onerror = () =>
    finish(false, "We couldn’t reach the signup service. Please try again.");
  const url = new URL("https://app.us11.list-manage.com/subscribe/post-json");
  url.search = new URLSearchParams({
    u: "c9d1c6436ce253c18651cf98d",
    id: "af8427abca",
    f_id: "00b41ce1f0",
    EMAIL: email.value.trim(),
    c: callback,
  }).toString();
  script.src = url.toString();
  document.head.append(script);
});
