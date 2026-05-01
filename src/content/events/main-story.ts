import type { EventGraph } from '~/core/types';

export const mainStory: EventGraph = {
  // ─── 育幼院線:第一次請假 ───
  start: {
    type: 'narration',
    text: '行事曆翻到了下個月,通告本上的紅筆密了一格又一格。\n\n某個午後,蘇嫚君站在辦公室門口,手裡捏著一個牛皮信封。',
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
    text: '「林媽媽說……小班的孩子感冒了一半,晚餐也沒人顧。我想回去一趟……」',
    next: 'e101_choice',
  },
  e101_choice: {
    type: 'choice',
    prompt: '怎麼回答?',
    options: [
      { label: '通告我幫妳挪一下,妳去。', next: 'e101_yes', setFlags: { suman_orphanage_visits: 1 } },
      { label: '今天通告排滿了,明天再說。', next: 'e101_no' },
    ],
  },
  e101_yes: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「真、真的嗎?謝謝!我晚上回來練,真的!台詞我都帶著!」',
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
    text: '幾週後的某天早上,蘇嫚君的位子是空的。\n\n秘書遞來一張便條:「她家電話從昨晚就一直忙線,我留了三次話都沒回。」',
    next: 'e104_a',
  },
  e104_a: {
    type: 'narration',
    text: '隔天,她推門進來,外套皺成一團,鞋尖還沾著乾掉的泥。',
    next: 'e104_b',
  },
  e104_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「對不起……我昨天……跑回去了。電話、電話我忘了打……」',
    next: 'e104_choice',
  },
  e104_choice: {
    type: 'choice',
    prompt: '怎麼回應?',
    options: [
      { label: '先坐下,慢慢說。', next: 'e104_kind', setFlags: { suman_friendship: 50 } },
      { label: '我擔心的是妳不見,不是請假。', next: 'e104_strict' },
    ],
  },
  e104_kind: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「謝謝……我以為你會趕我走的……」',
    next: 'e106_intro',
  },
  e104_strict: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「我知道……我只是那時候真的慌了。」',
    next: 'e106_intro',
  },

  // ─── 大掃除請假 ───
  e106_intro: {
    type: 'narration',
    text: '十月初,空氣轉涼。蘇嫚君拿著一張育幼院寄來的通知單,猶豫了半天才走進來。',
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

  // ─── 大掃除場景:用 narration 模擬進育幼院 ───
  e107_go: {
    type: 'narration',
    text: '坐了二十多分鐘的公車,鐵門吱呀一聲推開。\n\n林院長剛好在曬被子,看到蘇嫚君,先笑了出來:「妳又跑回來啦?」',
    next: 'e107_dialogue',
  },
  e107_dialogue: {
    type: 'narration',
    text: '小志爬到你腿上偷看了五次,每次都被別的小孩拉開。\n你舉著抹布,蘇嫚君遞給你水桶,結果踩到玩具車差點摔倒。',
    next: 'e107_a',
  },
  e107_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「欸,你剛剛被小志叫叔叔的時候,臉真的好好笑……啊,不是啦!我是說……謝謝你今天來。窗戶那邊如果只有我,大概擦到天黑吧。」',
    next: 'e108_intro',
  },

  // ─── 聖誕聚會 ───
  e108_intro: {
    type: 'narration',
    text: '十二月初。蘇嫚君把一張紅色邀請卡的折角折了又折,直到走到你桌前才開口:',
    next: 'e108_a',
  },
  e108_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「平安夜……育幼院有聖誕聚會。如果你不忙,院長說可以多帶一個大人……」',
    next: 'e108_choice',
  },
  e108_choice: {
    type: 'choice',
    options: [
      { label: '我把那晚空下來。', next: 'e109_dialogue', setFlags: { joined_xmas: true, suman_friendship: 100 } },
      { label: '那晚有通告,恐怕不行。', next: 'e2000w_intro' },
    ],
  },
  e109_dialogue: {
    type: 'narration',
    text: '12 月 24 日。卡帶在客廳轉著小叮噹版的聖誕歌,廉價彩燈每隔幾秒閃一下。\n孩子們穿著床單演聖誕劇,那條棉被當馬槽。\n\n蘇嫚君在你旁邊坐下,雙手在膝蓋上交疊。',
    next: 'e109_a',
  },
  e109_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'shy',
    text: '「今天的燈泡有幾顆一直閃,可是……不知道為什麼,我覺得比百貨公司的櫥窗還漂亮。\n老闆,你不要笑我喔。」',
    next: 'e2000w_intro',
  },

  // ─── 育幼院賣掉危機 ───
  e2000w_intro: {
    type: 'narration',
    text: '隔年夏天。報紙頭條寫著「鉅子娛樂土地處分案」,你帳冊還沒翻完,電話又響了。\n\n蘇嫚君站在門口,手裡是一份對折的文件。',
    next: 'e2000w_a',
  },
  e2000w_a: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「我看不太懂……可是上面寫『處分土地』。林媽媽今天早上還說不用擔心。」',
    next: 'e2000w_b',
  },
  e2000w_b: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「兩千萬……義賣全部加起來都不夠零頭。我昨晚算到三點,銀行說沒抵押品……」',
    next: 'e2000w_choice',
  },
  e2000w_choice: {
    type: 'choice',
    prompt: '怎麼辦?',
    options: [
      { label: '我去調這筆錢,先把育幼院保住。', next: 'e2000w_save', setFlags: { saved_orphanage: true, suman_friendship: 200 } },
      { label: '先找臨時安置,別讓孩子沒地方睡。', next: 'e2000w_lose' },
    ],
  },
  e2000w_save: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'cry',
    text: '「你、你是說真的?兩千萬不是兩千塊耶……\n我……我先打電話給院長,她一定以為我聽錯了。」',
    next: 'ending_check',
  },
  e2000w_lose: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'sad',
    text: '「……嗯。她今天早上還說不用擔心呢。」',
    next: 'ending_check',
  },

  // ─── 結局判斷 ───
  ending_check: {
    type: 'narration',
    text: '抽屜裡塞滿了三年來的剪報、通告本、和育幼院的合照。\n錄音帶上你還寫著她第一場戲的日期。',
    next: 'ending_dialogue',
  },
  ending_dialogue: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'happy',
    text: '「老闆……我今天可不可以……不要叫你老闆?」',
    next: 'ending_choice',
  },
  ending_choice: {
    type: 'choice',
    prompt: '怎麼回應?',
    options: [
      { label: '以後通告本和晚餐,我都陪妳對。', next: 'ending_protagonist', setFlags: { ending_protagonist: true } },
      { label: '妳想去哪裡,我都先聽妳說。', next: 'ending_neutral' },
    ],
  },
  ending_protagonist: {
    type: 'narration',
    text: '蘇嫚君低頭看著手上的通告本,把夾在裡面的育幼院照片扶正。\n\n「那……明天開始,我還是會遲到一下下喔。可是我會先打電話。」\n\n她說完才像是想起什麼,紅著臉把手伸過來。\n\n「還有,以後不要只叫我蘇小姐了。」',
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

if (import.meta.env.DEV) {
  const allKeys = new Set(Object.keys(mainStory));
  for (const [id, node] of Object.entries(mainStory)) {
    if ('next' in node && !allKeys.has(node.next)) {
      console.warn(`[main-story] dangling next: ${id} -> ${node.next}`);
    }

    if (node.type === 'choice') {
      for (const option of node.options) {
        if (!allKeys.has(option.next)) {
          console.warn(`[main-story] dangling choice next: ${id} -> ${option.next}`);
        }
      }
    }
  }
}
