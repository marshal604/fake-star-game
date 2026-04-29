# Codex Prompt 001 — 生 VN 模式半身立繪

STATUS: pending
SKILL: `generate2dsprite`(來自 agent-sprite-forge)
依賴:無
產出:`public/portraits/protagonist-normal.png`、`public/portraits/suman-normal.png`、`public/portraits/chenyifu-normal.png`

---

## Context(請先讀)

- `PRD.md` §3「玩家期望」、§5「技術棧」
- `GDD.md` §3「角色」、§7.1「VN 模式美術風格」、§7.3「風格一致性檢查」
- `COLLAB.md` §1「角色與權責」 — **你不可以改任何 .md 檔(JOURNAL.md 除外)**

## 任務

把三張參照圖轉成 visual novel 模式用的**半身正常表情立繪**,要求:

1. **transparent PNG**,1024 × 1536(直幅)
2. 半身(腰以上)構圖,人物置中,頭頂留約 100px 邊距
3. **三張立繪要看起來像同一個畫家畫的**:同樣的線稿粗細、同樣的 shading 風格、同樣的色彩飽和度
4. 風格 anchor:90s ~ 2000s 台/日 PC galgame、cell shading、暖色系、漫畫感(不要 AI 油畫感)
5. 表情:全部設為 normal / neutral(放鬆、輕微微笑)

## 輸入(reference 圖)

`references/` 目錄(已由 Claude 預先建好,**不上 git**,只在 local 有)應該包含:

| 角色 | reference 檔 | 角色描述(給 prompt 用) |
|---|---|---|
| protagonist | `references/protagonist-ref.png` | 男性經紀人,西裝打扮,30 歲左右,沉穩 |
| suman(蘇嫚君) | `references/suman-ref.png` | 22 歲女性,長髮,天真迷糊,溫柔活潑,白底套裝或淡色洋裝 |
| chenyifu(陳奕夫) | `references/chenyifu-ref.jpeg` | 男性偶像,清爽帥氣,20 歲出頭 |

> 跑 prompt 前先 `ls references/` 確認檔案存在;**若任一缺失,寫 BLOCKER 進 JOURNAL.md 並停下**(不要自己想辦法補)。
> 蘇嫚君是主軸角色,**她的立繪如果生不好,請優先重生這張**。

## 跑 generate2dsprite 時的關鍵 prompt 詞

每一張都加上:

```
Style: visual novel character portrait, late-1990s ~ 2000s Taiwanese / Japanese PC galgame aesthetic,
       cel-shaded anime illustration, soft warm color palette, clean line art, NOT photorealistic,
       NOT AI-painterly oil look.
Composition: half-body (waist up), centered, head ~100px below top edge, character facing slightly
             toward viewer, calm neutral expression, mouth closed.
Output: transparent background PNG, 1024 × 1536, hard alpha edges (no halos).
Consistency: match the line weight and shading style of the previous portraits in this batch.
```

並把對應 `references/{character}-ref.png` 當 reference image 餵進去。

## 嚴格要求

- 三張**串成一組生**(同一個 session,序列化執行,讓 sprite-forge 的 style 連續性生效),先生 suman 當 anchor,再生 protagonist 跟 chenyifu
- 透明背景必須乾淨,**不能有白邊或殘影**;若 alpha 不乾淨,用 Pillow 後處理(`alpha_threshold` ~ 8)
- 輸出檔名嚴格按上面規格,小寫、kebab-case、副檔名 `.png`

## 完成後

1. 把生好的圖放到 `public/portraits/`
2. 在 `JOURNAL.md` append 一段:
   ```markdown
   ## 2026-MM-DD — codex-prompt 001 portraits
   - [x] suman-normal.png  (備註: ...)
   - [x] protagonist-normal.png  (備註: ...)
   - [x] chenyifu-normal.png  (備註: ...)
   - 風格一致性自評: 高 / 中 / 低
   - 透明邊乾淨度: 高 / 中 / 低
   - BLOCKER:(若有,寫在這)
   - Commit: <hash>
   ```
3. 把本檔頂端的 `STATUS: pending` 改為 `STATUS: done`(這是少數 codex 可以動 codex-prompts/ 的例外,**只能改 STATUS 那一行**)
4. `git add public/portraits references && git commit -m "feat(portraits): generate VN portraits [prompt:001]"`

## 不要做

- 不要生其他角色 / 表情(只做 normal 表情,陳奕夫 v0.1 不出場但素材先備好)
- 不要動 `src/`、`package.json` 等
- 不要自己改 GDD / PRD / PLAN
- 不要 push 到 remote
