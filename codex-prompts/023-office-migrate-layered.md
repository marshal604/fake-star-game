# Codex Prompt 023 — Office baked_raster → layered_raster migration

STATUS: done
SKILL: `$generate2dmap` + `$generate2dsprite` + Pillow + view_image
依賴:022 完成
產出:
- `public/maps/office-base.png`(448×320,只有地板+牆,**沒有任何家具/物件**)
- `public/props/office/{desk,chair,bookshelf,door,phone,paper,rug}.png`(各 prop transparent PNG,個別檔案)
- `src/core/types.ts` 加 `props?` 欄位到 `TilemapData`
- `src/content/maps/office.json` schema 升級成 layered(加 `props` 列表 + 各 prop 的 placement + collision bbox)
- `src/components/Tilemap/TilemapScene.tsx` render 邏輯升級(layered render path)
- 廢檔:`public/maps/office-tilemap.png`(從 git rm)

不動:portraits / sprite sheets / 其他 React component / EventGraph

---

## 規格細節

### Task A — view_image 既有 office-tilemap.png 當風格 reference

```
view_image public/maps/office-tilemap.png  ← 看視覺 anchor (color palette, lighting, 物件位置概念)
```

JOURNAL Verified output 寫:既有圖中觀察到的物件清單 + 各物件大致位置(col, row),以人話列出。

### Task B — 生 office-base.png(只有地板 + 牆,沒物件)

```
view_image public/maps/office-tilemap.png  ← 風格 reference (palette only)

Use $generate2dmap baked_raster to create a top-down retro pixel office BASE
map — ONLY the floor and walls, NO furniture, NO objects, NO props.

map_kind: town
visual_model: baked_raster
art_style: retro_pixel (16-bit SNES JRPG, match the warm wood palette of
           the existing office-tilemap.png)
collision_model: none (handled separately)
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall (y=0..32, all 14 cols): horizontal wood-paneled wall strip
- left wall (x=0..32, y=32..288): vertical wood wall
- right wall (x=416..448, y=32..288): vertical wood wall
- bottom wall (y=288..320, all 14 cols): horizontal wall
- interior (x=32..416, y=32..288): CONTINUOUS warm wood plank floor —
  no rugs, no carpet patches, no furniture, no shadows of furniture.
  Just one large wooden plank floor.
- One door opening cut in the top wall around col 10 (the existing image
  showed door at col 10) — leave that tile as a darker open doorway shape
  (wood frame around an empty/black opening) so visually we know there's
  a doorway. The door PNG prop will overlay later if needed.

Output: public/maps/office-base.png, 448x320 RGB or RGBA opaque PNG.

CRITICAL: NO furniture in this image. No desk, no chair, no bookshelf,
no rug, no plant. Floor must look continuous and bare.
```

驗證:Pillow check size = (320, 448) opaque。view_image 確認沒看到家具。

### Task C — 生 prop pack(各 prop 獨立 transparent PNG)

跑 `$generate2dsprite` `prop_pack_3x3`(9 個 props)— 嚴格 retro_pixel + 透明背景:

```
view_image public/maps/office-tilemap.png  ← 風格參考(物件用色)

Use $generate2dsprite to create a 3x3 prop_pack of office furniture props,
each independent and tileable in placement.

bundle: prop_pack_3x3
asset_type: prop
art_style: retro_pixel
view: topdown
margin: tight (props fill cell, no large empty borders)
shared_scale: true

Cell content (row-major, 3x3, fill in this order):
  row 1: desk_full (3x2 tile size at 32px, dark wood office desk with PC),
         chair_office (1x1, swivel chair facing up),
         bookshelf (2x2, brown wood bookshelf with red+blue books)
  row 2: door_closed (1x1, wooden door with brass handle, vertical orientation
                      to fit a top-wall doorway),
         rug_red (3x2, ornate red carpet with patterns),
         phone_desktop (1x1, black office phone)
  row 3: paper_stack (1x1, white papers stack),
         lamp_desk (1x1, desk lamp),
         plant_pot (1x1, small green plant in brown pot)

Each prop:
- transparent background after chroma-key
- size scaled to its tile footprint (e.g. desk_full ≈ 96x64 px,
  bookshelf ≈ 64x64 px, single-tile props ≈ 32x32 px)
- magenta #FF00FF background during raw generation

Output: each prop saved as individual transparent PNG to
  public/props/office/<prop_id>.png
where prop_id is one of: desk, chair, bookshelf, door, rug, phone,
paper, lamp, plant. (Use the simple id, drop the suffix.)
```

