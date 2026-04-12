/**
 * Dark / light theme: toggle, localStorage, Prism theme link swap, smooth transitions.
 */
const STORAGE_KEY = "backontrack-theme";
const PRISM_LIGHT = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
const PRISM_DARK = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";

function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const link = document.getElementById("prism-theme");
  if (link) {
    link.href = theme === "dark" ? PRISM_DARK : PRISM_LIGHT;
  }
}

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
}

function init() {
  applyTheme(getPreferredTheme());
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}

init();

const y = document.getElementById("year");
if (y) y.textContent = String(new Date().getFullYear());
