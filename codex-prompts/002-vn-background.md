# Codex Prompt 002 — 生 VN 模式辦公室背景

STATUS: pending
SKILL: `generate2dmap`
依賴:無(可平行 001、004、005)
產出:`public/backgrounds/office.png`(1920×1080, opaque PNG, < 1.5 MB)

---

## Context(只讀)

- `GDD.md` §4「場景」、§7.1「VN 模式美術風格」
- `references/office-ref.png`(本機 reference 圖,先 `view_image` 載入)

## 任務

把辦公室參照圖轉成 visual novel 模式用的**單張靜態背景插畫**。

### 參數(寫進 generate2dmap 的 plan)

- `map_kind`: `town`(剛成立的小型經紀公司辦公室)
- `visual_model`: `baked_raster`
- `art_style`: `clean_hd`(乾淨手繪 HD,跟 90s/2000s galgame 背景一致)
- `visual_asset_source`: `image_gen`
- `collision_model`: `none`(VN 背景不需要碰撞)
- `runtime_object_model`: `none`
- `output_format`: PNG only
- `size`: 1920×1080

### Prompt 撰寫方向(自己寫,不要用 prompt-builder)

關鍵字:
```
Style: clean hand-painted HD 2D background, late-1990s ~ 2000s Taiwanese / Japanese
       PC galgame aesthetic, warm color palette, soft natural lighting from a window,
       NOT pixel art, NOT photorealistic, NOT AI-painterly oil look.
Subject: a small newly-established talent agency office, just being set up.
         Wooden desk in mid-foreground, office chair, bookshelf along the wall, a door
         at frame-right, a window with daytime soft light at frame-left, a few papers
         and a phone on the desk, warm wooden floor.
Composition: horizontal 1920x1080, eye-level view from inside the room, vanishing
             point center, the door and the wide floor area visible.
             Leave the lower-third visually clean (the dialogue box covers it during play).
             Leave horizontal mid-band uncluttered (where character portrait will overlay).
Mood: hopeful, just-starting-out, slightly cozy.
```

把 `references/office-ref.png` 用 `view_image` 載入後當風格 / 構圖 reference,但不必 1:1 還原(它是構圖 reference,風格才是這次重點)。

## 嚴格要求

- 1920×1080,opaque(不是 transparent),JPEG-quality 視覺但用 PNG 存
- **下緣 1/3 視覺要乾淨**(對話框會疊上去)
- **中段水平帶**(高度 30%~70%)不要塞超複雜的 detail(立繪會疊上去)
- 不要有人物在畫面裡
- 不要有 watermark / signature / typo

## 完成後

1. 確保檔案在 `public/backgrounds/office.png`,1920×1080
2. 用 Pillow 檢查尺寸 + 檔案大小,若 > 1.5 MB 用 quality reduction 重存
3. 在 `JOURNAL.md` append 一筆(schema 在 JOURNAL.md 頂部)
4. 把本檔頂端 `STATUS: pending` 改為 `STATUS: done`
5. `git add public/backgrounds && git commit -m "feat(bg): generate VN office background [prompt:002]"`

## 不要做

- 不要生 tilemap(那是 prompt 004 的事)
- 不要生其他場景(育幼院 / pub 等都 v0.2+ 才做)
- 不要動 src / package.json
