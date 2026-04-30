# Codex Prompt 024 — 對話框 anchor 改 top(往下長,跟立繪連著)

STATUS: pending
SKILL: 無(純 React code task,不需 image_gen)
依賴:022 完成
產出:
- `src/components/Dialogue/DialogueView.tsx` 對話框 wrapper 從 bottom-anchored 改成 top-anchored

不動:其他所有檔(includes DialogueBox.tsx 內部)

---

## Why

當前 DialogueBox 是 `bottom-0` + padding-bottom anchored,**文字越多 box 高度往「上」長**(top 邊往上跑,bottom 固定)→ 立繪會被往上推 / 跟對話框中間會生出 gap。

用戶要:對話框 top 對齊立繪 bottom,**文字越多 box 高度往「下」長**。

---

## Task — exact text replace 兩處

### Change 1 — DialogueView.tsx 第 80-92 行對話框 wrapper

**Search this exact text in `src/components/Dialogue/DialogueView.tsx`:**

```tsx
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-6 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-10 md:pb-16 lg:pb-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-2 sm:gap-3">
          <DialogueBox
            speaker={props.speakerName}
            text={props.text}
            onAdvance={showChoices ? undefined : props.onAdvance}
            showContinueHint={!showChoices}
          />
          {showChoices ? (
            <ChoiceList choices={props.choices ?? []} onSelect={props.onChoose ?? (() => {})} />
          ) : null}
        </div>
      </div>
```

**Replace with:**

```tsx
      <div className="absolute top-[82%] sm:top-[80%] md:top-[78%] left-0 right-0 z-20 px-3 sm:px-6 max-h-[22dvh] overflow-y-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-2 sm:gap-3">
          <DialogueBox
            speaker={props.speakerName}
            text={props.text}
            onAdvance={showChoices ? undefined : props.onAdvance}
            showContinueHint={!showChoices}
          />
          {showChoices ? (
            <ChoiceList choices={props.choices ?? []} onSelect={props.onChoose ?? (() => {})} />
          ) : null}
        </div>
      </div>
```

差異:
- `bottom-0` → `top-[82%] sm:top-[80%] md:top-[78%]`(對話框 top 在 viewport 底部 18%/20%/22% 上方,對齊 portrait wrapper bottom 那條線 — 即 prompt 022 的 portrait `bottom-[18%] sm:[20%] md:[22%]`)
- 移除 `pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-10 md:pb-16 lg:pb-20`(底部 padding 不再需要,對話框 top 已固定)
- 加 `max-h-[22dvh] overflow-y-auto`(對話框最高 22dvh,文字超長就 scroll 而不是溢出 viewport)

## Acceptance(自我驗證 + Claude chrome 實測)

Codex side:
- `git diff src/components/Dialogue/DialogueView.tsx` 顯示恰好上面兩段 search/replace
- `pnpm typecheck` pass(sandbox 跑不了寫 deferred)

Claude side(Codex 不必跑,只是 spec 紀錄):
- chrome 實測:portrait bottom edge 跟 dialogue box top edge 的 gap < 5 px
- 文字長度增加時 box bottom 往下伸展(box top 不動)
- portrait img 位置不被推動

## Verified output 必填

JOURNAL `Verified output:`:

1. `git diff src/components/Dialogue/DialogueView.tsx` 內容(複製貼上 diff text)
2. typecheck pass / fail / deferred
3. 確認沒動到其他檔(`git diff --name-only` 應該只列 DialogueView.tsx + JOURNAL.md + 本 prompt 檔)

## 完成後

1. JOURNAL.md append entry,Verified output 三項
2. codex-prompts/024-...md STATUS: → ready-for-commit / blocked
3. **不要 git commit / push**

## 不要做

- 不要動 DialogueBox.tsx / CharacterPortrait.tsx
- 不要動 portrait wrapper(prompt 022 已設好 bottom-[18%]...)
- 不要改 ChoiceList
- 不要 push
