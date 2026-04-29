# Codex Prompt 007 — 事件 runtime + sign-suman EventGraph

STATUS: done
SKILL: 無(純 code task)
依賴:**005 完成**(types + store 骨架);**006 不必先完成**(可平行)
產出:`src/core/runtime.ts`、`src/content/events/sign-suman.ts`、store 的 vn 部分完成

---

## Context(只讀)

- `GDD.md` §6.2「事件引擎」、§10「v0.1 demo 腳本」(對白直接翻譯)
- `src/core/types.ts`(EventNode / EventGraph)
- `src/store/gameStore.ts`(prompt 006 的版本,要在這份再加)

## 任務

### 7.1 `src/core/runtime.ts`

```ts
import type { EventGraph, EventNode } from './types';

export interface RuntimeStep {
  node: EventNode;
  isTerminal: boolean; // returnToMap / end
}

export function getNode(graph: EventGraph, nodeId: string): EventNode {
  const node = graph[nodeId];
  if (!node) throw new Error(`Event node not found: ${nodeId}`);
  return node;
}

export function advance(node: EventNode): string | null {
  // 對於有 next 的 node,回傳 next id;對於 choice/returnToMap/end 回 null(由 caller 處理)
  if ('next' in node) return node.next;
  return null;
}
```

### 7.2 store 的 vn 部分

加 actions:

```ts
advanceNode(): void;        // 拿目前 node,呼叫 advance(),把 mode.nodeId 換掉
chooseOption(index: number): void; // mode.kind 必須 vn,目前 node 必須 choice;設 setFlags、跳 next
```

`enterEvent(eventId)` 行為:`mode = { kind: 'vn', eventId, nodeId: 'start' }`,所有 graph 都從 `start` 入口。

`returnToMap` node 在 advanceNode 裡偵測:`mode = { kind: 'tilemap', mapId }` + 調整 player 座標。

`end` node:`mode = { kind: 'end', reason }`。

### 7.3 EventGraph: `src/content/events/sign-suman.ts`

依 GDD §10 翻譯:

```ts
import type { EventGraph } from '~/core/types';

export const signSuman: EventGraph = {
  start: {
    type: 'narration',
    text: '這裡是鉅子娛樂的辦公室。一切才剛剛起步——\n連辦公桌都還沒擺正,演藝圈的大門就已經在你眼前了。',
    next: 'knock',
  },
  knock: {
    type: 'narration',
    text: '「叩叩叩——」\n\n門外傳來敲門聲。',
    next: 'choose_door',
  },
  choose_door: {
    type: 'choice',
    prompt: '怎麼辦?',
    options: [
      { label: '去開門',     next: 'open_door',  setFlags: { door_opened: true } },
      { label: '假裝不在',   next: 'end_silent' },
    ],
  },
  open_door: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'normal',
    text: '「不、不好意思——請問這裡是鉅子娛樂嗎?」',
    next: 'suman_intro',
  },
  suman_intro: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'normal',
    text: '「我看到報紙上說在徵藝人……我叫蘇嫚君,我想……我想試試看!」',
    next: 'suman_observation',
  },
  suman_observation: {
    type: 'narration',
    text: '眼前的女孩有點手足無措,但眼睛很亮。',
    next: 'choose_sign',
  },
  choose_sign: {
    type: 'choice',
    options: [
      { label: '直接簽約',         next: 'end_signed',     setFlags: { signed_suman: true } },
      { label: '再考慮一下',       next: 'end_pending' },
    ],
  },
  end_silent:  { type: 'end', reason: '故事還沒開始就結束了。' },
  end_pending: { type: 'end', reason: '(v0.1 demo 到此為止,後續事件待續)' },
  end_signed:  { type: 'end', reason: '蘇嫚君加入了旗下藝人。\n第一年的故事,從這裡開始。' },
};
```

### 7.4 把 EventGraph 註冊進系統

`src/content/events/index.ts`:

```ts
import { signSuman } from './sign-suman';
import type { EventGraph } from '~/core/types';

export const EVENTS: Record<string, EventGraph> = {
  'sign-suman': signSuman,
};
```

store 的 `enterEvent` / advance 等 action 透過 `EVENTS[eventId]` 取 graph。

### 7.5 純函式測試(不導入 vitest,但檢查邏輯能跑)

不寫 unit test,但在 `src/core/runtime.ts` 同檔尾巴可以放 `// @example`(不要 export),作為自我說明:

```ts
// @example pseudo:
// const node = getNode(signSuman, 'start')
// next = advance(node)  // 'knock'
```

## Self-check

- [ ] `pnpm typecheck` pass
- [ ] node graph 中每個 `next` / `option.next` 都指向存在的 node id(自己在 console 跑一次驗證)
- [ ] `start` 一定存在
- [ ] 沒有 console error

驗證 graph 完整性,可以在開發階段加一段 boot-time check(不上 prod):

```ts
// src/content/events/sign-suman.ts 尾端
if (import.meta.env.DEV) {
  const allKeys = new Set(Object.keys(signSuman));
  for (const [id, node] of Object.entries(signSuman)) {
    if ('next' in node && !allKeys.has(node.next)) {
      console.error(`[sign-suman] dangling next: ${id} → ${node.next}`);
    }
    if (node.type === 'choice') {
      for (const opt of node.options) if (!allKeys.has(opt.next))
        console.error(`[sign-suman] dangling choice next: ${id} → ${opt.next}`);
    }
  }
}
```

## 完成後

1. JOURNAL.md append
2. `STATUS: pending` → `done`
3. `git add . && git commit -m "feat(runtime): event graph runtime + sign-suman script [prompt:007]"`

## 不要做

- 不要實作 VnScene render(prompt 008 的事)
- 不要寫 inkjs(v0.2+)
- 不要把對白「修飾得更好」(直接照 GDD §10,動了寫 BLOCKER)
- 不要主動處理 spawnNpc/walkNpcTo node(GDD 說 v0.1 視為 noop 即可,prompt 008 處理)

---

## JOURNAL

DATE: 2026-04-30
SUMMARY: Implemented event runtime helpers, VN store state/actions, sign-suman EventGraph, event registry, and DEV-only graph validation for dangling references.
BLOCKERS: none
SELF-CHECK:
- pnpm typecheck: deferred to Claude (sandbox lacks pnpm)
- graph reference validation: DEV guard implemented; runtime console verification deferred to Claude (sandbox lacks pnpm)
- start node presence: confirmed by code inspection
- console errors: deferred to Claude (sandbox lacks pnpm)
