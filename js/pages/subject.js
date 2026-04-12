/**
 * Subject page: list six units from JSON (dynamic).
 */
import { loadSubject } from "../dataService.js";
import { renderBreadcrumb } from "../breadcrumbs.js";

function getSubjectId() {
  const p = new URLSearchParams(window.location.search);
  return p.get("subject");
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

async function main() {
  const subjectId = getSubjectId();
  const loading = document.getElementById("loading-page");
  const content = document.getElementById("page-content");
  const intro = document.getElementById("page-intro");
  const errEl = document.getElementById("page-error");
  const bc = document.getElementById("breadcrumb");

  if (!subjectId) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = "Missing subject. Open a subject from the home page.";
    return;
  }

  try {
    const data = await loadSubject(subjectId);
    document.title = `${data.name} — BackOntrack`;

    renderBreadcrumb(bc, [
      { label: "Home", href: "index.html" },
      { label: data.name },
    ]);

    intro.innerHTML = `<div class="page-title-block"><h1>${escapeHtml(data.name)}</h1><p class="muted">${escapeHtml(data.description || "")}</p></div>`;

    const units = data.units || [];
    const listHtml = `
      <ul class="unit-list">
        ${units
          .map(
            (u) => `
          <li class="unit-card">
            <div>
              <h3>Unit ${u.id}: ${escapeHtml(u.title)}</h3>
              
            </div>
            <a class="btn btn-primary" href="unit.html?subject=${encodeURIComponent(subjectId)}&unit=${encodeURIComponent(u.id)}">Open unit</a>
          </li>`
          )
          .join("")}
      </ul>`;

    content.innerHTML = listHtml;
    loading.hidden = true;
    content.hidden = false;
  } catch (e) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = e.message || "Could not load subject.";
  }
}

main();
