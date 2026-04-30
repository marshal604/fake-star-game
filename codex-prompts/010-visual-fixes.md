# Codex Prompt 010 — Tilemap visual fixes(sprite 截斷 / tile 接縫 / 滿版)

STATUS: done
SKILL: 無(純 code task)
依賴:008 完成
產出:修正 `src/components/Tilemap/{TilemapScene,PlayerSprite,NpcSprite}.tsx` 三個元件,讓 v0.1 demo 視覺乾淨

---

## 用戶實測回報的 3 個 visual bug

**Bug A — 主角 sprite 上下被截掉,4 方向看不出是同一個人**

根因:`PlayerSprite.tsx` 跟 `NpcSprite.tsx` 把 frame 當成 `tileSize × tileSize`(32×32),但 sprite sheet **每 frame 是 32 × 48**(GDD §7.2 「一格寬、一格半高」)。整張 sheet 是 4 cols × 4 rows × 32 × 48 = **128 × 192 px**(prompt 003 的 spec)。

目前 code:
```ts
height: tileSize,                                    // ← bug: 應為 tileSize * 1.5
backgroundSize: `${tileSize * 4}px ${tileSize * 6}px`,  // ← 視覺上沒寫錯但 6 是巧合(192/32=6),語意該寫 1.5*4=6 才直觀
backgroundPosition: `-${frame * tileSize}px -${FACING_ROW[facing] * tileSize}px`,  // ← bug: row 應乘 frameHeight 48 不是 tileSize 32
```

修法:把 frame 高度跟 tileSize 解耦,引入 `frameHeight = tileSize * 1.5`,並讓 sprite 的 anchor=feet → 渲染時 `top` 往上偏 `tileSize / 2`(讓 sprite 底部對齊 tile 底邊,上半身突出到上一格)。

**Bug B — Tile 之間有黑色空隙,沒有連起來**

根因:`TilemapScene.tsx` 用兩層 CSS Grid 鋪 tile,但 grid 預設可能因瀏覽器 sub-pixel rounding 在相鄰 cell 之間留 1px 縫隙(尤其 Chrome 在非整數縮放時)。即使 `gap` 是 0(預設),sub-pixel positioning 會讓相鄰 background-image 有縫。

修法:
1. **明確** 寫 `gap: 0` 在 grid style 上(避免 tailwind / browser default 影響)
2. 每個 tile cell 加 `display: block; outline: 1px solid transparent; box-shadow: 0 0 0 0.5px currentColor;` 之類的 trick — **不要用這個 hack**,改成下一條
3. 推薦做法:tile cell 不用獨立 div,改成**單一 div 用 `background-image` + 多重 background**?太複雜。最簡實際做法:在每個 cell `style` 加 `width: ${tileSize + 1}px; height: ${tileSize + 1}px; margin-right: -1px; margin-bottom: -1px`(讓 cell 多 1px 互相疊住接縫)。

**請選下面這個更簡單的 production-grade 解**:把整個 tilemap **改用單一 `<canvas>`** 或 **單一大 `<div>` 用 multi-layer background-image** 取代 grid + N 個 div。

但 v0.1 不要做太大改動,先試:
- 在 TilemapScene 的 grid container 上明確設 `gap: '0px'`、`lineHeight: 0`、`fontSize: 0`(消除 inline-block style 殘影)
- 每個 cell div 用 `style={{ width: tileSize, height: tileSize, display: 'block' }}` 並把 background-image 改成有 `background-clip: padding-box; background-origin: padding-box;`
- 終極:讓 TilemapScene 用 **`<canvas>` 直接 drawImage** 把整張地圖畫上(這條路比較長但乾淨,你判斷做得到就做,做不到回 grid 加 sub-pixel fix)

我推薦你**做 canvas 版本**(更乾淨,效能更好,而且 sprite Bug A 也可以一起在 canvas 內畫,不用兩套坐標系)。但 sprite 仍維持 React component overlay 也可以(canvas 只畫 ground+objects,sprite 還是 absolute div)。

**Bug C — Tilemap 沒滿版,在頁面中間一小塊**

根因:`TilemapScene.tsx` 的 `<main className="...flex items-center justify-center p-4">` + tilemap 容器原生大小是 `14*32=448 × 10*32=320 px`,在 1900×900 viewport 上看起來只佔不到 1/4。

修法:加 **dynamic CSS scale up** — 把 tilemap container wrap 一個 `<div style={{transform: 'scale(N)', transformOrigin: 'center'}}>`,N 由 useEffect+useState 動態算:

```ts
const [scale, setScale] = useState(1);
useEffect(() => {
  function recalc() {
    const padX = 32; // 邊距
    const padY = 32;
    const sx = (window.innerWidth - padX * 2) / (map.width * map.tileSize);
    const sy = (window.innerHeight - padY * 2) / (map.height * map.tileSize);
    setScale(Math.max(1, Math.floor(Math.min(sx, sy))));  // 整數倍 scale 保持像素感
  }
  recalc();
  window.addEventListener('resize', recalc);
  return () => window.removeEventListener('resize', recalc);
}, [map.width, map.height, map.tileSize]);
```

`Math.floor(Math.min(sx, sy))` 取整數倍(2x / 3x / 4x...)避免 sub-pixel render artifacts。`Math.max(1, ...)` 保證至少不縮小。

注意 `imageRendering: 'pixelated'` 已在 sprite 跟 tile style 上,scale 後 retro 像素感保留。

---

## 完成後依 AGENTS.md

1. JOURNAL.md append schema entry
2. codex-prompts/010-visual-fixes.md 頂端 STATUS: pending → ready-for-commit / blocked
3. **不要 git commit / push** — Claude 自己跑 typecheck/build + 開瀏覽器看實際效果再決定

## 不要做

- 不要重生 sprite / tileset(只動 React 元件)
- 不要動 office.json
- 不要動 GDD / PRD
- 不要做 NPC walking animation
- 不要加 framer-motion 之類的 lib
