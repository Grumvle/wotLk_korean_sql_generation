export function normalizeText(s) {
    if (s == null) return null;
    s = String(s);

    // HTML 줄바꿈을 먼저 개행으로
    s = s.replace(/<br\s*\/?>/gi, '\n');

    // 명시 토큰 매핑
    s = s.replace(/<\s*name\s*>/gi, '$N')
        .replace(/<\s*class\s*>/gi, '$c')
        .replace(/<\s*race\s*>/gi, '$r');

    // 성별 분기: <A/B> → $GA:B;
    s = s.replace(
        /<\s*([^<>\/|]+?)\s*\/\s*([^<>\/|]+?)\s*>/g,
        (m, a, b) => `$G${a.trim()}:${b.trim()};`
    );

    // 남은 HTML 태그 제거
    s = s.replace(/<\/?[^>]+>/g, '');

    // 개행 → $B
    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '$B');

    // 공백 정리
    s = s.replace(/[ \t]{2,}/g, ' ').trim();

    return s.length ? s : null;
}
