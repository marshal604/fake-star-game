# Codex Prompt 039 — 主角線完整 EventGraph(從簽約到主角結局)

STATUS: done
SKILL: 無(純 TS)
依賴:038 完成(enterMap 已支援)
產出:
- `src/core/types.ts` 加 EventNode 變體 `goToEvent`(切到別的 EventGraph)
- `src/store/gameStore.ts` 加 `goToEvent(eventId, nodeId?)` action
- `src/components/VnScene.tsx` 處理 goToEvent
- `src/content/events/main-story.ts` 新檔(整條主角線 EventGraph,從育幼院線到主角結局)
- `src/content/events/index.ts` 把 sign-suman 的 `end_signed` 改成接 main-story,EVENTS 加 main-story 註冊

不動:portrait / sprite / map / tilemap

---

## 為什麼

讓玩家從頭(進 office tilemap → 走到門 → 簽約)→ 育幼院劇情 → 主角結局,**linear 不用存檔玩到底**。

主線採育幼院線(GDD §5.2)+ 主角結局(GDD §5.6 ending_protagonist),簡化版對白(原作每段濃縮成 2-3 行),場景切到 orphanage 用 enterMap。

---

## Task A — types.ts 加 goToEvent node

**Search this exact text in `src/core/types.ts`:**

```ts
  | { type: 'enterMap'; mapId: string; x: number; y: number; facing: Facing }
  | { type: 'end'; reason: string };
```

**Replace with:**

```ts
  | { type: 'enterMap'; mapId: string; x: number; y: number; facing: Facing }
  | { type: 'goToEvent'; eventId: string; nodeId?: string }
  | { type: 'end'; reason: string };
```

## Task B — gameStore.ts goToEvent action

`enterEvent(eventId)` 已存在,**reuse**。加一個 wrapper `goToEvent(eventId, nodeId?)`:
- 若 nodeId === undefined 或 'start' → call enterEvent(eventId)(進 vn,nodeId='start')
- 若 nodeId 指定 → 直接 set mode = { kind: 'vn', eventId, nodeId }

讀 store 確認 GameState interface 已有 enterEvent;新增 `goToEvent(eventId: string, nodeId?: string): void` action 並 expose 到 hook。

## Task C — VnScene.tsx 處理 goToEvent

**Search this exact text:**

```tsx
  useEffect(() => {
    if (node.type !== 'enterMap') return;

    exitToMap(node.mapId, node.x, node.y, node.facing);
  }, [exitToMap, node]);
```

**Replace with:**

```tsx
  useEffect(() => {
    if (node.type !== 'enterMap') return;

    exitToMap(node.mapId, node.x, node.y, node.facing);
  }, [exitToMap, node]);

  useEffect(() => {
    if (node.type !== 'goToEvent') return;

    goToEvent(node.eventId, node.nodeId);
  }, [goToEvent, node]);
```

並在 useGameStore selector block 加:`const goToEvent = useGameStore((state) => state.goToEvent);`

## Task D — 新檔 src/content/events/main-story.ts

寫整條主角線 EventGraph,內容(對白由 Claude 設計,Codex 翻 TS):

