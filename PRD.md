# Fake Star Game — PRD

## 1. 一句話

一個以《明星志願 3》為題材、由 Claude Code + Codex 兩個 AI agent 協同開發的 web 遊戲(像素走路探索 + visual novel 對話),先做一個極小可玩雛形,驗證多 AI 協作流程跟 Codex 自帶圖像生成的實際產出品質。

## 1.1 AI 分工(鐵則)

| Agent | 角色 | 可做 | 不可做 |
|---|---|---|---|
| Claude Code | Planner + Reviewer | 寫 PRD/GDD/PLAN/COLLAB、拆 task、出 codex prompt、review codex 寫的 PR/diff、寫測試規格 | **不直接寫 production code**(scaffolding 也由 Codex 做,Claude 只在 plan 裡描述檔案結構) |
| Codex | Implementer + Asset generator | 寫所有 production code、跑 agent-sprite-forge 產立繪 / 場景 / sprite 動畫、跑 typecheck/test、推 commit | 不主動加超出 plan 的 feature(必要時回頭問 Claude) |

兩邊透過檔案系統交換:
- Claude 寫 `PLAN.md`、`codex-prompts/NNN-*.md`
- Codex 看到後實作,完成寫 `JOURNAL.md`(回報做了什麼)
- Claude 從 git diff + JOURNAL review

## 2. 為什麼做

- 想實際驗證 **Claude Code 當 planner、Codex 當 executor + 美術產生器** 的合作模式可不可行
- 想知道 `agent-sprite-forge` 跑出來的立繪 / 場景能不能直接拿來用,還是要大量人工 retouch
- 順便把《明星志願 3》蘇曼君這條最熟的劇情線重做成自己版本

這不是要做一款上架的遊戲,是個**流程驗證 + 樂趣 side project**。所以 scope 壓很小,但 architecture 要乾淨,後面要持續加事件。

## 3. 玩家(其實是自己)期望從雛形得到什麼

進到網頁後:

1. **像素地圖模式**:看到辦公室 tile map,主角 pixel sprite 站在地圖中央,可用方向鍵 / WASD 走動(4 方向 walking animation)
2. 走進場景中會聽到「叩叩叩」並彈出旁白 → 走到門口 tile 觸發互動 → 切到 visual novel 對話 UI
3. **VN 對話模式**:出現「去開門 / 不開門」選項
4. 選「去開門」→ 切回地圖,蘇嫚君的 pixel sprite 出現在門口,自動走進房間,停在主角前方 → 再切 VN 對話自我介紹
5. 出現「直接簽約 / 再考慮」選項
6. 選「直接簽約」→ 蘇嫚君加入旗下,顯示結束畫面

整個流程跑得通、像素美術風格一致、立繪/sprite/背景看起來像同一個遊戲、對話有打字機效果、選項可選 = 雛形成功。

## 4. Scope

### v0.1(本次雛形)— 必做

- React + Vite + TS + Tailwind 專案初始化(Codex 做)
- 移植 `badminton-story` 的 `Dialogue` 模組(`Background`、`CharacterPortrait`、`DialogueBox`、`ChoiceList`、`useTypewriter`)
- **像素地圖系統**:
  - 一張 tile-based 辦公室地圖(由 agent-sprite-forge `generate2dmap` 生)
  - 主角 pixel sprite 4 方向 walking animation(由 `generate2dsprite` 生)
  - 蘇嫚君 NPC pixel sprite + 簡單的 walk-in 行為
  - 鍵盤輸入(方向鍵 / WASD),帶 collision(牆 / 桌子)
  - 觸發點機制(走到門口 tile → 觸發事件)
- **Visual novel 對話 UI**:
  - 用 Codex + agent-sprite-forge 把參照圖轉成 transparent PNG **半身立繪**(正常表情各一張,for VN 模式)
  - 用 Codex + agent-sprite-forge 把辦公室參照圖轉成 **VN 模式用的背景圖**(跟像素地圖是兩種美術)
  - 蘇嫚君「開門 → 簽約」最短路徑用簡單 state machine(先不引入 inkjs)
  - 一條失敗路徑(選「不開門」會讓事件結束、回主畫面)
- 模式切換:`tilemap → vn → tilemap` 推得動,VN 結束後回到地圖且 flag 已存
- `npm run dev` 可在瀏覽器跑通

### v0.1 不做(明確排除)

