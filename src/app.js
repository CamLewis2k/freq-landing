'use strict';
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