```ts
import type { EventGraph } from '~/core/types';

export const mainStory: EventGraph = {
  // ─── 育幼院線:第一次請假 ───
  start: {
    type: 'narration',
    text: '簽下蘇嫚君後,日子過得很快。\n\n某個午後,蘇嫚君欲言又止地走進辦公室。',
    next: 'e101_a',
  },
  e101_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「老闆……我有件事想拜託你。」',
    next: 'e101_b',
  },
  e101_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「我想……回育幼院一趟。那邊最近人手不夠……」',
    next: 'e101_choice',
  },
  e101_choice: {
    type: 'choice',
    prompt: '怎麼回答?',
    options: [
      { label: '當然好,你去吧。', next: 'e101_yes', setFlags: { suman_orphanage_visits: 1 } },
      { label: '工作要緊,改天再說。', next: 'e101_no' },
    ],
  },
  e101_yes: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真的嗎?謝謝你!我一定會把工作補回來的。」',
    next: 'e103_intro',
  },
  e101_no: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「……我知道了。」',
    next: 'e103_intro',
  },

  // ─── 蘇嫚君消失了一天 ───
  e103_intro: {
    type: 'narration',
    text: '幾週後的某天早上,蘇嫚君沒來上班。\n\n秘書說她從昨晚就連絡不上。',
    next: 'e104_a',
  },
  e104_a: {
    type: 'narration',
    text: '隔天,蘇嫚君紅著眼眶走進辦公室。',
    next: 'e104_b',
  },
  e104_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「對不起……我昨天回育幼院了,沒跟你說……」',
    next: 'e104_choice',
  },
  e104_choice: {
    type: 'choice',
    prompt: '怎麼回應?',
    options: [
      { label: '小孩重要,我不怪你。', next: 'e104_kind', setFlags: { suman_friendship: 50 } },
      { label: '下次要先請假。', next: 'e104_strict' },
    ],
  },
  e104_kind: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「謝謝……謝謝你……」',
    next: 'e106_intro',
  },
  e104_strict: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「對不起,下次我一定先講……」',
    next: 'e106_intro',
  },

  // ─── 大掃除請假 ───
  e106_intro: {
    type: 'narration',
    text: '十月初,蘇嫚君又來找你。',
    next: 'e106_a',
  },
  e106_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'normal',
    text: '「育幼院要大掃除了,你……要不要一起來幫忙?」',
    next: 'e106_choice',
  },
  e106_choice: {
    type: 'choice',
    options: [
      { label: '好啊,一起去。', next: 'e107_go', setFlags: { joined_cleanup: true } },
      { label: '我有事,你去吧。', next: 'e106_skip' },
    ],
  },
  e106_skip: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「沒關係……我自己去。」',
    next: 'e108_intro',
  },

  // ─── 大掃除場景:切到 orphanage ───
  e107_go: {
    type: 'narration',
    text: '你跟著蘇嫚君來到了育幼院。',
    next: 'e107_enter',
  },
  e107_enter: {
    type: 'enterMap',
    mapId: 'orphanage',
    x: 7,
    y: 8,
    facing: 'up',
  },
  // 注意:enterMap 只把玩家送到 tilemap,後續 trigger 才能再進事件。
  // 為了 linear,我們用 spawnNpc 的「自動 advance」pattern 直接接著:
  // 但 enterMap 是 terminal,不接 next。改用 goToEvent 從 tilemap 那邊?不行 tilemap 不會自動進 event。
  //
  // 折衷:e107_enter 之前用 narration 過場,直接跳 e107_dialogue,不真的切 tilemap。
  // (v0.2 玩家在 vn 看「育幼院內」對話,不真的走來走去 — orphanage tilemap 留 v0.3 加可走互動)

  // ─── 重新設計:e107_go 改 narration,不 enterMap(v0.2 不切真 tilemap)───
  // 已上面 e107_enter 標 deprecated;實際用下面 e107_dialogue
  e107_dialogue: {
    type: 'narration',
    text: '育幼院的小朋友看到蘇嫚君,開心地圍上來。\n你跟蘇嫚君一起整理庭院、擦窗、收拾玩具。',
    next: 'e107_a',
  },
  e107_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「謝謝你陪我來。看到孩子們的笑容,我什麼都忘了。」',
    next: 'e108_intro',
  },

  // ─── 聖誕聚會 ───
  e108_intro: {
    type: 'narration',
    text: '十二月初,蘇嫚君小心翼翼地問:',
    next: 'e108_a',
  },
  e108_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「平安夜……育幼院有聖誕聚會……你願意陪我去嗎?」',
    next: 'e108_choice',
  },
  e108_choice: {
    type: 'choice',
    options: [
      { label: '當然好,我去。', next: 'e109_dialogue', setFlags: { joined_xmas: true, suman_friendship: 100 } },
      { label: '抱歉,有事走不開。', next: 'e2000w_intro' },
    ],
  },
  e109_dialogue: {
    type: 'narration',
    text: '12 月 24 日。育幼院掛起彩燈,孩子們表演聖誕劇。\n夜色溫暖,蘇嫚君悄悄站到你身邊。',
    next: 'e109_a',
  },
  e109_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「能跟你一起在這裡……我覺得很幸福。」',
    next: 'e2000w_intro',
  },

  // ─── 育幼院賣掉危機 ───
  e2000w_intro: {
    type: 'narration',
    text: '隔年夏天,蘇嫚君神色凝重地走進辦公室。',
    next: 'e2000w_a',
  },
  e2000w_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「鉅子娛樂……要把育幼院賣掉,換現金週轉。」',
    next: 'e2000w_b',
  },
  e2000w_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「兩千萬……我們籌不到那麼多錢……」',
    next: 'e2000w_choice',
  },
  e2000w_choice: {
    type: 'choice',
    prompt: '怎麼辦?',
    options: [
      { label: '這兩千萬你先拿去用。', next: 'e2000w_save', setFlags: { saved_orphanage: true, suman_friendship: 200 } },
      { label: '還是快找房子搬家吧。', next: 'e2000w_lose' },
    ],
  },
  e2000w_save: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真的嗎?……老闆,我不知道該說什麼。我這輩子都會記得。」',
    next: 'ending_check',
  },
  e2000w_lose: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「……嗯,我會跟院長說。」',
    next: 'ending_check',
  },

  // ─── 結局判斷 ───
  ending_check: {
    type: 'narration',
    text: '時間過得很快,你和蘇嫚君一起走過了三年的演藝圈。',
    next: 'ending_dialogue',
  },
  ending_dialogue: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「老闆……不,以後我能不能不要叫你老闆了?」',
    next: 'ending_choice',
  },
  ending_choice: {
    type: 'choice',
    prompt: '怎麼回應?',
    options: [
      { label: '希望可以當妳的支柱。', next: 'ending_protagonist', setFlags: { ending_protagonist: true } },
      { label: '我永遠尊重妳的決定。', next: 'ending_neutral' },
    ],
  },
  ending_protagonist: {
    type: 'narration',
    text: '蘇嫚君臉紅了,輕輕牽起你的手。\n\n「那就……從現在起,讓我們一起走下去吧。」',
    next: 'ending_protagonist_end',
  },
  ending_protagonist_end: {
    type: 'end',
    reason: '★ 主角結局 ★\n\n蘇嫚君退出演藝圈,成為了你的妻子,\n育幼院在你們手下繼續守護著孩子們的笑容。\n\n— 完 —',
  },
  ending_neutral: {
    type: 'end',
    reason: '★ 普通結局 ★\n\n蘇嫚君繼續她的演藝事業,\n你們一直是最好的夥伴。\n\n— 完 —',
  },
};
```