skill 自己會處理 prop pack extraction → 每個 prop 一個透明 PNG。

驗證(per prop):
- mode='RGBA'
- 透明背景沒 magenta fringe
- size 合理(single-tile 32×32, multi-tile 比例對)

### Task D — 改 src/core/types.ts 加 props 欄位

把 `TilemapData` 改成:

```ts
export interface TilemapData {
  id: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  baseUrl?: string;
  props?: Array<{
    id: string;
    url: string;
    x: number;       // 左上角 in tile coords
    y: number;
    z?: number;      // y-sort, 預設用 y
    collision?: { x: number; y: number; w: number; h: number };  // tile bbox
  }>;
  // legacy v0.1 baked_raster fields (still required for type compat):
  tilesetUrl: string;
  tilesetCols: number;
  tilesetRows: number;
  layers: { ground: number[][]; objects: number[][] };
  collision: boolean[][];
  triggers: Array<{ id: string; x: number; y: number; eventId: string; autoFire?: boolean }>;
  spawns: { player: { x: number; y: number; facing: Facing } };
}
```

`props` 欄位 optional(向後相容),但 office.json 會填。

### Task E — 改 src/content/maps/office.json schema

替換 `baseUrl` 指向新 base,加 `props` 列表,**重新計算 collision** 從 props bbox + base 牆位置推導:

```json
{
  "id": "office",
  "name": "鉅子娛樂辦公室",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/office-base.png",
  "props": [
    { "id": "desk",      "url": "/props/office/desk.png",      "x": 1,  "y": 2, "collision": { "x": 1, "y": 2, "w": 3, "h": 2 } },
    { "id": "chair",     "url": "/props/office/chair.png",     "x": 2,  "y": 4, "collision": { "x": 2, "y": 4, "w": 1, "h": 1 } },
    { "id": "bookshelf", "url": "/props/office/bookshelf.png", "x": 1,  "y": 7, "collision": { "x": 1, "y": 7, "w": 2, "h": 2 } },
    { "id": "rug",       "url": "/props/office/rug.png",       "x": 5,  "y": 4 },
    { "id": "phone",     "url": "/props/office/phone.png",     "x": 3,  "y": 2 },
    { "id": "paper",     "url": "/props/office/paper.png",     "x": 2,  "y": 3 },
    { "id": "door",      "url": "/props/office/door.png",      "x": 10, "y": 0 }
  ],
  "tilesetUrl": "/tilesets/office-tileset.png",
  "tilesetCols": 4,
  "tilesetRows": 4,
  "layers": { "ground": [...keep existing 10 rows...], "objects": [...keep existing 10 rows...] },
  "collision": [
    [true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true ],
    [true,  false, false, false, false, false, false, false, false, false, false, false, false, true ],
    [true,  true,  true,  true,  false, false, false, false, false, false, false, false, false, true ],
    [true,  true,  true,  true,  false, false, false, false, false, false, false, false, false, true ],
    [true,  false, true,  false, false, false, false, false, false, false, false, false, false, true ],
    [true,  false, false, false, false, false, false, false, false, false, false, false, false, true ],
    [true,  false, false, false, false, false, false, false, false, false, false, false, false, true ],
    [true,  false, true,  true,  false, false, false, false, false, false, false, false, false, true ],
    [true,  false, true,  true,  false, false, false, false, false, false, false, false, false, true ],
    [true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true ]
  ],
  "triggers": [
    { "id": "office.door", "x": 10, "y": 2, "eventId": "sign-suman", "autoFire": true }
  ],
  "spawns": {
    "player": { "x": 7, "y": 5, "facing": "down" }
  }
}
```

