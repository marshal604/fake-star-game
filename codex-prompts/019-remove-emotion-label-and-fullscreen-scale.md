# Codex Prompt 019 — 拿掉 'normal' emotion label + tilemap fractional scale 撐滿

STATUS: done
SKILL: 無(純 React code task,沒 image_gen)
依賴:008 完成
產出:
- `src/components/Dialogue/CharacterPortrait.tsx`(移除兩處 emotion label rendering)
- `src/components/Tilemap/TilemapScene.tsx`(scale 算式去掉 `Math.floor`)

---

## 任務:用精確 string search/replace 改這兩個檔(機械執行,不要解讀)

### Change 1 — `src/components/Dialogue/CharacterPortrait.tsx`

#### 1a) Line 17-21:把這 5 行整段刪掉

**Search this exact text:**

```tsx
        {emotion ? (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-ink-100/70 bg-black/50 px-2 py-0.5 rounded">
            {emotion}
          </div>
        ) : null}
```

**Replace with:** (空字串 — 直接刪)

#### 1b) Line 71-74:把 emotion span 那行刪掉

**Search this exact text:**

```tsx
      <div className="mt-1 px-2 py-0.5 rounded text-[11px] text-ink-100/70 bg-black/40 font-display tracking-wide">
        {name}
        {emotion ? <span className="ml-1.5 text-ink-100/50">· {emotion}</span> : null}
      </div>
```

**Replace with:**

```tsx
      <div className="mt-1 px-2 py-0.5 rounded text-[11px] text-ink-100/70 bg-black/40 font-display tracking-wide">
        {name}
      </div>
```

---

### Change 2 — `src/components/Tilemap/TilemapScene.tsx`

Line 49-52:scale 算式去掉 `Math.floor`,允許 fractional scale 撐滿視窗。

**Search this exact text:**

```tsx
      const nextScale = Math.max(
        1,
        Math.floor(Math.min(window.innerWidth / mapPixelWidth, window.innerHeight / mapPixelHeight)),
      );
```

**Replace with:**

```tsx
      const nextScale = Math.max(
        1,
        Math.min(window.innerWidth / mapPixelWidth, window.innerHeight / mapPixelHeight),
      );
```

---

## Self-check(收工前)

跑(sandbox 沒 pnpm 你可能跑不了,跑不了寫 deferred):

```bash
pnpm typecheck
```

並用 `git diff src/components/Dialogue/CharacterPortrait.tsx src/components/Tilemap/TilemapScene.tsx` 確認:
- CharacterPortrait.tsx 比原本少 8 行(5 行 + 1 行 + 周圍空行)
- TilemapScene.tsx 只有 1 行改動(`Math.floor(Math.min(...))` → `Math.min(...)`)

## 完成後依 AGENTS.md

1. JOURNAL.md append schema entry,**Verified output 段必填**:
   - 列出兩個檔案的具體 diff(可用 `git diff <file>` 拷貝過去)
   - typecheck 結果(deferred to Claude 也行)
2. codex-prompts/019-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**(Claude 跑 typecheck/build + chrome 實測再做)

## 不要做

- 不要動 props interface(`emotion?: string` 留著,只是不 render)
- 不要動 VnScene / EventGraph / DialogueView / DialogueBox
- 不要改 sprite / portrait / map(那是 018 範圍)
- 不要加新 feature
- 不要 push
