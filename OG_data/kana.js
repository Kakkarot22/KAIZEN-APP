/* Japanese input: romaji → hiragana as you type (wanakana), plus an on-screen kana keyboard
   for phones or when you do not have a Japanese IME. Your own system IME also works. */

const ROWS = [
  ['あ', 'い', 'う', 'え', 'お'], ['か', 'き', 'く', 'け', 'こ'], ['さ', 'し', 'す', 'せ', 'そ'], ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'], ['は', 'ひ', 'ふ', 'へ', 'ほ'], ['ま', 'み', 'む', 'め', 'も'], ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'], ['わ', '', 'を', '', 'ん']
];
const DAKU = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ', う: 'ゔ' };
const HANDAKU = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };
const SMALL = { あ: 'ぁ', い: 'ぃ', う: 'ぅ', え: 'ぇ', お: 'ぉ', や: 'ゃ', ゆ: 'ゅ', よ: 'ょ', つ: 'っ', わ: 'ゎ' };
const invert = o => Object.fromEntries(Object.entries(o).map(([a, b]) => [b, a]));
const UNDAKU = invert(DAKU), UNHANDAKU = invert(HANDAKU), UNSMALL = invert(SMALL);

export function bindKana(input) {
  if (window.wanakana) { try { window.wanakana.bind(input, { IMEMode: 'toHiragana' }); } catch (e) {} }
}
export function unbindKana(input) {
  if (window.wanakana) { try { window.wanakana.unbind(input); } catch (e) {} }
}

export function kanaPadHTML() {
  const cols = ROWS.map(col => `<div class="kp-col">${col.map(k => k ? `<button type="button" class="kp-key" data-k="${k}">${k}</button>` : '<span class="kp-gap"></span>').join('')}</div>`).join('');
  return `<div class="kanapad" id="kanapad" role="group" aria-label="Kana keyboard">
    <div class="kp-grid">${cols}</div>
    <div class="kp-mods">
      <button type="button" class="kp-key mod" data-m="daku" title="Add or remove ゛">゛</button>
      <button type="button" class="kp-key mod" data-m="handaku" title="Add or remove ゜">゜</button>
      <button type="button" class="kp-key mod" data-m="small" title="Make the last kana small (っ ゃ ゅ ょ)">小</button>
      <button type="button" class="kp-key mod" data-k="ー" title="Long vowel mark">ー</button>
      <button type="button" class="kp-key mod" data-m="back" title="Delete">⌫</button>
    </div></div>`;
}

/** Wire the pad to an input. Keeps the caret where the user put it. */
export function wirePad(pad, input) {
  pad.addEventListener('mousedown', e => { if (e.target.closest('.kp-key')) e.preventDefault(); });
  pad.addEventListener('click', e => {
    const b = e.target.closest('.kp-key'); if (!b) return;
    const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s, v = input.value;
    const put = (text, from, to) => { input.value = v.slice(0, from) + text + v.slice(to); const c = from + text.length; input.setSelectionRange(c, c); };
    if (b.dataset.k) put(b.dataset.k, s, en);
    else {
      const m = b.dataset.m;
      if (m === 'back') { if (s !== en) put('', s, en); else if (s > 0) put('', s - 1, s); }
      else if (s > 0) {
        const last = v[s - 1];
        const map = m === 'daku' ? (DAKU[last] || UNDAKU[last] || UNHANDAKU[last] && DAKU[UNHANDAKU[last]])
          : m === 'handaku' ? (HANDAKU[last] || UNHANDAKU[last] || UNDAKU[last] && HANDAKU[UNDAKU[last]])
          : (SMALL[last] || UNSMALL[last]);
        if (map) put(map, s - 1, s);
      }
    }
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

