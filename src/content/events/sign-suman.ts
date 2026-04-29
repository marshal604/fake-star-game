import type { EventGraph } from '~/core/types';

export const signSuman: EventGraph = {
  start: {
    type: 'narration',
    text: '這裡是鉅子娛樂的辦公室。一切才剛剛起步——\n連辦公桌都還沒擺正,演藝圈的大門就已經在你眼前了。',
    next: 'knock',
  },
  knock: {
    type: 'narration',
    text: '「叩叩叩——」\n\n門外傳來敲門聲。',
    next: 'choose_door',
  },
  choose_door: {
    type: 'choice',
    prompt: '怎麼辦?',
    options: [
      { label: '去開門', next: 'open_door', setFlags: { door_opened: true } },
      { label: '假裝不在', next: 'end_silent' },
    ],
  },
  open_door: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'normal',
    text: '「不、不好意思——請問這裡是鉅子娛樂嗎?」',
    next: 'suman_intro',
  },
  suman_intro: {
    type: 'dialogue',
    speaker: 'suman',
    emotion: 'normal',
    text: '「我看到報紙上說在徵藝人……我叫蘇嫚君,我想……我想試試看!」',
    next: 'suman_observation',
  },
  suman_observation: {
    type: 'narration',
    text: '眼前的女孩有點手足無措,但眼睛很亮。',
    next: 'choose_sign',
  },
  choose_sign: {
    type: 'choice',
    options: [
      { label: '直接簽約', next: 'end_signed', setFlags: { signed_suman: true } },
      { label: '再考慮一下', next: 'end_pending' },
    ],
  },
  end_silent: { type: 'end', reason: '故事還沒開始就結束了。' },
  end_pending: { type: 'end', reason: '(v0.1 demo 到此為止,後續事件待續)' },
  end_signed: { type: 'end', reason: '蘇嫚君加入了旗下藝人。\n第一年的故事,從這裡開始。' },
};

if (import.meta.env.DEV) {
  const allKeys = new Set(Object.keys(signSuman));
  for (const [id, node] of Object.entries(signSuman)) {
    if ('next' in node && !allKeys.has(node.next)) {
      console.warn(`[sign-suman] dangling next: ${id} -> ${node.next}`);
    }

    if (node.type === 'choice') {
      for (const option of node.options) {
        if (!allKeys.has(option.next)) {
          console.warn(`[sign-suman] dangling choice next: ${id} -> ${option.next}`);
        }
      }
    }
  }
}
