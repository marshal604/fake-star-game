# Codex Prompt 041 — 對白改寫採納 codex review report 建議

STATUS: pending
SKILL: 無(純文字改寫,exact text replace)
依賴:040 review report
產出:
- `src/content/events/main-story.ts` 多段 dialogue / narration / choice 改寫(去 AI 感)

不動:sign-suman.ts(report 評分大多 1-2,維持)/ 其他 .ts/.tsx / portrait / sprite / map

---

## 採納清單

從 `codex-prompts/040-dialogue-review-report.md` 挑出 AI 感 ≥ 4 的 nodes 跟幾個 ≥ 3 但建議精準的,**機械 exact text replace**:

---

### Change 1 — `start` narration

**Search this exact text:**

```ts
  start: {
    type: 'narration',
    text: '簽下蘇嫚君後,日子過得很快。\n\n某個午後,蘇嫚君欲言又止地走進辦公室。',
    next: 'e101_a',
  },
```

**Replace with:**

```ts
  start: {
    type: 'narration',
    text: '行事曆翻到了下個月,通告本上的紅筆密了一格又一格。\n\n某個午後,蘇嫚君站在辦公室門口,手裡捏著一個牛皮信封。',
    next: 'e101_a',
  },
```

### Change 2 — `e101_b` 蘇嫚君人手不夠

**Search this exact text:**

```ts
  e101_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「我想……回育幼院一趟。那邊最近人手不夠……」',
    next: 'e101_choice',
  },
```

**Replace with:**

```ts
  e101_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「林媽媽說……小班的孩子感冒了一半,晚餐也沒人顧。我想回去一趟……」',
    next: 'e101_choice',
  },
```

### Change 3 — `e101_choice` 選項標籤

**Search this exact text:**

```ts
    options: [
      { label: '當然好,你去吧。', next: 'e101_yes', setFlags: { suman_orphanage_visits: 1 } },
      { label: '工作要緊,改天再說。', next: 'e101_no' },
    ],
```

**Replace with:**

```ts
    options: [
      { label: '通告我幫妳挪一下,妳去。', next: 'e101_yes', setFlags: { suman_orphanage_visits: 1 } },
      { label: '今天通告排滿了,明天再說。', next: 'e101_no' },
    ],
```

### Change 4 — `e101_yes` suman 慌張承諾

**Search this exact text:**

```ts
  e101_yes: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真的嗎?謝謝你!我一定會把工作補回來的。」',
    next: 'e103_intro',
  },
```

**Replace with:**

```ts
  e101_yes: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真、真的嗎?謝謝!我晚上回來練,真的!台詞我都帶著!」',
    next: 'e103_intro',
  },
```

### Change 5 — `e103_intro` 增加生活細節

**Search this exact text:**

```ts
  e103_intro: {
    type: 'narration',
    text: '幾週後的某天早上,蘇嫚君沒來上班。\n\n秘書說她從昨晚就連絡不上。',
    next: 'e104_a',
  },
```

**Replace with:**

```ts
  e103_intro: {
    type: 'narration',
    text: '幾週後的某天早上,蘇嫚君的位子是空的。\n\n秘書遞來一張便條:「她家電話從昨晚就一直忙線,我留了三次話都沒回。」',
    next: 'e104_a',
  },
```

### Change 6 — `e104_a` 改可見動作

**Search this exact text:**

```ts
  e104_a: {
    type: 'narration',
    text: '隔天,蘇嫚君紅著眼眶走進辦公室。',
    next: 'e104_b',
  },
```

**Replace with:**

```ts
  e104_a: {
    type: 'narration',
    text: '隔天,她推門進來,外套皺成一團,鞋尖還沾著乾掉的泥。',
    next: 'e104_b',
  },
```

### Change 7 — `e104_b` 拆吞吐

**Search this exact text:**

```ts
  e104_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「對不起……我昨天回育幼院了,沒跟你說……」',
    next: 'e104_choice',
  },
```

**Replace with:**

```ts
  e104_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「對不起……我昨天……跑回去了。電話、電話我忘了打……」',
    next: 'e104_choice',
  },
```

