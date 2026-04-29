# fake-star-game

以《明星志願 3》蘇嫚君劇情線為主軸、由 **Claude Code(planner)+ Codex(implementer)** 協同開發的 web 遊戲雛形。

像素地圖探索 + visual novel 對話的混合玩法。

## Docs

- `PRD.md` — 產品需求、AI 分工、scope、成功條件
- `GDD.md` — 蘇嫚君全線事件樹、tilemap 系統設計、美術風格指引
- `COLLAB.md` — Claude × Codex 協作 SOP、檔案邊界、harness 心法
- `PLAN.md` — 當前 sprint 的 codex-prompt 排程
- `REVIEW.md` — Claude review 紀錄(append-only)
- `JOURNAL.md` — Codex 執行日誌(append-only)

## Local setup(只給維護者看)

### 1. agent-sprite-forge

需要先裝才能跑 codex prompts:

```bash
git clone https://github.com/0x0funky/agent-sprite-forge.git
cd ./agent-sprite-forge
python3 -m pip install -r ./requirements.txt
mkdir -p ~/.codex/skills
cp -R ./skills/* ~/.codex/skills/
```

裝完 `~/.codex/skills/` 應該有 `generate2dsprite` 跟 `generate2dmap`。

### 2. references/

`references/` 不上 git(版權考量)。Codex 跑 prompts 前需要 local 有這些檔:

```
references/
├── protagonist-ref.png
├── suman-ref.png
├── chenyifu-ref.jpeg
├── office-ref.png
└── suman-events-source.md
```

來源:從各角色 / 地圖目錄(中文目錄,也不上 git)裡複製出來。

### 3. 跑 dev server

(待 codex 完成 005-scaffolding 後才有 `package.json`)

```bash
pnpm install
pnpm dev
```

## Status

- [x] PRD / GDD / COLLAB / PLAN 寫完
- [x] agent-sprite-forge 安裝
- [x] codex-prompts/001-portraits.md(待 codex 執行)
- [ ] codex-prompts/002 ~ 009(待 Claude 寫)
- [ ] v0.1 demo 跑通
