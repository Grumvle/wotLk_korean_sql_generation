// sqlbuilder/questOfferRewardBuilder.js
import { normalizeText } from '../scraper/normalize.js';

// 공용 이스케이프(텍스트/숫자)
function sqlEscapeText(s) {
    if (s == null) return 'NULL';
    return "'" + String(s)
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/'/g, "\\'")
        + "'";
}
function sqlEscapeNumber(n) {
    return (n == null || isNaN(+n)) ? 0 : +n;
}

/**
 * quest_offer_reward_locale UPSERT 생성기
 * RewardText ← RewardText 매핑 (동일 스크래핑 결과 재사용)
 */
export function buildQuestOfferRewardUpsertSQL(id, locale, f) {
    const cols = ['ID', 'locale', 'RewardText', 'VerifiedBuild'];
    const vals = [
        id,
        sqlEscapeText(locale),
        sqlEscapeText(normalizeText(f.RewardText)), // 핵심 매핑
        sqlEscapeNumber(f.VerifiedBuild)
    ];

    const updates = [
        'RewardText = newrow.RewardText',
        'VerifiedBuild = newrow.VerifiedBuild'
    ];

    return 'INSERT IGNORE INTO `quest_offer_reward_locale` (' +
    cols.map(c => '`' + c + '`').join(', ') +
    ') VALUES (' + vals.join(', ') + ');';
}
