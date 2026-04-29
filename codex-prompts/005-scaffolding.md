# Codex Prompt 005 — Scaffolding(Vite + React + TS + Tailwind + Zustand)+ Dialogue 移植

STATUS: blocked
SKILL: 無(純 code task)
依賴:無(可平行 001~004)
產出:可跑 `pnpm dev` 的 React 雛形,Dialogue 元件移植完成,types 系統定義到位

---

## Context(只讀)

- `GDD.md` §6「系統設計」、§9「內容檔案規劃」(嚴格依此目錄結構)
- `PRD.md` §6.2「程式檔 deliverables」(對著 checkbox 做)
- `~/self/coding/badminton-story/src/components/Dialogue/`(**移植來源**,先 `cat` 過五個 .tsx + 1 .ts + 1 index.ts)

## 任務分段

### 5.1 專案初始化

```bash
pnpm create vite . --template react-ts
pnpm install
pnpm add zustand
pnpm add -D tailwindcss@^3 postcss autoprefixer
pnpm dlx tailwindcss init -p
```

修改:
- `tailwind.config.js`:`content: ['./index.html', './src/**/*.{ts,tsx}']`、留 default theme
- `src/styles/index.css`(新建):`@tailwind base/components/utilities`,把現有 `src/index.css` 內容替換或刪掉
- `src/main.tsx`:import `./styles/index.css`
- `package.json` scripts 加:
  - `"typecheck": "tsc --noEmit"`
  - `"lint": "eslint src --ext .ts,.tsx"`(若 vite template 沒給 eslint 就先跳過 lint)

### 5.2 移植 Dialogue 元件

從 `~/self/coding/badminton-story/src/components/Dialogue/` 複製這 7 個檔到 `src/components/Dialogue/`:
- `Background.tsx`
- `CharacterPortrait.tsx`
- `ChoiceList.tsx`
- `DialogueBox.tsx`
- `DialogueView.tsx`
- `useTypewriter.ts`
- `index.ts`

複製後修改 `Background.tsx` 的 `LOCATION_STYLES`:
- 移除 badminton-story 場景(`dorm`、`university_court`、`library`、`gym_public`、`shop_uncle`、`park_riverside`)
- 加入本作場景(只先寫 `office` 即可,後面有需要再加):
  ```ts
  office: {
    gradient: 'from-[#3a2c18] via-[#241b10] to-[#140f08]',
    accent: 'radial-gradient(ellipse at 50% 30%, rgba(245,209,168,0.15), transparent 60%)',
    label: '鉅子娛樂辦公室',
  },
  ```
- 把 `NarrationDecoration` 裡 badminton-story 專屬的 SVG(`location === 'dorm'` 等)整段移除,保留 default 的圓+十字 SVG,但條件改成 `if (!location)` 全用 default

如果 `badminton-story` 的 Tailwind 顏色(`court-wood`、`ink-50` 等)在我們 default tailwind config 不存在,要在 `tailwind.config.js` 的 `theme.extend.colors` 加:
```js
colors: {
  'court-wood': '#c9954a',
  'ink-50':  '#f5f5f2',
  'ink-100': '#e8e6e0',
  'ink-900': '#1a1614',
}
```
(這幾個顏色從 badminton-story 推測,確切值看 `~/self/coding/badminton-story/tailwind.config.js`,複製過來。)

### 5.3 定義 types

新建 `src/core/types.ts`:

```ts
export type SpeakerId = 'protagonist' | 'suman' | 'chenyifu';
export type Facing = 'up' | 'down' | 'left' | 'right';

export type GameMode =
  | { kind: 'tilemap'; mapId: string }
  | { kind: 'vn'; eventId: string; nodeId: string }
  | { kind: 'end'; reason: string };

export type EventNode =
  | { type: 'narration'; text: string; next: string }
  | { type: 'dialogue'; speaker: SpeakerId; emotion?: string; text: string; next: string }
  | { type: 'choice'; prompt?: string; options: Array<ChoiceOption> }
  | { type: 'spawnNpc'; npcId: string; mapId: string; x: number; y: number; next: string }
  | { type: 'walkNpcTo'; npcId: string; x: number; y: number; next: string }
  | { type: 'returnToMap'; mapId: string; x: number; y: number }
  | { type: 'end'; reason: string };

export interface ChoiceOption {
  label: string;
  next: string;
  setFlags?: Record<string, boolean | number | string>;
}

export type EventGraph = Record<string, EventNode>;

export interface TilemapData {
  id: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  tilesetUrl: string;
  tilesetCols: number;
  tilesetRows: number;
  layers: { ground: number[][]; objects: number[][] };
  collision: boolean[][];
  triggers: Array<{ id: string; x: number; y: number; eventId: string; autoFire?: boolean }>;
  spawns: { player: { x: number; y: number; facing: Facing } };
}
```

### 5.4 stub 的內容檔(讓 typecheck 通過,但不寫邏輯)

- `src/content/characters.ts` — export `CHARACTERS: Record<SpeakerId, { displayName: string; portraitUrl: (e?: string) => string; spriteUrl: string }>`,resolver 都先寫死成 `/portraits/${id}-normal.png` / `/sprites/${id}.png`
- `src/content/scenes.ts` — export `SCENES: Record<string, { backgroundUrl: string }>`,先有 `office`
- `src/content/events/sign-suman.ts` — export 一個空的 `signSuman: EventGraph = {}`(prompt 007 才填)
- `src/store/gameStore.ts` — export 一個 minimal Zustand store(prompt 007 補完整邏輯),先有 `flags`、`mode` 兩個 state、`setFlag`、`setMode` 兩個 action
- `src/App.tsx` — 暫時 render 一個 `<DialogueView text="hello" />` 確認 Dialogue 移植成功

### 5.5 路徑別名(可選但建議)

在 `tsconfig.json` 加 `compilerOptions.paths`:
```json
"baseUrl": ".",
"paths": { "~/*": ["src/*"] }
```
在 `vite.config.ts` 加 alias:
```ts
resolve: { alias: { '~': '/src' } }
```

## Self-check(收工前必跑)

- [ ] `pnpm install` 沒 error
- [ ] `pnpm typecheck` pass
- [ ] `pnpm dev` 啟動,瀏覽器看到一個有打字機效果的 dialogue box
- [ ] `pnpm build` 產出 dist/ 沒 error

任何一項 fail → 寫 BLOCKER,STATUS 改 `blocked`,**不要強推**。

## 完成後

1. JOURNAL.md append:除 schema,加 `pnpm install ok / typecheck ok / dev boot ok`
2. `STATUS: pending` → `done`
3. `git add . && git commit -m "feat(scaffolding): vite/react/ts/tailwind/zustand setup + dialogue port [prompt:005]"`

## 不要做

- 不要寫 TilemapScene(prompt 006)、event runtime(prompt 007)、mode switch(prompt 008)
- 不要加未要求的 lib(framer-motion / immer / dexie / inkjs 都 v0.2+)
- 不要嘗試「順便寫一些測試」— prompt 沒要求就不做
