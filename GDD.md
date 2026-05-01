# Fake Star Game — GDD

## 1. 設計目標

- 重現《明星志願 3》蘇嫚君這條我最熟的劇情線,把它變成**自己版本**(可以微調台詞、結局)
- 玩法核心:**像素地圖探索 + visual novel 對話**雙模式
  - 探索模式:tile-based 地圖,主角 pixel sprite 4 方向走動,接近觸發點(NPC / 物件 / 門)時可互動
  - 對話模式:走進事件後切到 visual novel UI(立繪 + 對話框 + 選項),沿用 badminton-story 的 Dialogue 風格
  - 對話結束 → 回探索模式,旗標已 commit
- 不做模擬經營(行程表、屬性點數)那一塊
- v0.1 雛形只做最短的「簽約」入口,但事件樹(下面 §5)要先把蘇嫚君全線的事件都列出來,確保架構撐得住

## 2. 世界觀與時間線

承襲原作:玩家是新成立的小型經紀公司「鉅子娛樂」(暫名)的經紀人。蘇嫚君上門應徵 → 簽下她 → 帶她進演藝圈。

時間線(後期參考):
- 第一年:簽約、出道、首次合作
- 第二年:育幼院事件展開、緋聞開始
- 第三年:感情結局(主角線 / 陳奕夫線 / 解約回育幼院線)

v0.1 只覆蓋「第一年 第一週 第一天」。

## 3. 角色

每個角色有兩種美術資產:
- **VN 半身立繪**(transparent PNG, ~1024x1536):用於對話模式
- **Pixel sprite sheet**(4 方向 × 4 frames,32x48 px per frame):用於地圖模式

| ID | 顯示名 | 角色 | 參照圖 | v0.1 需要 | v0.2+ 需要 |
|---|---|---|---|---|---|
| `protagonist` | 主角(玩家) | 經紀人 | `主角/參照圖.png` | 半身立繪 ×1 + pixel sprite sheet | 表情立繪數張 |
| `suman` | 蘇嫚君 | 旗下藝人 / 戀愛對象 | `蘇曼君/參照圖.png` | 半身立繪 ×1 + pixel sprite sheet | 害羞 / 生氣 / 哭 / 制服 / 護士裝 |
| `chenyifu` | 陳奕夫 | 旗下藝人 / 蘇嫚君青梅竹馬 | `陳奕夫/參照圖.jpeg` | 半身立繪 ×1(不出場,先預備)+ pixel sprite sheet | 表情立繪數張 |

## 4. 場景

每個場景同樣有兩種資產:
- **像素 tilemap**(俯視 / 斜 45 度,寬 20 tiles × 高 15 tiles,每 tile 32px):探索模式用
- **VN 背景圖**(1920x1080 橫幅插畫):對話模式用(風格更近原作明星志願 3 動畫感)

| ID | 名稱 | 用途 | 參照圖 | v0.1 |
|---|---|---|---|---|
| `office` | 鉅子娛樂辦公室 | 主場景,大部分對話發生地 | `地圖/辦公室參照圖.png` | tilemap + VN bg |
| `orphanage`(v0.2+) | 育幼院 | 育幼院線、聖誕節活動 | 待生 | — |
| `obo`(v0.2+) | 歐堡娛樂城 | 簽約事件、約會 | 待生 | — |
| `pub`(v0.2+) | 19 號酒館 | 找記者放新聞 | 待生 | — |
| `set`(v0.2+) | 永振片場 | 拍戲探班 | 待生 | — |

### 4.1 辦公室(v0.1)tilemap 設計

```
+--------------------+
| W W W W W W W W W W|         W = 牆
| W . . . . . . . D W|         D = 門(觸發點)
| W . T T T . . . . W|         T = 桌子(碰撞)
| W . T T T . . . . W|         C = 椅子
| W . . C . . . . . W|         . = 可走 floor
| W . . . . . . . S W|         S = 主角起始點
| W . . . . . . . . W|         B = 書櫃
| W . B B . . . . . W|
| W . B B . . . . . W|
| W W W W W W W W W W|
+--------------------+
```

