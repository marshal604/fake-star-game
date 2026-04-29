# Claude × Codex 協作 SOP

兩個 AI agent 共用同一個專案目錄,沒有 IDE 整合的鎖,**全靠檔案系統 + 約定**避免衝突。本文件就是那個約定。

## 0. 三條從 harness-engineering 學來的心法

我們的協作流程本質上就是 LLM-LLM harness,套用 cheatsheet 的設計原則:

1. **Magenta Key Contract — 讓 Codex 輸出可被 regex / Python 驗證**
   - 每個 codex-prompt 開頭強制有 `STATUS: pending|in_progress|done|blocked` 一行
   - JOURNAL.md 每筆 entry 都有 `STATUS:` / `Commits:` / `Self-check:` 結構化欄位
   - 檔案 ID 全 kebab-case + 英數,事件節點固定 `[E\d{3}]` 格式
   - 透明背景 sprite 用 `#FF00FF` magenta key 後處理(sprite-forge 內建)
2. **Lazy Load — Context 不要一次塞給 Codex**
   - codex-prompt 寫「請先讀 GDD §3, §7.1, §10」,**不複製內文**
   - Codex 只讀當下需要的 spec 段落,不掃整個 GDD
3. **Fail Loud, Don't Silent — 不確定就停**
   - Codex 看到 GDD 跟現實衝突 → 寫 `BLOCKER:` 進 JOURNAL,**停下,不腦補**
   - 風格 / 結構 / 命名選擇,只能照 PLAN/GDD,**不允許自己決定**(否則會 silent drift)
   - QC fail(typecheck error / sprite edge-touch 過多)→ 不要自動 patch,寫進 JOURNAL 等 Claude 決定


## 1. 角色與權責

### Claude Code(planner + reviewer)

- **可改**:`PRD.md`、`GDD.md`、`COLLAB.md`(本檔)、`PLAN.md`、`codex-prompts/*.md`、`README.md`
- **可讀**:整個 repo
- **不可改**:任何 `src/`、`public/`、設定檔(`package.json`、`tsconfig.json`、`vite.config.ts`、`tailwind.config.js` 等)、`JOURNAL.md`(Codex 的回報區)
- 主要動作:
  1. 跟人類討論 → 更新 PRD/GDD
  2. 拆 task,寫進 `PLAN.md` 跟 `codex-prompts/NNN-*.md`
  3. Codex 完成後,看 `git diff` + `JOURNAL.md`,review code,在 `REVIEW.md` 寫意見或回 `PLAN.md` 開新 task

### Codex CLI(implementer + asset generator)

- **可改**:`src/**`、`public/**`、所有設定檔、`JOURNAL.md`、`package.json`、`tsconfig.json`、`bun.lockb`、`pnpm-lock.yaml`
- **可讀**:整個 repo
- **不可改**:`PRD.md`、`GDD.md`、`COLLAB.md`、`PLAN.md`、`codex-prompts/**`、`REVIEW.md`(這些是 Claude 的領地)
- **不可主動加 feature**:只做 PLAN / codex-prompt 寫進去的事;有疑問就在 JOURNAL.md 寫「需要 Claude 決定:...」然後停下
- 主要動作:
  1. 讀 `codex-prompts/NNN-*.md`(找最新一份 pending 的)
  2. 實作 / 跑 `agent-sprite-forge`
  3. 跑 `npm run typecheck`(若 build 在運行也跑) 確保沒 break
  4. 寫進 `JOURNAL.md`:做了什麼 / 哪些 commit / 有哪些 deviation
  5. 把 prompt 重新命名為 `NNN-*.md.done`,或在 prompt 檔頂端加 `STATUS: done`

### 人類

- 切兩邊 terminal、把 prompt 餵給對方
- 當 Codex 卡住時,把 JOURNAL 給 Claude 看,讓 Claude 改 prompt
- Final reviewer / approver

## 2. 檔案分區

```
fake-star-game/
├── PRD.md                  ← Claude
├── GDD.md                  ← Claude
├── COLLAB.md               ← Claude (本檔)
├── PLAN.md                 ← Claude (current sprint task list)
├── REVIEW.md               ← Claude (review notes / 給 codex 的回饋)
├── JOURNAL.md              ← Codex (執行日誌)
├── codex-prompts/
│   ├── 001-portraits.md          ← Claude 寫,Codex 執行
│   ├── 002-pixel-sprites.md
│   ├── 003-tilemap.md
│   └── 004-scaffolding.md
├── references/             ← 共用,參照圖(不會 build 進去)
├── src/                    ← Codex
├── public/                 ← Codex
└── (其他 build 設定 ...)   ← Codex
```

