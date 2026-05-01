# Codex Prompt 033 — Office redo v3:套新 prop/base 準則 + 典型辦公室佈局

STATUS: done
SKILL: $generate2dmap + $generate2dsprite + Pillow + view_image
依賴:028 office redo v2 完成(本次再優化)
產出(覆蓋既有):
- `public/maps/office-base.png`(包含**地毯 / 桌上小物視覺 / 牆掛飾 / 地板紋**等所有裝飾,只缺幾個 prop)
- `public/maps/office-dressed-reference.png`
- `public/props/office/{desk,chair,bookshelf,door}.png`(**只 4 個 props**,大件 + 互動)
- `public/maps/office-layered-preview.png`
- `src/content/maps/office.json`(props 列表只 4 項)

刪除:`public/props/office/{phone,paper,plant,lamp,rug,trash,coffee-mug,book-stack,nameplate}.png`(這 9 個畫進 base 或 desk prop 裡)

不動:其他場景檔 / portrait / sprite

---

## 為什麼

GDD §6.1 新加「prop vs base 準則」:
- 高度 > 1 tile 的障礙 / 可互動 → prop
- 平面 / 裝飾 / 配件 → base 或畫進其他 prop

028 office redo 還是把太多東西做成 prop(13 個),包括桌上電話、紙、咖啡杯、書、檯燈、紙鎮 — 應該畫進「桌子」prop 本體。地毯、垃圾桶、盆栽 — 平面或矮的,應該畫進 base。

加上用戶反饋:書櫃跟裝飾物擺放美感欠缺 → base 構圖要參考典型現實辦公室佈局,別讓 image_gen 隨機擺。

---

## Pipeline

### Step 1 — base.png(含所有裝飾物)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
small Taiwanese talent agency office BASE map. Layered raster pipeline.

map_kind: town
visual_model: baked_raster
art_style: clean_hd (clean hand-painted HD, NOT pixel art)
size: 448x320 px
perspective: top-down 45°

This base IS NOT EMPTY — include all visually decorative content (desk
overlay items, floor decorations, wall hangings) but EXCLUDE the 4
high/interactive props (desk, chair, bookshelf, door) which will be
overlaid as separate transparent props later.

Layout (typical Taiwanese 經紀公司 office configuration):
- top wall: dark wood paneling, 1 visible doorway opening centered around
  col 9-10 (darker rectangle for door prop overlay)
- left/right/bottom walls: warm wood panel walls
- interior floor: continuous warm wood plank

INCLUDE in this base (visual decoration only, not as separate props):
- a small red oriental decorative rug at floor center (around col 5-9, row 4-6)
- one or two framed wall hangings on the right wall (small, decorative)
- a low potted plant in a corner (visual only, walkable)
- a small trash bin near a wall (visual only)
- subtle floor seams between planks for visual realism
- a small "鉅子娛樂" sign etched onto the top wall above the doorway
- a small wall clock on the right wall

EXCLUDE (will be added as separate props):
- the office desk (will be a prop)
- the office chair (will be a prop)
- the bookshelf (will be a prop)
- the door panel itself (will be a prop)
- DO NOT draw shadows or imprints of these absent items

Composition guideline: typical small office — desk along the left wall
(empty space reserved 1-3 cols × rows 2-3), chair area in front of desk
(empty around col 3 row 4), bookshelf area along the right wall (empty
around col 11-12 rows 6-8). LEAVE THESE AREAS EMPTY (just floor) — props
will be placed there.

No text outside the small "鉅子娛樂" wall sign, no UI, no character.

Output: public/maps/office-base.png, 448x320 RGB opaque.
```

注意:base 包含「rug 地毯 / 牆飾 / 矮盆栽 / 牆鐘 / 招牌」等裝飾,**但保留桌椅櫃門的位置空著**。

跑完 Pillow 量 doorway col → `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (office-base.png) as the EXACT base reference.

Create a dressed-reference version of the same office by adding ONLY the
4 missing high-impact props on top:
- a wooden L-shaped office desk along the upper-left area (3 tiles wide
  × 2 tall, at roughly col 1-3 rows 2-3). The desk surface should ALREADY
  have built-in details: a black office phone, a stack of papers, a desk
  lamp, a coffee mug, a small nameplate "鉅子娛樂". DO NOT draw these
  as separate scattered objects — they are part of the desk prop.
- a black office swivel chair (1x1) in front of the desk (col 3 row 4)
- a tall wooden bookshelf with colorful book spines (2 tiles wide × 2
  tall, at col 11-12 rows 6-8) along the right wall
- a closed wooden door with brass handle (1x1) at the doorway location

Preserve exactly: camera, framing, image size (448x320), terrain, walls,
doorway position, the rug and decorations from the base.

Style: same clean HD as base.

No additional clutter, no NPCs, no text/UI/watermark.

