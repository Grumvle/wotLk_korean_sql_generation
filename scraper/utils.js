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

// utils.js
export function stripHtml(s) {
  if (s == null) return null;
  let text = String(s);

  // 0) <br> → \n (개행은 나중에 normalizeText에서 $B로 바뀜)
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // 1) 보호 대상들을 안전 마커로 바꾸기
  //   - 단일 토큰: <name>, <class>, <race>
  text = text
    .replace(/<\s*name\s*>/gi, '§§NAME§§')
    .replace(/<\s*class\s*>/gi, '§§CLASS§§')
    .replace(/<\s*race\s*>/gi, '§§RACE§§');

  //   - 성별 분기: <A/B> (영문/한글/숫자/공백 허용)
  //     예: <왕/여왕>, <형제여/자매여>, <king/queen>
  text = text.replace(
    /<\s*([^<>\/|]+?)\s*\/\s*([^<>\/|]+?)\s*>/g,
    (m, a, b) => `§§GENDER§§${a}§§SEP§§${b}§§END§§`
  );

  // 2) 실제 HTML 태그 제거 (영문자로 시작하는 태그만 제거)
  text = text.replace(/<\/?[a-z][^>]*>/gi, '');

  // 3) 엔티티 정리
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 4) 마커 복구: 보호했던 각괄호 토큰을 다시 살려서
  //    normalizeText()가 나중에 $N/$c/$r/$G…; 로 변환할 수 있게 함.
  text = text
    .replace(/§§NAME§§/g, '<name>')
    .replace(/§§CLASS§§/g, '<class>')
    .replace(/§§RACE§§/g, '<race>')
    .replace(/§§GENDER§§(.*?)§§SEP§§(.*?)§§END§§/g, '<$1/$2>');

  text = text.replace(/이 퀘스트는 더 이상 게임 내에서 받을 수 없습니다\./g, '');

  return text.trim();
}
