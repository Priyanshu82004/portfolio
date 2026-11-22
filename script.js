"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EMAIL = "priyanshukrnavtol@gmail.com";

/* ---------- Theme (remembers choice) ---------- */
const root = document.documentElement;
const themeBtn = $("#themeBtn");
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("theme", t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

/* ---------- Mobile menu ---------- */
const menuBtn = $("#menuBtn");
const nav = $("#nav");
function closeMenu() { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
$$("a", nav).forEach(a => a.addEventListener("click", closeMenu));

/* ---------- Scroll: progress bar, header, back-to-top ---------- */
const header = $("#header"), progress = $("#progress"), toTop = $("#toTop");
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  header.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 600);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- Active nav link (scroll spy) ---------- */
const links = $$(".nav a");
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- Typing effect ---------- */
const words = ["responsive websites.", "API-powered apps.", "full-stack projects.", "clean, usable interfaces."];
const typed = $("#typed");
let w = 0, c = 0, deleting = false;
function type() {
  const word = words[w];
  typed.textContent = word.slice(0, c);
  if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1500); }
  if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; }
  c += deleting ? -1 : 1;
  setTimeout(type, deleting ? 40 : 80);
}
if (matchMedia("(prefers-reduced-motion: reduce)").matches) typed.textContent = words[0];
else type();

/* ---------- Skill bars and counters animate when seen ---------- */
const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    reveal.unobserve(e.target);
  });
}, { threshold: 0.3 });
$$(".skill").forEach(s => reveal.observe(s));

function countUp(el) {
  const target = +el.dataset.count;
  const start = performance.now();
  const dur = target > 100 ? 1400 : 900;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const counters = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { countUp(e.target); counters.unobserve(e.target); }
  });
}, { threshold: 0.6 });
$$("[data-count]").forEach(el => counters.observe(el));

/* ---------- Skill filter ---------- */
$$(".tab[data-filter]").forEach(btn => btn.addEventListener("click", () => {
  const f = btn.dataset.filter;
  $$(".tab[data-filter]").forEach(b => {
    const on = b === btn;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on);
  });
  $$(".skill").forEach(s => {
    const show = f === "all" || s.dataset.cat.split(" ").includes(f);
    s.classList.toggle("hide", !show);
    if (show) { s.classList.remove("in"); void s.offsetWidth; s.classList.add("in"); }
  });
}));

/* ---------- Project filter ---------- */
$$(".tab[data-pf]").forEach(btn => btn.addEventListener("click", () => {
  const f = btn.dataset.pf;
  $$(".tab[data-pf]").forEach(b => b.classList.toggle("active", b === btn));
  $$(".card").forEach(card => card.classList.toggle("hide", f !== "all" && !card.dataset.tags.includes(f)));
}));

/* ---------- Project details modal ---------- */
// Replace the "#" links below with your real GitHub / live links.
const GH = "https://github.com/YOUR-GITHUB-USERNAME";
const projects = {
  weather: {
    title: "WeatherScope: real-time weather app",
    date: "Jun 2026 to Aug 2026",
    desc: "A web app that shows live weather for any city in the world.",
    points: [
      "Fetches live temperature, humidity and climate data from a public Weather API.",
      "Responsive interface: search a city and see results instantly.",
      "JavaScript fetches, parses and displays the API data dynamically on the page."
    ],
    tech: ["HTML", "CSS", "JavaScript", "Weather API"],
    code: GH + "/WeatherScope", live: "#"
  },
  amazon: {
    title: "Amazon Clone: e-commerce frontend",
    date: "Jul 2026 to Aug 2026",
    desc: "An Amazon-inspired shopping website built to practise layouts and styling.",
    points: [
      "Navigation bar, search bar, product sections and shopping categories.",
      "Clean, responsive design that works across screen sizes.",
      "Structured layouts and styling for a friendly online shopping experience."
    ],
    tech: ["HTML", "CSS"],
    code: GH + "/Amazon-Clone", live: "#"
  },
  event: {
    title: "Event Management System",
    date: "Full-stack project",
    desc: "A web application where users register and book events through a simple interface.",
    points: [
      "User registration and event booking modules with form validation.",
      "Data storage for registrations and bookings.",
      "Front end in HTML, CSS and JavaScript; Node.js handles registration and booking requests."
    ],
    tech: ["HTML", "CSS", "JavaScript", "Node.js"],
    code: GH + "/Event-Management-System", live: "#"
  }
};
const modal = $("#modal");
$$("[data-project]").forEach(btn => btn.addEventListener("click", () => {
  const p = projects[btn.dataset.project];
  $("#mTitle").textContent = p.title;
  $("#mDate").textContent = p.date;
  $("#mDesc").textContent = p.desc;
  $("#mPoints").innerHTML = p.points.map(x => `<li>${x}</li>`).join("");
  $("#mTech").innerHTML = p.tech.map(x => `<li>${x}</li>`).join("");
  $("#mCode").href = p.code;
  const live = $("#mLive");
  live.href = p.live;
  live.hidden = p.live === "#";
  modal.showModal();
}));
$("#mClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

/* ---------- Contact form ---------- */
const form = $("#contactForm"), status = $("#formStatus");
const rules = {
  name: v => v.trim().length >= 2 || "Enter your name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address.",
  message: v => v.trim().length >= 10 || "Write at least 10 characters."
};
function check(id) {
  const input = $("#" + id), res = rules[id](input.value);
  input.closest("label").classList.toggle("invalid", res !== true);
  $(`.err[data-for="${id}"]`).textContent = res === true ? "" : res;
  return res === true;
}
Object.keys(rules).forEach(id => $("#" + id).addEventListener("blur", () => check(id)));
form.addEventListener("submit", e => {
  e.preventDefault();
  status.textContent = "";
  if (!Object.keys(rules).map(check).every(Boolean)) return;
  const subject = encodeURIComponent("Portfolio message from " + $("#name").value.trim());
  const body = encodeURIComponent($("#message").value.trim() + "\n\nFrom: " + $("#name").value.trim() + " (" + $("#email").value.trim() + ")");
  location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  status.textContent = "Your email app is opening with the message ready to send.";
  form.reset();
});
$("#copyMail").addEventListener("click", async e => {
  try { await navigator.clipboard.writeText(EMAIL); e.target.textContent = "Email copied"; }
  catch (err) { e.target.textContent = EMAIL; }
  setTimeout(() => (e.target.textContent = "Copy email address"), 2000);
});

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();
