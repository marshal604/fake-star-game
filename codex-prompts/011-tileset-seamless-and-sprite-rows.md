# Codex Prompt 011 — 改用 baked_raster 整張辦公室圖 + 用 view_image 自我校正 sprite row

STATUS: superseded-by-012
SKILL: `$generate2dmap`(visual_model=baked_raster)+ `view_image`
依賴:008、010 完成
產出:
- `public/maps/office-tilemap.png`(448×320 px, retro_pixel, 整張無縫辦公室)
- `src/content/maps/office.json`(加 `baseUrl` 欄位指向新圖)
- `src/components/Tilemap/TilemapScene.tsx`(改 render 邏輯:畫整張 base 圖 + sprite,**不再用 tile grid 切割**)
- `src/core/types.ts`(`TilemapData` 加 `baseUrl?: string`)
- `src/components/Tilemap/{PlayerSprite,NpcSprite}.tsx`(改 FACING_ROW + 底部 offset 修 sprite)

廢掉:
- `public/tilesets/office-tileset.png`(用不到了,從 git 刪)
- `src/content/maps/office.json` 的 `layers.ground` / `layers.objects`(留著但 render 不用)、`tilesetUrl` / `tilesetCols` / `tilesetRows` 也不用

---

## Why this change

User playtesting found the current tileset (built via `$generate2dsprite` `prop_pack_4x4`) renders as 16 isolated wood boxes with dark borders, not a seamless office floor. Root cause: prop pack design implies isolated objects-with-margin, **not seamless tileable terrain**.

`agent-sprite-forge` README 章節「Layered RPG Map / Clean HD Reference Pipeline」記載 `$generate2dmap` 的官方做法是 baked base map(無縫地板)+ overlay props,**不是**把 tile 拼成 4×4 grid。

最小變動方案:走 baked_raster — 整張辦公室一張 retro_pixel 圖 448×320 px,直接 render 那張圖,collision 用 office.json 既有的 boolean grid 控制走路。物件(桌椅書櫃)直接畫進 base image 裡,不另做 prop overlay(留 v0.2 場景變多時再上 layered)。

---

## 任務分段

### Task A — Sprite row 自我診斷與修正

1. `view_image public/sprites/protagonist.png`(看實際圖 row/col 排列)
2. 看 4×4 sheet:
   - row 0 (top) 角色面向哪個方向?
   - row 1, 2, 3 各是哪個方向?
   - 每個 frame 裡角色腳是不是貼 frame 底邊?
3. 對 suman.png 跟 chenyifu.png 重複(務必三張一致)
4. 依判斷:
   - **三張一致 + row 順序跟 React FACING_ROW={up:0,right:1,down:2,left:3} 不同** → 改 PlayerSprite + NpcSprite 的 FACING_ROW 對應實際順序
   - **角色不在 frame 底部** → 加 top offset 補正(觀察腳離 frame 底邊 N px,top 算式減 N)
   - **三張 row 順序不一致** → 寫 BLOCKER 進 JOURNAL stop,留 Claude 決定(可能要重生)

### Task B — 重生 office-tilemap.png(baked_raster 整張)

```
view_image references/office-ref.png

Use $generate2dmap to create a baked_raster top-down retro pixel office map.
This is NOT a tileset/prop pack — it is a SINGLE seamless background image
where the wood floor, walls, desks, chairs, bookshelf, door, phone, and
papers are all already painted in their final positions.

map_kind: town
visual_model: baked_raster (single image, no tiles)
art_style: retro_pixel (16-bit SNES-era JRPG)
visual_asset_source: image_gen
collision_model: none (collision is handled separately via office.json)
runtime_object_model: none
output_format: PNG only
size: 448x320 px (14 cols x 10 rows of 32px tiles, but rendered as a single
      continuous image — no per-tile borders, no grid lines)
perspective: top-down 45 degrees (same as the player sprite top-down view)

Layout (in 0-indexed tile coords, tile=32px square; for art reference only,
there is NO grid in the output):
- (0..13, 0): top wall horizontal strip
- (0, 1..8): left wall vertical strip
- (13, 1..8): right wall vertical strip
- (0..13, 9): bottom wall horizontal strip
- (1..12, 1..8): wood floor — must be visually CONTINUOUS, no per-tile
  borders, looks like one large wooden plank floor
- (11, 1): closed door against the top wall (so user can see "this is the
  exit")
- (12, 1): door frame next to the door
- (2..4, 2..3): a 3x2 wooden desk in the upper-left area
- (3, 4): a small office chair just below the desk
- (2..3, 7..8): a 2x2 bookshelf in the lower-left area
- a phone and a paper somewhere on the desk surface
- a small rug or carpet patch in the center floor area for visual interest

Critical: the floor must read as ONE continuous wooden surface. Walls
have a slight vertical/horizontal seam pattern but no individual cell
borders. Imagine looking down at a real small office, not at a Stardew
Valley tileset preview.

Style anchor: warm wood tones consistent with the existing office VN
background (public/backgrounds/office.png) but in retro_pixel style instead
of clean_hd. Keep the palette warm and readable.

Output: public/maps/office-tilemap.png at exactly 448x320 px, opaque
RGB or RGBA PNG.
```

`$generate2dmap` 處理流程裡,如果生出來尺寸不是 448×320,請用 Pillow 縮放並 verify final size。

### Task C — 串進 React

1. `src/core/types.ts` 的 `TilemapData` 加 `baseUrl?: string` 可選欄位
2. `src/content/maps/office.json` 加 `"baseUrl": "/maps/office-tilemap.png"`(放在 `tilesetUrl` 旁邊或上面;原本的 `layers/tilesetUrl/...` 留著但不用刪,留作 fallback / 紀錄)
3. `src/components/Tilemap/TilemapScene.tsx` 改 render 邏輯:
   - 如果 `map.baseUrl` 存在 → 用一個 `<img src={map.baseUrl} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} />` 鋪滿整個 stage,**不要再 render layers.ground / layers.objects 那兩層 grid**
   - 如果 `map.baseUrl` 不存在 → 走原本的 grid+tileset 渲染(向後相容)
   - sprite 那層維持(player + npcs absolute 定位)
   - scale-to-fit 邏輯維持(prompt 010 加的)
4. 從 git 刪 `public/tilesets/office-tileset.png`(`git rm` 等同的:把檔案從 file system 砍掉,Claude 會在 commit 時 git rm)— 你只要砍檔案

### Task D — 廢檔處理

- `public/tilesets/office-tileset.png` 不再使用,你刪除這個檔案(`rm public/tilesets/office-tileset.png`)讓 Claude commit 時順便 git 移掉

## 完成後依 AGENTS.md

1. JOURNAL.md append 詳細 entry,寫:
   - Task A:你看 sprite 後的判斷(實際 row 順序、anchor 偏移)、改了什麼
   - Task B:用了 generate2dmap 哪些參數、重生幾次、最終 size
   - Task C:office.json schema 改動、TilemapScene 邏輯改動
2. codex-prompts/011-...md 頂端 STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**(Claude 跑 build + chrome 實測後再做)

## 不要做

- 不要動 office.json 的 collision / triggers / spawns / width / height(只加 baseUrl)
- 不要改 tilemap.ts 純函式(isWalkable / findTrigger / neighbour 都不需要動)
- 不要動 GDD / PRD
- 不要動 VnScene / EndScene / ModeFader
- 不要 layered_raster 的 prop pack(我們最小變動,只做 baked_raster)
