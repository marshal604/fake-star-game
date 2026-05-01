# Codex Prompt 032 — 永振片場場景:完整 layered_raster pipeline

STATUS: pending
SKILL: 同 028~031
依賴:031 完成
產出:
- `public/maps/set-base.png`(clean_hd 攝影棚 ground+walls+entry,no props)
- `public/maps/set-dressed-reference.png`
- `public/props/set/{camera-rig,light-stand,director-chair,green-screen,boom-mic}.png`(5 large)
- `public/props/set/{tripod,monitor,clapperboard,reflector,cable,prop-box,coffee-cup,script-pad,light-bulb}.png`(9 small)
- `public/maps/set-layered-preview.png`
- `public/backgrounds/set.png`(VN 1920×1080)
- `src/content/maps/set.json`
- `TilemapScene.tsx` MAPS + `scenes.ts` SCENES + `events/index.ts` set-exit-stub 註冊

不動:office / orphanage / obo / pub / portrait / sprite

---

## 為什麼

GDD §5.5「王瑞恩線」E401-E404(拍王瑞恩電影 / 鼓勵嫚君 / 拍攝期事件)+ §5.3「郝友乾線」E2xx 拍戲探班 + 「精明婆婆俏媳婦」拍攝事件 都在永振片場。

視覺特徵:
- 攝影棚:綠幕 + 大型攝影機 + 燈架 + 監視器
- 導演椅 + 道具箱 + 麥克風 boom
- 線材 / clapperboard / reflector(反光板)散落感
- 工業 / 黑+暗灰背景,跟 office/pub 木質 / obo 商場 形成對比

---

## Pipeline(同 028~031)

### Step 1 — base.png

```
Use $generate2dmap baked_raster to create a CLEAN HD top-down 2D RPG
indoor TV / film studio set BASE map — only ground, walls, and entry.
NO equipment, NO furniture, NO props.

map_kind: town (interior of a small TV/film soundstage 永振片場)
visual_model: baked_raster
art_style: clean_hd
size: 448x320 px
perspective: top-down 45°

Layout:
- top wall: dark studio wall with sound-baffling panels (sound foam)
- left/right walls: same dark sound-baffled walls
- bottom wall: with main entry doorway centered around col 6-7 (darker
  rectangle for door overlay)
- interior: continuous polished concrete or matte studio floor (dark
  grey, professional studio vibe) — NO equipment, NO cameras, NO lights,
  NO props.

CRITICAL: NO equipment/props in BASE. Empty studio floor.

No text, signs, watermarks, characters, UI.

Output: public/maps/set-base.png, 448x320 RGB opaque.
```

Pillow 量 entry door col。

### Step 2 — dressed reference

```
Use the image just shown (set-base.png) as the EXACT base reference.

Create a dressed-reference version of the same studio set by adding props
ONLY. Preserve camera/framing/size (448x320), walls, doorway, walkable
routes.

Add naturally:
- a large camera rig on a dolly (3x2) in the center
- 2-3 tall light stands (each 1x1)
- a director's chair (1x1) facing the camera
- a green screen panel (3x1) along the upper wall
- a boom microphone on a stand (1x2)
- a tripod (1x1)
- a monitor display on a stand (1x1)
- a clapperboard (1x1) on the floor
- a reflector (1x1) leaning
- some coiled cables (1x1)
- a prop box (1x1)
- coffee cups, script pad, spare light bulb scattered

Style: same clean HD, dim professional studio vibe (cool tones).

No characters/NPCs/text/UI/watermark.

Output: public/maps/set-dressed-reference.png, 448x320.
```

view_image 後寫 prop placement matrix 進 JOURNAL。

### Step 3 — large one-by-one(5)

| prop | spec | cell-size |
|---|---|---|
| camera-rig | professional film camera on a dolly with viewfinder and lens, 3x2 | 256 |
| light-stand | tall studio light stand with softbox, 1x1 | 128 |
| director-chair | classic foldable director chair with red canvas back, 1x1 | 128 |
| green-screen | green chroma-key screen panel mounted, 3x1 | 256 |
| boom-mic | boom microphone on adjustable stand, 1x2 | 192 |

每張 one-by-one prompt + chroma-key + extract reject-edge-touch。

### Step 4 — small prop_pack 3x3(9)

```
Create exactly one 3x3 prop sheet for a top-down 2D RPG film studio map.
Each cell, row-major:

  row 1: tripod (camera tripod, 1x1), monitor (small video monitor on
                  stand, 1x1), clapperboard (film clapperboard, 1x1)
  row 2: reflector (round photo reflector, 1x1), cable (coiled black
                    cable, 1x1), prop_box (wooden prop crate, 1x1)
  row 3: coffee_cup (paper coffee cup, 1x1), script_pad (clipboard
                     with script, 1x1), light_bulb (large studio light
                     bulb, 1x1)

Clean HD style, magenta bg, central 50-60% occupancy.
No text/UI/watermark.
```

extract labels: `tripod,monitor,clapperboard,reflector,cable,prop-box,coffee-cup,script-pad,light-bulb`

### Step 5 — alpha residue all 14 props < 50

(同 028~031)

### Step 6 — VN bg set.png

```
Use $generate2dmap baked_raster for a VN-mode background of inside a
小型台灣電視片場(永振片場)— a small TV studio soundstage.

art_style: clean_hd
size: 1920x1080
perspective: ground-level interior, slightly elevated

Subject: small TV studio, exposed lighting rigs above, green screen at
back, camera on dolly mid-ground, director's chair, cables on floor,
soundproofing on walls, professional but slightly cluttered/lived-in
working studio feel.

Composition rules: lower 1/3 clean, mid band uncluttered.

No characters/text/UI/watermark.

Output: public/backgrounds/set.png, 1920x1080 opaque, < 1.5 MB.
```

### Step 7 — set.json + 三檔註冊

`set.json` schema 同 pub.json,trigger.x = step 1 量出 door_col, trigger.y = 9, eventId = `set-exit-stub`。

註冊:
- TilemapScene MAPS: `set: setMap as TilemapData` (注意 `set` 是 JS reserved word context;import 用 `setMap`,key 用 `'set'` quoted)
- scenes.ts SCENES: `set: { backgroundUrl: '/backgrounds/set.png' }`
- events/index.ts: `set-exit-stub: { start: { type: 'end', reason: '(永振片場劇情即將開放)' } }`

### Step 8 — preview + typecheck/build

---

## Acceptance(整體)

1. set-base.png clean_hd no props
2. dressed-reference 含全 props
3. 5 large residue=0
4. 9 small residue=0
5. set.png 1920×1080 < 1.5 MB
6. preview 視覺合理
7. set.json valid
8. trigger walkable + spawn walkable
9. React 三檔註冊
10. typecheck + build pass

## Verified output 必填(同 028~031)

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit/push。

## 不要做

- 不要動 office/orphanage/obo/pub
- 不要動 portrait/sprite
- 不要 retro_pixel / 跳 step
