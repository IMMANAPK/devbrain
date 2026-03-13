# DevBrain

AI-powered developer knowledge management platform that helps you capture, organize, enrich, and recall your technical knowledge through interview preparation.

DevBrain acts as your "second brain" for development - using Retrieval-Augmented Generation (RAG) to answer questions grounded in your own notes and knowledge, supplemented by AI.

## Features

- **Note Management** - Create, organize, and tag your technical notes from multiple sources (web, CLI, git commits)
- **AI Enrichment** - Automatically enrich notes with interview questions, tags, and expanded content
- **Interview Mode** - Ask questions and get AI answers grounded in your personal knowledge base via RAG
- **Knowledge Scoring** - Track your interview readiness across topics (Junior/Mid/Senior levels)
- **Workspaces** - Isolate knowledge per project or technology stack
- **Learning Feed** - Curated GitHub releases and dev.to articles for your tech stack
- **CLI Tool** - Capture notes directly from the terminal

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  Login → Dashboard → Notes → Interview → Feed → Score       │
└─────────────────────────────────────────────────────────────┘
                           ↓ axios
┌─────────────────────────────────────────────────────────────┐
│                  API (NestJS on :3001)                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Auth       │   Notes      │  Interview   │  Score/Feed    │
│   (JWT)      │  (CRUD)      │  (RAG)       │  (Compute)     │
└──────────────┴──────────────┴──────────────┴────────────────┘
     ↓              ↓                ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│  MongoDB  │  Redis (Bull)  │  Qdrant  │  Ollama/Claude AI  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Query, React Router |
| **Backend** | NestJS 10, Mongoose, Passport JWT, Bull queues |
| **Database** | MongoDB 8, Qdrant (vectors), Redis 7 |
| **AI** | Claude API, Groq, Ollama (local), Puter.js (client-side) |
| **CLI** | Commander, Chalk, Ora |
| **Tooling** | pnpm, Turborepo, TypeScript |

## Project Structure

```
devbrain/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   ├── web/          # React frontend (port 5173)
│   └── cli/          # Command-line interface
├── packages/
│   ├── ai-core/      # AI provider abstraction (Claude, Ollama)
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MongoDB (local or cloud)
- Redis (or via Docker)
- Ollama (for embeddings) or Claude API key

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd devbrain
pnpm install
```

### 2. Start Infrastructure

```bash
# Start Redis via Docker
docker-compose up -d

# Ensure MongoDB is running (local or cloud)
# Ensure Ollama is running for embeddings (optional if using Claude)
```

### 3. Configure Environment

Copy the example env file and configure:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/devbrain
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Provider (pick one - Groq is free):
GROQ_API_KEY=your-groq-api-key-here
# CLAUDE_API_KEY=your-claude-api-key (optional)
# OLLAMA_URL=http://localhost:11434
# OLLAMA_MODEL=llama3
```

### 4. Run Development Servers

```bash
# Run all apps concurrently
pnpm dev

# Or run individually:
pnpm api      # Backend on http://localhost:3001
pnpm web      # Frontend on http://localhost:5173
```

## CLI Usage

```bash
# Authenticate
devbrain login <email> <password>

# Add a note
devbrain add "React useEffect runs after render" -t react,hooks

# Search notes
devbrain search "useEffect"

# List workspaces
devbrain workspace list

# Set active workspace
devbrain workspace use <workspace-id>
```

## API Endpoints

Base URL: `http://localhost:3001/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT |
| `/notes` | GET/POST | List/create notes |
| `/notes/search` | POST | Search notes |
| `/interview/ask` | POST | Ask question (full RAG) |
| `/interview/context` | POST | Get RAG context only |
| `/workspaces` | GET/POST | List/create workspaces |
| `/score/compute` | POST | Compute knowledge score |
| `/feed` | GET | Get learning feed |

## How It Works

### Note Enrichment Pipeline

```
User creates note → Enrich Queue → AI enrichment (Claude/Ollama)
→ Extract tags + interview questions + enriched content
→ Generate embeddings → Store in Qdrant vector DB
→ Trigger score computation
```

### Interview RAG Pipeline

1. Embed user question using Ollama
2. Vector search in Qdrant (top 8 results)
3. Fetch note content from MongoDB
4. Generate AI response with context
5. Return answer with source citations

### Knowledge Scoring

- Coverage: What % of topics are covered in notes
- Depth: How detailed are the notes per topic
- Recency: Bonus for recent notes
- Overall score maps to Junior/Mid/Senior readiness

## Scripts

```bash
pnpm dev        # Run all apps in development
pnpm build      # Build all apps
pnpm lint       # Lint all apps
pnpm test       # Run tests
pnpm api        # Run API only
pnpm web        # Run web only
pnpm cli        # Run CLI in dev mode
```

## Docker

```bash
# Start Redis
docker-compose up -d

# Stop
docker-compose down
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API server port (default: 3001) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_HOST` | Yes | Redis host (default: localhost) |
| `REDIS_PORT` | Yes | Redis port (default: 6379) |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | JWT expiry (default: 7d) |
| `GROQ_API_KEY` | No* | Groq API key (free tier available) |
| `CLAUDE_API_KEY` | No* | Anthropic Claude API key |
| `OLLAMA_URL` | No* | Ollama server URL |
| `OLLAMA_MODEL` | No | Ollama model (default: llama3) |
| `QDRANT_URL` | No | Qdrant URL (default: localhost:6333) |

*At least one AI provider is required

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT
