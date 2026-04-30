# Codex Prompt 028 — Office redo:完整 layered_raster pipeline(含 dressed reference + chroma-key cleanup + collision align)

STATUS: done
SKILL: `$generate2dmap` + `$generate2dsprite` + Pillow + view_image + sprite-forge scripts
依賴:取代 023 office layered(那次跳過了 5 個 pipeline 步驟導致 magenta 殘留 + 視覺不對齊 + 門碰不到)
產出(覆蓋既有):
- `public/maps/office-base.png`(clean_hd hand-painted ground+walls,**no furniture**)
- `public/maps/office-dressed-reference.png`(planning artifact:base + 所有 props 完整擺好,**作 reference 不是 runtime**)
- `public/props/office/{desk,chair,bookshelf,door}.png`(4 個 one-by-one 大件 props)
- `public/props/office/{phone,paper,plant,lamp,rug,trash,coffee-mug,book-stack,nameplate}.png`(9 個 prop_pack 3x3 小件)
- `public/maps/office-layered-preview.png`(QA flattened preview)
- `src/content/maps/office.json`(refresh:prop placements 對齊 dressed reference,collision 對齊 prop bbox,trigger 對齊 base 圖門位置)

不動:其他場景檔(orphanage 等)/ portrait / sprite

---

## 為什麼整個重做

用戶實測 office layered 版有 3 個 issue:
1. 圖上有 magenta 殘留(粉色背景沒清乾淨)
2. 家具視覺位置 vs JSON tile coords 對不上
3. 門碰到沒反應(視覺門位置 ≠ trigger tile)

讀 sprite-forge `references/layered-map-contract.md` + `references/prop-pack-contract.md` 後發現之前 023 跳過 5 個 pipeline steps(dressed reference / one-by-one for large props / chroma-key cleanup with despill / extract_prop_pack.py / compose preview)。

本次嚴格走完整流程。

---

## Pipeline 8 step

### Step 1 — Generate base map (clean_hd, ground + walls + windows + doorway only)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
office BASE map — only ground and walls. Layered raster pipeline.

map_kind: town (small newly-set-up Taiwanese talent agency office interior)
visual_model: baked_raster
art_style: clean_hd (clean hand-painted HD game asset style, sharp readable
           terrain, smooth surfaces, low texture noise. NOT pixel art.)
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: dark wood horizontal strip with 1 visible doorway opening
  centered around x=320 (col 10), shown as a darker rectangle (the door
  prop will overlay later)
- left/right/bottom walls: solid wood walls
- interior: continuous WARM WOOD plank floor — readable, smooth, NO
  furniture, NO desks, NO chairs, NO bookshelves, NO rugs, NO plants,
  NO papers. Bare floor.
- Optional: subtle floor seams (plank lines) for visual interest, but
  no clutter.

CRITICAL:
- Do not include any furniture, props, or decoration.
- Do not include text, signs, watermarks, UI.
- Doorway should be visible at top wall center, easy to identify.

Output: public/maps/office-base.png, 448x320 RGB opaque PNG.
```

跑完後 Pillow 量 doorway 在哪 col(top strip darkness scan,參考 prompt 022 的方法),記錄為 `door_col` for later。

### Step 2 — Generate dressed reference (base + all props,planning only)

`view_image public/maps/office-base.png` 載入 base context,然後:

```
Use the image just shown as the EXACT base map reference.

Create a dressed-reference version of the same office map by adding props
ONLY. Preserve exactly: camera, framing, image size (448x320), terrain,
walls, doorway position, all walkable routes.

Do NOT crop, zoom, rotate, repaint, or redesign the base.

Add these props naturally on top of the existing map:
- a wooden office desk near the upper-left area (about 3 tiles wide, 2 tall)
- an office chair in front of the desk (1 tile)
- a bookshelf along the lower-left wall (about 2x2 tiles)
- the closed wooden door at the top wall around col 10
- a phone and paper stack on the desk surface
- a small plant pot near the right side
- a desk lamp on the desk
- a small red rug in the floor center
- a trash bin near the wall
- a coffee mug on the desk
- a book stack on the bookshelf
- a small nameplate near the door

Style: same clean HD hand-painted style as the base.

No UI, no text, no watermark, no character.

