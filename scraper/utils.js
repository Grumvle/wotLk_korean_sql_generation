export function between(hay, start, end) {
  if (!hay) return null;
  const i = hay.indexOf(start);
  if (i === -1) return null;
  const j = hay.indexOf(end, i + start.length);
  if (j === -1) return null;
  return hay.substring(i + start.length, j);
}

export function betweenAll(hay, start, end, limit = 4) {
  const out = [];
  if (!hay) return out;
  let idx = 0;
  while (out.length < limit) {
    const s = hay.indexOf(start, idx);
    if (s === -1) break;
    const e = hay.indexOf(end, s + start.length);
    if (e === -1) break;
    out.push(hay.substring(s + start.length, e));
    idx = e + end.length;
  }
  return out;
}

export function stripHtml(s) {
  if (s == null) return null;
  return String(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/이 퀘스트는 더 이상 게임 내에서 받을 수 없습니다./g, '')
    .trim();
}