### Change 8 — `e104_choice` 選項人話

**Search this exact text:**

```ts
    options: [
      { label: '小孩重要,我不怪你。', next: 'e104_kind', setFlags: { suman_friendship: 50 } },
      { label: '下次要先請假。', next: 'e104_strict' },
    ],
```

**Replace with:**

```ts
    options: [
      { label: '先坐下,慢慢說。', next: 'e104_kind', setFlags: { suman_friendship: 50 } },
      { label: '我擔心的是妳不見,不是請假。', next: 'e104_strict' },
    ],
```

### Change 9 — `e104_kind` 加層次

**Search this exact text:**

```ts
  e104_kind: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「謝謝……謝謝你……」',
    next: 'e106_intro',
  },
```

**Replace with:**

```ts
  e104_kind: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「謝謝……我以為你會趕我走的……」',
    next: 'e106_intro',
  },
```

### Change 10 — `e104_strict`

**Search this exact text:**

```ts
  e104_strict: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「對不起,下次我一定先講……」',
    next: 'e106_intro',
  },
```

**Replace with:**

```ts
  e104_strict: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「我知道……我只是那時候真的慌了。」',
    next: 'e106_intro',
  },
```

### Change 11 — `e106_intro` 加季節

**Search this exact text:**

```ts
  e106_intro: {
    type: 'narration',
    text: '十月初,蘇嫚君又來找你。',
    next: 'e106_a',
  },
```

**Replace with:**

```ts
  e106_intro: {
    type: 'narration',
    text: '十月初,空氣轉涼。蘇嫚君拿著一張育幼院寄來的通知單,猶豫了半天才走進來。',
    next: 'e106_a',
  },
```

### Change 12 — `e107_go` 抵達感

**Search this exact text:**

```ts
  e107_go: {
    type: 'narration',
    text: '你跟著蘇嫚君來到了育幼院。',
    next: 'e107_enter',
  },
```

**Replace with:**

```ts
  e107_go: {
    type: 'narration',
    text: '坐了二十多分鐘的公車,鐵門吱呀一聲推開。\n\n林院長剛好在曬被子,看到蘇嫚君,先笑了出來:「妳又跑回來啦?」',
    next: 'e107_enter',
  },
```

### Change 13 — `e107_dialogue` 具體插曲

**Search this exact text:**

```ts
  e107_dialogue: {
    type: 'narration',
    text: '育幼院的小朋友看到蘇嫚君,開心地圍上來。\n你跟蘇嫚君一起整理庭院、擦窗、收拾玩具。',
    next: 'e107_a',
  },
```

**Replace with:**

```ts
  e107_dialogue: {
    type: 'narration',
    text: '小志爬到你腿上偷看了五次,每次都被別的小孩拉開。\n你舉著抹布,蘇嫚君遞給你水桶,結果踩到玩具車差點摔倒。',
    next: 'e107_a',
  },
```

### Change 14 — `e107_a` 大掃除後感謝(重點)

**Search this exact text:**

```ts
  e107_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「謝謝你陪我來。看到孩子們的笑容,我什麼都忘了。」',
    next: 'e108_intro',
  },
```

**Replace with:**

```ts
  e107_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「欸,你剛剛被小志叫叔叔的時候,臉真的好好笑……啊,不是啦!我是說……謝謝你今天來。窗戶那邊如果只有我,大概擦到天黑吧。」',
    next: 'e108_intro',
  },
```

### Change 15 — `e108_intro` 動作取代「小心翼翼」

**Search this exact text:**

```ts
  e108_intro: {
    type: 'narration',
    text: '十二月初,蘇嫚君小心翼翼地問:',
    next: 'e108_a',
  },
```

**Replace with:**

```ts
  e108_intro: {
    type: 'narration',
    text: '十二月初。蘇嫚君把一張紅色邀請卡的折角折了又折,直到走到你桌前才開口:',
    next: 'e108_a',
  },
```

### Change 16 — `e108_a` 加邀請理由

**Search this exact text:**

```ts
  e108_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「平安夜……育幼院有聖誕聚會……你願意陪我去嗎?」',
    next: 'e108_choice',
  },
```

