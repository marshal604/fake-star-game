# Codex Prompt 026 — 育幼院場景(layered_raster pipeline)

STATUS: done
SKILL: `$generate2dmap` + `$generate2dsprite` + Pillow
依賴:023 完成(layered render path 已支援)
產出:
- `public/maps/orphanage-base.png`(448×320 RGB,只有地板+牆+窗戶+門洞,無家具)
- `public/props/orphanage/{bed,toy,blackboard,table,small-chair,bookshelf,christmas-tree,plant,door}.png`(9 個 transparent prop PNG)
- `public/backgrounds/orphanage.png`(1920×1080 VN 背景,opaque)
- `src/content/maps/orphanage.json`(layered schema,collision + triggers)
- `src/components/Tilemap/TilemapScene.tsx` 的 MAPS dict 註冊 orphanage
- `src/content/scenes.ts` 加 orphanage scene 定義(VN 背景路徑)

不動:office 任何檔(office 已 layered 完成)

---

## Why

GDD §5.2 育幼院線(E101~E111)要用此場景:
- 蘇嫚君請假回育幼院 → 玩家可以選擇陪去 → 進育幼院 tilemap
- 大掃除事件、聖誕聚會、情人節 都在這裡
- 育幼院線結局如果蘇嫚君回育幼院,這也是最終場景

GDD §6.1 已 mandated 後續所有場景走 layered_raster pipeline,本場景是 pipeline 第一次驗證。

---

## Task A — 場景 base map(沒家具,只地板+牆+窗+門)

```
Use $generate2dmap baked_raster to create a top-down retro pixel orphanage
BASE map — ONLY floor, walls, windows, and a doorway. NO furniture, NO
beds, NO toys.

map_kind: town (interior of a small orphanage room)
visual_model: baked_raster
art_style: retro_pixel (16-bit SNES JRPG, soft warm pastel palette —
           lighter / cheerier than the office's dark wood; this is a
           kids' space)
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall (y=0..32, all 14 cols): horizontal pastel-colored wall (light
  yellow / cream) with 2 small square windows visible (wooden frame)
- left wall (x=0..32, y=32..288): vertical wall, similar style
- right wall (x=416..448, y=32..288): vertical wall
- bottom wall (y=288..320, all 14 cols): horizontal wall, with a doorway
  cut at col 6-7 (the kids' room exit, doorway shown as darker opening)
- interior (x=32..416, y=32..288): CONTINUOUS warm wooden plank floor —
  no rugs, no toys scattered, no beds, no furniture, no shadows. Bare
  floor.

CRITICAL: NO furniture, NO toys, NO beds in this image. Just the room
shell. Furniture will be added as separate prop overlays later.
```

驗證:size=(320, 448) RGB,view_image 確認沒家具。

## Task B — Prop pack 9 個育幼院家具

```
Use $generate2dsprite to create a 3x3 prop_pack of orphanage furniture, in
the same retro_pixel style as the existing office props (so the two
scenes feel consistent).

bundle: prop_pack_3x3
asset_type: prop
art_style: retro_pixel
view: topdown
margin: tight
shared_scale: true

Cell content (row-major, fill in this order):
  row 1: bed_kids (2x2, small wooden bed with blue blanket and pillow),
         toy_box (1x1, wooden toy chest with toys spilling out),
         blackboard (2x1, wooden blackboard on a stand with chalk
                     letters, kids height)
  row 2: small_table (2x1, low wooden kids' table),
         small_chair (1x1, small kids' chair),
         bookshelf_kids (2x2, short bookshelf with colorful books)
  row 3: christmas_tree (2x2, decorated christmas tree with
                         red and gold ornaments and a star on top),
         plant_pot (1x1, potted plant similar style to office plant),
         door_open (1x1, an open wooden door showing the inside through
                    the frame)

Each prop:
- transparent background after chroma-key (skill handles)
- magenta #FF00FF background during raw generation
- size scaled to its tile footprint (single = 32x32, multi-tile larger)

Output: each prop saved as separate transparent PNG to
  public/props/orphanage/<prop_id>.png
where prop_id is one of: bed, toy, blackboard, table, small-chair,
bookshelf, christmas-tree, plant, door (use the simple id).
```

