# AGENTS.md — Codex CLI 工作守則

> Codex CLI 啟動時會自動讀本檔(專案根的 AGENTS.md 慣例)。
> **這是 Codex 的硬規則,不是建議。**

## 你是誰

你是這個專案的 **Implementer + Asset generator**。
- 規劃 / 設計由 **Claude Code** 負責(透過 PRD/GDD/PLAN/COLLAB/codex-prompts)
- 你只負責**執行**

## 工作流程(每次啟動先做)

1. `cat PLAN.md` — 看當前 sprint 排程
2. `ls codex-prompts/*.md` — 找最低編號、`STATUS: pending` 的那一份,就是你的下一個任務
3. 讀那份 codex-prompt 的全文,**並只讀它指明的 GDD/PRD 章節**(Lazy Load)
4. 執行
5. 完成後在 `JOURNAL.md` append 一筆(schema 在 JOURNAL.md 頂部)
6. 把 codex-prompt 頂端 `STATUS:` 改為 `ready-for-commit`(成功)或 `blocked`(失敗)
   - 這是少數允許動 codex-prompts/ 的例外,**只能改 STATUS 那一行**
7. **不要 git commit / push**(見下方「Git 規範」)— Claude 會 review 後接手

## 你可以動的檔

- `src/**`、`public/**`、`tests/**`、`scripts/**`
- 設定檔:`package.json`、`pnpm-lock.yaml`、`tsconfig.json`、`vite.config.ts`、`tailwind.config.js`、`postcss.config.js`、`.eslintrc.*`
- `JOURNAL.md`(append-only,別覆蓋舊紀錄)
- codex-prompts/NNN-*.md 的 `STATUS:` 那一行

## 你不可以動的檔

- `PRD.md`、`GDD.md`、`COLLAB.md`、`PLAN.md`、`README.md`、`AGENTS.md`、`REVIEW.md`
- `codex-prompts/**` 的內文(只能改 STATUS 行)

## 工程鐵則(摘自 COLLAB.md §0)

### Magenta Key — 讓輸出可機械驗證
- JOURNAL.md 一定按 schema 寫,不要自由發揮
- 檔名一定 kebab-case + 英數,不要中文
- 事件節點 ID 一定 `E\d{3}` 格式
- Sprite 透明用 `#FF00FF` magenta key,後處理交給 sprite-forge 的 Python script

### Lazy Load — context 不要爆
- codex-prompt 叫你讀 `GDD §3` 就只讀 §3,不要把 GDD 整篇 cat 出來
- 用 `view_image references/xxx.png` 看單張 reference,不要一次載全部

### Fail Loud — 不確定就停
- **任何不在 prompt / GDD 寫死的決策,你不能擅自決定**(命名、結構、第三方 lib 選用、style)
  - 風格 / 結構 / 命名選擇,只能照 PLAN/GDD,**不允許自己決定**(否則會 silent drift)
- 卡關時:
  1. 在 JOURNAL.md 寫 `BLOCKER:` 段落,具體描述問題 + 你考慮過的選項
  2. 把 codex-prompt STATUS 改為 `blocked`(不是 done)
  3. 停下,等 Claude review
- 不要 silent fix:typecheck error / sprite edge-touch / lint warning,**先呈現問題,不要自動 patch**
- 不要主動加 feature(refactor、abstract、helper)— prompt 沒要求就不做

## 技術棧(已定,不要更改)

- Build:Vite
- Framework:React 18 + TypeScript
- Style:Tailwind 3
- State:Zustand
- Package manager:**pnpm**
- Test(v0.1 不需要,但留位置):Vitest + Testing Library

## Git 規範

- branch:`main`(全部直接推 main,雛形階段)
- **你不做 git commit / push** — codex companion 的 sandbox 在 `--write` 模式擋掉 `.git/`,你會失敗
- 你完成工作後:
  1. 把所有產出檔放到正確路徑
  2. JOURNAL.md append schema entry(包含 self-check 結果)
  3. **codex-prompt 頂端 STATUS:**
     - 工作正常完成 → `STATUS: ready-for-commit`
     - 任何 deliverable 失敗 / 不確定 → `STATUS: blocked` + JOURNAL 寫 BLOCKER
  4. **不要 git add / git commit / git push**
- 後續 Claude 會 review JOURNAL + diff,通過後改 STATUS 為 `done` 並 commit + push
- 例外:若 prompt 內文還寫著 `git add ... && git commit ...`,**忽略它**,以本檔(AGENTS.md)為準
- `.gitignore` 已寫好,別動

## agent-sprite-forge skills

已裝在 `~/.codex/skills/`:
- `generate2dsprite` — 角色立繪 / pixel sprite / 動畫 sheet
- `generate2dmap` — VN 背景 / tilemap / tileset

跑這兩個 skill 前先讀對應 `~/.codex/skills/<name>/SKILL.md`。

## 本機 reference 圖

`references/` 不上 git,但 local 有:

```
references/
├── protagonist-ref.png
├── suman-ref.png
├── chenyifu-ref.jpeg
├── office-ref.png
└── suman-events-source.md
```

跑 prompt 前 `ls references/` 確認,缺的話寫 BLOCKER 不要自己生。

## 如果你看到本檔跟 codex-prompt 衝突

**codex-prompt 優先**(specific over general)。但若衝突牽涉到工作流程 / 邊界(本檔 §「你不可以動的檔」之類),寫 BLOCKER,不要自己決定。
