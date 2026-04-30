# Codex Prompt 017 — 重生 protagonist + suman 對齊 chenyifu 各 row 角色 width + suman portrait flood-fill color-key

STATUS: done
SKILL: `$generate2dsprite` + Pillow + `view_image`
依賴:016 完成
產出:
- `public/sprites/protagonist.png` 重生(各 row 角色 width 對齊 chenyifu 17-18,且強化 identity preservation:business suit + dark hair)
- `public/sprites/suman.png` 重生(各 row 角色 width 對齊 chenyifu 17-18)
- `public/portraits/suman-normal.png` flood-fill color-key 清白邊

不動:chenyifu.png、protagonist-normal.png、chenyifu-normal.png、React/JSON/map

---

## Why

016 對齊 height/bottom 對了,但**角色 width per row 落差大**(用戶實測):

| sprite | up | right | down | left | range |
|---|---|---|---|---|---|
| **chenyifu (anchor)** | 17 | 17 | 17 | 17-18 | **0-1** ✓ |
| protagonist | 17 | 14-15 | **12-13** | 15-16 | **5** ❌ |
| suman | 19 | 17-19 | 18-19 | 17-19 | **2** mid |

protagonist 的 down view 角色 width 只有 12-13,比 up view 的 17 窄 5 px → 走到 down 時主角看起來變瘦。

加上 015 觀察到 suman portrait 的「白邊」是 RGB-white at alpha=255(不是 alpha halo),需要 color-key 不是 alpha threshold。

---

## Task A — 重生 protagonist(對齊 chenyifu width + identity preservation)

```
view_image public/sprites/chenyifu.png   ← width anchor reference
view_image public/portraits/protagonist-normal.png  ← character identity reference

Use $generate2dsprite to create a top-down 4x4 player_sheet for a 30-year-old
Taiwanese male talent agent. PRESERVE IDENTITY from the loaded VN portrait:
business suit (dark gray or navy), buttoned shirt, tie, short dark hair (NOT
blue, NOT yellow), calm sober adult look. NOT a young casual character.

Frame anchor convention (match chenyifu reference):
- Character HEIGHT per frame: 35..37 px
- Character TOP y ≈ 9..12 (per row)
- Character BOTTOM y ≈ 45 (feet near frame bottom edge)
- Character WIDTH per frame: 17..18 px (UNIFORM across all 4 rows; up, right,
  down, left view should all have similar shoulder width — do NOT make the
  down view skinnier than up view)

asset_type: player
action: walk
view: topdown
sheet: 4x4
frames: 16
art_style: retro_pixel
anchor: feet
margin: tight
shared_scale: true
per-frame: 32x48 px

Row order (must match chenyifu):
  row 0 (y=0..47):    back view, NO face visible, dark hair on top of head
                      = facing UP
  row 1 (y=48..95):   side view facing RIGHT, hair/face on right side
  row 2 (y=96..143):  front view, FACE VISIBLE (eyes, mouth, business suit
                      collar + tie). Body width should be SIMILAR to back
                      view, not noticeably skinnier.
  row 3 (y=144..191): side view facing LEFT, hair/face on left side

NO duplicate character heads, NO extra figures, NO row bleed.
Solid #FF00FF magenta background.
```

重生後跑 measure_character_bbox **per (row, col) all 16 frames**:

```python
def measure_all_frames(path, row_h=48, frame_w=32):
    from PIL import Image
    import numpy as np
    im = np.array(Image.open(path).convert('RGBA'))
    out = []
    for r in range(im.shape[0] // row_h):
        for c in range(im.shape[1] // frame_w):
            cell = im[r*row_h:(r+1)*row_h, c*frame_w:(c+1)*frame_w, 3]
            ys, xs = np.where(cell > 0)
            if len(ys):
                out.append({'r':r,'c':c,'top':int(ys.min()),'bot':int(ys.max()),
                           'h':int(ys.max()-ys.min()+1),'w':int(xs.max()-xs.min()+1)})
    return out
```

**驗證**(每張 sheet):
- 各 row width 平均 跟 chenyifu 該 row 平均差距 ≤ 2 px
- 各 row 的 4 個 frame 內 width range ≤ 2 px
- height 跟 chenyifu 該 row 差距 ≤ 2 px
- bottom y 跟 chenyifu 該 row 差距 ≤ 2 px

