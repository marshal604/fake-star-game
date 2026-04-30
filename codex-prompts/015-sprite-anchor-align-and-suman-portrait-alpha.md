# Codex Prompt 015 — Sprite anchor 對齊 chenyifu + suman VN 立繪去背重做

STATUS: superseded-by-016 (clipped feet → fixed in 016; suman portrait fringe is RGB-white not alpha → follow-up needed)
SKILL: `$generate2dsprite` + Pillow + `view_image`
依賴:014 完成
產出:
- `public/sprites/protagonist.png` 重生(角色在 frame 內的 size + position 跟 chenyifu 一致)
- `public/sprites/suman.png` 重生(同上)
- `public/portraits/suman-normal.png` alpha 重新清乾淨
- chenyifu.png 跟 portrait protagonist/chenyifu 不動

---

## 用戶實測回報

1. **Sprite frame 內角色的尺寸 + 放置位置 chenyifu vs protagonist/suman 不一致**(chenyifu 是對的)
2. **`public/portraits/suman-normal.png` 去背沒去乾淨**(alpha edge 有 halo / 殘餘背景色)

---

## Task A — 量化 chenyifu 的 frame anchor 標準

不要用「眼睛判斷」(上次出過事)。用 Pillow + numpy 量精確的 bounding box:

```python
from PIL import Image
import numpy as np

def measure_character_bbox(sheet_path, row_h=48, frame_w=32):
    """Measure character placement in each frame of a sprite sheet."""
    im = np.array(Image.open(sheet_path).convert('RGBA'))
    n_rows = im.shape[0] // row_h
    n_cols = im.shape[1] // frame_w
    results = []
    for r in range(n_rows):
        for c in range(n_cols):
            y0, y1 = r * row_h, (r + 1) * row_h
            x0, x1 = c * frame_w, (c + 1) * frame_w
            cell = im[y0:y1, x0:x1, 3]
            ys, xs = np.where(cell > 0)
            if len(ys) == 0:
                results.append({'r': r, 'c': c, 'empty': True})
            else:
                results.append({
                    'r': r, 'c': c,
                    'top': int(ys.min()), 'bottom': int(ys.max()),
                    'left': int(xs.min()), 'right': int(xs.max()),
                    'height': int(ys.max() - ys.min() + 1),
                    'width': int(xs.max() - xs.min() + 1),
                })
    return results

chen = measure_character_bbox('public/sprites/chenyifu.png')
prot = measure_character_bbox('public/sprites/protagonist.png')
suman = measure_character_bbox('public/sprites/suman.png')
# 比較每 row frame 0 的 top / bottom / height / width 三張 sheet 之間的差距
# 寫進 JOURNAL Verified output 當 baseline data
```

把三張 sheet 的 bbox 統計列出來,在 JOURNAL.md 的 Verified output 段寫:

```
chenyifu (anchor):
  row 0 frame 0: top=X, bottom=Y, height=H, width=W
  row 1 frame 0: ...
  row 2 frame 0: ...
  row 3 frame 0: ...
protagonist (current):
  ... (列出跟 chenyifu 的偏差)
suman (current):
  ...
```

## Task B — 重生 protagonist + suman 對齊 chenyifu

從 Task A bbox 數據,推導 chenyifu 的 anchor convention(例如:角色 top y≈3..6,bottom y≈42..46,height≈37..42,horizontally centered with width≈18..22)。

重生 protagonist + suman 時 prompt 嚴格寫:

