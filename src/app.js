'use strict';
const $ = (id) => document.getElementById(id);
const creators = [
  {id:'kairo', name:'Kairo', panel:0, category:'MUSIC', title:'The after-hours set', description:'The beat drops. The room lights up. You help pick where the set goes next.', question:'What should we play next?', choices:['Throwbacks','Something new']},
  {id:'val', name:'Val Arcade', panel:1, category:'GAMING', title:'Your new favorite squad', description:'Big reactions, questionable strategies, and a room that’s in on the joke.', question:'How are we playing this?', choices:['Go for the win','Try the wild card']},
  {id:'nia', name:'Nia Afterhours', panel:2, category:'JUST TALKING', title:'Stay for one more story', description:'The kind of conversation where “one more minute” turns into your favorite part of the night.', question:'Where should we take the conversation?', choices:['Hot takes','Life lately']},
];
// Preserve favorites from the earlier website preview.
const FOLLOW_KEY = 'freq-web-tuned-v3';
let followed = [];
try {
  const saved = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
  if (Array.isArray(saved)) followed = [...new Set(saved.filter((id) => typeof id === 'string'))];
} catch { /* Preview still works when storage is unavailable. */ }
const votes = new Map();
let activeRoom = null;
let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3200);
}
function followLabel(creator) {
  return followed.includes(creator.id) ? 'Following ' + creator.name + ' ✓' : '+ Follow ' + creator.name;
}
function openRoom(id) {
  const creator = creators.find((item) => item.id === id);
  if (!creator) return;
  activeRoom = id;
  const choice = votes.get(id);
  $('dialogContent').innerHTML = `
    <div class="room-preview">
      <div class="preview-scene">
        <div class="portrait" style="--panel:${creator.panel}"></div><div class="portal-shade"></div>
        <span class="room-tag">ROOM PREVIEW <span aria-hidden="true">✦</span></span>
        <div class="preview-creator"><h2 id="modalTitle">${creator.name}</h2><p>${creator.category} · ${creator.title}</p></div>
      </div>
      <div class="preview-controls">
        <p class="eyebrow">THE MOMENT IS BETTER WITH YOU IN IT</p><h3>${creator.title}</h3><p>${creator.description}</p>
        <div class="poll"><p class="poll-label" id="pollLabel">${creator.question}</p>
          <div class="poll-options" role="group" aria-labelledby="pollLabel">${creator.choices.map((label, index) => `<button class="poll-option" type="button" data-vote="${index}" aria-pressed="${choice === index}"><span>${label}</span><span class="choice-mark" aria-hidden="true">${choice === index ? '✓' : '↗'}</span></button>`).join('')}</div>
          <p class="poll-status" id="pollStatus" role="status" aria-live="polite">${choice === undefined ? 'Try choosing what happens next.' : 'Your sample choice: ' + creator.choices[choice] + '.'}</p>
        </div>
        <button class="button follow-button" id="followCreator" type="button" aria-pressed="${followed.includes(id)}">${followLabel(creator)}</button>
        <button class="next-room" id="nextRoom" type="button">Explore the next room →</button>
        <p class="demo-note">Fictional creator and sample interaction. Follows stay on this device. Your choice isn’t sent to a live creator.</p>
      </div>
    </div>`;
  if (!$('previewDialog').open) $('previewDialog').showModal();
  $('previewDialog').scrollTop = 0;
  $('closeDialog').focus();
}
function chooseVote(value) {
  const creator = creators.find((item) => item.id === activeRoom);
  if (!creator || !Number.isInteger(value) || value < 0 || value >= creator.choices.length) return;
  votes.set(activeRoom, value);
  document.querySelectorAll('[data-vote]').forEach((button) => {
    const selected = Number(button.dataset.vote) === value;
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.choice-mark').textContent = selected ? '✓' : '↗';
  });
  $('pollStatus').textContent = 'Your sample choice: ' + creator.choices[value] + '.';
}
function toggleFollow() {
  const creator = creators.find((item) => item.id === activeRoom);
  if (!creator) return;
  const next = followed.includes(activeRoom) ? followed.filter((id) => id !== activeRoom) : [...followed, activeRoom];
  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
  } catch {
    toast('Your browser couldn’t save this follow. Please allow local storage and try again.');
    return;
  }
  followed = next;
  $('followCreator').textContent = followLabel(creator);
  $('followCreator').setAttribute('aria-pressed', String(followed.includes(activeRoom)));
  toast(followed.includes(activeRoom) ? creator.name + ' saved to your favorites on this device.' : creator.name + ' removed from your favorites.');
}
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest('button');
  if (!control) return;
  if (control.dataset.room) openRoom(control.dataset.room);
  if (control.dataset.vote !== undefined) chooseVote(Number(control.dataset.vote));
  if (control.id === 'followCreator') toggleFollow();
  if (control.id === 'nextRoom') {
    const index = creators.findIndex((item) => item.id === activeRoom);
    openRoom(creators[(index + 1) % creators.length].id);
  }
});
$('closeDialog').addEventListener('click', () => $('previewDialog').close());
$('previewDialog').addEventListener('click', (event) => {
  if (event.target !== $('previewDialog')) return;
  const rect = $('previewDialog').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('previewDialog').close();
});
// Keep the original Mailchimp audience. Report success only after its callback.
const form = document.getElementById("waitlistForm"),
  email = document.getElementById("waitlistEmail"),
  submit = document.getElementById("waitlistButton"),
  status = document.getElementById("waitlistStatus");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (submit.disabled || !form.reportValidity()) return;
  if (document.getElementById("companyWebsite").value) return;
  const callback = "freqSignup_" + Date.now();
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
    submit.textContent = "Count me in ↗";
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
      finish(
        false,
        /already subscribed/i.test(text)
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
