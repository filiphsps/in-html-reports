import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsRoot = path.join(repositoryRoot, "reports");
const siteRoot = path.join(repositoryRoot, "_site");

async function collectFiles(directory, prefix = "") {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not supported in reports/: ${relativePath}`);
    }

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function reportTitle(relativePath) {
  return path
    .basename(relativePath, path.extname(relativePath))
    .replace(/[-_]+/g, " ");
}

await rm(siteRoot, { recursive: true, force: true });
await mkdir(path.join(siteRoot, "reports"), { recursive: true });

let sourceFiles = [];
try {
  sourceFiles = await collectFiles(reportsRoot);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const relativePath of sourceFiles) {
  const destination = path.join(siteRoot, "reports", relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(reportsRoot, relativePath), destination);
}

const reports = sourceFiles
  .filter((relativePath) => path.extname(relativePath).toLowerCase() === ".html")
  .sort((left, right) => right.localeCompare(left));

const reportList = reports.length
  ? `<ul class="reports">${reports
      .map((relativePath) => {
        const href = relativePath
          .split(path.sep)
          .map(encodeURIComponent)
          .join("/");
        const title = escapeHtml(reportTitle(relativePath));
        const label = escapeHtml(relativePath.split(path.sep).join("/"));
        return `<li><a href="reports/${href}">${title}</a><span>${label}</span></li>`;
      })
      .join("\n")}</ul>`
  : '<p class="empty">No reports published yet. Add a standalone HTML report to <code>reports/</code> and push to <code>main</code>.</p>';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>in-html reports</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17211d; background: #f3f5f2; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: clamp(1.25rem, 5vw, 4rem); }
      main { max-width: 860px; margin: 0 auto; }
      .eyebrow { margin: 0 0 .75rem; color: #50675b; font-size: .78rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 0; font-size: clamp(2rem, 6vw, 3.5rem); letter-spacing: -.045em; line-height: 1.05; }
      .intro { margin: 1rem 0 2.5rem; max-width: 38rem; color: #526159; font-size: 1.08rem; line-height: 1.65; }
      h2 { margin: 0 0 .9rem; font-size: 1rem; }
      .reports { display: grid; gap: .65rem; margin: 0; padding: 0; list-style: none; }
      .reports li { display: grid; gap: .25rem; padding: 1rem 1.1rem; border: 1px solid #d9e0da; border-radius: .9rem; background: #fff; }
      a { color: #176343; font-weight: 650; text-decoration-thickness: .08em; text-underline-offset: .18em; }
      a:focus-visible { outline: 3px solid #5b9e7d; outline-offset: 3px; border-radius: 2px; }
      .reports span, .empty { color: #66746c; font-size: .9rem; }
      .empty { padding: 1.2rem; border: 1px dashed #b9c7bc; border-radius: .9rem; line-height: 1.6; }
      code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
      footer { margin-top: 3rem; color: #77847c; font-size: .8rem; }
      @media (prefers-reduced-motion: no-preference) { a { transition: color .15s ease; } a:hover { color: #0d432e; } }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">A library of standalone reports</p>
      <h1>in-html reports</h1>
      <p class="intro">Each report is published as a self-contained HTML page. The list updates whenever a new report is pushed to the repository.</p>
      <section aria-labelledby="report-heading">
        <h2 id="report-heading">Reports</h2>
        ${reportList}
      </section>
      <footer>Published with GitHub Pages.</footer>
    </main>
  </body>
</html>
`;

await writeFile(path.join(siteRoot, "index.html"), html);
console.log(`Built report site with ${reports.length} HTML report(s).`);
