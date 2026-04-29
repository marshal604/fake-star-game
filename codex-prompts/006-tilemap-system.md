# Codex Prompt 006 — 實作 Tilemap 系統(渲染 + 鍵盤輸入 + 碰撞 + 觸發)

STATUS: done
SKILL: 無(純 code task)
依賴:**005 完成**(需要 src/core/types.ts、Zustand store 骨架);**004 完成**(需要 office.json + tileset);**003 完成**(需要 sprite sheet)
產出:`src/components/Tilemap/*`、`src/core/tilemap.ts`、`src/store/gameStore.ts`(完成 tilemap 部分)

---

## Context(只讀)

- `GDD.md` §6.0「GameMode」、§6.1「Tilemap 系統」、§8「Tilemap 模式 UI/UX」
- `src/content/maps/office.json`(prompt 004 產物)
- `public/sprites/{character}.png`(prompt 003 產物)
- `src/core/types.ts`(prompt 005 定的 type)

## 任務分段

### 6.1 `src/core/tilemap.ts`(純函式)

```ts
export function isWalkable(map: TilemapData, x: number, y: number): boolean
// out-of-bounds 視為 false; 否則回 !collision[y][x]

export function findTrigger(map: TilemapData, x: number, y: number, autoFireOnly: boolean): Trigger | null
// 走到 (x,y) 時找命中的 trigger;autoFireOnly=true 只回 autoFire=true 的

export function neighbour(x: number, y: number, facing: Facing): { x: number; y: number }
// 給 facing 算下一個 tile 座標
```

### 6.2 `src/store/gameStore.ts`(完成版)

state 加上 player 跟 npcs:

```ts
interface GameState {
  flags: Record<string, boolean | number | string>;
  mode: GameMode;
  player: { mapId: string; x: number; y: number; facing: Facing };
  npcs: Record<string, { mapId: string; x: number; y: number; facing: Facing; spriteId: SpeakerId }>;
  setFlag(key: string, value: boolean | number | string): void;
  setMode(mode: GameMode): void;
  movePlayer(dx: number, dy: number): void; // 內部跑 isWalkable check + facing 更新
  facePlayer(facing: Facing): void;          // 撞牆時只改朝向
  spawnNpc(npcId: string, spriteId: SpeakerId, mapId: string, x: number, y: number, facing: Facing): void;
  enterEvent(eventId: string): void;         // mode 切到 vn,nodeId='start'
  exitToMap(mapId: string, x: number, y: number, facing: Facing): void;
  endGame(reason: string): void;
}
```

初始 state:從 `office.json` 的 `spawns.player` 拿,`mode = { kind: 'tilemap', mapId: 'office' }`。

### 6.3 `src/components/Tilemap/TilemapScene.tsx`

- props:`mapId: string`
- 從 store 拿 player 位置 + 從 import 直接拿 office.json
- 用 `<div>` grid 或 `<canvas>` 都可,選 grid(更簡單)
- render 三層(同一個 grid container 內絕對定位):
  1. ground tiles(從 layers.ground)
  2. object tiles(從 layers.objects)
  3. player + npc sprites(絕對定位 left=`x*tileSize` top=`y*tileSize`)
- tile 顯示:用 background-image: url(tilesetUrl) + background-position 算出對應 sprite
- player sprite 顯示:用 sprite sheet 4 row × 4 col,row=facing index(up=0/right=1/down=2/left=3),col=walk-frame index(動畫由 setInterval 切 0~3)
- 加入鍵盤 listener:
  - 方向鍵 / WASD → 算 dx,dy → `movePlayer(dx, dy)`
  - 移動完(每次 movePlayer 後)在 store 裡 check `findTrigger(map, player.x, player.y, autoFireOnly=true)`;命中 → `enterEvent(trigger.eventId)`
  - 空白 / E → 看 player 朝向的鄰格,`findTrigger(autoFireOnly=false)`,命中 → `enterEvent`(v0.1 沒手動觸發,但先實作)
- mode 切到 vn 時自動釋放 keyboard listener(useEffect cleanup)

### 6.4 `src/components/Tilemap/PlayerSprite.tsx`、`NpcSprite.tsx`

抽出 sprite render 邏輯避免 TilemapScene 太胖。一個 `SpriteOnGrid` component 共用即可。

### 6.5 連接 App

`src/App.tsx` 改成:

```tsx
const mode = useGameStore(s => s.mode);
if (mode.kind === 'tilemap') return <TilemapScene mapId={mode.mapId} />;
if (mode.kind === 'vn')      return <VnScene eventId={mode.eventId} nodeId={mode.nodeId} />; // 暫時 placeholder
if (mode.kind === 'end')     return <EndScene reason={mode.reason} />;                       // 暫時 placeholder
```

VnScene / EndScene 放在 `src/components/`,先寫 placeholder(prompt 008 才完成):

```tsx
export const VnScene = ({ eventId, nodeId }: ...) => <div>VN {eventId}/{nodeId}</div>;
export const EndScene = ({ reason }: ...) => <div>END: {reason}</div>;
```

## Self-check

- [ ] `pnpm typecheck` pass
- [ ] `pnpm dev` 開瀏覽器,看到辦公室 tilemap + 主角 sprite
- [ ] 方向鍵 / WASD 能走,撞牆會擋,主角 facing 會變
- [ ] 走到 (11, 1) 會自動切 mode 到 `vn` 並 render placeholder「VN sign-suman/start」
- [ ] 沒 console error

## 完成後

1. JOURNAL.md append + 補 self-check 結果
2. `STATUS: pending` → `done`
3. `git add . && git commit -m "feat(tilemap): grid render + keyboard input + collision + trigger [prompt:006]"`

## 不要做

- 不要寫對話 runtime / EventGraph 推進(prompt 007)
- 不要做平滑插值的走路動畫(v0.1 grid-based 1 tile per keypress 就好,有打算做就在 JOURNAL 寫 BLOCKER 問 Claude)
- 不要做手機觸控

---

## JOURNAL

DATE: 2026-04-30
SUMMARY: Implemented tilemap helpers, office map rendering, keyboard movement/interact handling, player/NPC sprite components, store tilemap state/actions, and App mode routing for tilemap/vn/end placeholders.
BLOCKERS: none
SELF-CHECK:
- pnpm typecheck: deferred to Claude (sandbox lacks pnpm)
- pnpm dev/browser check: deferred to Claude (sandbox lacks pnpm)
- movement/collision/trigger behavior: implemented by code inspection; runtime verification deferred to Claude (sandbox lacks pnpm)
- console errors: deferred to Claude (sandbox lacks pnpm)