- 行程系統、好感度系統、屬性系統(演技、儀態、才智、自信...)
- 存檔 / 讀檔 / IndexedDB
- 多角色簽約(陳奕夫先擱置)
- 育幼院線、郝友乾線、陳奕夫感情線、王瑞恩線
- 音效、BGM
- 對話框打字機外的轉場動畫
- inkjs 整合(等事件變多再導入)
- 行動裝置橫向適配
- 多張地圖切換(只做辦公室一張)

### v0.2 ~ v1.0 構想(GDD 會詳寫)

蘇曼君主線一條接一條展開:育幼院線 → 郝友乾緋聞 → 陳奕夫告白 → 感情結局或解約。每加一條線就增加一個 ink 腳本檔 + 必要的旗標(flags)系統。

## 5. 技術棧決定

| 層 | 選擇 | 原因 |
|---|---|---|
| Build | Vite | 跟 badminton-story 一致 |
| UI | React 18 + TS | 同上 + 熟悉 |
| Style | Tailwind 3 | 同上 |
| State | Zustand | 同上,event/flag store 用得上 |
| 對話腳本(v0.2+) | inkjs | 對話分支多時遠勝手寫 if |
| 美術產生 | Codex + agent-sprite-forge | 內建 GPT-image,不需外部 key |
| 套件管理 | Bun 或 pnpm(待定) | 看 codex 寫專案時用什麼 |

## 6. 成功條件(Definition of Done for v0.1)

- [ ] 在瀏覽器能跑完「載入地圖 → 走到門口 → 簽約對話 → 結束」整條路徑
- [ ] 像素美術:主角 + 蘇嫚君 4 方向 walking animation 流暢、辦公室 tilemap 看起來合理
- [ ] VN 立繪:主角、蘇嫚君、陳奕夫各一張半身正常表情 + 辦公室 VN 背景一張,**直接從 Codex 產出來放進去就能看**(不能慘到還要 photoshop 一輪)
- [ ] 像素風格 vs VN 風格分得開但不打架(同一遊戲感)
- [ ] 對話有打字機效果、選項點擊有反饋
- [ ] 沒有 console error / TS error
- [ ] `npm run typecheck` 通過
- [ ] 把整個流程錄一段 GIF 收進 `docs/`,作為「協作模式驗證成功」的證據

## 7. 風險

| 風險 | 影響 | 緩解 |
|---|---|---|
| agent-sprite-forge 產出風格不統一 | 三張立繪畫風差很大,出戲 | 在 codex prompt 裡明確指定 art style ref(用蘇嫚君的參照圖當 anchor),並在 SKILL prompt 裡固定 seed / style keywords |
| 像素 sprite 跟 VN 立繪風格落差太大 | 切模式時違和 | v0.1 接受「像素風 vs 動畫風」是兩種美術的事實,但**色相要相近**,在兩個 prompt 都加上同一組色票指引 |
| 4 方向 walking animation 動作奇怪 | 主角走得像殭屍 | 先用最低限度 4 frames per direction(idle + 3 步)的標準格式,不追求精緻 |
| agent-sprite-forge 透明背景沒做乾淨 | 立繪 / sprite 有白邊 | 預期會發生,在 codex prompt 裡明確要求 alpha cleanup,真的不行就用 Pillow 後處理 |
| Codex 把專案結構亂建 | 後續整合麻煩 | Claude 在 PLAN 裡寫死目錄結構,codex prompt 指明 |
| 兩個 agent 動到同個檔 | 衝突 | Claude 不動 code,只動 docs / plans / prompts。Codex 不動 docs(寫 JOURNAL.md 例外) |

## 8. 時程感覺(沒 deadline,只是參考)

- Day 0(現在): 寫完 PRD / GDD / COLLAB / 第一個 codex prompt(全部 Claude 做)
- Day 1: 用戶餵第一個 prompt 給 codex → 拿到立繪 + 背景 → 回來 Claude review
- Day 2: Claude 建專案、移植 Dialogue、串第一個事件
- Day 3: 跑通整條雛形、錄 GIF、寫 retrospective

## 9. 開放問題(等用戶回答)

1. **package manager**:bun? pnpm? npm? badminton-story 用的是 npm,是否沿用?
2. **是否要 git init**:目前不是 git repo,要不要先 init 起來?(我建議要,後面 codex 動的東西可以 diff)
3. **deploy target**:純 local 跑就好,還是要 push 到 Vercel / GitHub Pages 看?(雛形階段建議純 local)
4. **角色名規範**:檔案裡是「蘇嫚君」(原作)和「蘇曼君」混用,程式裡 ID 用哪個?(我建議 `suman` 當 ID,顯示文字用「蘇嫚君」忠於原作)
