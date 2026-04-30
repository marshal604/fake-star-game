# Codex Prompt 016 — 重生 protagonist + suman(不做 bottom clip,讓腳完整)

STATUS: done
SKILL: `$generate2dsprite` + Pillow + `view_image`
依賴:015 完成
產出:
- `public/sprites/protagonist.png` 重生(完整有腳,bottom y ≈ 45,跟 chenyifu 一致)
- `public/sprites/suman.png` 重生

不動:chenyifu.png、所有 portrait、suman-normal.png(015 已修)

---

## Why

015 Task C 做了 `clip_row_bottom 8px` 當 safety net 防 image_gen overflow,但這次 015 重生品質很好(沒 overflow),clip 反而把角色的腳砍掉:

| sprite | row 0 frame 0 top | bottom | height |
|---|---|---|---|
| chenyifu | 9 | **45** | 37 |
| protagonist (after 015) | 9 | **39** ❌ | 31 |
| suman (after 015) | 9 | **39** ❌ | 31 |

bottom 從 45 變 39 = clip 砍掉 6 px = 腳。

修法:**重生 + 跳過 clip**。

## Task A — 量化現況(一句話即可)

跑 015 Task A 的 measure_character_bbox 得到 chenyifu 各 row bbox。**寫進 JOURNAL Verified output 當 target**(預計 height ≈ 35-37, top ≈ 9-12, bottom ≈ 45)。

## Task B — 重生 protagonist + suman

```
view_image public/sprites/chenyifu.png   ← frame anchor reference

Use $generate2dsprite to create a top-down 4x4 player_sheet for <character
desc from VN portrait>. Match character identity from the loaded VN portrait,
but match the FRAME ANCHOR convention of the chenyifu reference shown above.

asset_type: player
action: walk
view: topdown
sheet: 4x4
frames: 16
art_style: retro_pixel
anchor: feet
margin: tight (feet should reach close to the bottom of the cell)
shared_scale: true
per-frame: 32x48 px

CRITICAL anchor convention (match chenyifu, do NOT make character smaller):
- Character HEIGHT inside each frame: 35..37 px (full body, head to feet)
- Character TOP within frame: y ≈ 9..12 (small headroom buffer)
- Character BOTTOM (feet) within frame: y ≈ 45 (NOT 39 — feet should
  almost reach the bottom edge, leaving only 2-3 px buffer below).
- Character horizontally centered within ~24 px width
- The bottom 2-3px (y=46..47) of every frame must be empty (no pixels
  there) — this is the only safety buffer needed
- ABSOLUTELY NO duplicate character heads, NO extra figures in any cell

Row order (must match chenyifu):
  row 0: back view (no face, facing UP)
  row 1: side view facing RIGHT (hair/face on right side of frame)
  row 2: front view (face visible, facing DOWN)
  row 3: side view facing LEFT (hair/face on left side of frame)

Each row: 4 walk-cycle frames (idle, step1, idle, step2).
Solid #FF00FF magenta background.
```

重生後跑 measure_character_bbox 量,**驗證**:
- bottom y per row 在 43..47 範圍(跟 chenyifu ≤ 3 px 差距)
- height per row 在 33..40 範圍
- 沒有 frame 出現 height > 45(代表 overflow / multi-character)

不吻合就重生(最多 3 次)。3 次都不對 → STATUS=blocked。

## Task C — 不做 bottom clip,但保留 boundary 1px alpha clean

```python
from PIL import Image
import numpy as np

def clean_row_boundary_only(path, row_h=48):
    """Only clear ±1px around row boundaries (y=47/48, 95/96, 143/144).
    Do NOT clip 8px like 015. Do NOT touch frame interior."""
    im = np.array(Image.open(path).convert('RGBA'))
    h = im.shape[0]
    for boundary in range(row_h, h, row_h):
        lo = max(0, boundary - 1); hi = min(h, boundary + 1)
        im[lo:hi, :, 3] = 0
    Image.fromarray(im).save(path)

clean_row_boundary_only('public/sprites/protagonist.png')
clean_row_boundary_only('public/sprites/suman.png')
```

跑完再 measure 一次,確認 bottom y 仍然 ≥ 43(腳還在)。

## Task D — Verified output 數據要求

JOURNAL.md `Verified output:` 必填:

1. chenyifu 各 row bbox(target reference)
2. 重生後 protagonist + suman 各 row bbox + 跟 chenyifu 差距(per row top/bottom/height delta px)
3. boundary clean 後再量一次的 bbox(確認 bottom y ≥ 43)

## 完成後

1. JOURNAL.md append entry,Verified output 含上面三組數據
2. codex-prompts/016-...md 頂端 STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 chenyifu.png、所有 portraits、suman-normal.png(015 已修)
- 不要 clip 底部 8px(這是 015 的 bug,本次絕不能重複)
- 不要動 React、JSON、map
