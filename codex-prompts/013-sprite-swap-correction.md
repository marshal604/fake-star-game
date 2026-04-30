# Codex Prompt 013 — Sprite swap 修正(Claude 已肉眼確認過)+ row bleed 清理

STATUS: pending
SKILL: Pillow + `view_image`
依賴:012 完成
產出:
- `public/sprites/protagonist.png`(swap row 1↔3,撤回 012 的錯誤 swap)
- `public/sprites/suman.png`(swap row 1↔3,012 沒做的 swap)
- `public/sprites/chenyifu.png`(不動)
- 三張 sheet 加 row 邊界清理(±1px transparent,清 bleed)

---

## Background — Claude 已肉眼確認過 row 順序

Claude 用 Read 工具直接看三張 sprite 的圖,確認當前 row 順序(swap 後狀態):

| Sprite | row 0 | row 1 | row 2 | row 3 |
|--------|-------|-------|-------|-------|
| chenyifu(swap 過) | up | **right** ✓ | down | **left** ✓ |
| protagonist(swap 過) | up | **left** ❌ | down | **right** ❌ |
| suman(沒 swap) | up | **left** ❌ | down | **right** ❌ |

target FACING_ROW = `{up:0, right:1, down:2, left:3}`

**Codex 上次的 Pillow 判斷反了** — 把該 swap 的 suman 留著,把不該 swap 的 protagonist swap 了。

## Task A — 修正性 swap

對下面兩張 PNG 執行 `swap_rows_1_and_3`:

```python
from PIL import Image

def swap_rows_1_and_3(path):
    im = Image.open(path).convert('RGBA')
    # 128x192 sheet, 4 rows of 48px each
    row1 = im.crop((0, 48, 128, 96)).copy()
    row3 = im.crop((0, 144, 128, 192)).copy()
    im.paste(row3, (0, 48))
    im.paste(row1, (0, 144))
    im.save(path)

swap_rows_1_and_3('public/sprites/protagonist.png')   # 撤回 012 的錯誤 swap
swap_rows_1_and_3('public/sprites/suman.png')         # 012 漏做的 swap
# chenyifu.png 不動
```

完成後三張都應該是 `row 1 = right, row 3 = left`。

**驗證**:`view_image` 三張(逐一,別一次三張),用人話描述 row 1 / row 3 的角色面向哪邊。如果你看不出方向(上次的失誤),寫 BLOCKER,Claude 會補做。

## Task B — Row bleed 清理(修「下方冒出頭髮」)

用戶截圖 down 方向時 sprite 下方有「另一個頭頂」露出來。原因:sprite sheet 在生成時 row 邊界沒有完全 contained,row N 的角色像素可能延伸到 row N+1 的 top 1-2 px。

修法:對三張 sheet 每張用 Pillow 把 row 邊界區域(每 48px boundary ±1px)的 alpha 設 0(透明):

```python
from PIL import Image
import numpy as np

def clean_row_bleed(path, frame_h=48, bleed_px=1):
    im = Image.open(path).convert('RGBA')
    arr = np.array(im)
    h = arr.shape[0]
    # row boundaries at y = 48, 96, 144 (between rows). Clear ±bleed_px around each.
    for boundary in range(frame_h, h, frame_h):
        lo = max(0, boundary - bleed_px)
        hi = min(h, boundary + bleed_px)
        arr[lo:hi, :, 3] = 0  # alpha=0
    Image.fromarray(arr).save(path)

clean_row_bleed('public/sprites/protagonist.png')
clean_row_bleed('public/sprites/suman.png')
clean_row_bleed('public/sprites/chenyifu.png')
```

注意 bleed_px=1 是保守的。如果 1px 不夠(用戶實測還露頭)可以增到 2,但別超過 2。

## Task C — 驗證

最後 view_image 三張一次,描述每 row 內容並比對 target {up:0, right:1, down:2, left:3} 是否一致。記錄到 JOURNAL。

## 完成後依 AGENTS.md(注意 AGENTS.md 剛剛強化 JOURNAL 寫法要求)

JOURNAL.md append schema entry,**`Verified output:` 必填**,內容包含:

```
- protagonist.png view_image after corrective swap:
  - row 0 frame 1: <人話描述,例 「角色背對玩家,看到後腦髮」>
  - row 1 frame 1: <例「side view, 角色頭髮在 frame 右側, 臉朝右」>
  - row 2 frame 1: <例「角色正面, 看到臉部 detail (眼睛 / 嘴)」>
  - row 3 frame 1: <例「side view, 角色頭髮在 frame 左側, 臉朝左」>
- suman.png view_image after corrective swap: (同樣 4 row 描述)
- chenyifu.png view_image (untouched, baseline check): (同樣 4 row 描述)
- 三張 row 順序與 target {up:0, right:1, down:2, left:3} 是否一致:✅ / ❌
- bleed_px used: 1 / 2
- bleed clean visual check (view_image 後): row 邊界乾淨?有沒有殘留?
```

如果 row 順序仍然不對(swap 後 vs target),**寫 BLOCKER + STATUS: blocked,不要繼續做 Task B,留 Claude 處理**。

codex-prompts/013-...md 頂端 STATUS: → ready-for-commit / blocked。**不要 git commit / push**。

## 不要做

- 不要重生 sprite(已有的圖夠用,只 Pillow 處理)
- 不要動 React 元件(FACING_ROW 已經是 target,sprite 對齊到 target 就行)
- 不要動 JSON / map / VnScene 等
