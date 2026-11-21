/* Grammar syllabus: every grammar point in Minna no Nihongo I & II order, then N3 grammar by theme.
   Questions here are ORIGINAL — written for the grammar point, not copied from any textbook.

   Point:    P(lessonOrTheme, 'pattern', 'meaning', [questions])
   Question: [question, [correct, wrong1, wrong2, wrong3], explanation, 'trap1 trap2 trap3', 'full English translation', [note1, note2, note3]?]
   Notes (optional): one per wrong option, on why it is wrong in that sentence; without them the app builds a template note.
   A question containing ★ is a sentence-order item; others are fill-in-the-blank.
   Point IDs are built from the book + lesson + position, so add new points at the END of a lesson. */

import { BANK } from './questions.js';
import { MINNA1 } from './grammar_minna1.js';
import { MINNA2 } from './grammar_minna2.js';
import { N3G } from './grammar_n3.js';

export const BOOKS = [
  { k: 'm1', name: 'Minna no Nihongo I', short: 'Minna I', lv: 5, unit: '第{n}課', data: MINNA1 },
  { k: 'm2', name: 'Minna no Nihongo II', short: 'Minna II', lv: 4, unit: '第{n}課', data: MINNA2 },
  { k: 'n3', name: 'N3 grammar', short: 'N3', lv: 3, unit: '{n}', data: N3G }
];

export const GRAMMAR = [];      // all points
export const POINT = {};        // id → point

const tags = s => (s || '').split(/\s+/).filter(Boolean);

BOOKS.forEach(book => {
  const count = {};
  book.data.forEach(([unit, pattern, meaning, qs]) => {
    count[unit] = (count[unit] || 0) + 1;
    const id = `${book.k}-${String(unit).replace(/[^A-Za-z0-9]/g, '') || 'u'}-${count[unit]}`;
    const pt = { id, book: book.k, lv: book.lv, unit, pattern, meaning, qids: [] };
    qs.forEach((x, i) => {
      const qid = `g-${id}-${i + 1}`;
      BANK.push({ id: qid, lv: book.lv, s: 'grammar', t: x[0].includes('★') ? 'go' : 'gf', q: x[0], o: x[1], e: x[2], d: tags(x[3]), tr: x[4] || undefined, n: x[5] || undefined, pt: id });
      pt.qids.push(qid);
    });
    GRAMMAR.push(pt); POINT[id] = pt;
  });
});

