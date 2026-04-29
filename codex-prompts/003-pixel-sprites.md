# Codex Prompt 003 — 生像素地圖用 4 方向 walking sprite

STATUS: done
SKILL: `$generate2dsprite`(asset_type=`player`, action=`walk`)
依賴:**必須先完成 001**(用立繪當 identity reference)
產出:
- `public/sprites/protagonist.png`(4×4 sheet, 128×192, transparent RGBA)
- `public/sprites/suman.png`
- `public/sprites/chenyifu.png`

---

## Context(只讀)

- `GDD.md` §3「角色」、§7.2「Tilemap 模式美術」、§7.3「風格一致性檢查」
- `~/.codex/skills/generate2dsprite/SKILL.md`(`player_sheet` defaults)
- `agent-sprite-forge` README 的「Game Sprite / Four-Direction Walk」範例(在 `agent-sprite-forge/README.md` ~line 62~98,**先 cat 過**作為 prompt 範本)

## 任務

依 `$generate2dsprite` 的 `player_sheet` 慣例,為三個角色各生一張 **4 方向 × 4 frames 的 walking sprite sheet**。skill 已內建完整 pipeline(magenta key + chroma-key + extract + per-direction strips + GIFs),**用 natural language 下指令就好,不要自組工序**。

### 風格一致性順序(依 GDD §7.3)

順序固定 — **先 suman**(主軸,定型風格),用 VN 立繪當 identity reference:

```
view_image public/portraits/suman-normal.png  ← 載入 prompt 001 產物
```

接著生 suman pixel sprite,prompt 裡叫 skill「preserve hair color, hairstyle silhouette, outfit primary color」對齊 VN 立繪。然後同一程序處理 protagonist、chenyifu。

### 給 $generate2dsprite 的 3 個請求

#### 1. Suman(anchor)

```
view_image public/portraits/suman-normal.png

Use $generate2dsprite to create a top-down 4x4 player_sheet for a 22-year-old
young woman with the same identity as the loaded VN portrait above (long hair,
gentle expression, light pastel dress simplified for pixel scale).

asset_type: player
action: walk
view: topdown (45° top-down)
sheet: 4x4
frames: 16

Row order: up, right, down, left (top to bottom)
Column order: 4-frame walk cycle per direction (idle, step1, idle, step2)

art_style: retro_pixel (16-bit SNES-era JRPG)
anchor: feet
margin: safe (no edge touch)
shared_scale: true
per-frame size: 32x48 px (sheet total 128x192)

Identity preservation (from the loaded VN portrait):
- hair color, hairstyle silhouette
- outfit primary color (pastel/light)
- gender, age range, body proportions
The pixel sprite must read as "the same character" as the VN portrait when
seen side by side.

Strict sheet contract:
- exactly 16 frames in 4×4 grid
- solid #FF00FF magenta background
- each frame strictly inside its cell, no edge touch
- same scale and silhouette across all 16 frames
- same line weight and palette across all 16 frames

Output: public/sprites/suman.png (transparent RGBA after chroma-key cleanup).
Also keep direction strips and GIFs in public/sprites/strips/<character>/ if
the skill produces them.
```

#### 2. Protagonist

```
view_image public/portraits/protagonist-normal.png

Use $generate2dsprite to create a top-down 4x4 player_sheet for a 30-year-old
male talent agent with the same identity as the loaded VN portrait above
(business suit, calm sober look).

[Same params as suman above]

Style anchor: match the previously generated suman.png pixel sprite — same
pixel scale, same line weight, same outline behavior, same level of palette
saturation. The three sprites must read as "from the same game".

Output: public/sprites/protagonist.png (RGBA).
```

#### 3. Chenyifu

```
view_image public/portraits/chenyifu-normal.png

Use $generate2dsprite to create a top-down 4x4 player_sheet for a 20-something
male idol with the same identity as the loaded VN portrait above (clean casual
look).

[Same params as suman above]

Style anchor: match the previously generated suman.png and protagonist.png
pixel sprites — consistency across all three.

Output: public/sprites/chenyifu.png (RGBA).
```

## 嚴格要求

- 三張看起來像同一個遊戲(色相 / 像素 scale / 邊緣風格一致)
- VN 立繪那個人 = 像素 sprite 那個人(髮色 + 服裝主色看得出來)
- alpha 乾淨,無 magenta fringe
- 每 frame 不超出 cell border(skill 應該會自動拒絕 edge_touch)
- 4×4 sheet,128×192 px,RGBA mode

## 完成後

1. `ls -lh public/sprites/`(三張就位)
2. 用 Pillow 驗證每張:`mode == 'RGBA'`、`size == (128, 192)`
3. JOURNAL.md append + 加一行 `VN-vs-pixel identity 自評: 高 / 中 / 低`
4. `STATUS: pending` → `STATUS: done`
5. `git add public/sprites codex-prompts/003-pixel-sprites.md JOURNAL.md && git commit -m "feat(sprites): generate 4-direction walking sprites [prompt:003]"`
6. 不要 push

## 不要做

- 不要自組 image_gen + chroma-key 流程 — skill 已內建
- 不要生 idle / attack / cast(只做 walk)
- 不要生郝友乾、王瑞恩等其他角色(v0.2+)
- 不要 view_image 多張立繪同時載入(逐一處理)
