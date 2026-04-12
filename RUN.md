# Running BackOntrack locally

This project loads subject data with `fetch()` from the `data/` folder. **Opening `index.html` directly with `file://` will block those requests in most browsers** (CORS / file access rules).

## Option A: Python (recommended)

From the project folder (`BackOnTrack`):

```bash
python -m http.server 8080
```

Then open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in your browser.

## Option B: Node.js

If you have Node.js installed:

```bash
npx --yes serve -p 8080
```

Open the URL printed in the terminal (usually [http://localhost:8080](http://localhost:8080)).

## Option C: VS Code / Cursor

Use the **Live Server** extension (or similar) and serve the project root so paths like `data/c.json` resolve correctly.

---

**Checklist**

- Home page lists four subjects from `data/*.json`.
- Subject → Unit → Topic navigation uses query parameters (`subject`, `unit`, `topic`).
- Theme toggle persists in `localStorage` under `backontrack-theme`.
- Search indexes subjects and topics after the JSON files load.
