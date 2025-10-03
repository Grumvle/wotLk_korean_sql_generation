// build-locale.js (핵심 부분만 교체/추가)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import { scrapeKoreanById as scrapeQuest } from './scraper/questScraper.js';
import { buildQuestUpsertSQL } from './sqlbuilder/questBuilder.js';
import { buildQuestOfferRewardUpsertSQL } from './sqlbuilder/questOfferRewardBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const kind   = (process.argv[2] || 'quest').toLowerCase(); // 'quest' | 'quest-both' ...
const LOCALE = process.env.LOCALE || 'koKR';
const OUTDIR = path.resolve(__dirname, process.env.OUT_DIR || 'out');

const DATA_PATHS = {
  quest: process.env.DATA_QUEST,
  'quest-both': process.env.DATA_QUEST, // ★ quest와 같은 소스 공유
  // npc: process.env.DATA_NPC,
  // item: process.env.DATA_ITEM,
};

const srcEnvPath = DATA_PATHS[kind];
if (!srcEnvPath) {
  console.error('[ERROR] .env에 DATA_QUEST 등을 설정하세요.');
  process.exit(1);
}
const SRC = path.resolve(__dirname, srcEnvPath);

if (!fs.existsSync(SRC)) {
  console.error('[ERROR] 원본 파일 없음:', SRC);
  process.exit(1);
}
const raw = fs.readFileSync(SRC, 'utf8');
const json = JSON.parse(raw);
if (!json || !Array.isArray(json.rows)) {
  console.error('[ERROR] 입력 JSON에 rows[]가 없습니다.');
  process.exit(1);
}

fs.mkdirSync(OUTDIR, { recursive: true });

// ▶ 출력 파일 2개를 미리 준비 (both 모드 대비)
const outQuest = path.join(OUTDIR, 'quest_upsert.sql');
const outOffer = path.join(OUTDIR, 'quest-offer-reward_upsert.sql');

// kind별로 실제로 쓸 파일만 헤더 작성
function initOut(file) {
  const header = `-- GENERATED (${LOCALE})\n-- SOURCE: ${SRC}\nSTART TRANSACTION;\n`;
  fs.writeFileSync(file, header, 'utf8');
}
if (kind === 'quest') initOut(outQuest);
if (kind === 'quest-both') { initOut(outQuest); initOut(outOffer); }

function append(file, sql) { fs.appendFileSync(file, sql + '\n', 'utf8'); }
function finish(file) { fs.appendFileSync(file, 'COMMIT;\n', 'utf8'); }

let count = 0;
for (const row of json.rows) {
  const id = row?.ID;
  if (!id) continue;

  // ★ 스크래핑은 딱 한 번
  const f = await scrapeQuest(id, row);

  if (kind === 'quest') {
    append(outQuest, buildQuestUpsertSQL(id, LOCALE, f));
  } else if (kind === 'quest-both') {
    // 1) quest_template_locale
    append(outQuest, buildQuestUpsertSQL(id, LOCALE, f));
    // 2) quest_offer_reward_locale (RewardText ← RewardText)
    append(outOffer, buildQuestOfferRewardUpsertSQL(id, LOCALE, {
      RewardText: f.RewardText ?? null,
      VerifiedBuild: f.VerifiedBuild ?? (row.VerifiedBuild || 0),
    }));
  }
  count++;
}

// 트랜잭션 종료
if (kind === 'quest') finish(outQuest);
if (kind === 'quest-both') { finish(outQuest); finish(outOffer); }

console.log(`[DONE] kind=${kind} rows=${count}`);
if (kind === 'quest') console.log(' ->', outQuest);
if (kind === 'quest-both') console.log(' ->', outQuest, '\n ->', outOffer);
