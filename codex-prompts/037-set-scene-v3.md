# Codex Prompt 037 — set (永振片場) v3:從頭走完整 layered pipeline + 新準則

STATUS: done
依賴:036 完成
產出(全新):
- `public/maps/set-base.png`(覆蓋既有,加新 base 含散落物 / 牆飾)
- `public/maps/set-dressed-reference.png`(覆蓋)
- `public/props/set/{camera-rig,light-stand,director-chair,green-screen,boom-mic}.png`(5 large)
- `public/maps/set-layered-preview.png`
- `public/backgrounds/set.png`(VN bg 1920×1080)
- `src/content/maps/set.json`(layered schema,5 props)
- `TilemapScene.tsx` MAPS + `scenes.ts` SCENES + `events/index.ts` set-exit-stub 註冊

不動:office/orphanage/obo/pub/portrait/sprite

---

## 為什麼

032 set 上次 cx 撞 API limit 只跑到 step 2(base + dressed),props 沒生 + JSON / React 沒寫。本次從頭做,**直接套 v3 新準則**(只 5 high props,小物 / 散落畫進 base)。

---

## Pipeline(套 033-036 模板)

### Step 1 — base.png(覆蓋既有)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
small Taiwanese TV/film studio (永振片場) BASE map. Layered raster.

art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

This base IS NOT EMPTY but EXCLUDES the 5 high props (camera-rig,
light-stand, director-chair, green-screen, boom-mic).

Layout (typical 90s small TV studio):
- top wall: dark studio sound-baffling foam panels with 1 large green
  screen panel painted FLAT into the wall (visual only — actual physical
  green screen prop is separate; this wall just shows the painted
  background area)
- left/right walls: dark sound-baffled walls with cable hangers
- bottom wall: entry doorway centered around col 6-7
- interior floor: polished dark grey concrete or matte studio floor

INCLUDE in base (visual decoration only):
- subtle floor seams or markings (gaffer tape lines marking actor spots)
- a digital monitor mounted on a wall (visual only)
- a mounted clock on a wall
- scattered floor items: a coiled cable, a clapperboard on the floor,
  a clipboard with script, a coffee paper cup, a spare light bulb
- a tripod stand (1x1, walkable, drawn flat)
- a small reflector leaning against a wall
- '永振片場' studio sign on the back/top wall
- a coiled boom mic stand bag on the floor

EXCLUDE (will be props):
- the camera-rig on a dolly (3x2)
- 2-3 standing light stands (1x1 each)
- the director's chair (1x1)
- the standing green screen panel (3x1)
- the boom microphone on stand (1x2)

Composition: typical small studio — camera in center facing top wall
(empty col 5-7 row 4-5), green screen along top (empty col 9-11 row 1),
director chair near camera (empty col 4 row 6), light stands in
corners (empty col 1, col 12 row 2), boom mic side (empty col 11 rows
4-5).

No characters/NPCs/text outside small wall sign.

Output: public/maps/set-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col → `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (set-base.png) as the EXACT base reference.

Add ONLY the 5 missing props:
- a 3x2 professional film camera on a wheeled dolly with INTEGRATED
  viewfinder + lens + monitor on top
- 2 tall studio light stands (each 1x1) at corners, with INTEGRATED
  softbox + cable
- a foldable director's chair (1x1) with INTEGRATED red canvas back
  saying 'DIRECTOR'
- a standing green chroma-key screen panel (3x1) along upper area,
  separate from the wall painting
- a boom microphone on adjustable stand (1x2) with INTEGRATED windscreen

Preserve camera/framing/size/walls/doorway plus all the floor cables +
clapperboard + clipboard + coffee cup + light bulb + tripod + reflector
+ '永振片場' sign + monitor + clock from base.

Style: clean HD same, professional studio vibe.

Output: public/maps/set-dressed-reference.png, 448x320.
```

### Step 3 — 5 large one-by-one

