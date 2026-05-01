# Codex Prompt 034 — Orphanage redo v3:套新 prop/base 準則

STATUS: done
SKILL: $generate2dmap + $generate2dsprite + Pillow + view_image
依賴:033 完成(office v3 已驗,新準則奏效)
產出(覆蓋既有):
- `public/maps/orphanage-base.png`(含 toy/blackboard/小物件 等裝飾,**只缺幾個 prop**)
- `public/maps/orphanage-dressed-reference.png`
- `public/props/orphanage/{bed,bookshelf,table,christmas-tree,door}.png`(只 5 個 props)
- `public/maps/orphanage-layered-preview.png`
- `src/content/maps/orphanage.json`(props 列表 5 個 entries 或更少)

刪除:`public/props/orphanage/{toy,small-chair,plant,book,ball,teddy,crayon-box,window-frame,blackboard}.png`(9 個畫進 base)

不動:office / obo / pub / set / portrait / sprite

---

## 為什麼

跟 033 office redo 一樣的新準則:只把高 / 可互動的東西做成 prop。029 orphanage redo 有 14 個 prop 太多,玩具/書/球/泰迪/蠟筆/小椅子/盆栽/窗框/黑板都該畫進 base。

---

## Pipeline(同 033 模板)

### Step 1 — base.png(含所有裝飾)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
small Taiwanese orphanage common-room BASE map. Layered raster pipeline.

map_kind: town
visual_model: baked_raster
art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

This base IS NOT EMPTY — include all visually decorative content but
EXCLUDE the 5 high/interactive props (2 beds, bookshelf, table,
christmas-tree, door).

Layout (typical kids' room):
- top wall: pastel cream wall with 2 small framed windows and a wooden
  blackboard with chalk drawings centered
- left/right walls: same pastel walls
- bottom wall: doorway centered around col 6-7
- interior floor: continuous warm wood plank

INCLUDE in base (visual decoration, NOT separate props):
- a colorful round area rug with kids' pattern at floor center (around
  col 5-9, row 4-6)
- scattered toys on the floor (a teddy bear, a ball, a toy car) —
  drawn flat into the base
- a small potted plant in a corner
- crayon box and a single book on the floor near the table area
- a small "育幼院" wooden sign on the top wall
- subtle floor seams

EXCLUDE (will be props):
- 2 kids' beds (will be props)
- short bookshelf (will be a prop)
- low kids' table (will be a prop)
- christmas tree (will be a prop)
- door panel (will be a prop)
- DO NOT draw shadows or imprints of these absent items

Composition: typical orphanage common room — beds along upper-left
(empty around col 1-5 rows 1-2), bookshelf along left wall (empty col
1-2 rows 6-7), table in right-center (empty col 7-9 rows 4-5),
christmas tree in upper-right corner (empty col 11-12 rows 1-2).

No characters, NPCs, text/UI/watermark.

Output: public/maps/orphanage-base.png, 448x320 RGB opaque.
```

跑完 Pillow 量 doorway col(bottom strip)→ `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (orphanage-base.png) as the EXACT base reference.

Create a dressed-reference version by adding ONLY the 5 missing props:
- 2 kids' beds (each 2x2) along the upper area, wooden frame with blue/
  pink blanket and pillow
- a short kids' bookshelf (2x2) along left wall, books with colorful
  spines INTEGRATED on shelves
- a low wooden kids' table (2x1) in right-center area, with INTEGRATED
  surface details (a single book or notebook)
- a decorated christmas tree (2x2) in upper-right corner, with red+gold
  ornaments and a star INTEGRATED
- a closed wooden door (1x1) at the bottom doorway

Preserve exactly: camera, framing, image size (448x320), terrain, walls,
doorway position, the rug + scattered floor toys + plant + sign + window
+ blackboard from the base.

Style: same clean HD as base.

No additional clutter, no NPCs, no text/UI/watermark.

Output: public/maps/orphanage-dressed-reference.png, 448x320.
```

view_image 後寫 5 個 prop 在 (col, row) 進 JOURNAL。

### Step 3 — 5 large one-by-one

| prop | spec | cell-size |
|---|---|---|
| bed | small wooden kids' bed with blanket and pillow, integrated stuffed bear on top, 2x2 | 256 |
| bookshelf | short wooden bookshelf with INTEGRATED colorful book spines on shelves, 2x2 | 256 |
| table | low wooden kids' table with INTEGRATED book/notebook on top, 2x1 | 192 |
| christmas-tree | green christmas tree WITH INTEGRATED red+gold ornaments and star on top, 2x2 | 256 |
| door | closed wooden door with brass handle, 1x1 | 128 |

每張 chroma-key + extract reject-edge-touch。

### Step 4 — 廢檔

```bash
rm public/props/orphanage/toy.png
rm public/props/orphanage/small-chair.png
rm public/props/orphanage/plant.png
rm public/props/orphanage/book.png
rm public/props/orphanage/ball.png
rm public/props/orphanage/teddy.png
rm public/props/orphanage/crayon-box.png
rm public/props/orphanage/window-frame.png
rm public/props/orphanage/blackboard.png
```

### Step 5 — alpha residue 5 props < 50

### Step 6 — orphanage.json(props 6 個:2 床 + 1 櫃 + 1 桌 + 1 樹 + 1 門)

```json
{
  "id": "orphanage",
  ...
  "baseUrl": "/maps/orphanage-base.png",
  "props": [
    { "id": "bed1", "url": "/props/orphanage/bed.png", "x": <>, "y": <>, "collision": {...2x2} },
    { "id": "bed2", "url": "/props/orphanage/bed.png", "x": <>, "y": <>, "collision": {...2x2} },
    { "id": "bookshelf", "url": "/props/orphanage/bookshelf.png", "x": <>, "y": <>, "collision": {...2x2} },
    { "id": "table", "url": "/props/orphanage/table.png", "x": <>, "y": <>, "collision": {...2x1} },
    { "id": "christmas-tree", "url": "/props/orphanage/christmas-tree.png", "x": <>, "y": <>, "collision": {...2x2} },
    { "id": "door", "url": "/props/orphanage/door.png", "x": <door_col>, "y": 9 }
  ],
  ...
  "triggers": [
    { "id": "orphanage.exit", "x": <door_col>, "y": 9, "eventId": "orphanage-exit-stub", "autoFire": false }
  ],
  "spawns": { "player": { "x": <door_col>, "y": 8, "facing": "up" } }
}
```

collision 從 prop union + 牆推導。spawn / trigger walkable。

### Step 7 — preview

`compose_layered_preview.py` → `orphanage-layered-preview.png`

### Step 8 — typecheck/build pass

---

## Acceptance

1. base.png 含 rug/玩具散落/盆栽/招牌/牆飾/黑板/窗 (視覺 only)
2. dressed-reference 加 5 個 props
3. 5 props residue=0
4. 9 個舊小 prop 已刪
5. orphanage.json props ≤ 6 項(2 床算 2 entry)
6. preview 視覺合理(如真實兒童房)
7. spawn/trigger walkable + path 通
8. typecheck + build pass

## Verified output(JOURNAL)

(同 033 standard)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/obo/pub/set
- 不要動 portrait/sprite
- 不要 retro_pixel