驗證:每個 prop mode='RGBA',透明邊乾淨。

## Task C — VN background(對話模式用,clean_hd 風格)

```
Use $generate2dmap baked_raster to create a VN-mode visual novel background
of an orphanage interior, similar in feel to public/backgrounds/office.png
but for a small Taiwanese orphanage.

visual_model: baked_raster
art_style: clean_hd (NOT retro_pixel — this is for VN dialogue mode like
           the existing office.png background)
size: 1920x1080 px
perspective: room interior, slightly elevated angle

Subject: a small modest Taiwanese orphanage common room. Kids' beds along
walls, low wooden tables, blackboard with chalk drawings, toys on the floor,
warm afternoon sunlight from windows. Cheerful pastel palette but a hint of
old / lived-in atmosphere (peeling paint, simple wooden furniture).

Composition rules (must accommodate the dialogue UI):
- Lower 1/3 visually clean (dialogue box overlays here)
- Mid horizontal band (30..70%) not over-cluttered (character portrait
  overlays here)
- No characters in the scene (NPCs are added via portraits separately)

Output: public/backgrounds/orphanage.png, 1920x1080 opaque PNG, < 1.5 MB.
```

驗證:size=(1080, 1920) opaque, < 1.5 MB。

## Task D — orphanage.json(layered schema)

寫到 `src/content/maps/orphanage.json`:

```json
{
  "id": "orphanage",
  "name": "育幼院",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/orphanage-base.png",
  "props": [
    { "id": "bed1",      "url": "/props/orphanage/bed.png",          "x": 1,  "y": 1, "collision": { "x": 1, "y": 1, "w": 2, "h": 2 } },
    { "id": "bed2",      "url": "/props/orphanage/bed.png",          "x": 4,  "y": 1, "collision": { "x": 4, "y": 1, "w": 2, "h": 2 } },
    { "id": "table",     "url": "/props/orphanage/table.png",        "x": 7,  "y": 4, "collision": { "x": 7, "y": 4, "w": 2, "h": 1 } },
    { "id": "chair1",    "url": "/props/orphanage/small-chair.png",  "x": 7,  "y": 5, "collision": { "x": 7, "y": 5, "w": 1, "h": 1 } },
    { "id": "chair2",    "url": "/props/orphanage/small-chair.png",  "x": 9,  "y": 5, "collision": { "x": 9, "y": 5, "w": 1, "h": 1 } },
    { "id": "blackboard","url": "/props/orphanage/blackboard.png",   "x": 10, "y": 1, "collision": { "x": 10, "y": 1, "w": 2, "h": 1 } },
    { "id": "bookshelf", "url": "/props/orphanage/bookshelf.png",    "x": 1,  "y": 7, "collision": { "x": 1, "y": 7, "w": 2, "h": 2 } },
    { "id": "toy",       "url": "/props/orphanage/toy.png",          "x": 11, "y": 6 },
    { "id": "plant",     "url": "/props/orphanage/plant.png",        "x": 12, "y": 7 }
  ],
  "tilesetUrl": "/maps/orphanage-base.png",
  "tilesetCols": 1,
  "tilesetRows": 1,
  "layers": { "ground": [], "objects": [] },
  "collision": [
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [true, true, true, false, true, true, false, false, false, false, true, true, false, true],
    [true, true, true, false, true, true, false, false, false, false, false, false, false, true],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, true],
    [true, false, false, false, false, false, false, true, true, false, false, false, false, true],
    [true, false, false, false, false, false, false, true, false, true, false, false, false, true],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, true],
    [true, true, true, false, false, false, false, false, false, false, false, false, false, true],
    [true, true, true, false, false, false, false, false, false, false, false, false, false, true],
    [true, true, true, true, true, true, false, false, true, true, true, true, true, true]
  ],
  "triggers": [
    { "id": "orphanage.exit", "x": 6, "y": 9, "eventId": "orphanage-exit-stub", "autoFire": false }
  ],
  "spawns": {
    "player": { "x": 6, "y": 8, "facing": "up" }
  }
}
```

