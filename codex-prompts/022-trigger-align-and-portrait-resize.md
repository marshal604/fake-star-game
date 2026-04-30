# Codex Prompt 022 — 門 trigger 對齊實際圖位置 + 立繪 1.5× + 對齊對話框 top

STATUS: done
SKILL: view_image + Pillow + code edit
依賴:020/021 完成
產出:
- `src/content/maps/office.json` trigger 位置改成對齊 office-tilemap.png 上門的真實 grid 位置
- `src/components/Dialogue/CharacterPortrait.tsx` img 高度放大 1.5×
- `src/components/Dialogue/DialogueView.tsx` portrait wrapper bottom 改成貼齊對話框 top

不動:其他所有檔

---

## Issue 1 — 門 trigger 對齊實際圖位置

### 現況

- `office-tilemap.png` 是 448×320 baked_raster,內部視覺位置由 image_gen 自由發揮
- `src/content/maps/office.json` 寫死 `triggers[0] = { id: "office.door", x: 11, y: 1, autoFire: true }`(based on 原 ASCII layout 假設)
- 用戶實測:視覺上門位置比 col 11 偏左

### Task A — 量門的真實位置

```python
from PIL import Image
import numpy as np

im = np.array(Image.open('public/maps/office-tilemap.png').convert('RGBA'))
print(f'image size: {im.shape}')
# Find dark pixel clusters in the top wall area (y < 64) — door is darker than wall
top_strip = im[0:64, :, :3]
darkness = 255 - top_strip.mean(axis=2)  # higher = darker
# Per-column max darkness in top strip
col_dark = darkness.max(axis=0)
print('Per-32px-tile-col darkness max in y=0..64:')
for c in range(14):
    x0, x1 = c*32, (c+1)*32
    print(f'  col {c} (x {x0}..{x1}): max darkness = {col_dark[x0:x1].max():.0f}')
```

**或更簡單:`view_image public/maps/office-tilemap.png`** + 用人話判斷:
- 「門中心」在哪個 col?(0-indexed,x=col*32 to col*32+32)
- 「門中心」在哪個 row?(通常 row 0 或 row 1,top wall 區域)

這次**用視覺判斷**為準(Pillow 算的當 sanity check)。

### Task B — 改 office.json trigger

依照 Task A 量到的 (door_col, door_row),把 `src/content/maps/office.json` 的 trigger 改成:

```json
"triggers": [
  { "id": "office.door", "x": <door_col>, "y": <door_row + 1>, "eventId": "sign-suman", "autoFire": true }
]
```

**`y = door_row + 1`**:trigger 不放在門那格,放在「門下面那一格」(玩家從南邊走到門前那格自動觸發)。如果 door 在 row 0(貼牆),trigger 在 row 1。如果 door 已在 row 1,trigger 在 row 2。

驗證 trigger 位置對應的 collision[trigger.y][trigger.x] === false(那格可走)。如果是 true,選 trigger 在 (door_col, door_row + 1) 不行 → 試 (door_col-1, door_row+1) 或 (door_col+1, door_row+1) 找最近可走的 tile。

### Issue 1 Acceptance

- office.json `triggers[0].x` 跟 `triggers[0].y` 改成對齊圖上門的位置 ± 1 tile
- collision[trigger.y][trigger.x] === false
- JSON 仍 valid

---

## Issue 2 — 對話立繪 1.5× + 對齊對話框 top

### 現況

`src/components/Dialogue/CharacterPortrait.tsx` line 15:

```tsx
className="h-[46dvh] sm:h-[52dvh] md:h-[58dvh] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
```

`src/components/Dialogue/DialogueView.tsx` line 63:

```tsx
className={`absolute bottom-[26%] sm:bottom-[30%] z-10 ${portraitWrapperClass} transition-all duration-300 pointer-events-none`}
```

### Task C — CharacterPortrait img 放大 1.5×

**Search this exact text in `src/components/Dialogue/CharacterPortrait.tsx`:**

```tsx
          className="h-[46dvh] sm:h-[52dvh] md:h-[58dvh] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
```

**Replace with:**

```tsx
          className="h-[69dvh] sm:h-[78dvh] md:h-[80dvh] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
```

(46×1.5=69, 52×1.5=78, 58×1.5=87 但 cap 80dvh 避免太高超出視窗。)

### Task D — DialogueView portrait wrapper 對齊對話框 top

對話框在 viewport 底部 padding 1rem~5rem,對話框 height 約 12-18% viewport。立繪 bottom 要貼齊對話框 top。

**Search this exact text in `src/components/Dialogue/DialogueView.tsx`:**

```tsx
        <div
          className={`absolute bottom-[26%] sm:bottom-[30%] z-10 ${portraitWrapperClass} transition-all duration-300 pointer-events-none`}
        >
```

**Replace with:**

```tsx
        <div
          className={`absolute bottom-[18%] sm:bottom-[20%] md:bottom-[22%] z-10 ${portraitWrapperClass} transition-all duration-300 pointer-events-none`}
        >
```

(26%→18% / 30%→20% / +22% md。立繪降低約 8% viewport,接近對話框 top edge。)

### Issue 2 Acceptance

跑 `pnpm typecheck` 過。

不要實測 chrome(Claude 會做)。

---

## Verified output 必填

JOURNAL.md `Verified output:` 段:

1. Task A 量門的方式跟結果(Pillow darkness per col + view_image 人話描述,結論 door 在 col=X row=Y)
2. Task B office.json trigger 改前 / 改後 的 (x, y),確認 collision[y][x] === false
3. Task C CharacterPortrait diff(改的那一行 before / after)
4. Task D DialogueView diff(改的那一行 before / after)
5. typecheck pass / fail

## 完成後

1. JOURNAL.md append entry,Verified output 5 項
2. codex-prompts/022-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**(Claude chrome 實測再 push)

## 不要做

- 不要動 office-tilemap.png(只動 office.json)
- 不要動 sprite / portrait file
- 不要動 React state / runtime / store / 其他 component
- 不要重生 image
