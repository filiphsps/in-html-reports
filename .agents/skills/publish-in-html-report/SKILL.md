---
name: publish-in-html-report
description: Publish a selected standalone HTML report to the in-html-reports GitHub Pages site when explicitly invoked.
---

# Publish an HTML report

Use this skill only when the user invokes `$publish-in-html-report`. Publishing makes the report public in both the GitHub repository and the Pages site.

Ask for a report path only if the user has not identified a saved `.html` file. Confirm the file exists and is a regular file. Preserve its bytes; `$in-html` reports are already standalone.

## Publish

1. Use the current checkout only if its `origin` is `filiphsps/in-html-reports`. Otherwise use the dedicated clone at `$HOME/.cache/codex/in-html-reports`; clone with `gh repo clone filiphsps/in-html-reports "$HOME/.cache/codex/in-html-reports"` if it does not exist. Verify the clone's origin before writing.
2. Require a clean working tree. Switch to `main` and fast-forward from `origin/main`. If the clone is dirty, the branch diverged, or a pull conflicts, stop and report the exact condition without resetting or overwriting changes.
3. Name the copy `reports/YYYY-MM-DD-<slug>.html`, using today's local date and a slug based on the report filename. If that name exists with different contents, append `-2`, `-3`, and so on. If identical content is already present, leave it alone and report its existing URL.
4. Copy only the selected report. Stage only its new destination path, verify that this is the only staged change, then commit with a message such as `docs: publish <slug>` and push `main` to `origin`. The explicit skill invocation authorizes this publication. Never force-push or include unrelated files. If a concurrent push rejects the first push, fetch and rebase once, then retry; stop on any conflict or second rejection.
5. Wait for the `Publish reports` workflow run for the pushed commit to complete. If it fails, report the run URL and failure; do not say the report is live. After success, verify that the report URL responds successfully before returning it.

The site URL is `https://filiphsps.github.io/in-html-reports/`; a report is available at `https://filiphsps.github.io/in-html-reports/reports/<filename>`. Tell the user the committed path, commit SHA, and published link.
