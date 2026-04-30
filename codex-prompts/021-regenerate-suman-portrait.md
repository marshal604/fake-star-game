# Codex Prompt 021 — 重生 suman VN 立繪(放棄 patch enclosed white,直接重做)

STATUS: done
SKILL: `$generate2dsprite` + Pillow + view_image
依賴:無
產出:
- `public/portraits/suman-normal.png` 重生(乾淨透明,沒 enclosed white sliver)

不動:其他所有檔(includes protagonist + chenyifu portrait,已驗 OK)

---

## Why

018/020 patch suman portrait 連續失敗:
- 018 trim 掉 outline near-white 邊(corner-flood from boundaries)
- 但 enclosed sliver(手跟頭中間 / 頭髮-臉-脖-肩之間)alpha=255 outline sealed,corner-flood 進不去
- 020 想用 connected-component sliver detection 處理,但 logo / 高光 / sliver 形狀區別不容易,容易誤殺

**用戶建議**:重生 suman portrait 比 patch 容易乾淨。

---

## Task A — view_image references 確認 character identity

```
view_image references/suman-ref.png  ← character identity reference (1024x1536 大圖)
view_image public/portraits/protagonist-normal.png  ← style consistency reference (paint quality)
view_image public/portraits/chenyifu-normal.png    ← style consistency reference
```

JOURNAL Verified output 寫描述:
- references/suman-ref.png 你看到的 character 細節(hair / outfit / pose / accessories)
- protagonist+chenyifu 的 paint style anchor(line weight / cel-shading / palette)

## Task B — 用 $generate2dsprite single character 重生

```
view_image references/suman-ref.png

Use $generate2dsprite to create a single character VN portrait for:
- 22-year-old young woman, modern casual look (matching the loaded reference)
- Hair: dark pink / magenta, short with twin small buns or twin braids on top
- Outfit: red sleeveless top with white star logo at chest, blue denim
  jeans/shorts with heart-shaped belt buckle, red+white wristband
- Accessories: black-frame glasses, holding right hand near face (pushing
  glasses gesture)
- Style: late-1990s ~ 2000s Taiwanese / Japanese PC galgame visual novel
  portrait, cel-shaded anime illustration, soft warm color palette, clean
  line art (match the previously generated protagonist + chenyifu portraits)

asset_type: character
action: single
bundle: single_asset
view: side
sheet: 1x1 (frames: 1)
art_style: clean_hd  ← VN HD illustration, NOT retro_pixel. This is a 1024x1536
                       large portrait, not a 32x48 sprite.
anchor: center
margin: safe
size: 1024x1536 (vertical, half-body waist-up to roughly knees)

CRITICAL: art_style MUST be clean_hd (clean hand-painted HD anime illustration).
Do NOT generate pixel art / retro_pixel for this — that is for the 32x48
sprite sheets, not for the 1024x1536 VN portrait.

CRITICAL transparency requirement:
- Solid #FF00FF magenta background during raw generation. NO white background.
- After chroma-key cleanup, the alpha channel must be FULLY TRANSPARENT
  outside the character silhouette — including ENCLOSED REGIONS like the
  gap between hand and face, the gap between hair-cheek-neck-shoulder, etc.
- The skill's chroma-key processor should handle this automatically because
  the magenta background fills all gaps; the gaps will become alpha=0 after
  chroma-key.
- NO RGB-white outline. Cel-shading line art uses dark lines, not white.

Output: public/portraits/suman-normal.png, 1024x1536 RGBA, file < 800 KB.
```

## Task C — 嚴格 verify

```python
from PIL import Image
import numpy as np

im = np.array(Image.open('public/portraits/suman-normal.png').convert('RGBA'))
a = im[:,:,3]
print(f'Size: {im.shape}')
print(f'Alpha=0:   {(a==0).sum()}')
print(f'Alpha=255: {(a==255).sum()}')
print(f'Alpha 1..254 (halo): {((a>=1)&(a<=254)).sum()}')

# Check enclosed near-white opaque pixels
opaque = (a==255)
near_white = (im[:,:,0]>220)&(im[:,:,1]>220)&(im[:,:,2]>220)
n_white_opaque = (opaque & near_white).sum()
print(f'Opaque near-white pixels: {n_white_opaque}')

# Check edge near-white
shrunk = np.zeros_like(opaque)
shrunk[1:-1,1:-1] = (opaque[1:-1,1:-1] & opaque[:-2,1:-1] & opaque[2:,1:-1] & opaque[1:-1,:-2] & opaque[1:-1,2:])
edge = opaque & ~shrunk
edge_near_white = (edge & near_white).sum()
print(f'Edge near-white pixels: {edge_near_white} / {edge.sum()}')
```

**Acceptance criteria**(全部都要 pass,不過就 retry,最多 2 次):
- size = (1536, 1024, 4)(RGBA)
- alpha 1..254(halo)< total pixel 數的 5%(允許輕微 anti-alias)
- **opaque near-white pixels < 5000**(角色身上 logo + 高光,不超過 5000;之前 patch 失敗版是 24017)
- **edge near-white pixels < 200**(邊緣不是白色 outline)

如果不過就 view_image 看視覺哪裡有問題,寫 BLOCKER 進 JOURNAL,STATUS=blocked,留 Claude 處理。

## Task D — Verified output 必填

JOURNAL.md `Verified output:` 段:

1. references/suman-ref.png 描述
2. 重生後 alpha histogram + opaque near-white count + edge near-white count
3. view_image 重生後的 portrait,用人話描述:
   - 角色輪廓乾淨度(白邊 / 暗邊 / no edge artifact)
   - 手跟臉之間是否透明(過往 enclosed white 那塊)
   - 頭髮-臉-脖-肩之間是否透明(另一個 enclosed)
   - 角色身上 white star logo / highlights 是否保留
   - 整體跟 references/suman-ref.png 是否角色身份對得上

## 完成後

1. JOURNAL.md append entry,Verified output 4 項
2. codex-prompts/021-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要 patch 既有 PNG(alpha threshold / flood fill / connected component 都不要)
- 不要動 protagonist / chenyifu portrait
- 不要動 sprite / map / React
