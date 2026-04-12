/**
 * Build semantic breadcrumb lists for list pages and topic view.
 */
export function renderBreadcrumb(container, items) {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "bc-sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = "›";
      container.appendChild(sep);
    }
    if (item.href && i < items.length - 1) {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      container.appendChild(a);
    } else {
      const span = document.createElement("span");
      if (i === items.length - 1) span.setAttribute("aria-current", "page");
      span.textContent = item.label;
      container.appendChild(span);
    }
  });
}