**Replace with:**

```ts
  e108_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「平安夜……育幼院有聖誕聚會。如果你不忙,院長說可以多帶一個大人……」',
    next: 'e108_choice',
  },
```

### Change 17 — `e108_choice` 選項口語化

**Search this exact text:**

```ts
    options: [
      { label: '當然好,我去。', next: 'e109_dialogue', setFlags: { joined_xmas: true, suman_friendship: 100 } },
      { label: '抱歉,有事走不開。', next: 'e2000w_intro' },
    ],
```

**Replace with:**

```ts
    options: [
      { label: '我把那晚空下來。', next: 'e109_dialogue', setFlags: { joined_xmas: true, suman_friendship: 100 } },
      { label: '那晚有通告,恐怕不行。', next: 'e2000w_intro' },
    ],
```

### Change 18 — `e109_dialogue` 90s 細節

**Search this exact text:**

```ts
  e109_dialogue: {
    type: 'narration',
    text: '12 月 24 日。育幼院掛起彩燈,孩子們表演聖誕劇。\n夜色溫暖,蘇嫚君悄悄站到你身邊。',
    next: 'e109_a',
  },
```

**Replace with:**

```ts
  e109_dialogue: {
    type: 'narration',
    text: '12 月 24 日。卡帶在客廳轉著小叮噹版的聖誕歌,廉價彩燈每隔幾秒閃一下。\n孩子們穿著床單演聖誕劇,那條棉被當馬槽。\n\n蘇嫚君在你旁邊坐下,雙手在膝蓋上交疊。',
    next: 'e109_a',
  },
```

### Change 19 — `e109_a` 間接表達(重點)

**Search this exact text:**

```ts
  e109_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「能跟你一起在這裡……我覺得很幸福。」',
    next: 'e2000w_intro',
  },
```

**Replace with:**

```ts
  e109_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「今天的燈泡有幾顆一直閃,可是……不知道為什麼,我覺得比百貨公司的櫥窗還漂亮。\n老闆,你不要笑我喔。」',
    next: 'e2000w_intro',
  },
```

### Change 20 — `e2000w_intro` 鋪陳

**Search this exact text:**

```ts
  e2000w_intro: {
    type: 'narration',
    text: '隔年夏天,蘇嫚君神色凝重地走進辦公室。',
    next: 'e2000w_a',
  },
```

**Replace with:**

```ts
  e2000w_intro: {
    type: 'narration',
    text: '隔年夏天。報紙頭條寫著「鉅子娛樂土地處分案」,你帳冊還沒翻完,電話又響了。\n\n蘇嫚君站在門口,手裡是一份對折的文件。',
    next: 'e2000w_a',
  },
```

### Change 21 — `e2000w_a` 不直白

**Search this exact text:**

```ts
  e2000w_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「鉅子娛樂……要把育幼院賣掉,換現金週轉。」',
    next: 'e2000w_b',
  },
```

**Replace with:**

```ts
  e2000w_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「我看不太懂……可是上面寫『處分土地』。林媽媽今天早上還說不用擔心。」',
    next: 'e2000w_b',
  },
```

### Change 22 — `e2000w_b` 絕望細節

**Search this exact text:**

```ts
  e2000w_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「兩千萬……我們籌不到那麼多錢……」',
    next: 'e2000w_choice',
  },
```

**Replace with:**

```ts
  e2000w_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「兩千萬……義賣全部加起來都不夠零頭。我昨晚算到三點,銀行說沒抵押品……」',
    next: 'e2000w_choice',
  },
```

### Change 23 — `e2000w_choice` 選項人話

**Search this exact text:**

```ts
    options: [
      { label: '這兩千萬你先拿去用。', next: 'e2000w_save', setFlags: { saved_orphanage: true, suman_friendship: 200 } },
      { label: '還是快找房子搬家吧。', next: 'e2000w_lose' },
    ],
```

**Replace with:**

```ts
    options: [
      { label: '我去調這筆錢,先把育幼院保住。', next: 'e2000w_save', setFlags: { saved_orphanage: true, suman_friendship: 200 } },
      { label: '先找臨時安置,別讓孩子沒地方睡。', next: 'e2000w_lose' },
    ],
```

