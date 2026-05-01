# Codex Prompt 036 — pub (19 號酒館) redo v3:套新 prop/base 準則

STATUS: done
依賴:035 完成
產出:
- `public/maps/pub-base.png`(含吧檯瓶架/牆飾/地板/散落物)
- `public/maps/pub-dressed-reference.png`
- `public/props/pub/{bar-counter,pool-table,jukebox,booth-seat,piano}.png`(只 5 large)
- `public/maps/pub-layered-preview.png`
- `src/content/maps/pub.json`

刪除 9 small:`{barstool,bottle,glass,ashtray,dartboard,neon-sign,whiskey-barrel,coaster,napkin}.png`

不動:office/orphanage/obo/set/portrait/sprite

---

## Pipeline(套 033/034/035 模板)

### Step 1 — base.png

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
small dim Taiwanese pub (19號酒館) BASE map. Layered raster pipeline.

art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

This base IS NOT EMPTY — include all decoration but EXCLUDE the 5 high
props (bar-counter, pool-table, jukebox, booth-seat, piano).

Layout (typical 90s Taiwanese late-night pub):
- top wall: dark wood paneling with a small high window
- left/right walls: dark wood with wall hangings
- bottom wall: entry doorway centered around col 6-7
- interior floor: dark wood plank, atmospheric

INCLUDE in base:
- subtle wood plank seams
- a dartboard mounted on a wall (visual only)
- a hanging neon sign reading 'OPEN' or '酒' (mounted on wall texture)
- 2-3 framed wall photos / pin-up posters
- scattered floor items (a coaster, folded napkin, glass on floor near
  bar — drawn flat into the base)
- a small ashtray with cigarette stub on the floor
- a wooden whiskey barrel side-table (1x1 walkable, drawn flat)
- subtle smoke ambient feel (warm lighting)
- '19號酒館' carved sign above entry

EXCLUDE (props):
- long bar counter
- central pool table
- jukebox
- booth seat
- piano

Composition: typical pub — bar along top wall (empty around col 1-9
row 1-2), pool table center (empty col 5-7 rows 4-5), jukebox right
wall (empty col 12 rows 5-6), booth seat bottom-left (empty col 1-2
rows 7-8), piano right (empty col 11-12 rows 7-8).

No characters, NPCs, text outside the small wall sign.

Output: public/maps/pub-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col → `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (pub-base.png) as the EXACT base reference.

Add ONLY the 5 missing props:
- a long polished bar counter (3x1) along top wall, with INTEGRATED bottle
  rack behind, beer taps on counter, and 2-3 glasses on top
- a green felt pool table (2x2) in the center with INTEGRATED billiard
  balls and 2 cues
- a classic neon-lit jukebox (1x2) against the right wall
- a red leather booth seat (2x1) in bottom-left corner with INTEGRATED
  cushions
- a small wooden upright piano (2x1) along the right wall

Preserve camera/framing/size/walls/doorway, plus all the dartboard +
neon + photos + floor items + whiskey barrel from base.

Style: clean HD same as base, dim atmospheric pub.

Output: public/maps/pub-dressed-reference.png, 448x320.
```

### Step 3 — 5 large one-by-one

| prop | spec | cell-size |
|---|---|---|
| bar-counter | long polished bar with INTEGRATED bottle rack, beer taps, 2-3 glasses on top, 3x1 | 256 |
| pool-table | green felt pool table with INTEGRATED billiard balls + 2 cues, 2x2 | 256 |
| jukebox | classic neon-lit jukebox standing upright, 1x2 | 192 |
| booth-seat | red leather booth seat with INTEGRATED cushions, 2x1 | 192 |
| piano | small wooden upright piano, 2x1 | 192 |

各 chroma-key + extract reject-edge-touch。

### Step 4 — 廢檔

```bash
rm public/props/pub/{barstool,bottle,glass,ashtray,dartboard,neon-sign,whiskey-barrel,coaster,napkin}.png
```

### Step 5 — residue 5 props < 50

### Step 6 — pub.json props 5 項

trigger.x = `door_col`, trigger.y = 9, eventId = `pub-exit-stub`,spawn `(door_col, 8)` facing up。

### Step 7 — preview

### Step 8 — typecheck/build pass

---

## Acceptance(同 033/034/035)

5 props one-by-one,base 含散落物 + 牆飾 + 招牌 + 地板紋。spawn/trigger walkable。typecheck/build pass。

## Verified output(同前模板)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/orphanage/obo/set/portrait/sprite
