# Codex Prompt 019 — 拿掉 'normal' emotion label + tilemap 滿版 scale

STATUS: pending
SKILL: 無(純 React code task)
依賴:008 完成
產出:
- `src/components/Dialogue/CharacterPortrait.tsx`(移除 emotion label rendering)
- `src/components/Tilemap/TilemapScene.tsx`(scale 算式拿掉 `Math.floor`,允許 fractional 撐滿視窗)

不動:其他所有檔案

---

## Bug A — 對話時立繪下方出現 'normal' 字

### 根因

`src/components/Dialogue/CharacterPortrait.tsx`(從 badminton-story 移植)有 emotion label 渲染:

```tsx
{emotion ? (
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs ...">
    {emotion}
  </div>
) : null}
```

我們 v0.1 EventGraph 把每段對白 `emotion: 'normal'` 寫死(`src/content/events/sign-suman.ts`),`emotion` 永遠 truthy → label 永遠顯示「normal」。

### 修法

CharacterPortrait.tsx 直接**整段移除 emotion label rendering**(v0.1 不需要 emotion 視覺指示;v0.2+ 換不同 portrait file 來表達情緒,不需要 text label)。

具體:
- 找 `if (imageUrl) {` 那個分支內的 `{emotion ? <div ...>{emotion}</div> : null}`,**整段刪掉**
- 找 fallback SVG 分支內的 `{emotion ? <span ...>· {emotion}</span> : null}`,**整段刪掉**
- 不要動 props interface(`emotion?: string` 留著,只是不 render)
- 不要動 VnScene 或 EventGraph

## Bug B — 像素地圖不是滿版

### 根因

`src/components/Tilemap/TilemapScene.tsx` 的 scale 算式:

```ts
setScale(Math.max(1, Math.floor(Math.min(sx, sy))));
```

`Math.floor` 強制整數倍 scale。1870×878 viewport vs 448×320 map:
- sx = 1870/448 ≈ 4.17, sy = 878/320 ≈ 2.74
- min(sx, sy) ≈ 2.74
- floor → 2
- 結果:stage 顯示 896×640,viewport 留 letterbox 1870-896=974 px 寬閒置

### 修法

去掉 `Math.floor`,允許 fractional scale 撐滿其中一邊(等比,不變形):

```ts
setScale(Math.max(1, Math.min(sx, sy)));
```

新結果:scale ≈ 2.74,stage 顯示 1228×878 撐滿 viewport 高,寬仍有 letterbox 但小很多。

**重要**:fractional scale 在 pixel art 上會 sub-pixel render,需要確認 `imageRendering: 'pixelated'` 已套在:
- stage 內的 tile cells (010 已加)
- player + npc sprite (010 已加)
- baked tilemap `<img>`(若 011/012 加的 baseUrl render path)

如果 stage 容器外層也需要 `image-rendering: pixelated`,順便加上。

不要做:
- 不要把 viewport 拉伸成非等比(會把 tile 變形)
- 不要動 padding(維持 32px buffer 周圍的呼吸感)
- 不要碰 ModeFader / VnScene / EndScene

## 完成後

1. JOURNAL.md append schema entry
2. codex-prompts/019-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

Verified output 段(必填):
- 列出 CharacterPortrait.tsx 改動的具體 diff(刪掉哪幾行)
- 列出 TilemapScene.tsx scale 算式改動 before/after
- imageRendering: 'pixelated' 在哪些元素已套上(列舉)

## 不要做

- 不要動 sprite / portrait / map(018 在處理)
- 不要動 EventGraph
- 不要加 lib