Output: public/maps/office-dressed-reference.png, same 448x320 size.
```

跑完 view_image 比對 base + dressed,**用人話描述每個 prop 在哪個 (col, row) 位置**(精確到 tile)。寫進 JOURNAL Verified output 當 prop placement matrix。

### Step 3 — Generate large props one-by-one (desk, chair, bookshelf, door)

對下面 4 個 prop 各跑一次 `$generate2dsprite` single asset(非 prop_pack):

每張 prompt 模板(per `prop-pack-contract.md` 「One-By-One Prop Prompt Pattern」):

```
Create a single <prop> prop for a top-down 2D RPG map.
Use the same selected map art style: clean HD hand-painted (NOT pixel art).
Mostly front-facing top-down RPG object view: upright objects are vertical
and centered, with only a small visible top face. Avoid strong isometric
diagonal rotation.
Full object visible, centered, crisp but not chunky outlines.
Background must be 100% solid flat #FF00FF magenta, no gradients, no
texture, no shadows, no floor plane.
No text, labels, UI, or watermark.
Entire prop must fit fully inside the image with generous magenta margin
on all sides; no part may touch or cross the image edge.
```

`<prop>` spec(每個):

| prop_id | 描述 | 預期 cell-size |
|---|---|---|
| desk | wooden office desk, dark stained, 3 tiles wide × 2 tiles tall | 256 px(配合 fit-scale) |
| chair | swivel office chair facing up | 128 px |
| bookshelf | tall brown wooden bookshelf with red and blue book spines, 2 tiles wide × 2 tiles tall | 256 px |
| door | closed wooden door with brass handle, vertical orientation for top-wall doorway placement, 1 tile wide × 1 tile tall | 128 px |

**chroma-key cleanup**(每張)— per `prop-pack-contract.md`:

```bash
python ~/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py \
  --input <raw.png> \
  --out <raw-alpha.png> \
  --key-color '#ff00ff' \
  --soft-matte \
  --transparent-threshold 35 \
  --opaque-threshold 160 \
  --despill \
  --edge-contract 1 \
  --force
```

如果 script 不存在,手寫 Pillow 等價:RGB ≈ magenta 設 alpha=0,RGB 接近 magenta 但不純(despill)的 R/B 通道往中間 pull。

然後 `extract_prop_pack.py` 對單張(`--rows 1 --cols 1`)抽出 + reject-edge-touch:

```bash
python ~/.codex/skills/generate2dmap/scripts/extract_prop_pack.py \
  --input <raw-alpha.png> \
  --rows 1 --cols 1 \
  --labels <prop_id> \
  --output-dir public/props/office/ \
  --component-mode largest \
  --component-padding 8 \
  --min-component-area 200 \
  --reject-edge-touch
```

最終 PNG 在 `public/props/office/<prop_id>.png`。

### Step 4 — Generate small props in 3x3 pack

剩下 9 個小件用 prop_pack_3x3:

```
Create exactly one 3x3 prop sheet for a top-down 2D RPG office map.
Each cell contains one separate static environmental prop, in row-major order:

  row 1: phone (black office phone), paper (small paper stack), plant (small potted plant)
  row 2: lamp (desk lamp), rug (small red rectangular rug), trash (modern trash bin)
  row 3: coffee_mug (white ceramic mug), book_stack (3 books stacked), nameplate (small wooden nameplate "鉅子娛樂")

All props share the same biome, palette (warm office wood + accent red),
camera angle (top-down 45°), and scale (single-tile 32x32 except rug
which is 2x1).

Use clean hand-painted HD 2D game asset style (NOT pixel art).
Mostly front-facing top-down RPG object view.
Each prop must fit fully inside the central 50% to 60% of its cell with
generous flat magenta gutters on all four sides.
Background must be 100% solid flat #FF00FF magenta in every cell, no
gradients, no texture, no shadows, no floor plane.
No text, labels, UI, watermark, numbers, arrows, borders, grid lines.
```

跑完 `remove_chroma_key.py`(同 step 3 參數)+ `extract_prop_pack.py`:

```bash
python ~/.codex/skills/generate2dmap/scripts/extract_prop_pack.py \
  --input <raw-alpha.png> \
  --rows 3 --cols 3 \
  --labels phone,paper,plant,lamp,rug,trash,coffee-mug,book-stack,nameplate \
  --output-dir public/props/office/ \
  --component-mode largest \
  --component-padding 8 \
  --min-component-area 200 \
  --reject-edge-touch
