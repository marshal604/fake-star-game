# Codex Prompt 009 — Polish + 錄 GIF + 收尾

STATUS: pending
SKILL: 無(純收尾 task)
依賴:**001~008 全部完成**
產出:`docs/v0.1-walkthrough.gif`、整體 typecheck/build/lint 全綠

---

## Context(只讀)

- `PRD.md` §6「DOD」(對著 6.1 / 6.2 / 6.3 / 6.4 全部勾)

## 任務

### 9.1 對齊 DOD 6.1 ~ 6.3

逐項跑 `PRD.md` §6 的 checklist:

```
6.1 asset 檔案 → ls public/ 全在 + 尺寸對
6.2 程式檔 → ls src/ 全在
6.3 self-check → pnpm install / typecheck / build / dev 全 pass
```

任何一個漏的 → 寫 BLOCKER 不要強推。

### 9.2 風格微調(只做兩件事)

只動這兩個地方,其他 visual polish 不做:

1. **DialogueBox 配色**:把 badminton-story 的木色 (`court-wood`) 換成蘇嫚君主軸的暖粉色,在 tailwind config 加 `'star-rose': '#d49797'`,DialogueBox 跟 ChoiceList 的 border 用這色
2. **TilemapScene 邊框**:加一個淺色 letterbox(`bg-black` 全螢幕,中央 tilemap canvas)讓地圖不貼邊

不要動立繪、背景、sprite。

### 9.3 錄 GIF

用 `mcp__claude-in-chrome` 工具(這份 prompt 是 Codex 跑,可能沒這 MCP)— 若 Codex 沒這個工具,改用 macOS 內建螢幕錄影 (`Cmd+Shift+5`),再用 `ffmpeg` 轉成 GIF:

```bash
# 假設錄到 walkthrough.mov
ffmpeg -i walkthrough.mov -vf "fps=10,scale=720:-1:flags=lanczos" docs/v0.1-walkthrough.gif
```

如果 codex 環境沒 ffmpeg / 不能錄畫面 → **不要 skip**,寫 BLOCKER 讓人類錄。GIF 是 DOD 6.4 必要產出。

### 9.4 整理 JOURNAL.md

Append 一筆 final entry,自評:

```markdown
## YYYY-MM-DD HH:mm — codex-prompt 009 polish

- **STATUS**: done
- **DOD checklist**:
  - 6.1 assets:✅ / 部分缺(列出)
  - 6.2 code:✅ / 部分缺
  - 6.3 self-check:✅ pnpm install / typecheck / build / dev / 鍵盤 / trigger / VN / 結束 全部
  - 6.4 GIF:✅ 路徑 docs/v0.1-walkthrough.gif
- **整體感想**(自由寫):
  - VN-vs-pixel 風格一致性自評: ...
  - 哪一段最容易斷掉 / 最不穩 ...
  - 給 Claude 的建議 ...
- **Commit**: <hash>
```

### 9.5 更新 README

在 `README.md` 的 `## Status` 段下面加一個 **Demo** 段:

```markdown
## Demo

![v0.1 walkthrough](./docs/v0.1-walkthrough.gif)

開發過程驗證:Claude(planner)+ Codex(implementer + asset gen)兩 AI 協作流程跑通。
```

### 9.6 建立 v0.1 milestone tag

```bash
git tag v0.1 -m "v0.1 prototype: open the door and sign Suman"
```
**不要 push tag**(人類決定)。

## 完成後

1. JOURNAL.md final entry 寫完
2. `STATUS: pending` → `done`
3. `git add . && git commit -m "chore(polish): align with DOD, record walkthrough gif [prompt:009]"`

## 不要做

- 不要做新 feature
- 不要 refactor
- 不要 push tag(只 tag,不 push)
- 不要在這份 prompt 裡解 BLOCKER — 任何 DOD 失敗都應該停下,讓 Claude review
