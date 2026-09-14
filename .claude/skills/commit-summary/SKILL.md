---
name: commit-summary
description: Produce a brief commit message after a set of changes in this repo. Use after finishing edits, or whenever the user asks for the commit message. If a sibling repo (../Backend, ../AdminPanel, ../edusphere) was also changed, give one block per repo.
---

# Commit Summary

After changes, ALWAYS give the commit message — the user expects this every time.

## Output format

```
<type>: <short summary>
```

If a sibling repo changed too, output one block per repo, prefixed with the repo name.

## Rules

- Brief and small — one line where possible. No essays.
- Conventional prefix: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`.
- Describe the change, not the files. Imperative mood ("add", "fix").
- One logical change spanning repos uses the same summary in each block.
- Do NOT commit or push unless the user explicitly asks. Commits go straight to `main` (no feature branches).
- Never include secrets, generated noise, or AI attribution lines.
