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

## 2026-04-30 — review of codex-prompt 004 tilemap

- **Verdict**: accept
- **Reviewed**: JOURNAL 2026-04-30 00:30
- **What's good**:
  - tileset 128×128 RGBA 透明乾淨,21 KB
  - office.json 14×10 valid,collision 維度正確,trigger + spawn 都對
  - **重點**:codex 自己 detect 到 prompt 內文「STATUS=done + git commit」跟 AGENTS.md「STATUS=ready-for-commit + 不 commit」衝突 → 主動 follow AGENTS.md(higher-priority)+ 在 JOURNAL Decisions made 段記錄。這正是 fail-loud + reasonable judgment 的展現
  - 3-wide desk 用 repeat right/bottom tile 解(GDD 4.1 的桌子定義是 2×2 但 ASCII 給 3-wide,codex 找出可行 work-around)
- **What needs change**: 無
- **Action items for Codex**: 無
- **GDD review item**: GDD §4.1 桌子定義(2×2)跟 §4.1 ASCII(3-wide T)有 inconsistency,但 codex 用 work-around 處理。視覺品質再判斷。

## 2026-04-30 — review of codex-prompt 005 scaffolding (split run)

- **Verdict**: accept
- **Reviewed**: JOURNAL 005 entries (Claude 5.1 + Codex 5.2~5.5),Claude 親跑 typecheck + build 都綠
- **What's good**:
  - 7 個 Dialogue 元件移植完成,LOCATION_STYLES 只剩 office + default
  - types.ts 完整(GameMode/EventNode/EventGraph/TilemapData/ChoiceOption)
  - gameStore minimal Zustand,後續 prompt 007 補完整邏輯
  - characters / scenes / events stubs 就位
  - 切兩邊跑(Claude 5.1 處理 sandbox 沒 pnpm 的 infra 問題,Codex 5.2~5.5 純 code)— 這是這次的 learning
- **Infra finding**: codex sandbox 沒 pnpm + 沒網路 → 任何「需要 install / 跑 build / pnpm-anything」的 prompt 都要 Claude 接 infra 那一段。記錄在 AGENTS.md 是 follow-up。
- **What needs change**: 無
- **Action items**: 把這個 split-run pattern 在 AGENTS.md 補一段(下一次 commit 順便)

## 2026-04-30 — review of codex-prompt 003 pixel-sprites

- **Verdict**: accept
- **Reviewed**: JOURNAL 2026-04-30 00:50
- **What's good**:
  - 三張 sprite sheet 128×192 RGBA、frame edge-touch pass、identity 自評 High
  - 順序對:suman 當 anchor,然後 protagonist、chenyifu 對齊
  - Codex 主動 detect 兩個衝突並用 reasonable judgment 處理:
    1. prompt 內文 vs AGENTS.md(commit 該不該做)→ follow AGENTS.md
    2. generate2dsprite processor CLI 只接 square cell-size,但本 prompt 要求 32×48 → 手動 Pillow chroma-key + repack rect cells,保留 magenta workflow 精神
- **What needs change**: 無(視覺品質要等 tilemap 起來疊 sprite 看才能完整判斷)



