# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered Chinese language learning WeChat Mini Program built with Taro 3.x + React and WeChat Cloud Development. It provides vocabulary learning, poetry study, idiom learning, pinyin practice, and AI tutoring via DeepSeek API.

## Commands

### Development
```bash
npm run dev:weapp    # Start development with watch mode
npm run build:weapp  # Build for production
npm install          # Install dependencies
```

### Working with Cloud Functions
Each cloud function needs to be uploaded and deployed via WeChat Developer Tools:
1. Open WeChat Developer Tools
2. Right-click on cloud function folder → "上传并部署：云端安装依赖" (Upload and deploy: install dependencies)
3. Configure environment variables (e.g., `DEEPSEEK_API_KEY` for `chat` cloud function)

### Data Import
See `DEPLOY_GUIDE.md` for detailed instructions on importing vocabulary, idioms, and question bank data.

## Architecture

### Tech Stack
- **Frontend**: Taro 3.x with React 18 (compiles to WeChat Mini Program)
- **UI**: Taro UI component library
- **Backend**: WeChat Cloud Development (云函数 + 云数据库)
- **AI**: DeepSeek API for chat functionality
- **Build**: Webpack 5 with Taro CLI
- **Linting**: ESLint, Stylelint (configured but no npm scripts defined)

### Project Structure

```
├── src/
│   ├── app.jsx                    # App entry, initializes Taro.cloud
│   ├── app.config.js              # Route & TabBar config
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state management (React Context)
│   ├── pages/                     # All page components
│   ├── services/                  # API service layer
│   │   ├── request.js             # Cloud function wrapper + DB helper class
│   │   ├── auth.js                # Login/auth service
│   │   ├── question.js            # Question/answer service
│   │   ├── study.js               # Study records service
│   │   ├── chat.js                # AI chat service
│   │   └── vocabulary.js          # Vocabulary/idiom service
│   └── utils/
│       ├── constants.js           # All constants (QUESTION_TYPES, STUDY_TYPES, etc.)
│       └── storage.js             # Local storage wrapper
│
├── cloudfunctions/                # WeChat cloud functions
│   ├── login/                     # User login/registration
│   ├── user/                      # User profile management
│   ├── question/                  # Question CRUD, answer submission
│   ├── study/                     # Study records, statistics
│   ├── chat/                      # AI chat (DeepSeek integration)
│   ├── vocabulary/                # Vocabulary/idiom queries
│   ├── import-data/               # Import vocabulary/idioms data (embedded data)
│   ├── init-questions/            # Initialize question bank
│   └── init-database/             # Initialize database collections
│
├── cloudbase/
│   ├── vocabulary.json            # Vocabulary data source (120+ words)
│   ├── idioms.json                # Idioms data source (120+ idioms)
│   └── database.schema.json       # Database schema definition
│
├── config/
│   ├── index.js                   # Base Taro config
│   ├── dev.js                     # Dev environment config
│   └── prod.js                    # Production config
│
├── dist/                          # Build output (miniProgramRoot)
├── project.config.json            # WeChat Mini Program config
└── DEPLOY_GUIDE.md                # Data import and deployment guide
```

### Key Architecture Patterns

**1. Cloud Function Communication**
- All cloud functions receive `{ action, _openid, ...params }` as input
- `_openid` is automatically injected by `request.js` callCloudFunction wrapper
- Services in `src/services/` call cloud functions via `callCloudFunction(name, data)`

**2. Authentication Flow**
- `AuthContext.jsx` provides global auth state via React Context
- `useAuth()` hook gives access to: `userInfo`, `openid`, `isLogin`, `login()`, `logout()`, etc.
- OpenID is stored in local storage and attached to all cloud function calls

**3. Database Access**
- Frontend can directly access cloud database via `Taro.cloud.database()` (wrapped in `request.js` DB class)
- Cloud functions use `wx-server-sdk` with `cloud.database()`
- Database collections are defined in `cloudbase/database.schema.json`

**4. Question System**
- Main collection: `questions_bank` (5000+ questions from 2015-2024 K12 exams)
- Question types: pinyin, literature, idiom, correction, vocabulary, comprehension, grammar, reading
- Raw question data in `k12_md/` folder (Markdown format, needs parsing)
- Answers recorded in `answer_history` collection
- Favorites stored in `favorites` collection

