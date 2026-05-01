# Codex Prompt 038 — Scene transition system(EventGraph 內切換 tilemap)

STATUS: done
SKILL: 無(純 React/TS)
依賴:032 set v3 完成(所有 5 場景 layered + 註冊 React)
產出:
- `src/core/types.ts` 加 `EventNode` 變體 `enterMap`
- `src/store/gameStore.ts` 加 `enterMap(mapId, x, y, facing)` action(切換到不同 tilemap 場景)
- `src/components/VnScene.tsx` 處理 `enterMap` node;背景圖根據當前 player.mapId 動態 resolve(不再寫死 office)
- `src/content/events/index.ts` 加一個 `office-go-orphanage-stub` 測試用 EventGraph(從 office 進 orphanage)

不動:portraits / sprite / map JSON

---

## 為什麼

當前 EventGraph 只能在 vn → tilemap 之間用 `returnToMap` 回到原 map。要讓 EventGraph 主導「玩家從 office 走到 trigger → 切到育幼院 / 歐堡 / 酒館 / 片場」,需要 `enterMap` 這個 EventNode 變體。

順帶一個 bug:`VnScene.tsx` line 73 寫死 `SCENES.office.backgroundUrl`,意思是不管現在是哪個場景觸發 vn,vn 背景永遠是 office。應該根據 `player.mapId` 對應 `SCENES[mapId].backgroundUrl` 動態 resolve。

---

## Task A — types.ts 加 enterMap node

**Search this exact text in `src/core/types.ts`:**

```ts
export type EventNode =
  | { type: 'narration'; text: string; next: string }
  | { type: 'dialogue'; speaker: SpeakerId; emotion?: string; text: string; next: string }
  | { type: 'choice'; prompt?: string; options: Array<ChoiceOption> }
  | { type: 'spawnNpc'; npcId: string; mapId: string; x: number; y: number; next: string }
  | { type: 'walkNpcTo'; npcId: string; x: number; y: number; next: string }
  | { type: 'returnToMap'; mapId: string; x: number; y: number }
  | { type: 'end'; reason: string };
```

**Replace with:**

```ts
export type EventNode =
  | { type: 'narration'; text: string; next: string }
  | { type: 'dialogue'; speaker: SpeakerId; emotion?: string; text: string; next: string }
  | { type: 'choice'; prompt?: string; options: Array<ChoiceOption> }
  | { type: 'spawnNpc'; npcId: string; mapId: string; x: number; y: number; next: string }
  | { type: 'walkNpcTo'; npcId: string; x: number; y: number; next: string }
  | { type: 'returnToMap'; mapId: string; x: number; y: number }
  | { type: 'enterMap'; mapId: string; x: number; y: number; facing: Facing }
  | { type: 'end'; reason: string };
```

差異:加一行 `enterMap`(跟 returnToMap 類似但多 facing 欄位 + 語意是「切到新 map」)。

## Task B — gameStore.ts 加 enterMap action

當前 store 已有 `exitToMap(mapId, x, y, facing)` 處理 returnToMap。`enterMap` 用同一個 action(reuse),不必新增。但需要 expose action 方便 VnScene 呼叫(已 expose `exitToMap`)。

**確認 `useGameStore` 的 GameState interface 有 `exitToMap` 並接受 `mapId` 不限於 player 的 current mapId**(可切到其他 map)。讀 `src/store/gameStore.ts`,如果 `exitToMap` 內部寫死當前 player.mapId,要改成接收 mapId 參數。

如果 store 已正確,本 task 可 skip。

## Task C — VnScene.tsx 處理 enterMap + 動態 background

**Change 1**:加 useEffect 處理 enterMap:

**Search this exact text in `src/components/VnScene.tsx`:**

```tsx
  useEffect(() => {
    if (node.type !== 'returnToMap') return;

    exitToMap(node.mapId, node.x, node.y, 'down');
  }, [exitToMap, node]);
```

**Replace with:**

```tsx
  useEffect(() => {
    if (node.type !== 'returnToMap') return;

    exitToMap(node.mapId, node.x, node.y, 'down');
  }, [exitToMap, node]);

  useEffect(() => {
    if (node.type !== 'enterMap') return;

    exitToMap(node.mapId, node.x, node.y, node.facing);
  }, [exitToMap, node]);
```

**Change 2**:dynamic background。讀 store 的 player.mapId resolve 對應 SCENES。

**Search this exact text:**

```tsx
  const backgroundUrl = SCENES.office.backgroundUrl;
```

**Replace with:**

```tsx
  const playerMapId = useGameStore((state) => state.player.mapId);
  const backgroundUrl = SCENES[playerMapId]?.backgroundUrl ?? SCENES.office.backgroundUrl;
```

`useGameStore` selector 在 component 頂端,確保 hook 使用順序正確(useState/useEffect 規則)。

## Task D — 加 office-go-orphanage-stub event 測試

**Append to `src/content/events/index.ts`** 在 EVENTS dict 之前定義:

```ts
const officeGoOrphanage: EventGraph = {
  start: {
    type: 'narration',
    text: '(嘟嘟嘟——電話響了)\n\n「喂?好,我這就過去。」',
    next: 'walking',
  },
  walking: {
    type: 'narration',
    text: '你出了辦公室,走到了育幼院。',
    next: 'enter',
  },
  enter: {
    type: 'enterMap',
    mapId: 'orphanage',
    x: 7,
    y: 8,
    facing: 'up',
  },
};
```

**Append to EVENTS dict**:

```ts
  'office-go-orphanage': officeGoOrphanage,
```

(這個 stub event 將來給育幼院線 EventGraph reuse,當「玩家被觸發走到育幼院」的過場 narration。)

## Task E — Self-check

```bash
pnpm typecheck    # 必須 pass(尤其 enterMap 的 Facing import)
pnpm build         # 必須 pass
```

`Facing` 從 types.ts 已 export,types.ts 自己用沒問題。

## Task F — Verified output 必填

JOURNAL `Verified output:`:
1. types.ts diff(加 enterMap 那一行)
2. gameStore.ts:確認 exitToMap 接受任意 mapId(讀檔案後說明)
3. VnScene.tsx 兩段 diff(useEffect for enterMap + dynamic backgroundUrl)
4. events/index.ts diff(加 officeGoOrphanage + EVENTS entry)
5. typecheck + build pass

## 完成後

1. JOURNAL.md append entry
2. codex-prompts/038-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 map JSON / portrait / sprite
- 不要動 sign-suman event(留著當 v0.1 baseline 玩)
- 不要寫實際育幼院 EventGraph 內容(那是下一 prompt 039)
- 不要 push
