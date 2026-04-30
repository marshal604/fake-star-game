# Codex Prompt 018 — protagonist + suman sprite 對齊 VN identity + suman portrait edge trim

STATUS: done
SKILL: `$generate2dsprite` + Pillow + `view_image`
依賴:017 完成
產出:
- `public/sprites/protagonist.png` 重生(藍髮 / 灰西裝 / 藍領帶,對齊 VN 立繪)
- `public/sprites/suman.png` 重生(紫紅辮子 / 紅色 sleeveless / 牛仔褲 / 黑框眼鏡)
- `public/portraits/suman-normal.png` outline edge trim(near-white edge → alpha=0)
- 順便 `public/portraits/protagonist-normal.png` 也做 edge trim(以防 same issue)

不動:chenyifu sprite + chenyifu portrait + map + React

---

## Why

Claude review 發現之前 prompt 對 character identity 描述憑記憶寫,沒先 view_image VN 立繪確認。實際 VN 立繪 vs 目前 sprite:

| 角色 | VN 立繪實際 | 目前 sprite (017) |
|---|---|---|
| protagonist | **藍髮 spiky + 灰西裝 + 藍白斜紋領帶** | ❌ 黑髮紅領帶 |
| suman | **紫紅辮子髮 + 紅色 sleeveless + 牛仔 + 黑框眼鏡** | ❌ 粉髮粉色衣服 |
| chenyifu | 棕色 afro + 淺藍 hoodie + 紅 t-shirt | ✅ 接近(本次不動) |

加上 Claude Pillow 量 suman portrait edge:42% outline 是 RGB > 200 的 near-white(R=211 G=200 B=196 median)→ 用戶視覺上看到「白邊」。alpha 是 binary,但 outline 顏色就是白 → 需要 edge trim。

---

## Task A — view_image VN 立繪確認顏色(必做,不要靠記憶)

```
view_image public/portraits/protagonist-normal.png
view_image public/portraits/suman-normal.png
```

**用人話描述你看到的具體顏色**,寫進 JOURNAL Verified output 段。重點:

- protagonist: hair color? jacket color? tie pattern + color? shirt?
- suman: hair color + style? top color + style? bottom + accessory?

Claude 已先看過粗略描述如下,你 view 後可能更精準,以你看到的為準:

- protagonist: vibrant blue spiky hair, dark gray suit jacket, white shirt, blue+white diagonal striped tie
- suman: dark pink/magenta hair (small twin braids/buns), red sleeveless top with white star logo, blue jeans + heart-shaped belt buckle, black-frame glasses, red+white wristband

## Task B — 重生 protagonist sprite

```
view_image public/sprites/chenyifu.png  ← frame anchor (width/height) reference
view_image public/portraits/protagonist-normal.png  ← character identity reference

Use $generate2dsprite to create a top-down 4x4 player_sheet for the EXACT
character in the loaded VN portrait above:
- Hair: VIBRANT BLUE, spiky short cut. NOT black, NOT brown, NOT navy-near-black.
  Cobalt / royal blue range.
- Outfit: dark gray (charcoal) business suit jacket, white shirt, blue-and-
  white DIAGONAL striped tie. NOT plain red. NOT yellow.
- 30-year-old male, calm sober adult.

Frame anchor (match chenyifu reference exactly):
- Character height per frame: 35..37 px
- top y ≈ 9..12, bottom y ≈ 45 (feet near frame bottom)
- Character width per frame: 17..18 px UNIFORM across all 4 rows

asset_type: player; action: walk; view: topdown; sheet: 4x4
art_style: retro_pixel; anchor: feet; margin: tight; shared_scale: true
per-frame: 32x48 px

Row order:
  row 0: back view, NO face, BLUE hair on top of head (clearly visible blue)
  row 1: side view facing RIGHT (blue hair on right side)
  row 2: front view, FACE VISIBLE, blue spiky hair, gray suit jacket, blue tie
  row 3: side view facing LEFT (blue hair on left side)

NO duplicate heads, NO row bleed, NO 8px clip. Solid #FF00FF magenta bg.
```

重生後跑 measure_character_bbox,跟 chenyifu 比對(width/height/bottom delta ≤ 2 px,row width range ≤ 2)。

最重要:**view_image 確認 row 0 / row 2 真的是「藍色」頭髮**(不是黑色)。看不到藍色就重生(最多 3 次)。

## Task C — 重生 suman sprite

```
view_image public/sprites/chenyifu.png  ← frame anchor
view_image public/portraits/suman-normal.png  ← character identity

Use $generate2dsprite to create a top-down 4x4 player_sheet for:
- Hair: dark pink / magenta (NOT light pink / pastel pink). Style: short with
  small twin buns or twin braids on top.
- Outfit: red sleeveless top (NOT pink), blue denim jeans/shorts, with a
  visible white star or simple white logo on the chest if scale allows.
- Accessories: at this pixel scale, glasses may not render but include if
  possible.
- 22-year-old young woman, modern casual look.

Frame anchor (match chenyifu): same height/width/bottom convention as Task B.

asset_type: player; sheet: 4x4; retro_pixel; anchor: feet; margin: tight

Row order: same as Task B (back/right/front/left).

NO 8px clip. Solid #FF00FF magenta bg.
```

驗證 row 2 (front view) 看得到「紅色 top」+ 「dark pink hair」,不是粉色。

## Task D — Pillow ±1 boundary cleanup

對 protagonist + suman sprite 跑 clean_row_boundary_only(±1 px alpha=0)。chenyifu 不動。

## Task E — Suman + Protagonist portrait edge trim

```python
from PIL import Image
import numpy as np

def trim_white_outline(path, rgb_threshold=200):
    """Find pixels at the alpha boundary that are near-white in RGB,
    set their alpha to 0. Removes the visible 'white outline' artifact."""
    im = np.array(Image.open(path).convert('RGBA'))
    a = im[:, :, 3]
    opaque = (a == 255)
    # 4-neighborhood erosion DIY
    shrunk = np.zeros_like(opaque)
    shrunk[1:-1, 1:-1] = (opaque[1:-1, 1:-1] & opaque[:-2, 1:-1] &
                         opaque[2:, 1:-1] & opaque[1:-1, :-2] & opaque[1:-1, 2:])
    edge = opaque & ~shrunk
    near_white = ((im[:, :, 0] > rgb_threshold) &
                  (im[:, :, 1] > rgb_threshold) &
                  (im[:, :, 2] > rgb_threshold))
    trim_mask = edge & near_white
    im[trim_mask, 3] = 0
    Image.fromarray(im).save(path)
    return int(trim_mask.sum())

n_suman = trim_white_outline('public/portraits/suman-normal.png')
n_prot  = trim_white_outline('public/portraits/protagonist-normal.png')
print(f'Trimmed: suman={n_suman}, protagonist={n_prot}')
```

如果 trim 後角色看起來「邊緣破破的 / 鋸齒明顯」→ 可能 trim 太多。但這個保守 method(只清 RGB > 200 的 edge)應該安全。

跑完 view_image 確認:
- 角色 outline 不再是白色(現在會是頭髮 / 衣服顏色的邊)
- 沒有破洞或大塊缺失
- 透明背景純黑(no halo)

如果 trim 後角色還有可見白邊,提高 threshold 到 230(更精準);如果 trim 過頭(角色破洞),降到 220 重做。

## Task F — Verified output 必填

JOURNAL.md `Verified output:` 段:

1. Task A view_image 後**用人話描述顏色**(protagonist hair / jacket / tie + suman hair / top / bottom / glasses)
2. Task B/C 重生後 view_image 各 row 顏色描述(row 0 hair color、row 2 outfit visible color)
3. Task B/C bbox matrix(per row 4 frames)— 跟 chenyifu 對齊 ≤ 2 px
4. Task D boundary clean 後 bottom y ≥ 43
5. Task E trim pixel count + view_image 後 outline 顏色描述

## 完成後

1. JOURNAL.md append entry,Verified output 含上面 5 項
2. codex-prompts/018-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要寫 hair=dark / NOT blue / NOT magenta(過往的記憶錯誤)
- 不要動 chenyifu sprite + chenyifu portrait + map + React
- 不要做 8px clip
