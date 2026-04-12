/**
 * Topic reader: alternating explanation + code blocks, breadcrumbs, prev/next within unit.
 */
import { loadSubject } from "../dataService.js";
import { renderBreadcrumb } from "../breadcrumbs.js";
import { codeBlockHtml, enhanceCodeBlocks } from "../codeBlocks.js";

function params() {
  const p = new URLSearchParams(window.location.search);
  return {
    subject: p.get("subject"),
    unit: p.get("unit") != null ? Number(p.get("unit")) : NaN,
    topic: p.get("topic") != null ? Number(p.get("topic")) : NaN,
  };
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function renderContentBlocks(blocks) {
  if (!blocks || !blocks.length) return "<p class=\"muted\">No content for this topic yet.</p>";
  return blocks
    .map((b) => {
      if (b.type === "text") {
        return `<p>${escapeHtml(b.value)}</p>`;
      }
      if (b.type === "code") {
        return codeBlockHtml({ language: b.language || "plain", code: b.code || "" });
      }
      return "";
    })
    .join("");
}

async function main() {
  const { subject: subjectId, unit: unitId, topic: topicIndex } = params();
  const loading = document.getElementById("loading-page");
  const article = document.getElementById("page-content");
  const errEl = document.getElementById("page-error");
  const bc = document.getElementById("breadcrumb");
  const body = document.getElementById("topic-body");
  const titleEl = document.getElementById("topic-title");
  const prevA = document.getElementById("prev-topic");
  const nextA = document.getElementById("next-topic");

  if (!subjectId || Number.isNaN(unitId) || Number.isNaN(topicIndex)) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = "Invalid topic link.";
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
    const topics = unit.topics || [];
    const topic = topics[topicIndex];
    if (!topic) {
      loading.hidden = true;
      errEl.hidden = false;
      errEl.textContent = "Topic not found.";
      return;
    }

    document.title = `${topic.title} — BackOntrack`;

    renderBreadcrumb(bc, [
      { label: "Home", href: "index.html" },
      { label: data.name, href: `subject.html?subject=${encodeURIComponent(subjectId)}` },
      { label: `Unit ${unit.id}`, href: `unit.html?subject=${encodeURIComponent(subjectId)}&unit=${encodeURIComponent(unitId)}` },
      { label: topic.title },
    ]);

    titleEl.textContent = topic.title;
    body.innerHTML = `<div class="topic-body">${renderContentBlocks(topic.content)}</div>`;
    enhanceCodeBlocks(body);

    const base = `topic.html?subject=${encodeURIComponent(subjectId)}&unit=${encodeURIComponent(unitId)}&topic=`;

    if (topicIndex <= 0) {
      prevA.classList.add("is-disabled");
      prevA.removeAttribute("href");
    } else {
      prevA.classList.remove("is-disabled");
      prevA.href = `${base}${topicIndex - 1}`;
    }

    if (topicIndex >= topics.length - 1) {
      nextA.classList.add("is-disabled");
      nextA.removeAttribute("href");
    } else {
      nextA.classList.remove("is-disabled");
      nextA.href = `${base}${topicIndex + 1}`;
    }

    loading.hidden = true;
    article.hidden = false;
  } catch (e) {
    loading.hidden = true;
    errEl.hidden = false;
    errEl.textContent = e.message || "Could not load topic.";
  }
}

main();