20×15 太大,雛形先壓 14×10 即可。Codex 實作時用 JSON 描述 tilemap(`src/content/maps/office.json`),tile id 對應 `tileset.png` 的格子。

### 4.2 觸發點 / Interactables

| ID | 位置 | 行為 |
|---|---|---|
| `office.door` | (8, 1) | v0.1 開場有敲門聲提示;玩家走到門前任一可走 tile,自動觸發 `[E001]` 起始流程 |
| `office.desk`(v0.2+) | 桌子周圍 | 互動可看當週信件 |
| `office.exit`(v0.2+) | 門 | 簽約後重新走進門可離開到城市地圖 |

## 5. 事件樹(整條蘇嫚君線)

底下符號:
- `[E#]` = 事件 ID,實作時對應一個 ink knot 或 state-machine node
- `* (条件)` = 觸發條件
- `→ {flagX}` = 設置旗標
- `→ S#` = 跳到事件
- v0.1 只實作 `[E001]` ~ `[E003]`,標 ★

### 5.1 簽約篇

```
★ [E001] 開場                          (start of game)
   └─ 旁白介紹背景:鉅子娛樂剛成立
   └─ 敲門聲
   └─ → [E002]

★ [E002] 選擇開門
   ├─ 選項 A: 去開門          → {door_opened=true} → [E003]
   └─ 選項 B: 不開門          → 結束(顯示「故事還沒開始就結束了」, v0.1 fallback)

★ [E003] 蘇嫚君上門應徵
   └─ 蘇嫚君立繪登場 + 自我介紹台詞
   └─ 選項:
      ├─ 直接簽約 (signed=true)        → [E004 v0.1 終點: 顯示「蘇嫚君加入旗下」]
      └─ 再考慮 (v0.1 暫不實作後續, 顯示「事件待續」)

  [E010] 陳奕夫介紹蘇嫚君   (v0.2+, * 旗下無蘇嫚君 + 陳奕夫已加入 + 第一年Y1Q4前)
  [E011] 再次邀約 / 再談簽約 (v0.2+)
```

### 5.2 育幼院線(v0.3)

```
[E101] 第一次請假去育幼院 (* Y2 Jun~Jul)
[E102] 第二次請假
[E103] 蘇嫚君消失了一天   (* Y2 Aug~Sep, auto)
[E104] 蘇嫚君道歉
[E105] 商量育幼院的事
[E106] 大掃除請假
[E107] 大掃除場景        (* 12/24 前到育幼院地圖點)
[E108] 聖誕節活動邀請
[E109] 聖誕聚會場景      (* 12/24)
[E110] 情人節幫忙        (* Y3 ~2/14)
[E111] 情人節巧克力
```

### 5.3 郝友乾線(v0.4)

```
[E201] 出道後送花
[E202] 緋聞新聞
[E203] 緋聞詢問
[E204] 高爾夫照片事件 → 花錢/不花錢分支
[E205] 攀權附貴新聞
```

### 5.4 陳奕夫線(v0.5)

```
[E301] 青梅竹馬詢問
[E302] 緋聞
[E303] 鼓勵小夫告白
[E304] 告白成功
[E305] 不被看好的情侶
[E306] 蘇嫚君沮喪 → 分手選擇
```

### 5.5 王瑞恩線(v0.6)

```
[E401] 接王瑞恩電影 → 緊張
[E402] 拍攝期野貓事件
[E403] 鼓勵 → 看電影
[E404] 緋聞放料
```

### 5.6 結局判斷(v1.0)

讀取所有 flag,進入下面其中一個:
- `ending_protagonist` (與主角結局,需要 friendship>200 + 育幼院線 + 釣魚線 + 賺錢>5000萬)
- `ending_chenyifu` (蘇嫚君 × 陳奕夫)
- `ending_resign`   (退出演藝圈回育幼院)
- `ending_default`  (普通結束)