| prop | spec | cell-size |
|---|---|---|
| camera-rig | film camera on a wheeled dolly with INTEGRATED viewfinder + lens + small monitor screen on top, 3x2 | 256 |
| light-stand | tall studio light stand with INTEGRATED softbox + cable bundle, 1x1 | 128 |
| director-chair | foldable director's chair with INTEGRATED red canvas back saying 'DIRECTOR', 1x1 | 128 |
| green-screen | standing green chroma-key screen panel mounted on wheeled frame, 3x1 | 256 |
| boom-mic | boom microphone on adjustable stand with INTEGRATED windscreen, 1x2 | 192 |

Each chroma-key + extract reject-edge-touch。

### Step 4 — alpha residue all 5 < 50

(skip 廢檔 step,因為 set 從沒生 small props)

### Step 5 — VN bg set.png

```
Use $generate2dmap baked_raster for a VN-mode background of inside a
小型台灣電視片場(永振片場).

art_style: clean_hd
size: 1920x1080
perspective: ground-level interior, slightly elevated

Subject: small TV studio interior, exposed lighting rigs above, large
green screen at back, professional film camera on dolly mid-ground,
director's chair, cables on floor, soundproofing panels on walls,
slightly cluttered working studio feel, cool studio lighting.

Composition rules: lower 1/3 clean (dialogue), mid band uncluttered.

No characters/text/UI/watermark.

Output: public/backgrounds/set.png, 1920x1080 opaque, < 1.5 MB.
```

### Step 6 — set.json + 三檔註冊

```json
{
  "id": "set",
  "name": "永振片場",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/set-base.png",
  "props": [
    { "id": "camera-rig",     "url": "/props/set/camera-rig.png",     "x": <>, "y": <>, "collision": {...3x2} },
    { "id": "green-screen",   "url": "/props/set/green-screen.png",   "x": <>, "y": <>, "collision": {...3x1} },
    { "id": "director-chair", "url": "/props/set/director-chair.png", "x": <>, "y": <>, "collision": {...1x1} },
    { "id": "light-stand",    "url": "/props/set/light-stand.png",    "x": <>, "y": <>, "collision": {...1x1} },
    { "id": "boom-mic",       "url": "/props/set/boom-mic.png",       "x": <>, "y": <>, "collision": {...1x2} }
  ],
  "tilesetUrl": "/maps/set-base.png",
  "tilesetCols": 1,
  "tilesetRows": 1,
  "layers": { "ground": [], "objects": [] },
  "collision": [...14×10 from prop union + walls],
  "triggers": [{ "id": "set.exit", "x": <door_col>, "y": 9, "eventId": "set-exit-stub", "autoFire": false }],
  "spawns": { "player": { "x": <door_col>, "y": 8, "facing": "up" } }
}
```

註冊三檔(032 cx 上次已寫過部分,verify 並補):
- TilemapScene.tsx: import setMap + MAPS 加 `set: setMap as TilemapData`
- scenes.ts SCENES: `set: { backgroundUrl: '/backgrounds/set.png' }`
- events/index.ts: 加 `set-exit-stub: { start: { type: 'end', reason: '(永振片場劇情即將開放)' } }`

### Step 7 — preview compose

`compose_layered_preview.py` → `set-layered-preview.png`

### Step 8 — typecheck/build pass

---

## Acceptance(整體)

1. set-base.png 含 floor markings/scattered cables/clapperboard/clipboard/coffee/lightbulb/tripod/reflector/'永振片場'sign/monitor/clock(視覺 only)
2. dressed reference 加 5 props
3. 5 props residue=0
4. set.png VN bg 1920×1080 < 1.5 MB
5. set.json valid + 5 props + collision union
6. preview 視覺合理(typical TV studio)
7. spawn/trigger walkable
8. React 三檔註冊 set
9. typecheck + build pass

## Verified output(同 033-036 模板)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/orphanage/obo/pub/portrait/sprite
- 不要 retro_pixel
- 不要做 small prop_pack(本場景全 one-by-one)
