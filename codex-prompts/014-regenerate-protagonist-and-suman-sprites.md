# Codex Prompt 014 — 重生 protagonist + suman pixel sprites,以 chenyifu 為 row order anchor

STATUS: done
SKILL: `$generate2dsprite`
依賴:013 完成(chenyifu.png 是當前唯一 row 順序對的)
產出:
- `public/sprites/protagonist.png`(重生,4×4 sheet 32×48 per frame, row 0=up / 1=right / 2=down / 3=left)
- `public/sprites/suman.png`(重生)
- chenyifu.png 不動

---

## Why regenerate

013 用 Pillow swap row 修不了 frame 內 visual 問題。用戶實測仍然「按右走顯示左」+「下方冒出頭髮」。Pillow row swap 是把整 row block 對調,但如果**單個 frame 內角色 anchor / 比例不對**,swap 改不了。需要重新讓 image_gen 畫一次,並嚴格驗證。

## chenyifu.png 是 row 順序的官方 anchor

Claude 用 Read 工具肉眼確認 `public/sprites/chenyifu.png` 當前 row 順序符合 target:
- row 0: 角色背對玩家(看到後腦深色短髮、肩膀,**看不到臉**) → up
- row 1: side view, 角色身體面向**右**(髮在 frame 右側,臉朝右) → right
- row 2: 角色面向玩家(看到臉、瀏海、雙眼) → down
- row 3: side view, 面向**左** → left

新生的 protagonist 跟 suman **必須跟 chenyifu 同樣的 row 排列**。

## 任務

逐一處理 protagonist → suman(別平行)。每張流程:

### 1. 載入 chenyifu 當 row order reference

```
view_image public/sprites/chenyifu.png
```

不要用 chenyifu 當 character identity reference(我們不想要新角色長得像陳奕夫)。**只取它的 row 排列方式 + frame layout**(每 frame 32×48,角色腳貼底邊,row 順序 up/right/down/left)。

### 2. 載入 VN 立繪當 character identity reference

```
view_image public/portraits/protagonist-normal.png  (做 protagonist 時)
view_image public/portraits/suman-normal.png        (做 suman 時)
```

### 3. 給 $generate2dsprite 的請求

```
Use $generate2dsprite to create a top-down 4x4 player_sheet for a <character
description from VN portrait>. Match the character identity from the loaded
VN portrait above (hair color, hairstyle silhouette, outfit primary color).

asset_type: player
action: walk
view: topdown (45° top-down, SNES JRPG)
sheet: 4x4
frames: 16
art_style: retro_pixel (16-bit SNES JRPG, NOT clean_hd)
anchor: feet
margin: safe (no edge touch, no row bleed)
shared_scale: true
per-frame size: 32x48 px (sheet total 128x192)

CRITICAL row order (must match the chenyifu reference layout shown earlier):
  row 0 (top of sheet, y=0..47):    character seen FROM BEHIND (back view).
                                    NO face visible. Looking at back of head
                                    + shoulders. = facing UP / away from player.
  row 1 (y=48..95):                  side view, character body facing RIGHT.
                                    Face/hair on the right side of the frame,
                                    back on the left side.
  row 2 (y=96..143):                 character seen FROM FRONT (face view).
                                    Face features visible (eyes, mouth).
                                    = facing DOWN / toward player.
  row 3 (y=144..191):                side view, character body facing LEFT.
                                    Face/hair on the left side of the frame,
                                    back on the right side.

Each row contains 4 walk-cycle frames (idle, step1, idle, step2).

CRITICAL frame containment:
  - Each 32x48 cell must be SELF-CONTAINED. Pixels in row N must NOT touch
    or bleed into row N±1 boundaries.
  - Anchor: character's feet must touch the BOTTOM edge of each 32x48 cell
    (feet at y ~ 46 within the frame). Top of the head should be near the
    top of the cell but not touching the edge.
  - Solid #FF00FF magenta background (skill will chroma-key).

The result must be loadable as a 4x4 sprite sheet where indexing
[col=facing_step, row=facing_direction] gives correct character pose.
```

### 4. 立刻 view_image 驗證

每張生完立刻 view_image,**用人話寫**:
- row 0 frame 1: <描述,例 "back view, no face">
- row 1 frame 1: <例 "side view, hair on right side, face right">
- row 2 frame 1: <例 "front view, face visible, facing down">
- row 3 frame 1: <例 "side view, hair on left side, face left">

對齊 target → 進下一張。
**不對齊 → 重生**(最多 3 次)。
3 次都不對 → STATUS=blocked + BLOCKER 寫詳細,留 Claude 處理。

### 5. Frame containment 後處理

最後對兩張(protagonist + suman)用 Pillow alpha=0 清 row 邊界 ±1px:

```python
from PIL import Image
import numpy as np
def clean_row_bleed(path, frame_h=48, bleed_px=1):
    im = Image.open(path).convert('RGBA')
    arr = np.array(im)
    h = arr.shape[0]
    for boundary in range(frame_h, h, frame_h):
        lo = max(0, boundary - bleed_px); hi = min(h, boundary + bleed_px)
        arr[lo:hi, :, 3] = 0
    Image.fromarray(arr).save(path)

clean_row_bleed('public/sprites/protagonist.png')
clean_row_bleed('public/sprites/suman.png')
```

## 完成後依 AGENTS.md(必含 Verified output)

JOURNAL.md append schema entry,**`Verified output:` 必填**,逐張 sheet 寫 4 row 描述(用人話描述每 row 看到什麼),並列出每張花了幾次重生才對齊 target。

codex-prompts/014-...md 頂端 STATUS: → ready-for-commit / blocked。**不要 git commit / push**(Claude 會 Read 三張對照 + chrome 實測再決定)。

## 不要做

- 不要動 chenyifu.png(它是 anchor)
- 不要重生 portrait(prompt 001 的 VN 立繪不動)
- 不要動 React 元件 / JSON / map
- 不要做 NPC walking animation
