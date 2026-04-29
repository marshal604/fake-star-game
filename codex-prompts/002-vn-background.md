# Codex Prompt 002 — 生 VN 模式辦公室背景

STATUS: done
SKILL: `$generate2dmap`(visual_model=baked_raster)
依賴:無
產出:`public/backgrounds/office.png`(1920×1080, opaque PNG, < 1.5 MB)

---

## Context(只讀)

- `GDD.md` §4「場景」、§7.1「VN 模式美術風格」
- `~/.codex/skills/generate2dmap/SKILL.md`(完全照它的 baked_raster pipeline)
- `references/office-ref.png`(本機 reference 圖,先 view_image 載入)

## 任務

依 `agent-sprite-forge` 的 `$generate2dmap` 慣用法生一張 visual novel 模式用的**單張靜態辦公室背景插畫**。**用 skill 內建 pipeline,不要自組工序**。

### 給 $generate2dmap 的請求

```
view_image references/office-ref.png

Use $generate2dmap to create a baked_raster visual novel background of a small
newly-established Taiwanese talent agency office, just being set up.

map_kind: town (single-screen office interior)
visual_model: baked_raster
art_style: clean_hd (NOT pixel art)
visual_asset_source: image_gen
collision_model: none (VN background, no gameplay collision)
runtime_object_model: none
output_format: PNG only
size: 1920x1080 (horizontal, opaque)

Style anchor: late-1990s ~ 2000s Taiwanese / Japanese PC galgame background,
clean hand-painted HD, warm color palette, soft natural daylight from a window,
NOT photorealistic, NOT AI-painterly oil look.

Composition: eye-level interior view from inside the room. Wooden desk in
mid-foreground, office chair, bookshelf along the wall, a door at frame-right,
a window with daytime soft light at frame-left, papers and a phone on the desk,
warm wooden floor.

Important readability constraints (the game overlays UI on top):
- Lower 1/3 must be visually clean (dialogue box covers it).
- Mid horizontal band (30%~70% height) must NOT be cluttered with detail
  (character portrait will overlay there).
- No watermarks, no signatures, no text artifacts, no characters in scene.

Reference: references/office-ref.png — use as composition + mood reference, not
1:1 reproduction. The art style is what matters.

Output: public/backgrounds/office.png, 1920x1080, opaque PNG, < 1.5 MB.
```

## 嚴格要求

- 1920×1080,opaque(不是 transparent)
- 下緣 1/3 視覺乾淨(對話框會疊)
- 中段水平帶不過度 detail(立繪會疊)
- 不要人物、不要 watermark / signature / typo
- 檔案 < 1.5 MB(超過用 Pillow 重存 quality~85)

## 完成後

1. `ls -lh public/backgrounds/office.png` 確認
2. 用 Pillow 驗證 size == (1920, 1080)
3. JOURNAL.md append schema 完整 entry
4. `STATUS: pending` → `STATUS: done`
5. `git add public/backgrounds codex-prompts/002-vn-background.md JOURNAL.md && git commit -m "feat(bg): generate VN office background [prompt:002]"`
6. 不要 push

## 不要做

- 不要自組 image_gen 工序 — skill 已有
- 不要生 tilemap(004 才做)
- 不要生其他場景(育幼院 / pub 等 v0.2+)
- 不要動 src
