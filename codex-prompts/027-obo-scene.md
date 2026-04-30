# Codex Prompt 027 — 歐堡娛樂城場景(layered_raster)

STATUS: pending
SKILL: `$generate2dmap` + `$generate2dsprite` + Pillow
依賴:026 完成(layered render 已 work,scenes.ts 已能加新 entry)
產出:
- `public/maps/obo-base.png`(448×320 RGB, 商場內部主廣場)
- `public/props/obo/{escalator,sign,bench,vending-machine,kiosk,plant,fountain,trash-bin,info-board}.png`(9 個 transparent prop)
- `public/backgrounds/obo.png`(1920×1080 VN 背景)
- `src/content/maps/obo.json`(layered schema)
- 註冊到 TilemapScene + scenes.ts + obo-exit-stub

不動:office / orphanage / portrait / sprite

---

## 為什麼

GDD §5.1「簽約篇」事件 [E001-場景:非初始藝人且未出道時前往歐堡 → 蘇嫚君長褲被手扶梯夾住(獲得 CG)」+ E1xx 約會 + E201 緋聞放料相關場景。

歐堡是個娛樂商場 / 大樓,主要視覺特徵:
- 大型手扶梯(蘇嫚君褲管被夾住的 CG 場景)
- 招牌、商店招牌、櫃台
- 公共長椅、植物、噴水池
- 較現代化、明亮的氣氛(跟辦公室深色木質 / 育幼院暖色形成對比)

---

## Task A — base map (歐堡室內主廣場)

```
Use $generate2dmap baked_raster to create a top-down retro pixel
indoor mall / entertainment complex BASE map — ONLY the floor, walls,
and structural elements. NO furniture, NO benches, NO escalators, NO
plants.

map_kind: town (interior of a multi-story shopping/entertainment complex)
visual_model: baked_raster
art_style: retro_pixel (16-bit SNES JRPG, modern bright palette — light
           tile floor (cream/grey), glass walls visible at top edges,
           cleaner & more commercial than office or orphanage)
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: glass panel with a mall sign / entrance
- left + right walls: structural wall with glass panels
- bottom wall: with a 2-tile-wide doorway/exit at col 6-7 (entrance)
- interior: one large continuous polished tile floor (cream or pale
  blue-grey checkered or plain), no fixtures, no furniture, no
  escalators, no benches. Just clean shiny floor.

CRITICAL: NO escalators in the BASE — they will be added as separate
prop overlays. Floor should be a continuous single material.
```

驗證:size=(320, 448) RGB,view_image 確認沒設施。

## Task B — Prop pack 9 個歐堡設施

```
Use $generate2dsprite to create a 3x3 prop_pack of indoor mall / mall
furniture, in retro_pixel style consistent with the office/orphanage
prop palette but with a modern bright commercial vibe.

bundle: prop_pack_3x3
asset_type: prop
art_style: retro_pixel
view: topdown
margin: tight
shared_scale: true

Cell content (row-major):
  row 1: escalator (3x2 tile, side-view-ish escalator with metal rails
                    and steps going diagonally),
         sign_neon (1x1, vertical hanging neon sign),
         bench (2x1, public mall bench)
  row 2: vending_machine (1x2, tall red/blue vending machine),
         kiosk (2x1, small information kiosk with counter),
         plant_pot (1x1, large potted plant)
  row 3: fountain (2x2, small decorative fountain),
         trash_bin (1x1, modern trash bin),
         info_board (1x1, digital info board on a stand)

Each prop:
- transparent background after chroma-key
- magenta #FF00FF background during raw
- proper tile-footprint scaling

Output: public/props/obo/<prop_id>.png where prop_id is one of:
escalator, sign, bench, vending-machine, kiosk, plant, fountain,
trash-bin, info-board (use simple ids).
```

## Task C — VN background

```
Use $generate2dmap baked_raster to create a VN-mode background of an
indoor entertainment complex (歐堡娛樂城) lobby / atrium.

art_style: clean_hd
size: 1920x1080
perspective: ground-level interior view, slightly elevated camera

Subject: a bright multi-story indoor mall in 2000s Taiwan / Japan,
glass walls, polished tile floor, escalator visible going up to upper
floor, neon signs, shoppers in distance (silhouettes, not detailed),
warm afternoon natural light filtering through skylight.

Composition: lower 1/3 clean (dialogue), mid band uncluttered (portrait).

Output: public/backgrounds/obo.png, 1920x1080 opaque, < 1.5 MB.
```

## Task D — obo.json

```json
{
  "id": "obo",
  "name": "歐堡娛樂城",
  "tileSize": 32,
  "width": 14,
  "height": 10,
  "baseUrl": "/maps/obo-base.png",
  "props": [
    { "id": "escalator", "url": "/props/obo/escalator.png",       "x": 9,  "y": 1, "collision": { "x": 9, "y": 1, "w": 3, "h": 2 } },
    { "id": "fountain",  "url": "/props/obo/fountain.png",        "x": 6,  "y": 4, "collision": { "x": 6, "y": 4, "w": 2, "h": 2 } },
    { "id": "bench1",    "url": "/props/obo/bench.png",           "x": 1,  "y": 4, "collision": { "x": 1, "y": 4, "w": 2, "h": 1 } },
    { "id": "bench2",    "url": "/props/obo/bench.png",           "x": 11, "y": 6, "collision": { "x": 11, "y": 6, "w": 2, "h": 1 } },
    { "id": "kiosk",     "url": "/props/obo/kiosk.png",           "x": 1,  "y": 1, "collision": { "x": 1, "y": 1, "w": 2, "h": 1 } },
    { "id": "vending",   "url": "/props/obo/vending-machine.png", "x": 12, "y": 1, "collision": { "x": 12, "y": 1, "w": 1, "h": 2 } },
    { "id": "plant1",    "url": "/props/obo/plant.png",           "x": 4,  "y": 7 },
    { "id": "plant2",    "url": "/props/obo/plant.png",           "x": 9,  "y": 7 },
    { "id": "trash",     "url": "/props/obo/trash-bin.png",       "x": 12, "y": 7 }
  ],
  "tilesetUrl": "/maps/obo-base.png",
  "tilesetCols": 1,
  "tilesetRows": 1,
  "layers": { "ground": [], "objects": [] },
  "collision": [
    [true, true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true],
    [true, true,  true,  false, false, false, false, false, false, true,  true,  true,  true,  true],
    [true, true,  true,  false, false, false, false, false, false, true,  true,  true,  true,  true],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, true],
    [true, true,  true,  false, false, false, true,  true,  false, false, false, false, false, true],
    [true, true,  true,  false, false, false, true,  true,  false, false, false, false, false, true],
    [true, false, false, false, false, false, false, false, false, false, false, true,  true,  true],
    [true, false, false, false, true,  false, false, false, false, true,  false, false, false, true],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, true],
    [true, true,  true,  true,  true,  true,  false, false, true,  true,  true,  true,  true,  true]
  ],
  "triggers": [
    { "id": "obo.exit", "x": 6, "y": 9, "eventId": "obo-exit-stub", "autoFire": false }
  ],
  "spawns": {
    "player": { "x": 6, "y": 8, "facing": "up" }
  }
}
```

## Task E — register

`TilemapScene.tsx` MAPS:加 `obo: oboMap as TilemapData`(同樣 import obo.json)
`scenes.ts`:加 `obo: { backgroundUrl: '/backgrounds/obo.png' }`
`events/index.ts`:加 `obo-exit-stub: { start: { type: 'end', reason: '(歐堡娛樂城劇情即將開放)' } }`

---

## Acceptance(整體)

1. obo-base.png 448×320 opaque
2. 9 個 obo prop RGBA
3. obo.png 1920×1080 < 1.5 MB
4. obo.json valid
5. 三個 React 檔註冊更新
6. typecheck + build pass

## Verified output

JOURNAL:base size + 9 prop file size + VN bg size + JSON props 摘要 + 三個 React diff + typecheck/build

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit / push。

## 不要做

不要動 office / orphanage 既存檔。不要動 portrait / sprite。不要 push。