**5. AI Chat Integration**
- Cloud function `chat` handles AI requests
- Has local knowledge base for quick responses (修辞手法, 诗词意象, 文言虚词, etc.)
- Falls back to DeepSeek API when `DEEPSEEK_API_KEY` environment variable is configured
- Chat history stored in `chat_history` collection

**6. Data Import Strategy**
- Cloud functions CANNOT read local files from project directory
- For small datasets (vocabulary, idioms): embed data directly in cloud function code as constants
- For large datasets (questions_bank): use `import-data` cloud function with batch processing (BATCH_SIZE=50)
- See `cloudfunctions/import-data/index.js` for example of embedded data pattern

**import-data Cloud Function Actions**:
| action | Description |
|--------|-------------|
| `importAll` | Import all data (vocabulary → idioms → questions) |
| `importVocabulary` | Import only vocabulary |
| `importIdioms` | Import only idioms |
| `importQuestions` | Import only questions bank |
| `checkStatus` | Check data status in all collections |
| `clearCollection` | Clear specified collection (requires `collection` param) |

### Database Collections

| Collection | Purpose | Permissions |
|------------|---------|-------------|
| users | User profiles | Owner read/write |
| questions_bank | Question bank (5000+ questions) | Public read |
| study_records | Learning records | Owner read/write |
| chat_history | AI chat history | Owner read/write |
| answer_history | Answer history | Owner read/write |
| favorites | Favorited questions | Owner read/write |
| vocabulary | Vocabulary | Public read |
| idioms | Idioms | Public read |
| word_favorites | Favorited words | Owner read/write |

### Configuration Files

- `project.config.json`: WeChat Mini Program config (appid: wxf27009190638e333, cloudfunctionRoot: cloudfunctions/, miniprogramRoot: dist/)
- `cloud.json`: Cloud development environment configuration
- `config/index.js`: Taro framework config (designWidth: 750, outputRoot: dist)
- `babel.config.js`: Taro preset for React

**7. Real-Time Statistics (Event Bus Pattern)**
- `src/utils/eventBus.js` provides cross-page communication using Taro's event channel
- Practice pages emit `STUDY_RECORD_UPDATED` event after saving answers
- Home and Profile pages listen for this event to refresh statistics in real-time
- Pattern: `eventBus.emit('STUDY_RECORD_UPDATED')` → `eventBus.on('STUDY_RECORD_UPDATED', callback)`

### Important Notes

1. **Cloud Development**: Must be enabled in WeChat Developer Tools before cloud functions work
2. **Environment Variables**: DeepSeek API Key must be set in cloud function environment (云函数 → 云函数 → 配置), not in code
3. **Build Output**: Compiled files go to `dist/` directory (set as miniprogramRoot)
4. **Taro Cloud Init**: Cloud initialization happens in `app.jsx` before any cloud API usage
5. **TabBar Icons**: Located at `images/tabbar/` - need to be provided separately
6. **Question Data**: Large question datasets in `k12_md/` folder (2015-2024 Chinese questions in Markdown format)
7. **Data Import**: Always use `import-data` cloud function for importing vocabulary/idioms; data is embedded in code, not read from files
8. **Syntax Caution**: When embedding Chinese text with quotes in cloud functions, ensure inner quotes are escaped or removed to avoid syntax errors
9. **init-database Cloud Function**: Creates database collections if they don't exist; call via cloud console with `{ "action": "init" }`
10. **init-questions Cloud Function**: Initializes questions_bank from k12_md markdown files; use for bulk question import
11. **No Fake Data**: `src/services/study.js` returns empty arrays/objects when cloud functions fail, not mock data. This ensures users see "暂无学习记录" instead of fake scores
12. **comp.js Build Issue**: If `summer-compiler miss dist/ js file, comp.js` error occurs, run production build: `rm -rf dist && npm run build:weapp`

### Recent Bug Fixes (2025-01)

**Question Options Placeholder Bug** ([src/services/question.js](src/services/question.js)):
- Fixed `generateExtendedIdiom()`, `generateExtendedVocabulary()`, `generateExtendedLiterature()` showing "选项1/2/3/4" placeholders
- Now generates real distractors from other questions in the dataset

**Fake Data Removal** ([src/services/study.js](src/services/study.js)):
- Removed `MOCK_RECORDS` array with hardcoded scores (85, 90, 75, etc.)
- `getRecords()`, `getReport()`, `getAnalysis()`, `getStudyCalendar()` now return empty data when cloud functions fail