### Change 24 — `e2000w_save` 真實反應(重點)

**Search this exact text:**

```ts
  e2000w_save: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真的嗎?……老闆,我不知道該說什麼。我這輩子都會記得。」',
    next: 'ending_check',
  },
```

**Replace with:**

```ts
  e2000w_save: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「你、你是說真的?兩千萬不是兩千塊耶……\n我……我先打電話給院長,她一定以為我聽錯了。」',
    next: 'ending_check',
  },
```

### Change 25 — `e2000w_lose` 補一筆

**Search this exact text:**

```ts
  e2000w_lose: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「……嗯,我會跟院長說。」',
    next: 'ending_check',
  },
```

**Replace with:**

```ts
  e2000w_lose: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「……嗯。她今天早上還說不用擔心呢。」',
    next: 'ending_check',
  },
```

### Change 26 — `ending_check` 物件回憶

**Search this exact text:**

```ts
  ending_check: {
    type: 'narration',
    text: '時間過得很快,你和蘇嫚君一起走過了三年的演藝圈。',
    next: 'ending_dialogue',
  },
```

**Replace with:**

```ts
  ending_check: {
    type: 'narration',
    text: '抽屜裡塞滿了三年來的剪報、通告本、和育幼院的合照。\n錄音帶上你還寫著她第一場戲的日期。',
    next: 'ending_dialogue',
  },
```

### Change 27 — `ending_dialogue` 不完整句

**Search this exact text:**

```ts
  ending_dialogue: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「老闆……不,以後我能不能不要叫你老闆了?」',
    next: 'ending_choice',
  },
```

**Replace with:**

```ts
  ending_dialogue: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「老闆……我今天可不可以……不要叫你老闆?」',
    next: 'ending_choice',
  },
```

### Change 28 — `ending_choice` 具體承諾

**Search this exact text:**

```ts
    options: [
      { label: '希望可以當妳的支柱。', next: 'ending_protagonist', setFlags: { ending_protagonist: true } },
      { label: '我永遠尊重妳的決定。', next: 'ending_neutral' },
    ],
```

**Replace with:**

```ts
    options: [
      { label: '以後通告本和晚餐,我都陪妳對。', next: 'ending_protagonist', setFlags: { ending_protagonist: true } },
      { label: '妳想去哪裡,我都先聽妳說。', next: 'ending_neutral' },
    ],
```

### Change 29 — `ending_protagonist` 去模板化(重點)

**Search this exact text:**

```ts
  ending_protagonist: {
    type: 'narration',
    text: '蘇嫚君臉紅了,輕輕牽起你的手。\n\n「那就……從現在起,讓我們一起走下去吧。」',
    next: 'ending_protagonist_end',
  },
```

**Replace with:**

```ts
  ending_protagonist: {
    type: 'narration',
    text: '蘇嫚君低頭看著手上的通告本,把夾在裡面的育幼院照片扶正。\n\n「那……明天開始,我還是會遲到一下下喔。可是我會先打電話。」\n\n她說完才像是想起什麼,紅著臉把手伸過來。\n\n「還有,以後不要只叫我蘇小姐了。」',
    next: 'ending_protagonist_end',
  },
```

---

## Self-check

1. 跑 `pnpm typecheck` + `pnpm build` pass
2. `git diff src/content/events/main-story.ts` 顯示恰好 29 段 search/replace
3. 沒動其他檔(git status 應該只有 main-story.ts + JOURNAL.md + 本 prompt 檔)

## Verified output

JOURNAL `Verified output:`:
1. 列 `git diff --stat` 結果(只有 main-story.ts 改動)
2. typecheck + build pass
3. Spot-check 3 個重點 node(e107_a / e109_a / ending_protagonist)diff text 都對齊上面 spec

## 完成後

STATUS: pending → ready-for-commit / blocked。不要 git commit / push。

## 不要做

- 不要動 sign-suman.ts(report 評分大多 1-2,維持原樣)
- 不要動其他 .ts/.tsx
- 不要 push
