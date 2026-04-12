/**
 * Global search: loads all subject JSON files and matches subject names + topic titles.
 */
import { SUBJECTS } from "./config.js";
import { loadSubject } from "./dataService.js";

let index = [];
let indexReady = false;

function invalidateSearchIndex() {
  indexReady = false;
  index = [];
}

/* After editing JSON, switching back to this tab should rebuild search from disk */
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") invalidateSearchIndex();
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) invalidateSearchIndex();
  });
}

async function buildIndex() {
  if (indexReady) return index;
  const tasks = SUBJECTS.map(async (s) => {
    const data = await loadSubject(s.id);
    const rows = [
      {
        type: "subject",
        subjectId: s.id,
        subjectName: data.name,
        label: data.name,
        meta: "Subject",
        url: `subject.html?subject=${encodeURIComponent(s.id)}`,
      },
    ];
    (data.units || []).forEach((unit) => {
      (unit.topics || []).forEach((topic, ti) => {
        rows.push({
          type: "topic",
          subjectId: s.id,
          subjectName: data.name,
          unitId: unit.id,
          topicIndex: ti,
          label: topic.title,
          url: `topic.html?subject=${encodeURIComponent(s.id)}&unit=${encodeURIComponent(unit.id)}&topic=${ti}`,
          meta: `${data.name} · Unit ${unit.id}`,
        });
      });
    });
    return rows;
  });
  const chunks = await Promise.all(tasks);
  index = chunks.flat();
  indexReady = true;
  return index;
}

function normalize(q) {
  return q.trim().toLowerCase();
}

function score(row, q) {
  const hay = `${row.label} ${row.subjectName || ""}`.toLowerCase();
  if (!q) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.includes(q)) return 50;
  return 0;
}

function renderResults(container, query) {
  const q = normalize(query);
  if (!q) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  const scored = index
    .map((row) => ({ row, s: score(row, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.row);

  container.innerHTML = "";
  if (scored.length === 0) {
    const p = document.createElement("div");
    p.className = "empty";
    p.textContent = "No matches. Try another keyword.";
    container.appendChild(p);
  } else {
    scored.forEach((row) => {
      const a = document.createElement("a");
      a.href = row.url;
      a.innerHTML = `<span>${escapeHtml(row.label)}</span><span class="meta">${escapeHtml(row.meta || row.subjectName)}</span>`;
      container.appendChild(a);
    });
  }
  container.hidden = false;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

let debounceTimer;

async function initSearch() {
  const input = document.getElementById("global-search");
  const results = document.getElementById("search-results");
  if (!input || !results) return;

  /* Build index lazily on focus/input so the home page can finish loading subjects first. */

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        await buildIndex();
        renderResults(results, input.value);
      } catch {
        results.innerHTML = '<div class="empty">Search unavailable until data loads.</div>';
        results.hidden = false;
      }
    }, 200);
  });

  input.addEventListener("focus", async () => {
    try {
      await buildIndex();
      if (input.value.trim()) renderResults(results, input.value);
    } catch {
      /* ignore */
    }
  });

  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) {
      results.hidden = true;
    }
  });
}

initSearch();

export { buildIndex, invalidateSearchIndex };
