# Codex Prompt 035 — obo (歐堡娛樂城) redo v3:套新 prop/base 準則

STATUS: done
SKILL: $generate2dmap + $generate2dsprite + Pillow + view_image
依賴:034 完成
產出(覆蓋既有):
- `public/maps/obo-base.png`(含招牌 / 地板 pattern / 散落小物 / 牆飾)
- `public/maps/obo-dressed-reference.png`
- `public/props/obo/{escalator,fountain,kiosk,vending-machine,bench}.png`(只 5 large props)
- `public/maps/obo-layered-preview.png`
- `src/content/maps/obo.json`(props 列表 5-6 項)

刪除 obo 多餘 small props:`{plant,trash-bin,info-board,sign,arcade-machine,phone-booth,coke-can,shopping-bag,coupon}.png`

---

## Pipeline(套 033/034 模板)

### Step 1 — base.png

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
indoor mall (歐堡娛樂城) BASE map. Layered raster pipeline.

art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

This base IS NOT EMPTY — include all decorative content but EXCLUDE
the 5 high props (escalator, fountain, kiosk, vending-machine, bench).

Layout (typical Taiwanese 90s-2000s mall lobby):
- top wall: glass storefront with neon "歐堡娛樂城" sign
- left/right walls: glass + structural panels with hanging neon signs
  built into the wall textures (not freestanding sign props)
- bottom wall: main entry doorway centered around col 6-7
- interior floor: polished cream/beige tile checker pattern (ornate but
  walkable)

INCLUDE in base (visual decoration only):
- decorative tile floor pattern (subtle squares or diagonal accents)
- 2-3 small potted plants in corners (visual only, walkable)
- a trash bin near the entry (visual only)
- a digital info board mounted on a wall
- a hanging neon sign or 2 attached to ceiling/wall textures
- scattered items: coke can, shopping bag, paper coupon (drawn flat
  on the floor)

EXCLUDE (will be props):
- the large escalator (will be a prop)
- the central fountain (will be a prop)
- the info kiosk (will be a prop)
- the vending machine (will be a prop)
- the public bench (will be a prop)

Composition: typical mall atrium — escalator on right side, fountain
center, kiosk near upper-left, vending machine along left wall, bench
near bottom-right facing fountain.

No characters/NPCs/text outside the wall sign/UI/watermark.

Output: public/maps/obo-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col → `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (obo-base.png) as the EXACT base reference.

Create a dressed-reference version by adding ONLY the 5 missing props:
- a 3x2 escalator on the right side going diagonally up
- a 2x2 decorative fountain in the center
- a 2x1 information kiosk near the upper-left corner with INTEGRATED
  brochure rack and laptop on counter
- a 1x2 tall vending machine against the left wall with INTEGRATED
  drink display and coin slot
- a 2x1 modern public bench near the bottom-right area

Preserve exactly: camera, framing, image size (448x320), tile floor,
walls, doorway position, sign + plants + neon signs + scattered floor
items + info board from the base.

Style: clean HD same as base.

Output: public/maps/obo-dressed-reference.png, 448x320.
```

### Step 3 — 5 large one-by-one

| prop | spec | cell-size |
|---|---|---|
| escalator | metal escalator with rails and steps going diagonally, vertical orientation, 3x2 | 256 |
| fountain | decorative round/square stone fountain with water spray, 2x2 | 256 |
| kiosk | small modern info kiosk with INTEGRATED counter + laptop + brochures, 2x1 | 192 |
| vending-machine | tall red+blue vending machine with INTEGRATED drink display + coin slot, 1x2 | 192 |
| bench | modern public mall bench with armrests, 2x1 | 192 |

每張 chroma-key + extract reject-edge-touch。

### Step 4 — 廢檔

```bash
rm public/props/obo/plant.png
rm public/props/obo/trash-bin.png
rm public/props/obo/info-board.png
rm public/props/obo/sign.png
rm public/props/obo/arcade-machine.png
rm public/props/obo/phone-booth.png
rm public/props/obo/coke-can.png
rm public/props/obo/shopping-bag.png
rm public/props/obo/coupon.png
```

### Step 5 — alpha residue 5 props < 50

### Step 6 — obo.json props 列表簡化

```json
{
  ...
  "baseUrl": "/maps/obo-base.png",
  "props": [
    { "id": "escalator",       ... "x": <>, "y": <>, "collision": {...3x2} },
    { "id": "fountain",        ... "collision": {...2x2} },
    { "id": "kiosk",           ... "collision": {...2x1} },
    { "id": "vending-machine", ... "collision": {...1x2} },
    { "id": "bench",           ... "collision": {...2x1} }
  ],
  ...
  "triggers": [
    { "id": "obo.exit", "x": <door_col>, "y": 9, "eventId": "obo-exit-stub", "autoFire": false }
  ],
  "spawns": { "player": { "x": <door_col>, "y": 8, "facing": "up" } }
}
```

### Step 7 — preview

### Step 8 — typecheck/build pass

---

## Acceptance

1. base.png 含 sign/floor pattern/plants/trash/info-board/scattered items
2. dressed-ref 加 5 props
3. 5 props residue=0
4. 9 個舊 small prop 已刪
5. obo.json props ≤ 5 項
6. preview 視覺合理(典型 mall atrium)
7. spawn/trigger walkable
8. typecheck + build pass

## Verified output(同 033/034 standard)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/orphanage/pub/set
- 不要動 portrait/sprite