**注意**:e107 用 narration 模擬「進育幼院」(不真的切 tilemap),這是 v0.2 簡化。v0.3 可以改成真的 enterMap orphanage + 在 orphanage 內 trigger event。

但 prompt 要保留 `enterMap` 的 demo node 位置(e107_enter,雖然 e107_dialogue 跳過它),這樣 future 可以接回去。或者乾脆移除 e107_enter 節點。**移除以避免 dangling next**。

從上面 graph **刪除 e107_enter 節點**,e107_go 直接 next 到 e107_dialogue。

最終 graph:
- start → e101_a → e101_b → e101_choice → e101_yes/no → e103_intro
- e103_intro → e104_a → e104_b → e104_choice → e104_kind/strict → e106_intro
- e106_intro → e106_a → e106_choice → e107_go/e106_skip
- e107_go → e107_dialogue → e107_a → e108_intro
- e106_skip → e108_intro
- e108_intro → e108_a → e108_choice → e109_dialogue/e2000w_intro
- e109_dialogue → e109_a → e2000w_intro
- e2000w_intro → e2000w_a → e2000w_b → e2000w_choice → e2000w_save/lose → ending_check
- ending_check → ending_dialogue → ending_choice → ending_protagonist/ending_neutral
- ending_protagonist → ending_protagonist_end (end)
- ending_neutral (end)

確認所有 next 都指向存在 node。

加 import.meta.env.DEV dangling-next 驗證(同 sign-suman.ts pattern)在 main-story.ts 尾巴。

## Task E — events/index.ts 把 sign-suman 接 main-story

讀 `src/content/events/index.ts`,找到 sign-suman 相關 import + EVENTS dict。要做兩件事:

1. import mainStory:`import { mainStory } from './main-story';`
2. EVENTS dict 加 `'main-story': mainStory`
3. **不動 sign-suman.ts**(那是 v0.1 demo,維持獨立可玩)。但要在 EVENTS 串接:讓 sign-suman 結束後玩家可以進 main-story。

最簡:**修改 sign-suman.ts 的 `end_signed` node**(讀檔確認 node id),把 `type: 'end'` 改成:

```ts
end_signed: {
  type: 'goToEvent',
  eventId: 'main-story',
},
```

(reason 字串不再顯示;玩家直接進 main-story start。)

留 `end_silent` 跟 `end_pending` 不變(那兩條是失敗路徑)。

## Task F — typecheck + build pass

## 完成後

JOURNAL `Verified output:`:
1. types.ts diff(加 goToEvent)
2. gameStore.ts diff(加 goToEvent action)
3. VnScene.tsx diff(useEffect for goToEvent)
4. events/index.ts diff(加 import + EVENTS)
5. sign-suman.ts diff(end_signed 改 goToEvent)
6. main-story.ts 新檔內容摘要(node 數)
7. typecheck + build pass

STATUS: pending → ready-for-commit / blocked。不要 git commit / push。

## 不要做

- 不要動 portraits / sprites / maps
- 不要改其他 stub events(orphanage-exit-stub 等保留)
- 不要 push
