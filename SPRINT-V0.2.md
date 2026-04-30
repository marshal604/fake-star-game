# SPRINT v0.2 — 蘇嫚君全劇情資產 + Layered Migration + UI Polish

最後更新:Claude,2026-05-01

## 目標

把蘇嫚君全線劇情(GDD §5.1~§5.6)需要的**地圖 / 對白 / 表情 / CG**全部準備好,並把 office 從 baked_raster 遷移到 layered_raster pipeline(per 用戶 directive 「所有場景都要 layered_raster」)。

每 phase 由 Claude 寫精確 prompt(input + spec + acceptance + output schema),Codex 透過 cx 執行,Claude 用 Pillow / chrome MCP / git diff 量化 verify 才放行。

---

## Phase 1 — Foundation(本 sprint 立刻啟動)

### 023 — Office migrate baked → layered_raster

**Input**:
- 既有 `public/maps/office-tilemap.png`(baked 整圖)當風格 reference
- GDD §6.1 layered_raster pipeline schema

**Spec**:
- 跑 `$generate2dmap layered_raster` pipeline
  1. base map(ground+walls only)→ `public/maps/office-base.png`(448×320,no objects)
  2. dressed reference(skill 內部用)
  3. prop_pack 3×3 透明 props → `public/props/office/{desk,chair,bookshelf,door,phone,paper,rug,plant,lamp}.png`
- `src/core/types.ts` `TilemapData` 加 `props?: Array<{id, url, x, y, z?, collision?}>`
- `src/content/maps/office.json` schema 改:加 `props` 列表 + 各 prop 的 (x, y) 跟 collision bbox
- `src/components/Tilemap/TilemapScene.tsx` render 邏輯升級:有 `props` 就 layered render(base img + 各 prop absolute 定位 + y-sort with player/npc)
- 廢檔:`public/maps/office-tilemap.png`(baked 版,記得 git rm)

**Acceptance**:
- office-base.png 1024 × 320(no per-tile borders, continuous wood floor + walls)
- 9 個 prop transparent PNG,各自獨立 walkable
- office.json `props` 列表 ≥ 6 個 prop(desk, chair, bookshelf, door, phone, paper 至少)
- door 的 prop.collision bbox 對齊既有 trigger (10, 2) 的位置
- pnpm typecheck + build pass
- chrome 實測:從 spawn 走到門 trigger 仍會觸發 sign-suman

**Output(JOURNAL Verified output schema)**:
- base 圖 size + 描述
- prop list:每個 prop id / url / size / 位置
- collision matrix vs prop placement consistency check
- typecheck/build/dev-server 結果

### 024 — Dialogue box 改 downward growth

**Input**:
- 既有 `src/components/Dialogue/DialogueView.tsx` 第 80 行 `<div className="absolute bottom-0 ...">` 對話框 wrapper
- 既有 `src/components/Dialogue/DialogueBox.tsx`(button + padding + text)

**Spec**:
- 對話框 wrapper 從 `bottom-0` anchored 改成 **top-aligned**(top 接立繪 bottom)
- 對話框 height auto,文字越長 box 往**下**長(不再往上長)
- 對話框 top 跟立繪 bottom 直接接著(無 gap)— 立繪 bottom 在 viewport 約 18%(per prompt 022 設定)→ 對話框 top 同位置
- 對話框 max-height ≈ 22vh(超過就 overflow-y: auto,但實際對白短不會觸發)

**Acceptance**:
- chrome 實測:portrait bottom edge 到 dialogue box top edge 的 gap < 5px
- 文字增加時 box bottom 往下伸展(box top 不動)
- 短對白(1-2 行)時 box 緊貼立繪
- 長對白(4 行+)時 box 不會把立繪往上推
- pnpm typecheck pass

**Output**:
- DialogueView.tsx + DialogueBox.tsx diff
- chrome 量 portrait/box bbox + gap

---

## Phase 2 — 表情立繪 (v0.3 育幼院線開始用)

### 025 — Suman 表情立繪 ×4 + Protagonist ×2 + Chenyifu ×3

**Input**:
- 既有 `public/portraits/{suman,protagonist,chenyifu}-normal.png` 當 identity + style reference
- 各角色的「情境」描述(下方 spec)

**Spec(每個表情一張 1024×1536 RGBA clean_hd)**:

| 角色 | 表情 ID | 情境 | 視覺特徵 |
|---|---|---|---|
| suman | shy | 害羞、被告白、緋聞 | 雙頰紅、低頭、手摸臉頰、眼神閃避 |
| suman | happy | 簽約成功、育幼院贏 | 大笑、開心眼、舉手或握拳 |
| suman | sad | 沮喪、裝病、離開演藝圈 | 低頭、眉毛下垂、眼神黯淡 |
| suman | cry | 育幼院賣掉、分手 | 流淚、用手擦眼、眉頭緊蹙 |
| protagonist | serious | 重要決策、衝突 | 皺眉、嚴肅 |
| protagonist | smile | 感情結局、簽約 | 微笑、放鬆 |
| chenyifu | shy | 對蘇嫚君告白前 | 臉紅、別過頭 |
| chenyifu | happy | 告白成功、合作 | 燦爛笑容 |
| chenyifu | jealous | 蘇嫚君跟主角接近 | 皺眉、抿嘴、眼神低垂 |

