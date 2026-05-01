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

  // ─── 大掃除場景:用 narration 模擬進育幼院 ───
  e107_go: {
    type: 'narration',
    text: '你跟著蘇嫚君來到了育幼院。',
    next: 'e107_dialogue',
  },
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