注意:
- collision 對齊 props bbox + 牆。row 9 col 6/7 為 false(門洞 walkable)
- trigger autoFire=false(玩家走到門前需要主動互動,不像 office 自動觸發)— 因為育幼院不是 v0.1 demo 範圍,trigger 暫接到 stub event(暫時 alert 訊息或 console)
- spawn 在門前 row 8 col 6,玩家進場朝上(剛進門)

eventId `orphanage-exit-stub` 是佔位,Phase 4 寫實際 EventGraph 時 replace。

## Task E — TilemapScene + scenes.ts 註冊

`src/components/Tilemap/TilemapScene.tsx` line ~10 的 MAPS dict 加:

**Search this exact text:**

```ts
import officeMap from '~/content/maps/office.json';
```

**Replace with:**

```ts
import officeMap from '~/content/maps/office.json';
import orphanageMap from '~/content/maps/orphanage.json';
```

**Search this exact text:**

```ts
const MAPS: Record<string, TilemapData> = {
  office: officeMap as TilemapData,
};
```

**Replace with:**

```ts
const MAPS: Record<string, TilemapData> = {
  office: officeMap as TilemapData,
  orphanage: orphanageMap as TilemapData,
};
```

`src/content/scenes.ts` 加:

**Search this exact text:**

(讀檔看真實內容後找 SCENES 物件)

**Replace with:** 加 `orphanage: { backgroundUrl: '/backgrounds/orphanage.png' }` 到 SCENES dict。

(若 search/replace 找不到 exact text 結構,允許 codex 直接 edit 加一個 entry,但不能改其他既有 entry。)

## Task F — Stub event for trigger

`src/content/events/index.ts` 加一個 `orphanage-exit-stub` 接到 simple end:

```ts
import type { EventGraph } from '~/core/types';

const orphanageExitStub: EventGraph = {
  start: { type: 'end', reason: '(育幼院線即將開放,敬請期待 v0.3)' },
};

// add to EVENTS dict:
'orphanage-exit-stub': orphanageExitStub,
```

不要動 sign-suman 那條。

---

## Acceptance(整體)

1. `public/maps/orphanage-base.png` 448×320 opaque(view_image 確認沒家具)
2. `public/props/orphanage/*.png` 9 張 RGBA
3. `public/backgrounds/orphanage.png` 1920×1080 opaque < 1.5 MB
4. `src/content/maps/orphanage.json` valid JSON
5. `src/content/scenes.ts` 加 orphanage entry
6. `TilemapScene.tsx` MAPS 加 orphanage
7. `events/index.ts` 加 orphanage-exit-stub
8. `pnpm typecheck` + `pnpm build` pass

(本 prompt 不打通「office → orphanage」場景切換 — Phase 4 EventGraph 寫到時 spawnNpc/exitToMap 會用。orphanage tilemap 是「準備好等用」狀態。)

## Verified output 必填

JOURNAL `Verified output:` 段:

1. orphanage-base.png Pillow size + view_image 描述(沒家具)
2. 9 個 prop file size + 透明度檢查
3. orphanage.png VN 背景 size + 視覺描述
4. orphanage.json valid 確認 + props/collision/triggers 摘要
5. TilemapScene.tsx + scenes.ts + events/index.ts 三個 diff
6. typecheck / build pass

## 完成後

1. JOURNAL.md append entry
2. codex-prompts/026-...md STATUS: → ready-for-commit / blocked
3. 不要 git commit / push

## 不要做

- 不要動 office 任何檔(已 layered 完成)
- 不要動 portrait / sprite
- 不要動 sign-suman EventGraph
- 不要在 React 加 orphanage 場景切換邏輯(Phase 4 才寫)