## 3. 一輪典型流程

```
[人類]   開新 sprint:「我們要把 v0.1 開門簽約做完」
   ↓
[Claude] 把 GDD §10 demo 腳本拆成 4 個 codex prompt:
         001-portraits.md      生 VN 立繪
         002-pixel-sprites.md  生主角 + 蘇嫚君的 sprite sheet
         003-tilemap.md        建辦公室 tilemap + tileset + JSON
         004-scaffolding.md    Vite 專案初始化 + Dialogue 移植 + tilemap 系統 + 事件 runtime
         寫進 PLAN.md
   ↓
[人類]   切到 codex 終端機,告訴 codex:「請執行 codex-prompts/001-portraits.md」
   ↓
[Codex]  跑 agent-sprite-forge,把 portraits 放進 public/portraits/
         在 JOURNAL.md 寫:「001 完成,生了 3 張立繪。風格基本一致但蘇嫚君的眼睛偏大,需要再生一次嗎?」
   ↓
[人類]   切回 claude 終端機,把 JOURNAL 拿給 claude review
   ↓
[Claude] 讀 JOURNAL + 看圖 → 在 REVIEW.md 寫:「眼睛大可接受,進下一個 prompt」 或 「重生,加上『eye size: medium, not anime-large』」
   ↓
[人類]   把 review 結果餵給 codex,進下一輪
```

## 4. 衝突處理

如果某個 task 同時牽涉到 docs(Claude 區)跟 code(Codex 區),**永遠先讓 Claude 改 docs,Codex 再讀 docs 改 code**,絕對不要平行。

如果 Codex 在實作中發現 GDD 寫錯/不可行:
- 不要自己改 GDD
- 在 JOURNAL.md 寫「BLOCKER: GDD §X.Y 說 ...,但實作上 ...」
- 停下,等 Claude review

如果 Claude 在 review 時發現 GDD 跟 code 對不上:
- Claude 改 GDD(這是 plan)
- 在 PLAN.md 開新 task 給 codex 同步 code

## 5. Git 規範

- Codex 用 conventional commits(`feat:`、`fix:`、`refactor:`...)
- 一個 codex-prompt 對應一個或數個 commit,commit message 帶 prompt 編號:`feat(portraits): generate VN portraits [prompt:001]`
- Claude 不 commit code,只 commit docs:`docs: add v0.2 orphanage event tree`
- 兩邊都不要 push 到 remote(雛形階段純 local)

## 6. 環境

| 工具 | 版本 | 安裝 |
|---|---|---|
| codex-cli | 0.125.0+ | 已裝 |
| claude code | 2.x | 已裝 |
| node | v20+ | 已裝 |
| Python 3 + Pillow + NumPy | for agent-sprite-forge | **待裝**(見 §7) |
| agent-sprite-forge | latest | **待裝**(見 §7) |

## 7. agent-sprite-forge 安裝(macOS)

人類執行一次:

```bash
git clone https://github.com/0x0funky/agent-sprite-forge.git ~/tmp/agent-sprite-forge
cd ~/tmp/agent-sprite-forge
python3 -m pip install -r requirements.txt
mkdir -p ~/.codex/skills
cp -R ./skills/* ~/.codex/skills/
ls ~/.codex/skills    # 應該看到 generate2dsprite, generate2dmap, find-skills
```

裝完後 Codex 在執行 codex-prompt 時就可以呼叫 `generate2dsprite` 跟 `generate2dmap`。

## 8. 給 Codex 的固定提示(可貼到 codex 系統提示或對話開頭)

> 你正在 fake-star-game 專案中工作。**先讀 `COLLAB.md` 和 `PLAN.md`**,確認你要做的 task。
> 不可修改 `PRD.md`、`GDD.md`、`COLLAB.md`、`PLAN.md`、`REVIEW.md`、`codex-prompts/**`。
> 完成後在 `JOURNAL.md` append 一段執行日誌(時間、做了什麼、commit hash、有哪些不確定)。
> 風格 / 結構問題不要自己決定,寫進 JOURNAL 的「BLOCKER」段落並停下。

## 9. 開放問題

- [ ] codex 是否能直接 `git commit`?還是要人類最後 commit?(建議:讓 codex commit,但不 push)
- [ ] 人類要不要設個 alias 把 claude / codex 切換變得更快?
