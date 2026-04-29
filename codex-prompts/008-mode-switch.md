# Codex Prompt 008 — VnScene 完成 + Mode 切換 + EndScene + Fade

STATUS: pending
SKILL: 無(純 code task)
依賴:**005、006、007 全部完成**
產出:`src/components/VnScene.tsx`、`src/components/EndScene.tsx`、`src/App.tsx` 完整版、模式切換 fade

---

## Context(只讀)

- `GDD.md` §6.0「GameMode」、§6.4「對話 UI」、§8「模式切換」
- `src/components/Dialogue/DialogueView.tsx`(已從 badminton-story 移植過來)
- `src/store/gameStore.ts`(prompt 006/007 完成版)
- `src/content/events/index.ts`(EVENTS map)

## 任務

### 8.1 `src/components/VnScene.tsx`

```tsx
interface Props { eventId: string; nodeId: string; }
```

行為:
1. 從 `EVENTS[eventId]` 拿 graph,從 graph 拿 `nodeId` 對應 node
2. 根據 node.type render `<DialogueView>`:
   - **narration**:`speakerName` undefined,`text` 帶入,`onAdvance` 呼叫 store.advanceNode
   - **dialogue**:`speakerName=characters[node.speaker].displayName`、`speakerImageUrl=characters[node.speaker].portraitUrl(node.emotion)`、`speakerEmotion=node.emotion`、`onAdvance` 呼叫 store.advanceNode
   - **choice**:`text=node.prompt ?? ''`、`choices=node.options.map((opt, i) => ({ id: String(i), label: opt.label }))`、`onChoose=(id) => store.chooseOption(Number(id))`
   - **spawnNpc** / **walkNpcTo**:v0.1 視為 noop,**自動 call advanceNode**(用 useEffect)
   - **returnToMap**:useEffect 自動呼叫 `store.exitToMap(mapId, x, y, 'down')`,不 render 任何 UI
   - **end**:useEffect 自動呼叫 `store.endGame(reason)`,不 render
3. `backgroundUrl` 套 `scenes['office'].backgroundUrl`(因為 v0.1 只有辦公室;若要切就 read store 的 `currentScene`,先寫死 office)

鍵盤:
- Enter / Space:在非 choice node 時 = `advanceNode`(打字機未完則 finish typewriter)
- 數字鍵 1~9:在 choice node 時選對應選項

### 8.2 `src/components/EndScene.tsx`

```tsx
interface Props { reason: string; }
```

簡單畫面:
- 黑底全屏
- 中央顯示 `reason`(`whitespace-pre-wrap` 處理 \n)
- 下方有 `[ 重新開始 ]` 按鈕,點擊呼叫 `window.location.reload()`(v0.1 不做正規 reset)

### 8.3 `src/App.tsx`

```tsx
const mode = useGameStore(s => s.mode);

return (
  <ModeFader modeKey={modeKeyOf(mode)}>
    {mode.kind === 'tilemap' && <TilemapScene mapId={mode.mapId} />}
    {mode.kind === 'vn'      && <VnScene eventId={mode.eventId} nodeId={mode.nodeId} />}
    {mode.kind === 'end'     && <EndScene reason={mode.reason} />}
  </ModeFader>
);
```

`modeKeyOf`:`tilemap:${mapId}` / `vn:${eventId}` / `end`(只看模式類型 + 主要 id,不看 nodeId,避免每個對話 node 切都 fade)

### 8.4 `ModeFader`

簡單 fade(150ms 黑屏):

```tsx
function ModeFader({ modeKey, children }: { modeKey: string; children: ReactNode }) {
  const [shownKey, setShownKey] = useState(modeKey);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (modeKey === shownKey) return;
    setOpacity(0);                          // fade out
    const t = setTimeout(() => {
      setShownKey(modeKey);
      setOpacity(1);                        // fade in
    }, 150);
    return () => clearTimeout(t);
  }, [modeKey, shownKey]);

  return <div style={{ transition: 'opacity 150ms', opacity }}>{children}</div>;
}
```

不要用 framer-motion(v0.1 不裝)。

### 8.5 spawnNpc / walkNpcTo 在 v0.1 怎麼處理

照 GDD §6.2 講的「v0.1 簡化處理:視為 noop + 短暫黑幕」。實作上:
- VnScene 看到這兩種 node → useEffect 等 200ms 後 advanceNode
- 不要真的去切回 tilemap render NPC walk(那是 v0.2)

但**蘇嫚君上門**那個段落確實希望能呈現「她從門外走進來」的感覺。v0.1 折衷:
- `start` → `knock` → `choose_door` → 選「去開門」→ **這時候** insert 一個短暫的 narration「(你打開了門)」→ 再進 `open_door`(蘇嫚君 dialogue)
- 但這個 graph 已經在 prompt 007 寫死,**不要回頭改**。如果你覺得需要這個過場,在 JOURNAL 寫 BLOCKER 問 Claude

## Self-check(整條雛形跑通)

- [ ] `pnpm dev` 開瀏覽器
- [ ] 看到辦公室 tilemap + 主角 sprite,可走動
- [ ] 走到 (11, 1) → 自動 fade → 進 VN 模式 → 看到 narration 「這裡是鉅子娛樂的辦公室...」
- [ ] 點對話框繼續 → 進「叩叩叩」narration → 進 choice
- [ ] 選「去開門」→ 蘇嫚君立繪出現 + 蘇嫚君台詞 → 旁白 → choice → 選「直接簽約」→ end 顯示「蘇嫚君加入了旗下藝人」
- [ ] 重新整理頁面 → 重玩 → 選「假裝不在」→ end 顯示「故事還沒開始就結束了」
- [ ] 沒 console error
- [ ] `pnpm typecheck` pass
- [ ] `pnpm build` pass

任何一條 fail → 寫 BLOCKER。

## 完成後

1. JOURNAL.md append + 把上面 self-check 全部勾起來貼進 entry
2. `STATUS: pending` → `done`
3. `git add . && git commit -m "feat(app): wire mode switch with fade, vn scene, end scene [prompt:008]"`

## 不要做

- 不要實作 NPC walking animation
- 不要做存檔 / load
- 不要做 BGM / SFX
- 不要對 Dialogue 元件大改(只能改 LOCATION_STYLES,prompt 005 已做)
