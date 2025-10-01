# AzerothCore 한국어 로케일 SQL 생성기

AzerothCore용 한국어 로케일 테이블에 삽입할 SQL문을 자동 생성하는 도구입니다.

## 개요

이 프로젝트는 한국어로 작성된 WoW 데이터베이스 정보를 스크래핑하여 AzerothCore의 `*_locale` 테이블에 맞는 SQL UPSERT 문을 생성합니다.

## 기능

- **Quest 로케일 생성**: 퀘스트 한국어 번역 SQL 생성
- **NPC 로케일 생성**: NPC 한국어 번역 SQL 생성 (개발 예정)
- **Item 로케일 생성**: 아이템 한국어 번역 SQL 생성 (개발 예정)

## 프로젝트 구조

```
wotLk_korean_sql_generation/
├── build-locale.js          # 메인 빌드 스크립트
├── scraper/                 # 웹 스크래핑 모듈
│   ├── questScraper.js     # 퀘스트 데이터 스크래퍼
│   ├── normalize.js        # 데이터 정규화 유틸
│   └── utils.js            # 공통 유틸리티
├── sqlbuilder/             # SQL 생성 모듈
│   └── questBuilder.js     # 퀘스트 SQL 빌더
├── data/                   # 입력 JSON 데이터
│   ├── quest_template.json
│   └── quest_template_locale.json
├── out/                    # 생성된 SQL 파일 출력 디렉토리
├── .env                    # 환경 설정 파일
└── package.json
```

## 설치

```bash
npm install
```

## 환경 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
LOCALE=koKR
OUT_DIR=out
DATA_QUEST=data/quest_template.json
DATA_NPC=data/npc_template.json
DATA_ITEM=data/item_template.json
```

## 사용법

### Quest 로케일 생성

```bash
npm run build:quest
```

### NPC 로케일 생성 (개발 예정)

```bash
npm run build:npc
```

### Item 로케일 생성 (개발 예정)

```bash
npm run build:item
```

## 출력

생성된 SQL 파일은 `out/` 디렉토리에 저장됩니다:

- `out/quest_upsert.sql`
- `out/npc_upsert.sql`
- `out/item_upsert.sql`

각 SQL 파일은 트랜잭션으로 래핑되어 있으며, AzerothCore 데이터베이스에 직접 적용할 수 있습니다.

## 기술 스택

- **Node.js** (ESM)
- **dotenv** - 환경 변수 관리

## 라이선스

MIT
