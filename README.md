# in-html reports

Store standalone HTML reports in `reports/`. Pushing to `main` rebuilds the report index and deploys the whole site to GitHub Pages.

Use `$publish-in-html-report` with the path to a report to add it here, commit it, and push it. The skill keeps the report repository separate from the project where the report was created. Its tracked definition is in `.agents/skills/publish-in-html-report/`; this environment also has it installed for direct invocation.

The repository and published site are public. Do not publish reports containing private information.

Site: <https://filiphsps.github.io/in-html-reports/>

## Repository layout

- `reports/` — standalone HTML reports and any report assets.
- `scripts/build-site.mjs` — copies reports and generates the browsable home page.
- `.github/workflows/deploy.yml` — deploys the site after each push to `main`.

## Local preview

```sh
node scripts/build-site.mjs
python3 -m http.server --directory _site 8000
```

Open <http://localhost:8000/> to preview the generated site.