```

如果有 prop edge-touch reject → regen 整張 pack。

### Step 5 — Verify all props alpha clean (no magenta residue)

對每個 `public/props/office/*.png`:

```python
from PIL import Image
import numpy as np
im = np.array(Image.open(path).convert('RGBA'))
# Check: no pixel should be both opaque and "magenta-ish"
opaque = im[:,:,3] > 128
magenta_ish = (im[:,:,0] > 200) & (im[:,:,1] < 100) & (im[:,:,2] > 200)
residue = (opaque & magenta_ish).sum()
assert residue < 50, f'{path}: {residue} magenta residue pixels'
```

任一 prop residue ≥ 50 → 重跑 chroma-key with stronger despill(transparent_threshold 提高到 50)。

### Step 6 — 寫 office.json placement(對齊 dressed reference 量出的 col/row)

對應 step 2 量出的 prop placement matrix,寫 office.json。例如(實際 col/row 由 step 2 量決定):

```json
{
  "id": "office",
  "name": "鉅子娛樂辦公室",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/office-base.png",
  "props": [
    { "id": "desk",       "url": "/props/office/desk.png",       "x": <from step 2>, "y": <>, "collision": { "x": <>, "y": <>, "w": 3, "h": 2 } },
    { "id": "chair",      "url": "/props/office/chair.png",      "x": <>, "y": <>, "collision": { "x": <>, "y": <>, "w": 1, "h": 1 } },
    { "id": "bookshelf",  "url": "/props/office/bookshelf.png",  "x": <>, "y": <>, "collision": { "x": <>, "y": <>, "w": 2, "h": 2 } },
    { "id": "door",       "url": "/props/office/door.png",       "x": <door_col>, "y": 0 },
    ... 其他 9 個小 prop
  ],
  "tilesetUrl": "/maps/office-base.png",
  "tilesetCols": 1,
  "tilesetRows": 1,
  "layers": { "ground": [], "objects": [] },
  "collision": [...14×10 boolean,從 props collision bbox union + 邊牆 推導...],
  "triggers": [
    { "id": "office.door", "x": <door_col>, "y": 1, "eventId": "sign-suman", "autoFire": true }
  ],
  "spawns": {
    "player": { "x": 7, "y": 5, "facing": "down" }
  }
}
```

**Collision 推導法**(寫個 Python helper):
- 14×10 全 false 起始
- 邊牆:row 0/9 + col 0/13 全 true,但**保留 doorway**(door_col 位置 row 0 設 true 或門 walkable 看設計;門開玩家可走 trigger 觸發)
- 對每個 prop 的 collision bbox,把對應 (x..x+w-1, y..y+h-1) 設 true
- 確認 spawn (7, 5) 是 false
- 確認 trigger (door_col, 1) 是 false(玩家可走到那 tile 觸發)
- 確認從 spawn 到 trigger 有 walkable path

### Step 7 — Compose layered preview QA

```bash
python ~/.codex/skills/generate2dmap/scripts/compose_layered_preview.py \
  --base public/maps/office-base.png \
  --placements <temp placements json from step 6> \
  --output public/maps/office-layered-preview.png
```

如果 script 不存在 / placements format 不對,手寫 Pillow:base 圖 + 每個 prop alpha-blend 到 (prop.x*32, prop.y*32) 位置。

view_image preview 確認視覺看起來合理(家具不重疊牆 / 門位置清楚 / 通道 walkable)。

### Step 8 — Update React 跟 trigger

如果 step 6 算出的 door_col 不是當前 trigger.x(10),用新 door_col 更新 office.json `triggers[0].x`。

`TilemapScene.tsx` 已經有 layered render path(prompt 023 加的),不用動。

`pnpm typecheck + build` pass。

---

## Acceptance(整體)

1. office-base.png 視覺乾淨,無家具,doorway 可辨
2. office-dressed-reference.png 含完整擺設(planning use)
3. 4 個 large props one-by-one 生成,每個 < 200 px magenta residue(透明乾淨)
4. 9 個 small props prop_pack 抽出,每個 < 50 px magenta residue
5. office-layered-preview.png 存在,視覺看起來像「base + 各 prop 對齊位置」
6. office.json valid,props 對齊 dressed reference 量出的 col/row
7. trigger.x = step 1 量出的 door_col(可能不是 10,以實際為準)
8. typecheck + build pass

## Verified output 必填

JOURNAL `Verified output:` 段,逐 step 量化:

1. Step 1 base.png Pillow size + 量出 door_col(top wall darkness scan)
2. Step 2 dressed-reference.png + view_image 後人話描述「每個 prop 在 (col, row)」
3. Step 3 4 大 prop 各:size, opaque-magenta-residue count, edge_touch flag
4. Step 4 9 小 prop 同上
5. Step 5 alpha clean assertion 全 pass
6. Step 6 office.json props 列表(逐 prop x, y, w, h)+ collision matrix(14×10 boolean)
7. Step 7 preview.png 視覺描述
8. Step 8 typecheck + build 結果

## 完成後

1. JOURNAL.md append entry(完整 8 step 的 Verified output)
2. codex-prompts/028-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 orphanage / 其他場景
- 不要動 portrait / sprite
- 不要 push
- 不要跳過任何 step(跳了會回到 023 的 issue)
- 不要用 retro_pixel(本次 layered 走 clean_hd 預設)
