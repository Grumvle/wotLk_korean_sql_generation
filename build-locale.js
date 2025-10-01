import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

// __dirname 대체 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ===== 스크레이퍼/빌더 임포트 =====
// 현재는 quest만 준비되어 있다면 아래 두 줄만 있어도 OK.
// npc/item 모듈을 만들면 주석 해제/추가하면 됨.
import { scrapeKoreanById as scrapeQuest } from './scraper/questScraper.js';
import { buildQuestUpsertSQL } from './sqlbuilder/questBuilder.js';
// import { scrapeNpcById } from './scraper/npcScraper.js';
// import { buildNpcUpsertSQL } from './sqlbuilder/npcBuilder.js';
// import { scrapeItemById } from './scraper/itemScraper.js';
// import { buildItemUpsertSQL } from './sqlbuilder/itemBuilder.js';

// ===== 인자 / 환경 =====
const kind   = (process.argv[2] || 'quest').toLowerCase(); // quest|npc|item ...
const LOCALE = process.env.LOCALE || 'koKR';
const OUTDIR = process.env.OUT_DIR
  ? path.resolve(__dirname, process.env.OUT_DIR)
  : path.resolve(__dirname, 'out');

// 테이블별 데이터 경로(.env)
const DATA_PATHS = {
  quest: process.env.DATA_QUEST,
  npc:   process.env.DATA_NPC,
  item:  process.env.DATA_ITEM,
};

// ===== 데이터 소스 경로 결정 =====
const srcEnvPath = DATA_PATHS[kind];
if (!srcEnvPath) {
  console.error(`[ERROR] .env에 ${kind === 'quest' ? 'DATA_QUEST' : kind === 'npc' ? 'DATA_NPC' : 'DATA_ITEM'} 변수를 설정하세요.`);
  process.exit(1);
}
const SRC = path.resolve(__dirname, srcEnvPath);

// ===== 파일 읽기 =====
if (!fs.existsSync(SRC)) {
  console.error(`[ERROR] 원본 파일을 찾을 수 없습니다: ${SRC}`);
  process.exit(1);
}
const raw = fs.readFileSync(SRC, 'utf8');
let json;
try {
  json = JSON.parse(raw);
} catch (e) {
  console.error('[ERROR] JSON 파싱 실패:', e.message);
  process.exit(1);
}
if (!json || !Array.isArray(json.rows)) {
  console.error('[ERROR] 입력 JSON에 rows[]가 없습니다.');
  process.exit(1);
}

// ===== 출력 준비 =====
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const outFile = path.join(OUTDIR, `${kind}_upsert.sql`);

// 헤더 먼저 써서, 중간에 실패해도 파일은 남게
const header =
  `-- GENERATED for AzerothCore ${kind}_locale (${LOCALE})
-- SOURCE: ${SRC}
START TRANSACTION;
`;
fs.writeFileSync(outFile, header, 'utf8');

// ===== 빌드 =====
let count = 0;

function append(sql) {
  fs.appendFileSync(outFile, sql + '\n', 'utf8');
  count++;
}

try {
  for (const row of json.rows) {
    const id = row?.ID;
    if (!id) continue;

    if (kind === 'quest') {
      const f = await scrapeQuest(id, row);
      const sql = buildQuestUpsertSQL(id, LOCALE, f);
      append(sql);
    }
    // else if (kind === 'npc') {
    //   const f = await scrapeNpcById(id, row);
    //   const sql = buildNpcUpsertSQL(id, LOCALE, f);
    //   append(sql);
    // }
    // else if (kind === 'item') {
    //   const f = await scrapeItemById(id, row);
    //   const sql = buildItemUpsertSQL(id, LOCALE, f);
    //   append(sql);
    // }
    else {
      console.error(`[ERROR] 지원하지 않는 kind: ${kind}`);
      process.exit(1);
    }
  }

  fs.appendFileSync(outFile, 'COMMIT;\n', 'utf8');
  console.log(`[DONE] ${outFile} (${count} rows)`);
} catch (e) {
  console.error('[FATAL] 처리 중 오류:', e?.stack || e);
  fs.appendFileSync(outFile, '-- ERROR DURING BUILD\nROLLBACK;\n', 'utf8');
  process.exit(1);
}
