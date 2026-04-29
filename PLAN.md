# PLAN — v0.1 Sprint

最後更新:Claude Code,2026-04-29

## Sprint 目標

跑通 GDD §10 的 demo 腳本:從辦公室 tilemap 走到門口 → 開門 → VN 對話 → 簽下蘇嫚君 → 結束畫面。

DOD 在 `PRD.md` §6,逐項勾完才算 v0.1 完成。

## Codex prompt 排程(全部已 ready)

| # | Prompt | Skill | 依賴 | 狀態 |
|---|---|---|---|---|
| 001 | `001-portraits.md` | generate2dsprite | 無 | ⏳ pending |
| 002 | `002-vn-background.md` | generate2dmap | 無 | ⏳ pending |
| 003 | `003-pixel-sprites.md` | generate2dsprite | 001 | ⏳ pending |
| 004 | `004-tilemap.md` | generate2dmap + sprite | 無 | ⏳ pending |
| 005 | `005-scaffolding.md` | code | 無 | ⏳ pending |
| 006 | `006-tilemap-system.md` | code | 003, 004, 005 | ⏳ pending |
| 007 | `007-event-runtime.md` | code | 005 | ⏳ pending |
| 008 | `008-mode-switch.md` | code | 005, 006, 007 | ⏳ pending |
| 009 | `009-polish.md` | code + 錄 GIF | 001~008 | ⏳ pending |

## 給人類的執行順序

### Wave 1(可平行,4 份)

平行丟給 codex:
- `001-portraits.md`
- `002-vn-background.md`
- `004-tilemap.md`
- `005-scaffolding.md`

完成後 Claude review 一輪,看品質(立繪 / 背景 / tilemap / scaffolding 是否符合 GDD)。

### Wave 2(依賴 wave 1)

- `003-pixel-sprites.md`(需要 001 的立繪當 reference)

### Wave 3(依賴 wave 1 + 2)

平行:
- `006-tilemap-system.md`(要 003、004、005)
- `007-event-runtime.md`(要 005)

### Wave 4(收尾)

- `008-mode-switch.md`(要 005、006、007)
- `009-polish.md`(要前面全部)

## Claude review checkpoint

每個 wave 結束 Claude review 一次:讀 JOURNAL,看 commit diff,在 REVIEW.md 寫 verdict(`accept` / `revise` / `reject`)。如果 `revise`/`reject`,回頭改對應 codex-prompt,把 STATUS 改回 `pending`,人類再餵一次。

## Open questions(待確認)

- [x] package manager → pnpm
- [x] git init + push → 已完成,marshal604/fake-star-game
- [x] agent-sprite-forge → 已裝
- [ ] 第一波 codex 跑完後,風格如果嚴重不一致,要不要回頭重生 portraits?(預先決定:Yes,蘇嫚君優先)
