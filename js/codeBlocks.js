/**
 * Prism highlight + copy-to-clipboard for dynamically injected code blocks.
 */

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/**
 * Run Prism on all code under root, wire copy buttons.
 */
export function enhanceCodeBlocks(root) {
  if (!root || typeof Prism === "undefined") return;

  root.querySelectorAll("pre code").forEach((codeEl) => {
    if (!codeEl.className.includes("language-")) {
      codeEl.classList.add("language-plain");
    }
    const m = /language-(\w+)/.exec(codeEl.className);
    const lang = m ? m[1] : "";
    if (lang && lang !== "plain" && Prism.languages[lang]) {
      Prism.highlightElement(codeEl);
    }
  });

  root.querySelectorAll(".copy-code-btn").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", async () => {
      const wrap = btn.closest(".code-block-wrap");
      const codeEl = wrap?.querySelector("code");
      const text = codeEl ? codeEl.textContent : "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy code";
          btn.classList.remove("copied");
        }, 2000);
      } catch {
        btn.textContent = "Copy failed";
        setTimeout(() => {
          btn.textContent = "Copy code";
        }, 2000);
      }
    });
  });
}

/**
 * Build HTML from a code block object { language, code }.
 */
export function codeBlockHtml(block) {
  const rawLang = block.language || "plain";
  const safeLang = /^[a-z0-9+-]+$/i.test(rawLang) ? rawLang : "plain";
  const raw = block.code ?? "";
  const safeCode = escapeHtml(raw);
  return `
    <div class="code-block-wrap">
      <div class="code-toolbar">
        <button type="button" class="copy-code-btn">Copy code</button>
      </div>
      <pre><code class="language-${safeLang}">${safeCode}</code></pre>
    </div>`;
}
