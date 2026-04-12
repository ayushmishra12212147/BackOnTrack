/**
 * Fetch subject JSON by id.
 * No in-memory cache — every call hits the network so edits to data/*.json show up on refresh.
 * Timestamp query + cache headers avoid stubborn HTTP/browser caches.
 */
function subjectJsonUrl(subjectId) {
  return new URL(`../data/${subjectId}.json`, import.meta.url);
}

export async function loadSubject(subjectId) {
  const url = subjectJsonUrl(subjectId);
  url.searchParams.set("t", String(Date.now()));

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!res.ok) {
    throw new Error(`Could not load subject "${subjectId}" (${res.status})`);
  }

  return res.json();
}
