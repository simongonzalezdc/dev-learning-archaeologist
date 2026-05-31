globalThis.document?.documentElement?.classList?.add("js");

const navToggle = document.querySelector(".nav-toggle");
const navLinks = Array.from(document.querySelectorAll("#nav-links a"));
const sampleButtons = Array.from(document.querySelectorAll("[data-sample]"));
const stuckSentence = document.querySelector("#stuck-sentence");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const nextState = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", nextState);
    navToggle.setAttribute("aria-expanded", String(nextState));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!stuckSentence) return;
    stuckSentence.value = button.dataset.sample || "";
    stuckSentence.focus();
  });
});
