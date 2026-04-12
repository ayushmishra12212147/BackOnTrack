/**
 * Unit page: topic list + practice (MCQ, theory, coding) at end of unit.
 */
import { loadSubject } from "../dataService.js";
import { renderBreadcrumb } from "../breadcrumbs.js";
import { codeBlockHtml, enhanceCodeBlocks } from "../codeBlocks.js";

function params() {
  const p = new URLSearchParams(window.location.search);
  return {
    subject: p.get("subject"),
    unit: p.get("unit") != null ? Number(p.get("unit")) : NaN,
  };
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function renderMcqs(container, mcqs, prefix) {
  if (!mcqs || mcqs.length === 0) {
    container.innerHTML = "<p class=\"muted\">No MCQs for this unit.</p>";
    return;
  }
  container.innerHTML = `<h3>Multiple choice</h3>${mcqs
    .map((q, i) => {
      const name = `${prefix}-mcq-${i}`;
      const opts = (q.options || [])
        .map(
          (opt, oi) => `
        <li><label><input type="radio" name="${name}" value="${oi}" /> ${escapeHtml(opt)}</label></li>`
        )
        .join("");
      return `
      <div class="mcq-item" data-correct="${q.correctIndex ?? 0}">
        <p>${i + 1}. ${escapeHtml(q.question)}</p>
        <ul class="mcq-options">${opts}</ul>
        <div class="mcq-feedback" data-feedback="${name}" hidden></div>
      </div>`;
    })
    .join("")}`;

  container.addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    const item = input.closest(".mcq-item");
    const fb = item?.querySelector(`[data-feedback="${input.name}"]`);
    if (!item || !fb) return;
    const correct = parseInt(item.getAttribute("data-correct"), 10);
    const chosen = Number.parseInt(input.value, 10);
    fb.hidden = false;
    if (chosen === correct) {
      fb.textContent = "Correct.";
      fb.className = "mcq-feedback ok";
    } else {
      fb.textContent = "Not quite — try another option.";
      fb.className = "mcq-feedback bad";
    }
  });
}

function renderTheory(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = "<p class=\"muted\">No theory prompts for this unit.</p>";
    return;
  }
  container.innerHTML = `<h3>Theory</h3>${items
    .map(
      (t, i) => `
    <div class="theory-item">
      <p><strong>${i + 1}.</strong> ${escapeHtml(t.question)}</p>
      ${
        t.answer
          ? `<details class="hint"><summary>Sample answer</summary><p>${escapeHtml(t.answer)}</p></details>`
          : ""
      }
    </div>`
    )
    .join("")}`;
}

function renderCoding(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = "<p class=\"muted\">No coding problems for this unit.</p>";
    return;
  }
  container.innerHTML = `<h3>Coding</h3>${items
    .map(
      (c, i) => `
    <div class="coding-item">
      <h4>${i + 1}. ${escapeHtml(c.title)}</h4>
      <p>${escapeHtml(c.description || "")}</p>
      ${c.starterCode ? codeBlockHtml({ language: c.starterCode.language || "plain", code: c.starterCode.code || "" }) : ""}
      ${c.hint ? `<details class="hint"><summary>Hint</summary><p>${escapeHtml(c.hint)}</p></details>` : ""}
    </div>`
    )
    .join("")}`;
  enhanceCodeBlocks(container);
}

async function main() {
  const { subject: subjectId, unit: unitId } = params();
  const loading = document.getElementById("loading-page");
  const article = document.getElementById("page-content");
  const errEl = document.getElementById("page-error");
  const bc = document.getElementById("breadcrumb");
  const topicList = document.getElementById("topic-list");
  const titleEl = document.getElementById("unit-title");
  const summaryEl = document.getElementById("unit-summary");
  const mcqEl = document.getElementById("practice-mcqs");
  const theoryEl = document.getElementById("practice-theory");
  const codingEl = document.getElementById("practice-coding");

  if (!subjectId || Number.isNaN(unitId)) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = "Invalid link. Use a unit from the subject page.";
    return;
  }

  try {
    const data = await loadSubject(subjectId);
    const unit = (data.units || []).find((u) => u.id === unitId);
    if (!unit) {
      loading.hidden = true;
      errEl.hidden = false;
      errEl.textContent = "Unit not found.";
      return;
    }

    document.title = `${unit.title} — ${data.name} — BackOntrack`;

    renderBreadcrumb(bc, [
      { label: "Home", href: "index.html" },
      { label: data.name, href: `subject.html?subject=${encodeURIComponent(subjectId)}` },
      { label: `Unit ${unit.id}` },
    ]);

    titleEl.textContent = unit.title;
    summaryEl.textContent = unit.summary || "";

    const topics = unit.topics || [];
    topicList.innerHTML = topics
      .map(
        (t, ti) => `
      <li>
        <a href="topic.html?subject=${encodeURIComponent(subjectId)}&unit=${encodeURIComponent(unitId)}&topic=${ti}">
          ${escapeHtml(t.title)}
        </a>
      </li>`
      )
      .join("");

    const q = unit.questions || {};
    renderMcqs(mcqEl, q.mcqs || [], `u${unitId}`);
    renderTheory(theoryEl, q.theory || []);
    renderCoding(codingEl, q.coding || []);

    loading.hidden = true;
    article.hidden = false;
  } catch (e) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = e.message || "Could not load unit.";
  }
}

main();
