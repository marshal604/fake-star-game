# JOURNAL — Codex execution log

> Append-only ledger. Newest at top. Each entry follows the schema below.
>
> **Codex 寫入規則**:每完成一個 codex-prompt 必須 append 一段。
> **Claude 不寫此檔**(只讀)。

---

## Schema(每個 entry 必填)

```markdown
## YYYY-MM-DD HH:mm — codex-prompt NNN <slug>

- **STATUS**: done | partial | blocked
- **Commits**: <hash> [, <hash>] ...
- **Files changed**:
  - + public/portraits/suman-normal.png
  - ~ src/App.tsx
  - - src/old.ts
- **Self-check**:
  - typecheck: pass | fail | n/a
  - lint: pass | fail | n/a
  - dev server boot: pass | fail | n/a
- **Notes**: 自由說明
- **BLOCKER**:(若 STATUS=blocked,寫具體問題;否則寫 none)
- **Decisions made**:(若有 deviation,列出 — 由 Claude review 是否認可)
```

---

(尚無紀錄,等第一個 codex-prompt 執行後 codex 在此 append)

## 2026-04-30 00:13 — codex-prompt 001 portraits

- **STATUS**: blocked
- **Commits**: none
- **Files changed**:
  - + public/portraits/suman-normal.png
  - + public/portraits/protagonist-normal.png
  - + public/portraits/chenyifu-normal.png
- **Self-check**:
  - All three RGBA: pass
  - Style consistency self-eval: high
  - Alpha edge cleanliness self-eval: high
- **Notes**: Generated Suman first as style anchor, then protagonist and chenyifu matching the generated portrait set. Final PNGs are 1024x1536 RGBA and each is under 800 KB. Commit step could not be completed.
- **BLOCKER**: Git commit is blocked because the environment rejects writes inside `.git`: `git add` failed with `fatal: Unable to create '/Users/hubert/self/coding/fake-star-game/.git/index.lock': Operation not permitted`, and `touch .git/codex-write-test` also failed with `Operation not permitted`.
- **Decisions made**: Suman raw generation produced a white outer background instead of magenta, so the outer background was normalized to #FF00FF before running the generate2dsprite processor; final portraits were placed on a safe 1024x1536 transparent canvas after processor QC reported lower-edge contact from the half-body crops.