## 6. 系統設計

### 6.0 模式切換(GameMode)

```ts
type GameMode =
  | { kind: 'tilemap'; mapId: string }
  | { kind: 'vn'; eventId: string; nodeId: string }
  | { kind: 'end'; reason: string };
```

頂層元件根據 `GameMode` 決定 render `TilemapScene` 或 `VnScene`。模式切換靠事件 trigger:

- `tilemap` → `vn`:玩家走到 trigger tile 或按互動鍵時,呼叫 `enterEvent(eventId)`
- `vn` → `tilemap`:事件 graph 走到 `{ type: 'returnToMap'; mapId, x, y }` node
- `vn` / `tilemap` → `end`:事件 graph 走到 `{ type: 'end' }` node

### 6.1 Tilemap 系統(v0.1 baked_raster / v0.2+ layered_raster)

#### v0.1 現況(baked_raster)

`office` 場景用 `$generate2dmap baked_raster` pipeline 生整張 448×320 圖(`public/maps/office-tilemap.png`),React 用一個 `<img>` 鋪滿 stage。

**問題**:image_gen 內部物件位置自由發揮,不嚴格對齊 14×10 grid。collision 跟 trigger 要 Pillow 量圖手動 align(prompt 022 已做過一次)。新增物件 / 改動牆位都要重生整張 + 重 align。

#### v0.2+ 後續場景(layered_raster — 官方推薦)

從 `育幼院 / pub / 片場 / 歐堡 ...` 起,所有新場景用 `$generate2dmap layered_raster` pipeline:

1. **Base map**:整片 ground only(地板 + 牆,沒物件)— `public/maps/<scene>-base.png`
2. **Dressed reference**(planning only):skill 內部用,不 commit
3. **Prop pack**:各物件獨立 transparent PNG — `public/props/<scene>/<prop>.png`(桌、椅、書櫃、門、燈、盆栽 etc)
4. **Placement metadata**:每個 prop 在 map 上的 (x, y, layer) 寫進 `<scene>.json`
5. **Collision**:從 prop bbox 自動推導 + 手動補強(門洞、窄通道)

#### Schema(v0.2 起 TilemapData 擴充)

```ts
export interface TilemapData {
  id: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  baseUrl: string;                  // 必填(layered 的 ground)
  props?: Array<{
    id: string;                     // 'desk-1', 'door-main', etc
    url: string;                    // /props/office/desk.png
    x: number;                      // 左上角 in tile coords
    y: number;
    z?: number;                     // y-sort hint;不填用 y
    collision?: { x: number; y: number; w: number; h: number };  // tile bbox
  }>;
  collision: boolean[][];           // 仍保留,base 牆 + prop collision 合併
  triggers: Array<{ id: string; x: number; y: number; eventId: string; autoFire?: boolean }>;
  spawns: { player: { x: number; y: number; facing: Facing } };

  // legacy v0.1 baked_raster fields (optional, only office uses these)
  tilesetUrl?: string;
  tilesetCols?: number;
  tilesetRows?: number;
  layers?: { ground: number[][]; objects: number[][] };
}
```

#### Render 規則(v0.2+)

`TilemapScene.tsx` 偵測:
- 有 `props` 欄位 → layered_raster mode:
  1. render `<img src={baseUrl}>` 鋪滿 stage(z-0)
  2. render 每個 prop `<img src={prop.url} style={{ position: absolute, left: prop.x*tileSize, top: prop.y*tileSize, zIndex: prop.z ?? prop.y }}>`(y-sort)
  3. render player + npc sprite(z-sort 跟 props 混排,角色站 prop 後面被擋)
- 沒 `props` 欄位 → fallback baked_raster(office 走這條,維持目前行為)

#### 何時 prop / 何時 base(2026-05-01 加,設計準則)

決定一個物件要當 **獨立 prop**(transparent PNG + JSON 寫位置)還是 **直接畫進 base**:

