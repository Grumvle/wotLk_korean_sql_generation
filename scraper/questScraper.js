import { between, betweenAll, stripHtml } from './utils.js';

function parseObjectivesFromIconList(html) {
    // icon-list 블록만 추출
    const table = between(html, '<table class="icon-list">', '</table>');
    if (!table) return []; // 1) 없으면 빈 배열 반환

    // 2) 제공됨이 있으면 건너뜀
    if (/\(\s*제공됨\s*\)/.test(table)) return [];

    // 3) <tr> ... </tr> 블록 수집
    const trs = betweenAll(table, '<tr', '</tr>', 32).map(tr => '<tr' + tr + '</tr>');

    const out = [];
    for (const tr of trs) {
        const td = between(tr, '<td>', '</td>');
        if (!td) continue;

        const aChunk = between(td, '<a', '</a>');
        if (!aChunk) continue;

        const gt = aChunk.indexOf('>');
        const anchorText = gt >= 0 ? aChunk.slice(gt + 1) : aChunk;
        const text = stripHtml(anchorText).trim();
        if (!text) continue;

        out.push(text);
        if (out.length >= 4) break;
    }
    return out;
}


export async function scrapeKoreanById(id, origRow) {
    const url = `https://www.wowhead.com/cata/ko/quest=${id}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const html = await res.text();

    const Title         = stripHtml(between(html, '<h1 class="heading-size-1">', '</h1>'));
    const Details       = stripHtml(between(html, '<h2 class="heading-size-3">서술</h2>', '<h2 class="heading-size-3">'));
    const Objectives    = stripHtml(between(html, '</h1>', '<table class="icon-list">'));
    const EndText       = null;
    const CompletedText = null;
    const RewardText = stripHtml(between(html, '<div id="lknlksndgg-completion" style="display: none">', '</div>'));
    const objList = parseObjectivesFromIconList(html);

    return {
        Title,
        Details,
        Objectives,
        EndText,
        CompletedText,
        ObjectiveText1: objList[0] || null,
        ObjectiveText2: objList[1] || null,
        ObjectiveText3: objList[2] || null,
        ObjectiveText4: objList[3] || null,
        VerifiedBuild: 18019,
        RewardText: RewardText || null
    };
}

scrapeKoreanById(13695);