每張嚴格保持 character identity(髮色 / 衣服 / 配件跟 normal 立繪一致)。

**Acceptance**(per 張):
- 1024×1536 RGBA
- alpha=0+255 binary or alpha histogram halo < 5%
- opaque near-white < 5000(同 021 標準)
- edge near-white < 200
- view_image 後表情符合情境描述

**Output**:
- 每張 alpha histogram + near-white counts
- view_image 描述

---

## Phase 3 — 場景 (v0.3+ 各線)

每個場景流程一致:`$generate2dmap layered_raster`:
1. base map(ground+walls only)
2. prop pack(3×3 transparent)
3. JSON metadata(prop placement + collision + triggers + spawns)

| Prompt | 場景 ID | 名稱 | 關鍵 prop | 用於哪些事件 |
|---|---|---|---|---|
| 026 | orphanage | 育幼院 | 床 / 玩具 / 黑板 / 椅子 / 聖誕樹(可選 prop) | E101~E111 |
| 027 | obo | 歐堡娛樂城 | 電扶梯 / 招牌 / 椅子 / 商店 | E201, E1xx scene |
| 028 | pub | 19 號酒館 | 吧檯 / 桌椅 / 杯子 / 燈 | E2xx 緋聞放料 |
| 029 | set | 永振片場 | 攝影機 / 燈架 / 道具 / 椅子(導演椅) | E2xx 拍戲探班 |

每個場景 acceptance:
- base.png 448×320 RGBA, continuous floor
- prop pack 9 個 transparent PNG
- JSON valid + collision consistent + spawn 在可走 tile

---

## Phase 4 — EventGraph 擴充

每條線一個 prompt,參考 GDD §5 + `references/suman-events-source.md`(原作攻略),由 Claude 寫對白 spec,Codex 翻成 EventGraph TypeScript。

| Prompt | 線 | 事件範圍 | 場景需求 | flag 變化 |
|---|---|---|---|---|
| 030 | 育幼院 | E101~E111 | office, orphanage | orphanage_visited / suman_friend |
| 031 | 郝友乾 | E201~E205 | office, pub, set | gakuyukan_news / golf_photo |
| 032 | 陳奕夫 | E301~E306 | office, set | chenyifu_signed / chenyifu_confessed |
| 033 | 王瑞恩 | E401~E404 | office, set | wang_film / wang_news |
| 034 | 結局判斷 | endings | n/a | flag aggregation → 4 endings |

對白由 Claude 自己寫(不發包給 image_gen);Codex 純翻譯成 TS code。

每線 acceptance:
- EventGraph 所有 next 都 valid(boot-time validator pass)
- start node 存在
- 從 office trigger 跑 → 走完線 → end node
- typecheck pass

---

## Phase 5 — CG 圖 (重要劇情點插畫)

| Prompt | CG | 觸發點 | 風格 |
|---|---|---|---|
| 035 | 育幼院大掃除 | E107 | clean_hd full-scene 1920×1080,有主角 + 蘇嫚君 + 小孩 |
| 036 | 聖誕節晚會 | E109 | 夜景 + 聖誕樹 + 角色合影 |
| 037 | 釣魚 | E2xx | 河邊夕陽 + 兩人坐釣 |
| 038 | 情人節巧克力 | E110/E111 | 蘇嫚君遞巧克力 + 主角接過 |
| 039 | 主角 ending kiss | ending_protagonist | 婚禮場景 |
| 040 | 蘇陳結婚 | ending_chenyifu | 兩人結婚畫面 |

每張 1920×1080 opaque PNG,acceptance 簡單(視覺 + 大小 + 檔案 < 1.5 MB)。

---

## Phase 6 — Polish (v1.0 demo)

| Prompt | 內容 |
|---|---|
| 041 | 行程系統雛形(week / 自由活動 / 跟隨 / 出國) |
| 042 | 屬性系統雛形(演技 / 儀態 / 才智 / 自信 / 名氣) |
| 043 | 存檔(Dexie + IndexedDB) |
| 044 | 整體 polish + 錄 GIF + tag v1.0 |

---

## 執行順序 / Dependencies

```
Phase 1: 023 (office migrate) + 024 (dialogue) — 立刻
        ↓
Phase 2: 025 表情立繪 — 029 育幼院線會用
        ↓
Phase 3: 026~029 場景(layered) — 各線會用
        ↓
Phase 4: 030~034 EventGraph
        ↓
Phase 5: 035~040 CG
        ↓
Phase 6: 041~044 系統 + polish
```

每 phase 完成 commit + push,Claude 用 chrome MCP / Pillow review 才放行下個。

## 用戶介入時機

- 各 phase 結束後,Claude push commit。用戶任意時點玩 demo / review。
- 中途遇到 BLOCKER(spec 衝突 / image_gen retry 3 次都不過 / typecheck fail 無法修),Claude 停下找用戶。
- 否則 Claude 自動 sequential 走完所有 phase。