不對就重生(最多 3 次)。

## Task B — 重生 suman(同樣標準)

跟 Task A 同樣流程,但 prompt 強調 suman identity:22-year-old young woman, long pink hair, light pastel dress (or nurse outfit), gentle expression, soft warm tones。

## Task C — Pillow row boundary cleanup(只 ±1 px,**不要 clip 8 px**)

```python
def clean_row_boundary_only(path, row_h=48):
    from PIL import Image
    import numpy as np
    im = np.array(Image.open(path).convert('RGBA'))
    h = im.shape[0]
    for boundary in range(row_h, h, row_h):
        lo = max(0, boundary-1); hi = min(h, boundary+1)
        im[lo:hi, :, 3] = 0
    Image.fromarray(im).save(path)
```

對 protagonist + suman 跑,chenyifu 不動。

## Task D — suman portrait flood-fill color-key

`public/portraits/suman-normal.png` 的「白邊」是 RGB-white at alpha=255(image_gen 把白色背景當前景 opaque)。alpha threshold 解不了。用 flood-fill from corners 找到「跟邊框 connected 的白色背景」,只清那部分(角色身上的白衣服 / 高光不會誤殺):

```python
from PIL import Image
import numpy as np
from collections import deque

def flood_clear_corner_white(path, white_threshold=235):
    """Flood-fill from each corner; pixels with all-RGB > threshold connected
    to a corner become alpha=0."""
    im = np.array(Image.open(path).convert('RGBA'))
    h, w = im.shape[:2]
    is_white = (im[:, :, 0] >= white_threshold) & (im[:, :, 1] >= white_threshold) & (im[:, :, 2] >= white_threshold)
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for sy, sx in [(0,0),(0,w-1),(h-1,0),(h-1,w-1)]:
        if is_white[sy, sx] and not visited[sy, sx]:
            q.append((sy, sx)); visited[sy, sx] = True
    # Also start from edges (in case corner is not white but edge is)
    for x in range(w):
        for y in (0, h-1):
            if is_white[y, x] and not visited[y, x]:
                q.append((y, x)); visited[y, x] = True
    for y in range(h):
        for x in (0, w-1):
            if is_white[y, x] and not visited[y, x]:
                q.append((y, x)); visited[y, x] = True
    while q:
        y, x = q.popleft()
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_white[ny, nx]:
                visited[ny, nx] = True; q.append((ny, nx))
    im[visited, 3] = 0
    Image.fromarray(im).save(path)

flood_clear_corner_white('public/portraits/suman-normal.png', white_threshold=235)
```

`white_threshold=235` 抓 RGB > 235 的 white-ish pixel(允許輕微 anti-alias),但只清 connected to edge 的部分。角色身上的高光 / 白色衣服不會被誤殺(因為 not connected to edge)。

跑完 view_image 確認:
- 角色輪廓周圍乾淨
- 角色身上白色保留
- 透明背景純黑(no halo)

如果還有殘餘白邊 → 提高 threshold 到 245(更精準);如果角色被誤切 → 降到 220。

## Task E — Verified output 必填

JOURNAL.md `Verified output:` 段:

1. **Width matrix 量化**(per row 4 frames 的 width):
   - chenyifu (target): row 0 widths=[17,17,17,17] etc
   - protagonist after regenerate: 跟 chenyifu 比對 (per row 平均差 / 各 row 4 frame range)
   - suman after regenerate: 同上
2. **Height/bottom alignment** 確認:跟 chenyifu 各 row delta ≤ 2 px
3. **Boundary cleanup 確認**:跑 measure 看 bottom y ≥ 43
4. **Portrait color-key 結果**:flood-fill 清掉的 pixel 數;view_image 後角色輪廓 + 背景描述

## 完成後

1. JOURNAL.md append entry,Verified output 含上面 4 項
2. codex-prompts/017-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 chenyifu.png、protagonist-normal.png、chenyifu-normal.png
- 不要 clip 底部 8 px(這是 015 的 bug)
- 不要動 React / JSON / map
