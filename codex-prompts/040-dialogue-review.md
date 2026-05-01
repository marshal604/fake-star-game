# Codex Prompt 040 — 對白 review:檢查 AI 感、補上人味、給改寫建議

STATUS: done (report at codex-prompts/040-dialogue-review-report.md)
SKILL: 無(純文字 review,不改 code)
依賴:039 完成
產出:
- `codex-prompts/040-dialogue-review-report.md` 新檔(只是 review 報告,不動 code)

不動:**不要改任何 .ts / .tsx 檔**(本 prompt 只 review,不 implement)

---

## 為什麼

main-story.ts 的對白是 Claude 設計的,可能有 AI 感(過於敘述、沒生活細節、結構工整、缺 90s 台灣語境)。你(Codex)當**外部 reviewer**,逐 node 評估、給具體改寫建議。

不要改 code,只寫 report。Claude 會看 report 再決定要不要採納。

---

## Task A — 讀完所有對白

```bash
cat src/content/events/sign-suman.ts
cat src/content/events/main-story.ts
```

## Task B — 用下面 check-list 逐 node 評估「AI 感」

對每個 dialogue / narration / choice 節點,**用 1-5 分** 標 AI 感(1=非常自然像真人,5=非常像 AI 寫的),並引用具體原因。

**AI 感 check-list**(出現越多分越高):

1. **過於敘述性** — narration 像「腳本說明」,缺人物 voice(例:「蘇嫚君紅著眼眶走進辦公室」)
2. **對白工整但無生活細節** — 沒有口頭禪 / 具體名詞(例「謝謝你陪我來」AI 感高;「真的耶,謝謝陪我來。等下我請你吃滷肉飯」較自然)
3. **缺角色獨特語氣** — 蘇嫚君(GDD §3 設定「天真迷糊」)講話該偶爾不知所措 / 結巴 / 用「啊」「嗯……」開頭。如果她每句都很完整流暢就不像她
4. **情感過於直白** — 直接說「我很傷心」AI 感;間接表現如「最近都睡不太好」/ 「我自己也不知道為什麼……」更像人
5. **結構對稱** — 選項 A 跟 B 的回應對白結構幾乎一樣(都「謝謝/對不起」)→ 顯得套版
6. **缺 90s 台灣 / galgame 語境** — 現在對白「modern 中性」,沒「老闆」「大人」「我這就」「拜托」等時代語感
7. **重複用詞** — 多個 node 用相同形容詞 / 表情指令
8. **節奏單調** — 每段都「narration → dialogue → dialogue → choice」沒變化,缺懸念 / 停頓 / 角色內心獨白

## Task C — 報告格式

寫到 `codex-prompts/040-dialogue-review-report.md`(新檔):

```markdown
# Dialogue Review Report — main-story + sign-suman

## 整體評估

(2-3 句總評,e.g.「整體中等偏 AI,主要問題在 X / Y / Z」)

## 逐 node 評分

### sign-suman.ts

| node | type | AI感 1-5 | 主要問題(具體) | 建議改寫(若 ≥ 3) |
|---|---|---|---|---|
| start | narration | 2 | 偏敘述但短 | (無需改) |
| knock | narration | 1 | OK | — |
| open_door | dialogue (suman) | 3 | 「請問這裡是鉅子娛樂嗎」太工整 | 「不、不、不好意思……請問……這裡是鉅子娛樂嗎?」加結巴 |
| ... | ... | ... | ... | ... |

### main-story.ts

| node | type | AI感 1-5 | 主要問題 | 建議改寫 |
| ... | ... | ... | ... | ... |

## 高 AI 感重點段落(≥ 4 分)

列出 3-5 個最該改的 node,給完整改寫版本(對白 + emotion 建議調整)。

## 整體建議

3-5 條 actionable items 給 Claude 看完報告後決定採納哪些。
```

## Task D — STATUS

寫完 report → codex-prompts/040-...md(本 prompt 檔)STATUS: pending → ready-for-review

**注意是 ready-for-review 不是 ready-for-commit**,因為 Claude 看完還可能要再 invoke 你(或自己)實際改 code。

## 不要做

- **絕對不要改 .ts / .tsx 檔**(只寫 040-dialogue-review-report.md 新 markdown)
- 不要改 main-story.ts / sign-suman.ts 對白
- 不要 git commit / push
- 不要詢問 Claude 任何問題,直接給 report
