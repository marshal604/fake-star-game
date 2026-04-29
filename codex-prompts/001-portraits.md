# Codex Prompt 001 — 生 VN 模式半身立繪

STATUS: pending
SKILL: `$generate2dsprite`(來自 agent-sprite-forge)
依賴:無
產出:`public/portraits/protagonist-normal.png`、`public/portraits/suman-normal.png`、`public/portraits/chenyifu-normal.png`(三張 transparent PNG, 1024×1536)

---

## Context(只讀指明的章節)

- `GDD.md` §3「角色」、§7.1「VN 模式美術風格」、§7.3「風格一致性檢查」
- `~/.codex/skills/generate2dsprite/SKILL.md`(skill 的官方 workflow,**完全照它做,不要自創流程**)

## 任務

依照 `agent-sprite-forge` 的 `$generate2dsprite` 慣用法,生三張 VN 半身立繪。**用 skill 內建 pipeline,不要自己組 image_gen + chroma-key 流程**(skill 已經有完整管線,你只要用 natural language 下 prompt 就好)。

### Reference 圖(本機已備好)

```
references/protagonist-ref.png   男性經紀人,西裝,30 歲左右,沉穩
references/suman-ref.png          22 歲女性,長髮,天真迷糊,溫柔活潑
references/chenyifu-ref.jpeg      男性偶像,清爽帥氣,20 歲出頭
```

跑前先 `ls references/` 確認;缺檔寫 BLOCKER 停下。

### 給 $generate2dsprite 的 3 個請求(先 view_image reference 再下)

順序固定:**先 suman**(她是主軸,負責定型風格),再 protagonist、chenyifu — 後兩張的 prompt 都要叫 skill「match the previously generated portrait's line weight, shading, palette, and warmth」。

#### 1. Suman(anchor)

```
view_image references/suman-ref.png

Use $generate2dsprite to create a single character portrait for a 22-year-old
Taiwanese woman, long hair, gentle and slightly clumsy expression, calm neutral
mouth (closed), light pastel dress simplified for a visual novel half-body cut.

art_style: clean_hd
asset_type: character
action: single
bundle: single_asset
view: side
sheet: 1x1 (frames: 1)
anchor: center
margin: safe
size: 1024x1536 (vertical, half-body waist-up)

Style anchor: late-1990s ~ 2000s Taiwanese / Japanese PC galgame visual novel
portrait, cel-shaded anime illustration, soft warm color palette, clean line
art. NOT photorealistic. NOT AI-painterly oil look.

Composition: half-body (waist up), centered, head ~100px below the top edge,
character facing slightly toward the viewer.

Reference: use the previously loaded references/suman-ref.png to preserve hair
color, hairstyle silhouette, face proportions, and outfit color identity.

Output: public/portraits/suman-normal.png with proper alpha (RGBA), no magenta
fringe, hard alpha edges.
```

#### 2. Protagonist

```
view_image references/protagonist-ref.png

Use $generate2dsprite to create a single character portrait for a 30-year-old
Taiwanese male talent agent, business suit, calm sober expression, mouth closed,
slightly approachable.

art_style: clean_hd
asset_type: character
action: single
bundle: single_asset
view: side
sheet: 1x1 (frames: 1)
anchor: center
margin: safe
size: 1024x1536

Style anchor: same as the previously generated suman portrait — match line
weight, cel-shading style, palette warmth, and overall illustration tone so the
two characters look painted by the same artist.

Composition: half-body (waist up), centered.

Reference: references/protagonist-ref.png for face proportions, hairstyle, and
suit color.

Output: public/portraits/protagonist-normal.png, RGBA, hard alpha edges.
```

#### 3. Chenyifu

```
view_image references/chenyifu-ref.jpeg

Use $generate2dsprite to create a single character portrait for a 20-something
Taiwanese male idol, casual clean look, friendly neutral expression, mouth
closed.

art_style: clean_hd
asset_type: character
action: single
bundle: single_asset
view: side
sheet: 1x1 (frames: 1)
anchor: center
margin: safe
size: 1024x1536

Style anchor: same as the previously generated suman + protagonist portraits —
match line weight, cel-shading, palette, and warmth. The three characters must
look like one consistent illustration set.

Composition: half-body (waist up), centered.

Reference: references/chenyifu-ref.jpeg for face proportions, hairstyle, and
outfit color.

Output: public/portraits/chenyifu-normal.png, RGBA, hard alpha edges.
```

## 嚴格要求

- 三張串成一組生(同一 codex turn,維持 style 連續性);**先 suman 當 anchor**
- 三張看起來像同一個畫家畫的(line weight、cel-shading、palette、warmth 一致)
- 透明背景必須乾淨,**不能有 magenta fringe / 白邊 / halo**
- 1024×1536,RGBA mode,檔案 < 800 KB(大過就用 Pillow 重存 quality~85)
- 檔名嚴格按 spec(kebab-case)

## 完成後

1. `ls -lh public/portraits/`(確認三張就位 + 檔案大小)
2. 用 Pillow 驗證每張 `mode == 'RGBA'`,任一不是就重生那張
3. JOURNAL.md append 一段(按 schema):
   ```
   ## YYYY-MM-DD HH:mm — codex-prompt 001 portraits
   - **STATUS**: done
   - **Commits**: <hash>
   - **Files changed**:
     - + public/portraits/suman-normal.png
     - + public/portraits/protagonist-normal.png
     - + public/portraits/chenyifu-normal.png
   - **Self-check**:
     - All three RGBA: pass / fail
     - Style consistency self-eval: high / mid / low
     - Alpha edge cleanliness self-eval: high / mid / low
   - **Notes**: ...
   - **BLOCKER**: none
   - **Decisions made**: ...
   ```
4. `STATUS: pending` → `STATUS: done`(本檔頂端,只能改這一行)
5. `git add public/portraits codex-prompts/001-portraits.md JOURNAL.md && git commit -m "feat(portraits): generate VN portraits [prompt:001]"`
6. **不要 git push**(我會 push)

## 不要做

- 不要自己組 `image_gen` + `chroma-key` 工序 — `$generate2dsprite` skill 已內建,**用 natural language 下指令就好**
- 不要生其他角色 / 表情(只做 normal)
- 不要動 `src/`、`package.json`、其他 docs
- 不要 push
