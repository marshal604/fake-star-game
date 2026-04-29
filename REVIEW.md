# REVIEW — Claude's notes on Codex output

> Claude 寫入。每次 review 一個 prompt 的執行結果,append 一段。
> Codex 讀此檔了解上一輪的 feedback,但**不修改本檔**。

---

## Schema

```markdown
## YYYY-MM-DD — review of codex-prompt NNN <slug>

- **Verdict**: accept | revise | reject
- **Reviewed**:
  - JOURNAL entry: <date>
  - Diff: <commit hash range>
- **What's good**:
- **What needs change**:
- **Action items for Codex**:(若 verdict=revise,列出具體要做的事;會對應到下一份 codex-prompt)
- **GDD/PRD updates needed**:(若 review 中發現 plan 本身有問題,Claude 在此標記要回頭改 docs)
```

---

## 2026-04-30 — review of codex-prompt 001 portraits

- **Verdict**: accept
- **Reviewed**:
  - JOURNAL entry: 2026-04-30 00:13
  - Diff: `7319f0e` (vs `cc615ed`)
- **What's good**:
  - 三張 1024×1536 RGBA, < 800 KB,符合 spec
  - Codex 主動處理「raw 生成是白底」的 edge case(用 magenta normalization 再走 generate2dsprite processor)— 這就是 GDD §0 強調的 fail-loud + 自己解決小問題,不亂 patch
  - 順序正確:suman 當 anchor 先生
- **What needs change**: 無(視覺品質要等 web app 跑起來疊到背景上才能完整判斷,先收貨)
- **Action items for Codex**: 無
- **GDD/PRD updates needed**: 無
- **Infra finding**: codex companion sandbox 是 `workspace-write`,擋 .git 寫入。已更新 AGENTS.md 反映此事實 — codex 完成後設 STATUS 為 `ready-for-commit`,Claude 接手 commit。

## 2026-04-30 — review of codex-prompt 002 vn-background

- **Verdict**: accept
- **Reviewed**: JOURNAL 2026-04-30 00:22
- **What's good**:
  - 1920×1080 opaque PNG, 676 KB,符合 spec
  - 新 AGENTS.md 流程奏效 — codex 沒再撞 sandbox,直接寫 STATUS=ready-for-commit 給 Claude
  - Codex 主動 resize from 1672×941 → 1920×1080(image_gen 有時尺寸不對的 reasonable fix)
- **What needs change**: 無(palette mode 而非 RGB 對 VN 背景無影響)
- **Action items for Codex**: 無


