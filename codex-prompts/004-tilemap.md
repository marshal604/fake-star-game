# Codex Prompt 004 — 生辦公室 tilemap + tileset + JSON

STATUS: pending
SKILL: `generate2dmap`(visual_model=`tilemap`)
依賴:無(可平行 001、002、005)
產出:
- `public/tilesets/office-tileset.png`(transparent, ≥ 16 tiles, 32px each)
- `src/content/maps/office.json`(tilemap data + collision + triggers)

---

## Context(只讀)

- `GDD.md` §4「場景」、§4.1「辦公室 tilemap 設計」、§4.2「觸發點」、§7.2「Tilemap 模式美術」
- `~/.codex/skills/generate2dmap/SKILL.md`(尤其 `tilemap` pipeline)

## 任務

### 4.1 生 tileset(art)

跑 `generate2dsprite`(因為 generate2dmap 對 tileset 也是建議走 sprite skill 的 prop pack 模式)生一個 tileset 圖,包含:

- `floor_wood`(辦公室木地板)
- `floor_carpet`(地毯)
- `wall_top`(牆上半)
- `wall_side`(牆側面)
- `door_closed`(門)
- `door_frame`(門框)
- `desk_top_left`、`desk_top_right`、`desk_bottom_left`、`desk_bottom_right`(2×2 桌子)
- `chair`(椅子,1 tile)
- `bookshelf_top`、`bookshelf_bottom`(2 tile 書櫃)
- `phone`(電話)
- `paper`(紙)

至少 16 個 tiles,輸出 4×4 prop pack:

```
generate2dsprite
  asset_type: prop
  bundle: prop_pack_4x4
  art_style: retro_pixel
  view: topdown
  reference: view_image references/office-ref.png  ← 構圖參考,不必 1:1
  margin: safe
  shared_scale: true
  prompt: "16-bit retro pixel art office tileset, SNES-era top-down RPG, 32x32 per
           tile, warm wood tones, clean readable shapes, magenta #FF00FF background.
           Items: <list above>. Each tile must stay within its cell."
```

後處理:
- 跑 `scripts/extract_prop_pack.py`(SKILL.md 提到的)做 chroma-key + extract
- 合成最終 tileset 圖 `public/tilesets/office-tileset.png`(transparent, 4×4 grid 共 128×128 px)

### 4.2 寫 office.json

依 GDD §4.1 的 14×10 設計,輸出 `src/content/maps/office.json`:

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
    "ground": [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ...每行 14 個 tile id,共 10 行
    ],
    "objects": [
      [...] // 桌子、椅子、書櫃、電話等
    ]
  },
  "collision": [
    [true, true, ..., true],   // 第 1 行(全是牆)
    [true, false, false, ..., false, true],  // 第 2 行(只有左右是牆)
    ...
  ],
  "triggers": [
    {
      "id": "office.door",
      "x": 11,
      "y": 1,
      "eventId": "sign-suman",
      "autoFire": true
    }
  ],
  "spawns": {
    "player": { "x": 7, "y": 5, "facing": "down" }
  }
}
```

ASCII 構圖參考(GDD §4.1 是 10×10,這次擴到 14×10 給更多走動空間):

```
row 0:  W W W W W W W W W W W W W W
row 1:  W . . . . . . . . . . D F W       D=door_closed F=door_frame
row 2:  W . T T T . . . . . . . . W       T=desk
row 3:  W . T T T . . . . . . . . W
row 4:  W . . C . . . . . . . . . W       C=chair
row 5:  W . . . . . . S . . . . . W       S=player spawn
row 6:  W . . . . . . . . . . . . W
row 7:  W . B B . . . . . . . . . W       B=bookshelf
row 8:  W . B B . . . . . . . . . W
row 9:  W W W W W W W W W W W W W W

(0-indexed,(x=11, y=1) 是 D 的位置 → 觸發點)
```

注意 `triggers[0].x` 應改為實際的可走 tile,玩家走到 (10, 1) 旁邊就會觸發,你可以擴大成 trigger 區域(實作時 prompt 006 處理),這裡就放門那個格子。

JSON 的 `collision` 跟 ASCII 圖對齊:`true` = 不可走(W、T、B),`false` = 可走(.、C 椅子可坐就讓他可走、S 是 spawn 也可走、D 也可走避免卡住)。

## 嚴格要求

- tileset 透明乾淨無 magenta fringe
- office.json 嚴格 valid JSON(Codex 跑 `python3 -m json.tool < src/content/maps/office.json` 確認 parse)
- collision 2D array 尺寸**正好** 10 行 × 14 列
- 至少有一個 trigger(`office.door` → `sign-suman`)
- player spawn 點不可在 collision=true 的格子上

## 完成後

1. `public/tilesets/office-tileset.png` + `src/content/maps/office.json` 就位
2. JOURNAL.md append:除 schema,加 `tileset clean: high/mid/low`、`json valid: pass/fail`
3. `STATUS: pending` → `done`
4. `git add public/tilesets src/content/maps && git commit -m "feat(map): generate office tilemap and tileset [prompt:004]"`

## 不要做

- 不要做其他地圖(育幼院 / pub v0.2+)
- 不要寫 TilemapScene.tsx(prompt 006 的事)
- 不要把 collision 寫成 string array 或物件,**就是 boolean 2D array**
