# Codex Prompt 004 — 生辦公室 tilemap + tileset + JSON

STATUS: pending
SKILL: `$generate2dmap` + `$generate2dsprite` (prop_pack 4x4)
依賴:無
產出:
- `public/tilesets/office-tileset.png`(transparent, ≥ 16 tiles, 32px each)
- `src/content/maps/office.json`(tilemap data + collision + triggers)

---

## Context(只讀)

- `GDD.md` §4.1「辦公室 tilemap 設計」、§4.2「觸發點」、§7.2「Tilemap 模式美術」
- `~/.codex/skills/generate2dmap/SKILL.md`(尤其 `tilemap` pipeline 段)
- `~/.codex/skills/generate2dsprite/SKILL.md`(prop_pack 4x4 段)
- `agent-sprite-forge` README:「Map Examples」章節(line ~459~471),先 cat 看官方語法

## 任務

依 `$generate2dmap` 的 tilemap pipeline,生辦公室 tile-based 地圖。skill 內建 tileset image_gen + chroma-key + prop pack 抽出,**用 natural language 下指令就好**。

### 4.1 用 $generate2dsprite 生 tileset(prop_pack 4×4)

需要的 tile id(共 16 個):

```
floor_wood, floor_carpet, wall_top, wall_side, door_closed, door_frame,
desk_top_left, desk_top_right, desk_bottom_left, desk_bottom_right,
chair, bookshelf_top, bookshelf_bottom, phone, paper, rug_corner
```

下指令:

```
view_image references/office-ref.png

Use $generate2dsprite to create a 4x4 prop_pack of 16-bit retro pixel art
office tile assets, 32x32 each, top-down view.

bundle: prop_pack_4x4
asset_type: prop
art_style: retro_pixel (SNES-era JRPG, NOT clean_hd)
view: topdown
margin: safe (no edge touch)
shared_scale: true (every tile uses the same pixel scale)

Tile content (one per cell, 4 rows × 4 cols, fill in this order):
row 1: floor_wood, floor_carpet, wall_top, wall_side
row 2: door_closed, door_frame, desk_top_left, desk_top_right
row 3: desk_bottom_left, desk_bottom_right, chair, bookshelf_top
row 4: bookshelf_bottom, phone, paper, rug_corner

Style anchor: warm wood tones, clean readable shapes, palette consistent across
all 16 tiles, NOT clean_hd. Background must be solid #FF00FF magenta.

Reference: references/office-ref.png — composition / mood reference only, the
art style is 16-bit retro pixel, not the realistic reference.

Output: public/tilesets/office-tileset.png after chroma-key cleanup. The
exported tileset should be a 4×4 grid totaling 128×128 px, RGBA, tile-aligned
(each 32×32 cell strictly contains one tile).
```

skill 自己會跑 `extract_prop_pack.py` 之類的後處理,**信任 skill**。

### 4.2 寫 office.json

依 GDD §4.1 的設計,但擴成 14×10 tilemap(更多走動空間)。寫到 `src/content/maps/office.json`:

ASCII 構圖(0-indexed):

```
row 0:  W W W W W W W W W W W W W W
row 1:  W . . . . . . . . . . D F W       D=door_closed (col 11)  F=door_frame (col 12)
row 2:  W . T T T . . . . . . . . W       T=desk
row 3:  W . T T T . . . . . . . . W
row 4:  W . . C . . . . . . . . . W       C=chair
row 5:  W . . . . . . S . . . . . W       S=player spawn (col 7, row 5)
row 6:  W . . . . . . . . . . . . W
row 7:  W . B B . . . . . . . . . W       B=bookshelf
row 8:  W . B B . . . . . . . . . W
row 9:  W W W W W W W W W W W W W W
```

JSON schema(嚴格遵守):

```json
{
  "id": "office",
  "name": "鉅子娛樂辦公室",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "tilesetUrl": "/tilesets/office-tileset.png",
  "tilesetCols": 4,
  "tilesetRows": 4,
  "layers": {
    "ground": [[14 ints], ...10 rows],
    "objects": [[14 ints], ...10 rows]
  },
  "collision": [[14 booleans], ...10 rows],
  "triggers": [
    { "id": "office.door", "x": 11, "y": 1, "eventId": "sign-suman", "autoFire": true }
  ],
  "spawns": {
    "player": { "x": 7, "y": 5, "facing": "down" }
  }
}
```

Tile id 對應(0-indexed,row-major in 4×4 tileset):
```
0=floor_wood   1=floor_carpet  2=wall_top      3=wall_side
4=door_closed  5=door_frame    6=desk_top_left 7=desk_top_right
8=desk_bot_left 9=desk_bot_right 10=chair      11=bookshelf_top
12=bookshelf_bot 13=phone      14=paper        15=rug_corner
```

`ground` layer 用 floor_wood (0) 鋪整地,牆體 row 用 wall_top (2) / wall_side (3)。
`objects` layer:沒物件的格用 -1(empty);桌子 / 椅子 / 書櫃 / 門按上面 ASCII 配置擺。

`collision`:對應 ASCII 中 W/T/B 為 `true`,其他 `false`。Door (D) 跟 Chair (C) 設 `false`(可踩)。

## 嚴格要求

- tileset 透明乾淨,無 magenta fringe
- `office.json` 嚴格 valid JSON(跑 `python3 -m json.tool < src/content/maps/office.json` 驗)
- collision 2D array 正好 10 行 × 14 列
- 至少有一個 trigger(`office.door` → `sign-suman`)
- player spawn 不在 collision=true 格子上

## 完成後

1. `ls -lh public/tilesets/office-tileset.png src/content/maps/office.json`
2. `python3 -m json.tool < src/content/maps/office.json > /dev/null` (確認 valid)
3. 用 Pillow 驗證 tileset `mode == 'RGBA'` 且 `size == (128, 128)`
4. JOURNAL.md append schema entry,加 `tileset clean: high/mid/low` 跟 `json valid: pass/fail`
5. `STATUS: pending` → `STATUS: done`
6. `git add public/tilesets src/content/maps codex-prompts/004-tilemap.md JOURNAL.md && git commit -m "feat(map): generate office tilemap and tileset [prompt:004]"`
7. 不要 push

## 不要做

- 不要自組 image_gen + chroma-key + extract 工序 — skills 已內建
- 不要做其他地圖
- 不要寫 TilemapScene.tsx(prompt 006 才做)
- collision 不可寫成 string 或物件,**就是 boolean 2D array**
