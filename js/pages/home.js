/**
 * Homepage: load each subject JSON and render cards (no hardcoded subject list beyond config-driven fetch).
 */
import { SUBJECTS } from "../config.js";
import { loadSubject } from "../dataService.js";

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

const LOAD_TIMEOUT_MS = 20000;

async function main() {
  const grid = document.getElementById("subjects-grid");
  const loading = document.getElementById("loading-subjects");
  const errEl = document.getElementById("subjects-error");

  try {
    const list = await Promise.race([
      Promise.all(
        SUBJECTS.map(async (s) => {
          const data = await loadSubject(s.id);
          return { slug: s.id, name: data.name, description: data.description || "" };
        })
      ),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Timed out loading subject files."));
        }, LOAD_TIMEOUT_MS);
      }),
    ]);

    loading.hidden = true;
    grid.hidden = false;
    grid.innerHTML = list
      .map(
        (s) => `
      <article class="subject-card">
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.description)}</p>
        <a class="btn btn-primary" href="subject.html?subject=${encodeURIComponent(s.slug)}">Open subject</a>
      </article>`
      )
      .join("");
  } catch (e) {
    loading.hidden = true;
    errEl.hidden = false;
    const hint =
      location.protocol === "file:"
        ? " Do not open this site as a file (file://). Start a local server from the project folder, e.g. python -m http.server 8080, then open http://127.0.0.1:8080/ — see RUN.md."
        : "";
    errEl.textContent = (e && e.message ? e.message : "Failed to load subjects.") + hint;
  }
}

main();