Output: public/maps/office-dressed-reference.png, 448x320.
```

view_image 後寫 4 個 prop 在 (col, row) 位置進 JOURNAL。

### Step 3 — 4 large props one-by-one

對下面 4 個 prop 各跑一次 `$generate2dsprite` single asset(per prop-pack-contract.md「One-By-One Prop Prompt Pattern」),clean_hd 風格。**注意 desk 要把桌上小物件一起畫進去**:

| prop | spec | cell-size |
|---|---|---|
| desk | dark wooden L-shaped office desk WITH INTEGRATED desk surface details — a black phone on the right, a stack of papers, a desk lamp, a white coffee mug, a small "鉅子娛樂" nameplate. All as one connected piece (single PNG). 3 tiles wide × 2 tall. | 256 |
| chair | black office swivel chair, top-down view. 1x1 tile. | 128 |
| bookshelf | tall wooden bookshelf WITH INTEGRATED books on shelves (red, blue, green book spines visible). Single piece. 2 tiles wide × 2 tall. | 256 |
| door | closed wooden door with brass handle, vertical orientation for top-wall placement. 1x1. | 128 |

每張跑 chroma-key cleanup + extract reject-edge-touch(同 028)。

### Step 4 — 廢檔

刪除 028 留下的小 prop:

```bash
rm public/props/office/phone.png
rm public/props/office/paper.png
rm public/props/office/plant.png
rm public/props/office/lamp.png
rm public/props/office/rug.png
rm public/props/office/trash.png
rm public/props/office/coffee-mug.png
rm public/props/office/book-stack.png
rm public/props/office/nameplate.png
```

(這些都畫進 desk prop 或 base 了)

### Step 5 — alpha residue all 4 props < 50

(同 028 standard)

### Step 6 — office.json prop 列表簡化

```json
{
  "id": "office",
  "name": "鉅子娛樂辦公室",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/office-base.png",
  "props": [
    { "id": "desk",      "url": "/props/office/desk.png",      "x": <from step 2>, "y": <>, "collision": { "x": <>, "y": <>, "w": 3, "h": 2 } },
    { "id": "chair",     "url": "/props/office/chair.png",     "x": <>, "y": <>, "collision": { "x": <>, "y": <>, "w": 1, "h": 1 } },
    { "id": "bookshelf", "url": "/props/office/bookshelf.png", "x": <>, "y": <>, "collision": { "x": <>, "y": <>, "w": 2, "h": 2 } },
    { "id": "door",      "url": "/props/office/door.png",      "x": <door_col>, "y": 0 }
  ],
  "tilesetUrl": "/maps/office-base.png",
  "tilesetCols": 1,
  "tilesetRows": 1,
  "layers": { "ground": [], "objects": [] },
  "collision": [...14×10,從 props 推導...],
  "triggers": [
    { "id": "office.door", "x": <door_col>, "y": 1, "eventId": "sign-suman", "autoFire": true }
  ],
  "spawns": {
    "player": { "x": 7, "y": 5, "facing": "down" }
  }
}
```

注意:
- `props` 列表只 4 項(desk / chair / bookshelf / door)
- `collision` 從 4 個 prop 的 collision union + 邊牆推導
- spawn 維持 (7, 5),trigger 對齊 step 1 量出的 door_col
- 確認 spawn → trigger 有 walkable path

### Step 7 — compose preview

```bash
python ~/.codex/skills/generate2dmap/scripts/compose_layered_preview.py \
  --base public/maps/office-base.png \
  --placements <temp> \
  --output public/maps/office-layered-preview.png
```

view_image preview 確認:
- 視覺上桌子有電話/紙/咖啡杯等(桌子 prop 自帶)
- 地毯在地板 base 上(不是 prop)
- 構圖像典型辦公室(桌靠壁 / 椅在桌前 / 櫃靠對壁)
- 沒看起來空蕩或散亂

### Step 8 — typecheck/build

`pnpm typecheck && pnpm build` pass。

---

## Acceptance(整體)

1. office-base.png 1024x320 含 rug / 牆飾 / plant / trash / 招牌 / 牆鐘(視覺 only,不是 prop)
2. dressed-reference.png 含 4 個高 impact props(desk 桌上有自帶小物)
3. 4 个 prop residue=0
4. **舊 9 個小 prop 檔案已刪除**(`ls public/props/office/` 只剩 4 個 PNG)
5. office.json props 列表 = 4 項
6. preview 視覺合理(桌椅櫃門位置接近真實辦公室)
7. spawn (7,5) walkable, trigger walkable, path 通
8. typecheck + build pass

## Verified output

逐 step 量化:
1. base size + door_col
2. dressed prop placement matrix(4 個 prop 的 col/row)
3. 4 large props each residue
4. confirmed deletion of 9 small props
5. office.json props (4 項) + collision matrix
6. preview 視覺描述(典型辦公室佈局?桌子有自帶小物?地毯在 base?)
7. typecheck + build

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動其他場景(orphanage/obo/pub/set)
- 不要做 small prop_pack(本次 prop 全 one-by-one)
- 不要動 portrait/sprite
- 不要 retro_pixel
