# Codex Prompt 030 — 歐堡娛樂城場景:完整 layered_raster pipeline

STATUS: done
SKILL: 同 028/029
依賴:028 (office redo done) + 029 (orphanage redo done)
產出:
- `public/maps/obo-base.png`(clean_hd 商場大廳 ground+walls+main entry,no props)
- `public/maps/obo-dressed-reference.png`
- `public/props/obo/{escalator,fountain,kiosk,vending-machine,bench}.png`(5 large one-by-one)
- `public/props/obo/{plant,trash-bin,info-board,sign,arcade-machine,phone-booth,coke-can,shopping-bag,coupon}.png`(9 small prop_pack)
- `public/maps/obo-layered-preview.png`
- `public/backgrounds/obo.png`(VN 背景 1920×1080)
- `src/content/maps/obo.json`(layered schema)
- `TilemapScene.tsx` MAPS + `scenes.ts` SCENES + `events/index.ts` obo-exit-stub 註冊

不動:office / orphanage / portrait / sprite

---

## 為什麼這個場景重要

GDD §5.1「簽約篇」E001(電扶梯被夾褲管 CG)+ E1xx 約會場景 都在歐堡。

視覺特徵:
- 室內商場大廳,polished tile floor
- 大型手扶梯(蘇嫚君褲子被夾的場景)
- 噴水池 / 商店招牌 / 公共長椅 / 信息亭
- 較現代化、明亮、跟 office 暖木質形成對比

---

## Pipeline(完全同 028/029)

### Step 1 — base.png (clean_hd, mall floor + walls + entry only)

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
indoor mall / entertainment complex BASE map — only ground, walls, and
the entry doorway. NO escalators, NO benches, NO fountains, NO props.

map_kind: town (interior of a multi-story shopping/entertainment complex)
visual_model: baked_raster
art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: glass panel + neon mall sign (signage textures only, not
  freestanding signs)
- left + right walls: glass and structural walls
- bottom wall: with main entrance doorway centered around col 6-7 (a
  darker wide rectangle for entry)
- interior: continuous polished tile floor — NO escalators, NO benches,
  NO furniture, NO plants. Just the bare empty atrium floor.

CRITICAL: NO props in BASE. Empty atrium shell.

Output: public/maps/obo-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col(bottom strip darkness scan)→ `door_col`。

### Step 2 — dressed reference

```
Use the image just shown (obo-base.png) as the EXACT base map reference.

Create a dressed-reference version of the same mall by adding props ONLY.
Preserve exactly: camera, framing, image size (448x320), tile floor,
walls, entry doorway, all walkable routes.

Add these props naturally:
- a large 3x2 escalator on the right side going diagonally up
- a 2x2 decorative fountain in the center
- a 2x1 information kiosk near the upper-left corner
- a 1x2 tall vending machine against the left wall
- 2 public benches (each 2x1) flanking the fountain
- some small potted plants at corners
- a trash bin near the entry
- a digital info board on a stand
- a 1x2 hanging neon sign
- a 2x1 small arcade machine
- a 1x2 phone booth
- some misc items (coke can, shopping bag, coupon)

Style: same clean HD style as base, modern bright commercial vibe.

No characters/NPCs/text/UI/watermark.

Output: public/maps/obo-dressed-reference.png, 448x320.
```

view_image 後寫每個 prop (col, row) 進 JOURNAL。

### Step 3 — large one-by-one(5 個)

| prop_id | spec | cell-size |
|---|---|---|
| escalator | metal escalator with steps and rails, vertical orientation, 3 tiles wide × 2 tall | 256 |
| fountain | decorative round/square stone fountain with water spray, 2x2 | 256 |
| kiosk | small modern info kiosk with counter, 2x1 | 192 |
| vending-machine | tall red+blue vending machine, 1x2 | 192 |
| bench | modern public mall bench, 2x1 | 192 |

每張用 one-by-one prompt + chroma-key + extract。

### Step 4 — small prop_pack 3x3(9 個)

```
Create exactly one 3x3 prop sheet for a top-down 2D RPG indoor mall map.
Each cell contains one separate static environmental prop, in row-major order:

  row 1: plant (potted plant, 1x1), trash_bin (modern bin, 1x1),
         info_board (digital info board on stand, 1x1)
  row 2: sign (vertical hanging neon sign, 1x1),
         arcade_machine (small arcade cabinet, 1x1),
         phone_booth (a phone booth, 1x1)
  row 3: coke_can (a soda can, 1x1), shopping_bag (paper shopping bag,
                  1x1), coupon (a small flyer, 1x1)

All clean HD style, magenta bg, central 50-60% occupancy with margins.
No text/UI/watermark.
```

跑 chroma-key + extract (--rows 3 --cols 3 --labels plant,trash-bin,info-board,sign,arcade-machine,phone-booth,coke-can,shopping-bag,coupon)。

### Step 5 — verify alpha residue 全 14 props

(同 028/029,assert residue < 50 each)

### Step 6 — VN background obo.png

```
Use $generate2dmap baked_raster to create a VN-mode background of the
inside of a 歐堡娛樂城 mall lobby.

art_style: clean_hd
size: 1920x1080
perspective: ground-level interior, slightly elevated

Subject: bright multi-story Taiwanese indoor mall, glass walls, polished
tile floor, escalator visible going up, neon signs, distant shopper
silhouettes, warm afternoon natural light from skylight.

Composition:
- Lower 1/3 clean (dialogue overlays)
- Mid band uncluttered (portrait overlays)

Output: public/backgrounds/obo.png, 1920x1080 opaque, < 1.5 MB.
```

### Step 7 — obo.json + 註冊

`obo.json` schema 同 office.json,props 用 dressed reference 量出位置,collision union from prop bbox + walls,trigger.x = `door_col`, trigger.y = 9, eventId = `obo-exit-stub`,spawn 在 `(door_col, 8)`。

註冊:
- `TilemapScene.tsx` MAPS dict 加 `obo: oboMap as TilemapData`(import `~/content/maps/obo.json`)
- `scenes.ts` SCENES 加 `obo: { backgroundUrl: '/backgrounds/obo.png' }`
- `events/index.ts` 加 `obo-exit-stub: { start: { type: 'end', reason: '(歐堡娛樂城劇情即將開放)' } }`

### Step 8 — compose preview + typecheck/build

```bash
python ~/.codex/skills/generate2dmap/scripts/compose_layered_preview.py \
  --base public/maps/obo-base.png \
  --placements <temp> \
  --output public/maps/obo-layered-preview.png

pnpm typecheck && pnpm build
```

---

## Acceptance(整體)

1. obo-base.png clean_hd, no props
2. dressed-reference.png 含全部規劃 props
3. 5 large props one-by-one,residue=0 each
4. 9 small props prop_pack,residue=0 each
5. obo.png VN 背景 1920×1080 < 1.5 MB
6. obo-layered-preview.png 視覺合理
7. obo.json valid,prop placement 對齊 dressed reference
8. trigger.x=door_col,collision walkable for spawn+trigger
9. React 三個檔(TilemapScene/scenes.ts/events/index.ts)註冊 obo
10. typecheck + build pass

## Verified output 必填

逐 step 在 JOURNAL 記:base size+door_col / dressed prop matrix / 14 props residue / preview 描述 / json 摘要 / spawn+trigger walkable 確認 / 三個 React diff / typecheck+build。

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office / orphanage 任何檔
- 不要動 portrait / sprite
- 不要 retro_pixel / 跳 step
- 不要 push
