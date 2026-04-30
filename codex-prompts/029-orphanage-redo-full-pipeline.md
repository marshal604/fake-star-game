# Codex Prompt 029 — Orphanage redo:完整 layered_raster pipeline(套用 028 模板)

STATUS: done
SKILL: 同 028
依賴:取代 026
產出:
- `public/maps/orphanage-base.png`(clean_hd ground+walls only,no furniture)
- `public/maps/orphanage-dressed-reference.png`(planning)
- `public/props/orphanage/{bed,bookshelf,table,christmas-tree,door}.png`(5 個 large one-by-one)
- `public/props/orphanage/{toy,blackboard,small-chair,plant,book,ball,teddy,crayon-box,window-frame}.png`(9 個 small prop_pack 3x3)
- `public/maps/orphanage-layered-preview.png`(QA)
- `src/content/maps/orphanage.json`(refresh:對齊 dressed reference,collision union from props)

不動:office 任何檔(028 已 redo done)/ portrait / sprite

---

## Pipeline(完全同 028,場景換成育幼院)

### Step 1 — base (clean_hd, ground+walls only)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
orphanage common-room BASE map — only ground and walls. Layered raster
pipeline.

map_kind: town (interior of a small kids' orphanage common room)
visual_model: baked_raster
art_style: clean_hd (clean hand-painted HD game asset style. NOT pixel art.)
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: warm pastel yellow/cream wall with 2 small framed windows
  (no doorway in top — doorway is at bottom)
- left/right walls: solid pastel walls
- bottom wall: with a doorway opening centered around col 6-7 (the
  exit, shown as darker rectangle for door prop overlay)
- interior: continuous warm WOODEN PLANK floor (slightly worn, lived-in
  feel) — NO furniture, NO beds, NO toys, NO decorations.

CRITICAL: NO furniture/toys/beds/decorations in the BASE — this is the
empty room shell. All props will overlay separately.

No text, signs, watermarks, characters, UI.

Output: public/maps/orphanage-base.png, 448x320 RGB opaque PNG.
```

Pillow 量 doorway col(bottom strip darkness scan)→ `door_col`。

### Step 2 — dressed reference (base + props 規劃)

`view_image public/maps/orphanage-base.png` 後:

```
Use the image just shown as the EXACT base map reference.

Create a dressed-reference version of the same orphanage map by adding props
ONLY. Preserve exactly: camera, framing, image size (448x320), terrain,
walls, doorway position, all walkable routes.

Do NOT crop, zoom, rotate, repaint, or redesign the base.

Add these props naturally on top of the existing map:
- 2 kids' beds along the upper area (each 2x2 tiles)
- a low kids' table in the right-center area (2x1)
- 2 small kids' chairs around the table
- a wooden blackboard against the upper wall (2x1)
- a kids' bookshelf with colorful books along the lower-left wall (2x2)
- a christmas tree in the upper-right corner (2x2)
- the closed door at the bottom wall around col 6-7
- some toys scattered on the floor (toy box, ball, teddy bear)
- a potted plant in a corner
- a window frame decoration on the wall
- a crayon box on the table

Style: same clean HD hand-painted style as the base, warm friendly
kids'-room atmosphere.

No UI, no text, no watermark, no children/character/NPC.

Output: public/maps/orphanage-dressed-reference.png, same 448x320 size.
```

view_image 後寫進 JOURNAL:每個 prop 的 (col, row) 位置(精確到 tile)。

### Step 3 — large props one-by-one(5 個)

對每個 prop 跑 `$generate2dsprite` single asset(per `prop-pack-contract.md` 「One-By-One Prop Prompt Pattern」),clean_hd style:

| prop_id | spec | cell-size |
|---|---|---|
| bed | small wooden kids' bed with blue blanket and pillow, 2x2 tiles | 256 |
| bookshelf | short wooden bookshelf with colorful book spines, 2x2 tiles | 256 |
| table | low wooden kids' table, 2x1 tiles | 192 |
| christmas-tree | decorated christmas tree with red+gold ornaments and a star, 2x2 tiles | 256 |
| door | closed wooden door with brass handle, 1 tile | 128 |

每張跑 chroma-key cleanup (`remove_chroma_key.py --soft-matte --despill --transparent-threshold 35 --opaque-threshold 160 --edge-contract 1`) + `extract_prop_pack.py --rows 1 --cols 1 --reject-edge-touch`。

### Step 4 — small props prop_pack 3x3(9 個)

```
Create exactly one 3x3 prop sheet for a top-down 2D RPG orphanage map.
Each cell contains one separate static environmental prop, in row-major order:

  row 1: toy (wooden toy chest with toys spilling out, 1x1),
         blackboard (small wooden blackboard with chalk letters, 2x1),
         small_chair (small kids' chair, 1x1)
  row 2: plant (small potted plant, 1x1),
         book (a single open book, 1x1),
         ball (a kids' colorful ball, 1x1)
  row 3: teddy (a teddy bear toy, 1x1),
         crayon_box (a small crayon box, 1x1),
         window_frame (a small wall window decoration, 1x1)

All props share the same biome, palette (warm wood + bright kids' colors),
camera angle (top-down 45°), and scale (mostly single-tile).
Use clean hand-painted HD 2D game asset style (NOT pixel art).
Mostly front-facing top-down RPG object view.
Each prop must fit fully inside the central 50% to 60% of its cell with
generous flat magenta gutters on all four sides.
Background must be 100% solid flat #FF00FF magenta in every cell.
No text, labels, UI, watermark.
```

跑 chroma-key + `extract_prop_pack.py --rows 3 --cols 3 --labels toy,blackboard,small-chair,plant,book,ball,teddy,crayon-box,window-frame --reject-edge-touch --output-dir public/props/orphanage/`。

### Step 5 — alpha 殘留 verify(全 14 props)

```python
for f in os.listdir('public/props/orphanage/'):
    if not f.endswith('.png'): continue
    p = f'public/props/orphanage/{f}'
    im = np.array(Image.open(p).convert('RGBA'))
    opaque = im[:,:,3] > 128
    magenta = (im[:,:,0] > 200) & (im[:,:,1] < 100) & (im[:,:,2] > 200)
    res = (opaque & magenta).sum()
    assert res < 50, f'{f}: {res} magenta residue'
```

任一 fail → 重跑 chroma-key with stricter despill。

### Step 6 — orphanage.json 用 dressed reference 量出的位置寫

格式同 028 office.json,參考 026 既有 schema 但 props 列表用 step 2 量出的位置。

trigger.x = step 1 的 `door_col`(可能不是現有 6 — 以 Pillow 量為準)
trigger.y = 9(門洞在 bottom row)
spawn 維持 (6, 8) 或調成 `(door_col, 8)` 跟 trigger 對齊。

collision 從 props bbox union + 邊牆推導(自動算,不要 hand-write)。
**驗證**:spawn 是 walkable,trigger 是 walkable,從 spawn 到 trigger 有 walkable path。

### Step 7 — compose preview

```bash
python ~/.codex/skills/generate2dmap/scripts/compose_layered_preview.py \
  --base public/maps/orphanage-base.png \
  --placements <temp json> \
  --output public/maps/orphanage-layered-preview.png
```

### Step 8 — typecheck + build

```bash
pnpm typecheck && pnpm build
```

---

## Acceptance(整體)

1. orphanage-base.png clean_hd, no furniture
2. dressed-reference.png with all props
3. 5 large props one-by-one,each magenta residue = 0
4. 9 small props from prop_pack,each magenta residue = 0
5. orphanage-layered-preview.png 視覺合理
6. orphanage.json valid,props 對齊 dressed reference 量出 col/row
7. trigger.x = step 1 量出的 door_col,collision[trigger.y][trigger.x] = false
8. spawn 跟 trigger 之間 walkable path 存在
9. typecheck + build pass

## Verified output 必填(JOURNAL)

逐 step 記:
1. base size + door_col
2. dressed-reference.png view_image 後 prop placement matrix(每個 prop col, row)
3. 5 large props residue + edge_touch flag
4. 9 small props residue + edge_touch flag
5. preview 視覺描述
6. orphanage.json props 列表 + collision matrix
7. spawn / trigger walkable assertion
8. typecheck + build 結果

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit / push。

## 不要做

- 不要動 office 任何檔(028 已 done)
- 不要動 portrait / sprite / React schema(office redo 已建好 layered render path)
- 不要用 retro_pixel
- 不要跳 step