| 物件類型 | 必須 prop | 可放 base |
|---|---|---|
| 高度 > 1 tile 的障礙物(會擋住角色身體) | ✅ z-sort 需要 | ❌ |
| 可對話 / 互動 / trigger 的物件(門 / NPC / 信箱) | ✅ trigger 邏輯需要 | ❌ |
| 角色可走到「物後方」的物件(角色被擋一部分) | ✅ z-sort 需要 | ❌ |
| 高度 = 1 tile 的平面障礙(腳墊、單格高木箱、地板凸起) | ❌ | ✅ collision=true 即可,視覺看不出 z-sort 問題 |
| 純裝飾物(地毯、地板花紋、牆面掛飾) | ❌ | ✅ |
| 桌上 / 架上 配件(電話、紙、咖啡杯、檯燈、書本) | ❌ — **畫進那張桌子 / 書櫃 prop 內**(prop 圖檔本身已含這些) | ✅ 或讓 base 表現 |
| 散落小物件(紙屑、coupon、零錢、餅乾屑) | ❌ | ✅ 畫進 base 地板 |

簡單口訣:
- 高 + 會擋人 → prop
- 可互動 → prop
- 平的 / 純裝飾 / 配件 → 畫進 base 或 prop 本體

實作上每個場景的 prop 數量應該很少(office 4-5 個:桌椅櫃門、可能加盆栽),不該超過 8 個。

#### 構圖美感(2026-05-01 加)

image_gen 對 base map 構圖容易擺得「散」(物件平均分佈、無焦點)。寫 prompt 時要明確指定**典型現實佈局**,例如:
- 辦公室:桌子靠左壁 + L 型 / 椅子可推進 / 書櫃靠右壁 / 地毯置中(讓出走道)
- 育幼院:床貼牆排列 / 玩具集中在一角 / 學習桌靠中央 / 聖誕樹放角落
- 酒館:吧檯靠長牆 / 撞球桌中央 / 卡座靠對牆 / 點唱機 + 飛鏢盤在側

讓 image_gen 有個「真實樣板」可學,而不是「在 14×10 格子裡平均分散物件」。

#### Migration 決策(office 是否 retroactive)

兩條路:
- **A. forward-only**(推薦):office 維持 baked_raster(已 work),v0.2 新場景全走 layered。每個 layered 場景的 prompt 直接生 base + prop pack + JSON 一次到位。
- **B. retroactive**(office 也轉 layered):重生 office-base.png + 拆出 desk/chair/bookshelf/door 個別 prop,改 office.json schema,重做 collision align。風險高,但 codebase 統一。

**現定 A**(forward-only)。office 是「已知能跑的 baseline」,動它 risk 大。新場景的 layered 寫法成熟後,如果有需要再回頭遷 office。

碰撞:`collision` 2D array `true` = 不可走。layered_raster mode 下,collision 由 base 牆(prompt 強調 base 圖只畫地板,牆位置寫進 collision)+ 各 prop 的 collision bbox 合併計算。

觸發:`triggers` 列表 `{ x, y, eventId, autoFire?: boolean }` 不變。

### 6.2 事件引擎(v0.1: 手寫 state machine)

v0.1 用最樸素的 state-machine,放在 `src/content/events/sign-suman.ts`:

```ts
type EventNode =
  | { type: 'narration'; text: string; next: string }
  | { type: 'dialogue'; speaker: SpeakerId; emotion?: string; text: string; next: string }
  | { type: 'choice'; prompt?: string; options: Array<{ label: string; next: string; setFlags?: Record<string, boolean | number | string> }> }
  | { type: 'spawnNpc'; npcId: string; mapId: string; x: number; y: number; next: string }
  | { type: 'walkNpcTo'; npcId: string; x: number; y: number; next: string }
  | { type: 'returnToMap'; mapId: string; x: number; y: number }
  | { type: 'end'; reason: string };

type EventGraph = Record<string /* node id */, EventNode>;
```

