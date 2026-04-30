# Codex Prompt 025 — 表情立繪 9 張(suman ×4, protagonist ×2, chenyifu ×3)

STATUS: done
SKILL: `$generate2dsprite` + Pillow + view_image
依賴:021 完成(suman normal portrait clean baseline)
產出:
- `public/portraits/suman-{shy,happy,sad,cry}.png`
- `public/portraits/protagonist-{serious,smile}.png`
- `public/portraits/chenyifu-{shy,happy,jealous}.png`

不動:現有 `*-normal.png` 三張 / sprite / map / React

---

## Why

GDD §3 角色表情需求:後續事件(育幼院 / 緋聞 / 告白 / 結局)會切換表情。每個表情一張獨立 portrait,VnScene 接 EventNode `emotion` 欄位 resolve 對應檔。

## 風格 anchor

每張立繪:
- 1024×1536 RGBA
- art_style: clean_hd(VN HD 動畫風,**NOT retro_pixel**)
- 跟既有 `{character}-normal.png` 同畫風 / 同身份(髮色 / 衣服 / 配件)
- 透明背景(預期 alpha histogram binary 0/255)

## Task A — 對 9 張各跑一次 $generate2dsprite single character

逐張處理(別平行),每張流程:

1. `view_image public/portraits/{character}-normal.png` 載入 character identity reference
2. 跑 `$generate2dsprite`:

```
asset_type: character
action: single
bundle: single_asset
view: side
sheet: 1x1
art_style: clean_hd
anchor: center
margin: safe
size: 1024x1536

CRITICAL: art_style MUST be clean_hd. NOT retro_pixel.
Match the character identity from the loaded VN portrait above —
SAME hair color, SAME outfit, SAME accessories, SAME body proportions.
Only the EXPRESSION changes.

Magenta #FF00FF background; skill chroma-key handles transparency
including enclosed regions.
```

每張的「expression spec」:

| 角色 | 表情 ID | 視覺 spec |
|---|---|---|
| suman | shy | 雙頰泛紅、低頭、雙手摸臉頰、眼神往下右閃避、嘴小抿;**身份保留:紫紅辮子 + 紅 sleeveless + 牛仔 + 黑框眼鏡** |
| suman | happy | 大笑、眼睛彎曲開心、舉右拳到胸前;同身份 |
| suman | sad | 低頭、眉毛下垂、眼神黯淡、嘴抿;同身份 |
| suman | cry | 流淚、用手背擦眼、眉頭緊蹙、嘴開微哭;同身份 |
| protagonist | serious | 皺眉、嚴肅表情、嘴抿、肩膀微傾;**身份:藍髮 spiky + 灰西裝 + 藍白條紋領帶** |
| protagonist | smile | 微笑、眼神溫和;同身份 |
| chenyifu | shy | 臉紅、別過頭、抓後頸尷尬;**身份:棕色 afro + 淺藍 hoodie + 紅 t-shirt** |
| chenyifu | happy | 燦爛笑容、舉手或比讚;同身份 |
| chenyifu | jealous | 皺眉、抿嘴、眼神低垂側看;同身份 |

3. 生完每張立刻 Pillow verify:
   - mode='RGBA' size=(1024, 1536) 
   - opaque near-white < 5000
   - edge near-white < 200
   - alpha 1..254 halo < 5%

不過就重生(該張最多 retry 2 次)。3 次都不過 → STATUS=blocked + JOURNAL 記具體哪張。

## Acceptance(整體)

- 9 張 PNG 都在對應路徑
- 每張 acceptance 全 pass
- 透過 view_image 確認表情符合 spec(由 codex 自評)

## Verified output 必填

JOURNAL `Verified output:` 段:

| 角色 | emotion | size | opaque_near_white | edge_near_white | retry count | view_image 自評(表情視覺對 spec) |

(9 列表)

## 完成後

1. JOURNAL.md append entry
2. codex-prompts/025-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 `*-normal.png` 既有 3 張(只新增,不蓋)
- 不要動 sprite / map / React
- 不要 inline retro_pixel 路線
- 不要混入 NPC walking sprite 的 row 順序需求(這是 single asset)
