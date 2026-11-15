// Captions: large, colourful, word-synced subtitles in Tall Tale style with keyword colour highlights.
// *word -> bright yellow (#FFD43B), ~word -> aqua splash (#58D5FF), !word -> coral pop (#FF6B6B).
import { ctx, lerp, seg, eob } from './lib.js';
import { T, lineWords } from './timing.js';

export const CAP = { y: 1470, size: 92, maxW: 940 };
let caps = [];
const SHORT = /^(a|an|the|to|of|in|on|at|by|and|but|or|so|is|it|he|she|we|i|his|her|my|no|up|for|was)$/i;
const COL = { '*': '#FFD43B', '~': '#58D5FF', '!': '#FF6B6B' };

function autoChunks(ws) {
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], n = ws[i + 1], bare = w.replace(/[^A-Za-z']/g, '');
    if (n && SHORT.test(bare) && !/[,.!?;:]$/.test(w) && (w + n).length <= 11) { out.push([i, i + 1]); i++; } else out.push([i, i]);
  }
  return out;
}

function parseWords(chunk) {
  return chunk.split(/\s+/).filter(Boolean).map((w) => {
    const m = COL[w[0]];
    return { txt: m ? w.slice(1) : w, col: m || '#FFFFFF' };
  });
}

export function buildCaptions(script) {
  caps = [];
  script.lines.forEach((ln, i) => {
    const ws = lineWords(i); if (!ws.length) return;
    const textWords = ln.text.split(/\s+/).filter(Boolean);
    const spoken = ws.length === textWords.length ? textWords : ws.map((w) => w.w);
    if (ln.caps) {
      const nm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']+/g, '');
      let from = 0;
      ln.caps.split('|').map((c) => c.trim()).filter(Boolean).forEach((c, j) => {
        const first = nm(c.split(/\s+/)[0]);
        let idx = j === 0 ? 0 : ws.findIndex((w, k) => k > from && nm(w.w) === first);
        if (idx < 0) idx = Math.min(ws.length - 1, from + 1);
        from = idx;
        caps.push({ line: i, s: ws[idx].s - 0.04, words: parseWords(c), text: c.replace(/[*~!]/g, '') });
      });
    } else {
      autoChunks(spoken).forEach(([a, b]) => {
        const txt = spoken.slice(a, b + 1).join(' ');
        caps.push({ line: i, s: ws[a].s - 0.04, words: parseWords(txt), text: txt });
      });
    }
  });
  caps.forEach((c, k) => {
    const next = caps[k + 1], lineEnd = T.lines[c.line].end;
    c.e = next ? (next.s - lineEnd > 0.6 && next.line !== c.line ? lineEnd + 0.25 : next.s) : T.dur;
  });
  return caps;
}
export const captionList = () => caps;

export function captionText(wordsOrText, x = 540, y = CAP.y, sc = 1) {
  const words = typeof wordsOrText === 'string' ? parseWords(wordsOrText) : wordsOrText;
  const size = CAP.size;
  ctx.save();
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '0px';
  const sp = size * 0.25;
  words.forEach((w) => (w.w = ctx.measureText(w.txt).width));
  const totalW = words.reduce((a, w) => a + w.w, 0) + sp * (words.length - 1);
  const fit = Math.min(1, CAP.maxW / Math.max(1, totalW));
  ctx.translate(x, y); ctx.scale(sc * fit, sc * fit);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  let cx = -totalW / 2;
  for (const w of words) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(w.txt, cx + 3, 9);
    ctx.lineWidth = 17; ctx.strokeStyle = '#0B0B10'; ctx.strokeText(w.txt, cx, 0);
    ctx.fillStyle = w.col; ctx.fillText(w.txt, cx, 0);
    cx += w.w + sp;
  }
  ctx.restore();
}

export function drawCaption(t) {
  const c = caps.find((c) => t >= c.s && t < c.e); if (!c) return;
  const lt = t - c.s;
  captionText(c.words, 540, CAP.y, lt < 0.12 ? lerp(0.82, 1, eob(seg(lt, 0, 0.12))) : 1);
}