`spawnNpc` / `walkNpcTo` 是混合模式的關鍵:某些 cinematic 段落(如蘇嫚君從門口走進來),引擎暫時把模式切回 tilemap、執行 NPC 移動、結束後再切回 vn 繼續對話。**v0.1 簡化處理**:`spawnNpc`/`walkNpcTo` 視為 noop + 短暫黑幕,不真的播 NPC 走進來的動畫,留 v0.2 再做。

執行器(`src/core/runtime.ts`)拿 graph + 當前 node id + flag store,推進到下一個 node。

v0.2+ 改成 inkjs,用 `.ink` 檔寫腳本,`runtime.ts` 變成 ink wrapper。屆時 `EventGraph` 只當 fallback / 測試。

### 6.3 Flag store(Zustand)

```ts
interface GameState {
  flags: Record<string, boolean | number | string>;
  currentNodeId: string;
  currentScene: string;
  setFlag(key: string, value: boolean | number | string): void;
  goTo(nodeId: string): void;
}
```

旗標例:`door_opened`、`signed_suman`、`signed_chenyifu`、`orphanage_visited`、`gakuyukan_news`...

GameState 也保留地圖位置:

```ts
interface GameState {
  flags: Record<string, boolean | number | string>;
  mode: GameMode;
  player: { mapId: string; x: number; y: number; facing: 'up' | 'down' | 'left' | 'right' };
  npcs: Record<string, { mapId: string; x: number; y: number; facing: 'up' | 'down' | 'left' | 'right' }>;
  setFlag(key: string, value: boolean | number | string): void;
  enterEvent(eventId: string): void;
  exitToMap(mapId: string, x: number, y: number): void;
}
```

### 6.4 對話 UI

直接用 `badminton-story/src/components/Dialogue/` 五個元件,**先整包複製**過來,後面再針對劇情/風格做樣式調整(蘇嫚君的色票會比羽球的木色暖)。差異:

- `Background` 的 `LOCATION_STYLES` 改用本作場景(`office`、`orphanage`、`obo`...)
- `CharacterPortrait` 邏輯不動,改餵 `imageUrl={getPortrait(speakerId, emotion)}`
- 其他元件原樣使用

## 7. 美術風格指引(給 Codex 的 anchor)

兩套美術並存,各自有風格定位:

### 7.1 VN 模式(立繪 + 背景)

- 整體調性:90 年代末 ~ 2000 年代初台/日 PC galgame 風格,參考明星志願 3 原作美術
- 色調:暖色系、柔和、有漫畫感的 cell shading;不要寫實 AI 油畫感
- 立繪格式:transparent PNG,半身 ~ 全身,1024x1536 左右,背景純透明
- 場景格式:1920x1080,横式,人物站在中下方時不會擋到關鍵元素
- **三張角色立繪要看起來像同一個畫家畫的**(這是 codex 最容易翻車的地方,prompt 要強調)

### 7.2 Tilemap 模式(像素藝術)

- 整體調性:16-bit 復古 RPG 風格(類 SNES 時代),參考經典 RPG Maker 默認美術
- Tile size:32×32 px(雛形先用此尺寸,Codex 若覺得 16×16 更好可提案)
- Player / NPC sprite:32×48 px(一格寬、一格半高),4 方向 × 4 frames(停 + 3 步)
- 透視:俯視 45 度(top-down),不做 isometric
- 色票需與 VN 模式色相相近(暖色為主)以維持「同一遊戲」感,但飽和度可略高(像素風吃對比)
- Tileset 至少要有:floor(木地板 / 地毯)、wall、door、desk、chair、bookshelf

### 7.3 風格一致性檢查

切兩個模式時主角看起來必須是「同一個人」:髮色、衣服顏色、髮型輪廓要對得上。**Codex 跑 sprite-forge 時要把 VN 立繪先生好,再用 VN 立繪當 reference 去生 pixel sprite**,順序很重要。

## 8. UI / UX 細節

