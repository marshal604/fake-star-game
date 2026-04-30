# Codex Prompt 012 — Pillow swap row 1/3 + 接續 011 Task B/C/D

STATUS: done
SKILL: `view_image` + Pillow + `$generate2dmap`
依賴:011 已 blocked(Task A 診斷完,B/C/D 未做)
產出:
- `public/sprites/{protagonist,suman,chenyifu}.png` 三張 row 順序統一(row 0=up, 1=right, 2=down, 3=left)
- `public/maps/office-tilemap.png`(從 011 Task B 接著做)
- `src/content/maps/office.json` 加 `baseUrl`
- `src/core/types.ts`、`src/components/Tilemap/TilemapScene.tsx` 改動
- `public/tilesets/office-tileset.png` 刪除

---

## Background

Prompt 011 Task A 你判斷:
- 三張都 128×192,frame 32×48
- Row 0 = up,Row 2 = down(一致)
- Row 1/3 不一致:chenyifu row 1=left row 3=right,suman row 1=right row 3=left

(`protagonist` 你沒明確判斷,需要先確認)

## Task A1 — 確認 protagonist 的 row 1/3 是什麼方向

`view_image public/sprites/protagonist.png` → 判斷 row 1 是 left 還是 right。

## Task A2 — Pillow swap row 1/3

選 **target 順序為 React FACING_ROW 預設:**`{up:0, right:1, down:2, left:3}`

對於每張不符合此順序的 sheet,用 Pillow swap row 1 跟 row 3:

```python
from PIL import Image

def swap_rows_1_and_3(path):
    im = Image.open(path).convert('RGBA')
    # Sheet 是 128x192,4 rows of 48px each
    row1 = im.crop((0, 48, 128, 96))   # row index 1
    row3 = im.crop((0, 144, 128, 192)) # row index 3
    im.paste(row3, (0, 48))
    im.paste(row1, (0, 144))
    im.save(path)
```

執行邏輯:
- protagonist:依 Task A1 判斷
- suman:目前 row 1=right(matches target),不需 swap;**但跟 chenyifu/protagonist 不一致時需 swap**
- chenyifu:row 1=left(不 match target right),需要 swap

判斷後 swap 該 swap 的。完成後再 view_image 三張驗證:
- row 1 都是面向**右**
- row 3 都是面向**左**
- row 0 都是 up,row 2 都是 down(這個 Task A 已驗證)

如果 view 後仍不一致,寫 BLOCKER。

## Task B — 接續 011 Task B(整張 baked_raster 辦公室)

(完整 prompt 內容見 `codex-prompts/011-tileset-seamless-and-sprite-rows.md` Task B 段)

關鍵:用 `$generate2dmap` 生 `public/maps/office-tilemap.png`,448×320 px retro_pixel 整張連續辦公室。

## Task C — 接續 011 Task C(串進 React)

1. `src/core/types.ts` 的 `TilemapData` 加 `baseUrl?: string`
2. `src/content/maps/office.json` 加 `"baseUrl": "/maps/office-tilemap.png"`
3. `src/components/Tilemap/TilemapScene.tsx`:
   - 若 `map.baseUrl` 存在 → render 一個 `<img src={map.baseUrl} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} />`,**不要 render** 原本的兩層 grid+tileset
   - 若不存在 → fallback 到原本的 grid+tileset(向後相容)
   - sprite + scale-to-fit + 鍵盤 listener 維持

## Task D — 廢檔

`rm public/tilesets/office-tileset.png`

## Task E — Sprite anchor 補正(若需要)

011 Task A 沒明確判斷角色腳是否貼 frame 底邊。請順便 view_image 一次三張 sheet 之一(取 suman 即可),目測角色腳在 frame 內的 y 位置。

- 若腳貼底邊(48 px frame 內,腳在 y=44~48)→ 不需補正
- 若腳離底邊有 N px 空白 → 在 PlayerSprite + NpcSprite 的 top 算式減去 N 補正

只動兩個元件的 top 算式,不要動 height / backgroundSize / backgroundPosition(011 Task A 已修)。

## 完成後

1. JOURNAL.md append schema entry,寫清楚:
   - protagonist row 1/3 是什麼方向
   - 哪幾張 sheet 你 swap 了
   - swap 後 view_image 驗證結果
   - Task B 重生 office-tilemap.png 用了 generate2dmap 哪些參數、最終 size、seamless 自評
   - Task E anchor 觀察結果跟補正 px(或 「不需補正」)
2. codex-prompts/012-...md 頂端 STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要重生 sprite sheet(只用 Pillow swap)
- 不要動 office.json 的 collision / triggers / spawns
- 不要動 GDD / PRD
- 不要動 VnScene 等