重要約束:
- `collision` 仍是完整 14×10 boolean 2D array(向後相容,fallback render 還能用)
- `collision` 內容應該對應 `props[].collision` 的 union + 牆(row 0, row 9, col 0, col 13)
- `triggers[0]` 維持 (10, 2),不要動(已在 022 align 過)
- `spawns.player` 維持 (7, 5)
- 既有 `tilesetUrl / tilesetCols / tilesetRows / layers` 留著(向後相容,即使新 layered render 不用)

### Task F — 改 src/components/Tilemap/TilemapScene.tsx render 邏輯

當前 line 118 已經有 `if (map.baseUrl) <img>...` 走 baked path。要升級成:

- 如果 `map.props && map.props.length > 0` → **layered path**:
  1. render `<img src={map.baseUrl}>` 鋪滿 stage(z=0)
  2. 對每個 prop render 一個 `<img src={prop.url}>`,絕對定位 left=`prop.x*tileSize` top=`prop.y*tileSize`,zIndex=`prop.z ?? prop.y + 1`(y-sort,讓 player z=10 永遠在 prop 之上的 simple 版本可以全部 prop z=1~5)
  3. player + npc 維持
- 否則(只有 baseUrl,無 props)→ baked path(現有邏輯)
- 否則(無 baseUrl)→ tile grid path(現有 fallback)

具體 search/replace 由 Codex 自由發揮(這段 React JSX 改動稍大,允許 reorganize props block,但**保留所有現有 fallback path + scale-to-fit + keyboard handlers**)。

驗證:`pnpm typecheck` 跟 `pnpm build` 必須 pass。

### Task G — 廢 baked map 檔

```bash
rm public/maps/office-tilemap.png
```

`office-tileset.png`(舊 tileset)早在 011/012 已刪。

---

## Acceptance(整體)

1. `public/maps/office-base.png` 存在,448×320 opaque(view_image 確認沒家具)
2. `public/props/office/*.png` 至少 7 個 transparent PNG(desk, chair, bookshelf, door, rug, phone, paper)
3. `src/content/maps/office.json` valid JSON,parse 通過,`props` 列表 ≥ 7 項,每項 url 對應到實存 PNG 檔
4. `src/core/types.ts` `TilemapData.props` optional 欄位加上
5. `src/components/Tilemap/TilemapScene.tsx` 改成偵測 props 走 layered path
6. `pnpm typecheck` pass
7. `pnpm build` pass
8. 廢檔 `public/maps/office-tilemap.png` 不存在

Claude 後續會 chrome 實測:
- 視覺看到家具放在合理位置(桌椅在左上、書櫃在左下、門在上中)
- 走到 door trigger (10, 2) 仍會觸發 sign-suman event
- 角色走到桌子前不會穿過去(collision 對齊 prop bbox)

## Verified output 必填

JOURNAL `Verified output:` 段:

1. Task A 既有圖物件觀察清單
2. Task B office-base.png Pillow size + 「沒家具」view_image 確認
3. Task C prop pack 9 prop 各檔案 size + 透明度確認
4. Task D types.ts diff
5. Task E office.json prop list + collision row-major 完整輸出
6. Task F TilemapScene.tsx 主要 diff(layered render 段落)
7. typecheck + build pass / fail
8. ls public/maps/ public/props/office/ 確認檔案

## 完成後

1. JOURNAL.md append entry
2. codex-prompts/023-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**(Claude chrome 實測再 push)

## 不要做

- 不要改 EventGraph / VnScene / 其他 React component
- 不要重生 portrait / sprite
- 不要動 trigger.x trigger.y(維持 10, 2)
- 不要動 spawn(維持 7, 5)
