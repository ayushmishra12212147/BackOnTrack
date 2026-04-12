/**
 * Subject slugs map to data/<slug>.json — single source for homepage and search.
 */
export const SUBJECTS = [
  { id: "c", name: "C Programming" },
  { id: "dbms", name: "DBMS" },
  { id: "java", name: "Java" },
  { id: "dsa", name: "DSA" },
];

export function subjectUrl(id) {
  return `data/${id}.json`;
}
