# Codex Prompt 003 — 生像素地圖用的 4 方向 walking sprite

STATUS: pending
SKILL: `generate2dsprite`(asset_type=`player`)
依賴:**必須先完成 001**(用立繪當 reference 維持角色 identity)
產出:
- `public/sprites/protagonist.png`(4×4 sheet, 128×192, transparent)
- `public/sprites/suman.png`
- `public/sprites/chenyifu.png`

---

## Context(只讀)

- `GDD.md` §3「角色」、§7.2「Tilemap 模式美術」、§7.3「風格一致性檢查」
- `~/.codex/skills/generate2dsprite/SKILL.md` 的 `player_sheet` defaults
- `public/portraits/{character}-normal.png`(prompt 001 產物,**先 view_image 載入**當 reference)

## 任務

為三個角色各生一張 **4 方向 × 4 frames 的 walking sprite sheet**(player_sheet),供地圖模式使用。

### 參數

- `asset_type`: `player`
- `action`: `walk`
- `view`: `topdown`(45 度俯視)
- `sheet`: `4x4`(rows=4 directions, cols=4 frames)
  - row 順序:up / right / down / left(從上到下)
  - col 順序:idle / step1 / idle / step2(經典 4-frame walk cycle)
- `frames`: 16
- `art_style`: `retro_pixel`(16-bit RPG / SNES 時代風格)
- `anchor`: `feet`
- `margin`: `safe`(邊緣留 buffer 避免 edge_touch)
- `shared_scale`: true
- 每 frame size:32×48 px → sheet 共 128×192

### 風格一致性策略(重要,讀 GDD §7.3)

順序:
1. `view_image public/portraits/suman-normal.png` → 把蘇嫚君 VN 立繪載入 context
2. **先生 suman 的 sprite**(蘇嫚君是主軸,風格定型靠她)
3. `view_image public/portraits/protagonist-normal.png` → 載入 → 生 protagonist
4. `view_image public/portraits/chenyifu-normal.png` → 載入 → 生 chenyifu

每張 prompt 必須:
- 引用「前一張立繪」當 character identity reference(髮色 / 衣服 / 髮型輪廓)
- **保留 stable identity markers**:髮色、髮型、主要服裝顏色、性別年齡感
- 把 VN 立繪的服裝**簡化**成像素能畫的形狀(不是 1:1 retro 化)

### Prompt 範本(以 suman 為例,protagonist/chenyifu 自行調整)

```
Style: 16-bit retro pixel art, SNES-era top-down RPG character sprite, clean
       readable silhouette, NO outline antialiasing, palette of 16 colors max
       per character, warm tones consistent with the VN portrait shown above.
Subject: a 22-year-old young woman, character identity from the reference portrait
         (long hair, neutral / soft expression, light dress simplified for pixel
         scale). Top-down view at 45 degrees.
Sheet contract:
  - 4 rows × 4 columns, total 16 frames
  - row 1: facing UP, 4 walking-cycle frames (step1, mid, step2, mid)
  - row 2: facing RIGHT, 4 walking-cycle frames
  - row 3: facing DOWN, 4 walking-cycle frames
  - row 4: facing LEFT, 4 walking-cycle frames
  - each frame 32x48 pixels, anchor at feet
  - solid #FF00FF magenta background, no shadows on the bg
  - characters stay strictly within their cell — NO edge touch
  - same character scale across all 16 frames
  - same line weight and palette across all 16 frames
```

## 後處理

跑 `scripts/generate2dsprite.py process`,參數:
- `--rows 4 --cols 4`
- `--shared-scale` on
- `--component-mode largest`
- `--reject-edge-touch`(若 reject 則 regenerate raw)
- 輸出 `public/sprites/<name>.png`(transparent 4×4 sheet)

每張另外輸出 4 條 direction-strip(`-up.png`、`-right.png`、`-down.png`、`-left.png`)留在 `public/sprites/strips/` 給之後 debug,但不上 git(寫到 .gitignore exception 或就接受 commit)。

## 嚴格要求

- 三張看起來像同一個遊戲(色相相近、像素 scale 一致、邊緣風格一致)
- **alpha 必須乾淨**,無 magenta fringe
- 每 frame 不可超出 cell border
- 角色看得出來是「VN 立繪那個人」(主要靠髮色 + 服裝主色)

## 完成後

1. `public/sprites/protagonist.png`、`suman.png`、`chenyifu.png` 三張 4×4 sheet 就位
2. JOURNAL.md append entry:除了 schema 必填欄位外,加一行「VN-vs-pixel identity 自評:高 / 中 / 低」
3. `STATUS: pending` → `done`
4. `git add public/sprites && git commit -m "feat(sprites): generate 4-direction walking sprites [prompt:003]"`

## 不要做

- 不要生 idle / attack / cast(只做 walk)
- 不要生其他角色(郝友乾、王瑞恩 v0.2+)
- 不要 view_image 多張立繪同時載入(逐一處理,維持 lazy load)
