# PLAN — v0.1 Sprint

最後更新:Claude Code,2026-04-29

## Sprint 目標

跑通 GDD §10 的 demo 腳本:從辦公室 tilemap 走到門口 → 開門 → VN 對話 → 簽下蘇嫚君 → 結束畫面。

## Codex prompt 排程

| 順序 | Prompt 檔 | 說明 | 依賴 | 狀態 |
|---|---|---|---|---|
| 1 | `codex-prompts/001-portraits.md` | 跑 agent-sprite-forge `generate2dsprite` 把 3 張參照圖轉成 VN 半身立繪 | 無 | 待 codex |
| 2 | `codex-prompts/002-vn-background.md` | 跑 `generate2dmap` 把辦公室參照圖轉成 VN 模式背景圖(animation 風) | 無(可平行 1) | 待 claude 寫 |
| 3 | `codex-prompts/003-pixel-sprites.md` | 用 step 1 的 VN 立繪當 reference,生 32×48 px 4 方向 walking sprite sheet ×3 | 1 完成 | 待 claude 寫 |
| 4 | `codex-prompts/004-tilemap.md` | 跑 `generate2dmap` 生辦公室 tile-based 地圖 + tileset PNG + collision/trigger JSON | 無(可平行 1/2/3) | 待 claude 寫 |
| 5 | `codex-prompts/005-scaffolding.md` | Vite + React + TS + Tailwind + Zustand 專案初始化,移植 badminton-story 的 Dialogue,建立 type 系統(GameMode/EventNode/GameState) | 無(可平行 1~4) | 待 claude 寫 |
| 6 | `codex-prompts/006-tilemap-system.md` | 實作 `TilemapScene`、`PlayerSprite`、collision、trigger | 4, 5 | 待 claude 寫 |
| 7 | `codex-prompts/007-event-runtime.md` | 實作 `core/runtime.ts` + Zustand store,寫 `events/sign-suman.ts` 把 GDD §10 腳本翻譯成 EventGraph | 5 | 待 claude 寫 |
| 8 | `codex-prompts/008-mode-switch.md` | 把 tilemap → vn → end 模式切換串通,trigger 觸發後實際進對話、結束後跑結束畫面 | 6, 7 | 待 claude 寫 |
| 9 | `codex-prompts/009-polish.md` | 樣式微調、typecheck、錄 GIF 收進 docs/ | 1~8 | 待 claude 寫 |

## 給 Claude 自己的下一步

1. 把 `references/` 建好,把現有 4 張參照圖複製進去(這個動作 Claude 不能做 — 會動到 src/public 之外但對 codex 來說是 build artifact 來源,需要決定是 Claude 還是人類做)
2. 寫完 002~005 prompt 讓人類可以餵第一輪
3. 待 codex 跑完 001 後,review portraits 品質,決定要不要重生

## 給人類的下一步(餵給 codex)

按順序丟下面四份(前四份可平行):

```
codex-prompts/001-portraits.md
codex-prompts/002-vn-background.md   ← 待 claude 寫
codex-prompts/004-tilemap.md          ← 待 claude 寫
codex-prompts/005-scaffolding.md      ← 待 claude 寫
```

只有 003-pixel-sprites 必須等 001 完成(因為要拿 portrait 當 reference)。

## Open questions(等人類決定)

1. 參照圖檔放哪?目前在 `主角/`、`蘇曼君/`、`陳奕夫/`、`地圖/`(中文目錄)。要 Codex 還是人類負責複製到 `references/`?
2. 要不要 `git init`?強烈建議要,讓 review diff 看得到。
3. Package manager:npm / pnpm / bun?推薦 pnpm(快、跟 codex 搭配也熟)。