### Tilemap 模式
- 鍵盤:方向鍵 / WASD 移動,空白鍵或 E 互動
- 走路速度:每按一下走 1 tile(grid-based),帶 100ms 平滑插值
- 不顯示 HUD(v0.1 沒有屬性),畫面正中放 tilemap canvas,四周可留黑色 letterbox
- 觸碰式裝置:v0.1 不支援(雛形只測桌機)

### VN 模式
- 對話框:沿用 badminton-story 的設計(底部、半透明黑、打字機)
- 選項:出現在對話框下方,點選後立即推進
- 字級:base 16~18px,確保中文可讀
- 鍵盤:Enter 跳過打字機 / 推進、數字鍵選選項

### 模式切換
- v0.1 用最簡單的 fade(150ms 黑畫面),不做花俏轉場
- 切回 tilemap 時 player 站到事件指定的 (x, y) + facing

## 9. 內容檔案規劃

```
src/
  App.tsx
  main.tsx
  components/
    Dialogue/                   # 從 badminton-story 移植
      Background.tsx
      CharacterPortrait.tsx
      ChoiceList.tsx
      DialogueBox.tsx
      DialogueView.tsx
      useTypewriter.ts
      index.ts
    Tilemap/
      TilemapScene.tsx          # 主 canvas / grid
      PlayerSprite.tsx          # 主角 sprite + 鍵盤輸入
      NpcSprite.tsx             # NPC sprite
  core/
    runtime.ts                  # 事件 graph 推進器
    tilemap.ts                  # collision / trigger / pathfinding
    types.ts                    # GameMode / EventNode / GameState
  store/
    gameStore.ts                # Zustand store
  content/
    characters.ts               # 角色資料 + 立繪 / sprite 路徑對應
    scenes.ts                   # 場景資料 + 背景 / tilemap 路徑對應
    events/
      sign-suman.ts             # E001 ~ E003
      orphanage.ts              # E101 ~ E111  (v0.3+)
      gakuyukan.ts              # E201 ~ E205  (v0.4+)
      chenyifu.ts               # E301 ~ E306  (v0.5+)
      wangruien.ts              # E401 ~ E404  (v0.6+)
    maps/
      office.json               # tilemap 資料
public/
  portraits/                    # VN 半身立繪
    protagonist-normal.png
    suman-normal.png
    chenyifu-normal.png
  backgrounds/                  # VN 背景圖
    office.png
  sprites/                      # tilemap 像素 sprites
    protagonist.png             # 4 方向 × 4 frames sprite sheet
    suman.png
    chenyifu.png
  tilesets/
    office-tileset.png          # tile 圖集
references/                     # 不上 build,只給 codex 餵 prompt 用
  protagonist-ref.png           # = 主角/參照圖.png
  suman-ref.png                 # = 蘇曼君/參照圖.png
  chenyifu-ref.png              # = 陳奕夫/參照圖.jpeg
  office-ref.png                # = 地圖/辦公室參照圖.png
```

## 10. v0.1 demo 腳本(實際對白草稿)

```
[narration] 這裡是鉅子娛樂的辦公室。一切才剛剛起步——
            連辦公桌都還沒擺正,演藝圈的大門就已經在你眼前了。

[narration] 「叩叩叩——」

            門外傳來敲門聲。

[choice]
  A. 去開門          → {door_opened=true}
  B. 假裝不在        → end "故事還沒開始就結束了。"

[suman normal] 「不、不好意思——請問這裡是鉅子娛樂嗎?」
[suman normal] 「我看到報紙上說在徵藝人……我叫蘇嫚君,我想……我想試試看!」
[narration] 眼前的女孩有點手足無措,但眼睛很亮。

[choice]
  A. 直接簽約         → {signed_suman=true} → [end "蘇嫚君加入了旗下藝人。\n第一年的故事,從這裡開始。"]
  B. 再考慮一下       → end "(v0.1 demo 到此為止,後續事件待續)"
```

(以上對白都先放這,實作時直接從 GDD 抓進 `events/sign-suman.ts`)
