# Codex Prompt 031 — 19 號酒館場景:完整 layered_raster pipeline

STATUS: done
SKILL: 同 028~030
依賴:030 完成
產出:
- `public/maps/pub-base.png`(clean_hd 酒館內部 ground+walls+entry,no props)
- `public/maps/pub-dressed-reference.png`
- `public/props/pub/{bar-counter,pool-table,jukebox,booth-seat,piano}.png`(5 large)
- `public/props/pub/{barstool,bottle,glass,ashtray,dartboard,neon-sign,whiskey-barrel,coaster,napkin}.png`(9 small)
- `public/maps/pub-layered-preview.png`
- `public/backgrounds/pub.png`(VN 1920×1080)
- `src/content/maps/pub.json`
- `TilemapScene.tsx` MAPS + `scenes.ts` SCENES + `events/index.ts` pub-exit-stub 註冊

不動:office / orphanage / obo / portrait / sprite

---

## 為什麼

GDD §5.3「郝友乾線」E204(高爾夫照片給記者放料)+ E2xx 找記者 + 育幼院線 E1xx 賣院新聞 都在 19 號酒館。

視覺特徵:
- 昏暗酒館氣氛、木質 + 暗紅色調
- 吧檯 + 酒瓶架 + 高腳椅
- 撞球桌 / 點唱機 / 飛鏢盤(社交設備)
- 跟 office 的明亮辦公 + obo 的商場明亮 形成 dim 對比

---

## Pipeline(同 028~030)

### Step 1 — base.png

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
small dim pub interior BASE map — only ground, walls, and entry. NO bar,
NO furniture, NO props.

map_kind: town (interior of a small dimly-lit pub / izakaya, late-1990s
           Taiwanese-Japanese 19號酒館 vibe)
visual_model: baked_raster
art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: dark wood paneling with 1 small high window
- left/right walls: dark wood walls
- bottom wall: with main entry doorway centered around col 6-7 (darker
  rectangle for door overlay)
- interior: continuous dark wood plank floor (worn, atmospheric) — NO
  bar counter, NO tables, NO chairs, NO props.

CRITICAL: NO furniture/props in BASE. Empty pub shell.

No text, signs, watermarks, characters, UI.

Output: public/maps/pub-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col(bottom strip)。

### Step 2 — dressed reference

```
Use the image just shown (pub-base.png) as the EXACT base reference.

Create a dressed-reference version of the same pub by adding props ONLY.
Preserve camera, framing, image size (448x320), walls, doorway, walkable
routes.

Add these props naturally:
- a long bar counter (3x1) along the upper wall
- a pool table (2x2) in the center
- a jukebox (1x2) against a wall
- a booth seat (2x1) in a corner
- a small piano (2x1) along a wall
- a few barstools at the bar (1x1 each, 3 of them)
- glass bottles + glasses on the bar
- an ashtray on a table
- a dartboard on a wall
- a neon sign hanging
- a whiskey barrel (1x1) as a side table
- coasters / napkin scattered

Style: same clean HD style as base, dim atmospheric pub vibe.

No characters, NPCs, text, UI, watermark.

Output: public/maps/pub-dressed-reference.png, 448x320.
```

view_image 後寫每個 prop (col, row) 進 JOURNAL。

### Step 3 — large one-by-one(5)

| prop | spec | cell-size |
|---|---|---|
| bar-counter | long polished wooden bar with bottle racks behind, 3x1 | 256 |
| pool-table | green felt pool table with billiard balls, 2x2 | 256 |
| jukebox | classic neon-lit jukebox standing upright, 1x2 | 192 |
| booth-seat | red leather booth seat, 2x1 | 192 |
| piano | small wooden upright piano, 2x1 | 192 |

每張 one-by-one prompt + chroma-key + extract reject-edge-touch。

### Step 4 — small prop_pack 3x3(9)

```
Create exactly one 3x3 prop sheet for a top-down 2D RPG dim pub map.
Each cell, row-major:

  row 1: barstool (1x1), bottle (a tall liquor bottle, 1x1),
         glass (a beer glass with foam, 1x1)
  row 2: ashtray (with cigarette stub, 1x1), dartboard (1x1),
         neon_sign (small hanging neon sign, 1x1)
  row 3: whiskey_barrel (round wooden barrel, 1x1),
         coaster (round coaster, 1x1), napkin (folded napkin, 1x1)

Clean HD style, magenta bg, central 50-60% occupancy.
No text/UI/watermark.
```

extract labels: `barstool,bottle,glass,ashtray,dartboard,neon-sign,whiskey-barrel,coaster,napkin`

### Step 5 — alpha residue 全 14 props < 50

(同 028~030 standard)

### Step 6 — VN bg pub.png

```
Use $generate2dmap baked_raster for a VN-mode background of inside a
late-1990s 台北/東京 vibe small pub (19 號酒館).

art_style: clean_hd
size: 1920x1080
perspective: ground-level interior, slightly elevated

Subject: dim warm pub atmosphere, polished wooden bar counter with rows
of liquor bottles backlit, hanging amber pendant lamps, exposed brick
walls, leather booth seats in distance, soft jazz / smoke ambient feel.
Late afternoon / evening light.

Composition rules: lower 1/3 clean (dialogue), mid band uncluttered (portrait).

No characters/text/UI/watermark.

Output: public/backgrounds/pub.png, 1920x1080 opaque, < 1.5 MB.
```

### Step 7 — pub.json + 三檔註冊

`pub.json` schema 同 obo.json,trigger.x = step 1 量出 door_col, trigger.y = 9, eventId = `pub-exit-stub`,spawn `(door_col, 8)` facing up。

註冊:
- TilemapScene.tsx: import pubMap + MAPS 加 `pub: pubMap as TilemapData`
- scenes.ts: SCENES 加 `pub: { backgroundUrl: '/backgrounds/pub.png' }`
- events/index.ts: 加 `pub-exit-stub: { start: { type: 'end', reason: '(19號酒館劇情即將開放)' } }`

### Step 8 — preview + typecheck/build

`compose_layered_preview.py` + `pnpm typecheck && pnpm build`

---

## Acceptance(整體)

1. pub-base.png clean_hd no props
2. dressed-reference.png 含全部 props
3. 5 large props residue=0
4. 9 small props residue=0
5. pub.png 1920×1080 < 1.5 MB
6. preview 視覺合理
7. pub.json valid + 對齊 dressed
8. trigger walkable + spawn walkable
9. typecheck + build pass

## Verified output(JOURNAL)

逐 step 量化(同 028~030)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/orphanage/obo
- 不要動 portrait/sprite
- 不要 retro_pixel / 跳 step