```
view_image public/sprites/chenyifu.png   ← 用作 frame anchor reference

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
margin: safe
shared_scale: true
per-frame: 32x48 px (sheet 128x192)

CRITICAL anchor convention (match chenyifu, do not deviate):
- Character HEIGHT inside each frame: between <chenyifu_h_min> and
  <chenyifu_h_max> px (use Task A measurement)
- Character TOP within frame: y ≈ <chenyifu_top_avg>
- Character BOTTOM (feet) within frame: y ≈ <chenyifu_bottom_avg>
- Character horizontally centered, width ≈ <chenyifu_w_avg>
- ABSOLUTELY NO duplicate character heads, NO extra figures, NO row bleed
  into the bottom of the frame (the bottom 6-8px of every frame must be
  empty/transparent, NO pixels there).

Row order (must match chenyifu reference layout):
  row 0: back view (no face, facing UP)
  row 1: side view facing RIGHT (hair/face on right side of frame)
  row 2: front view (face visible, facing DOWN)
  row 3: side view facing LEFT (hair/face on left side of frame)

Each row: 4 walk-cycle frames (idle, step1, idle, step2).

Solid #FF00FF magenta background.
```

生完一張立刻跑 Task A 量測,**比對 chenyifu bbox 是否吻合(各方向 height/top/bottom 差距 ≤ 5 px)**。不吻合就重生(最多 3 次)。

## Task C — Pillow 後處理(防 image_gen overflow artifact)

對重生的 protagonist.png + suman.png(chenyifu 不動)強制把每 row 的底部 8 px alpha=0:

```python
from PIL import Image
import numpy as np

def clip_row_bottom(path, row_h=48, clip_px=8):
    im = np.array(Image.open(path).convert('RGBA'))
    h = im.shape[0]
    n_rows = h // row_h
    for r in range(n_rows):
        y0 = r * row_h + (row_h - clip_px)
        y1 = (r + 1) * row_h
        im[y0:y1, :, 3] = 0
    Image.fromarray(im).save(path)

clip_row_bottom('public/sprites/protagonist.png')
clip_row_bottom('public/sprites/suman.png')
```

不對 chenyifu 做(它已經乾淨)。

跑完再用 Task A measure 一次,確認角色 bottom y < 40(在 clip 安全範圍內)。

## Task D — suman-normal.png VN 立繪 alpha 清乾淨

用戶看 `public/portraits/suman-normal.png` 去背沒去乾淨,有 halo / 殘餘背景。

不要重生(VN 立繪重生 risk 角色身份漂移)。用 Pillow 做 alpha threshold + edge cleanup:

```python
from PIL import Image
import numpy as np

def refine_alpha(path, alpha_threshold=240):
    """Hard-threshold alpha: anything below the threshold becomes 0."""
    im = np.array(Image.open(path).convert('RGBA'))
    # Binary alpha: keep only pixels with alpha >= threshold
    mask = im[:, :, 3] >= alpha_threshold
    im[~mask, 3] = 0
    Image.fromarray(im).save(path)

refine_alpha('public/portraits/suman-normal.png', alpha_threshold=240)
```

跑完 view_image 確認:
- 角色輪廓乾淨(沒有半透明 halo)
- 背景純透明
- 角色內部沒有意外被切掉的部分(若有,降低 threshold 到 200 或 180 重試)

## Task E(必填)— Verified output 的數據要求

JOURNAL.md `Verified output:` 段必須包含:

1. **Task A 量化結果**:三張 sheet 每 row 的 bbox(用上面 measure 函式輸出)
2. **Task B 重生比對**:重生後 protagonist + suman bbox vs chenyifu 的差距(per row)
3. **Task C 後處理確認**:clip 後 bottom area 是否乾淨(np.all(im[y_clip:y_end, :, 3] == 0))
4. **Task D 立繪 alpha**:alpha 中間值像素數量(0 < alpha < 240)清前 / 清後對比;view_image 後角色輪廓 / 背景透明的描述

## 完成後

1. JOURNAL.md append schema entry,Verified output 段照上面 Task E 寫
2. codex-prompts/015-...md 頂端 STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 chenyifu.png 跟 chenyifu-normal.png(它們是 anchor / reference)
- 不要動 React 元件 / JSON / map
- 不要重生 protagonist-normal.png 跟 chenyifu-normal.png(VN 立繪只清 suman 的 alpha)
- 不要做 NPC walking animation
