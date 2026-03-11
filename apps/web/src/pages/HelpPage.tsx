import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

// ── TOC sections ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'what-is', label: 'What is DevBrain?' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'notes', label: 'Notes & Capture' },
  { id: 'score', label: 'Knowledge Score' },
  { id: 'feed', label: 'Dev Feed' },
  { id: 'interview', label: 'Interview Mode' },
  { id: 'cli', label: 'CLI Tool' },
  { id: 'ai-setup', label: 'AI Setup' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'api-reference', label: 'API Reference' },
];

// ── Reusable doc components ────────────────────────────────────────────────

function SectionTitle({ id, icon, children }: { id: string; icon: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-xl font-bold text-white mb-4 scroll-mt-6">
      <span className="text-2xl">{icon}</span>
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-sky-400 mb-2 mt-6">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 text-sm leading-relaxed mb-3">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-sky-300 text-xs font-mono">
      {children}
    </code>
  );
}

function CodeBlock({ children, lang = '' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative group mb-4">
      <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-t-lg px-4 py-1.5">
        <span className="text-xs text-gray-500 font-mono">{lang}</span>
        <button
          onClick={copy}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-900 border border-t-0 border-gray-700 rounded-b-lg px-4 py-3 text-xs text-gray-200 font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {children.trim()}
      </pre>
    </div>
  );
}

function InfoBox({ type = 'info', children }: { type?: 'info' | 'tip' | 'warn'; children: React.ReactNode }) {
  const styles = {
    info: 'border-sky-500/30 bg-sky-500/5 text-sky-300',
    tip:  'border-green-500/30 bg-green-500/5 text-green-300',
    warn: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300',
  };
  const icons = { info: 'ℹ️', tip: '💡', warn: '⚠️' };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm mb-4 flex gap-3 ${styles[type]}`}>
      <span className="shrink-0">{icons[type]}</span>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <div className="text-sm text-gray-400 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {children}
    </span>
  );
}

function Divider() {
  return <hr className="border-gray-800 my-10" />;
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('what-is');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <Layout>
      <div className="flex min-h-full">
        {/* ── Sticky TOC sidebar ── */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-800 px-4 py-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                  activeSection === s.id
                    ? 'text-sky-400 bg-sky-500/10 font-medium'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main ref={contentRef} className="flex-1 px-8 py-8 max-w-3xl overflow-y-auto">
          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">📖</span>
              <div>
                <h1 className="text-3xl font-bold">DevBrain Docs</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Developer guide — what it is, how to use it, how it works
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Badge color="border-sky-500/30 text-sky-400">v1.0</Badge>
              <Badge color="border-green-500/30 text-green-400">NestJS + React</Badge>
              <Badge color="border-purple-500/30 text-purple-400">AI-Powered</Badge>
            </div>
          </div>

          {/* ── 1. What is DevBrain ── */}
          <SectionTitle id="what-is" icon="🧠">What is DevBrain?</SectionTitle>
          <P>
            DevBrain is an <strong className="text-white">AI-powered personal knowledge management system</strong> built
            specifically for developers. Think of it as your second brain — a place to capture everything you learn,
            build, and discover as a developer, then use AI to recall and reason over it.
          </P>
          <P>
            Unlike generic note apps, DevBrain understands your <strong className="text-white">tech stack</strong>,
            scores your knowledge against industry syllabi, surfaces relevant GitHub releases and dev.to articles,
            and lets you have AI-powered Q&amp;A sessions grounded in your own notes.
          </P>

          <div className="grid grid-cols-3 gap-3 my-6">
            {[
              { icon: '📝', label: 'Capture', desc: 'Notes from web, CLI, or git hooks' },
              { icon: '🤖', label: 'Enrich', desc: 'AI adds tags, summaries & interview Qs' },
              { icon: '🎯', label: 'Score', desc: 'See gaps vs industry standards' },
            ].map((c) => (
              <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">{c.icon}</p>
                <p className="text-sm font-semibold mb-1">{c.label}</p>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>

          <Divider />

          {/* ── 2. Getting Started ── */}
          <SectionTitle id="getting-started" icon="🚀">Getting Started</SectionTitle>
          <P>Follow these steps to go from zero to a working knowledge base in under 5 minutes.</P>

          <Step n={1} title="Register an account">
            Go to <Code>/register</Code>, enter your name, email and password. Your data is stored
            locally in MongoDB — no external services required.
          </Step>
          <Step n={2} title="Create a Workspace">
            Navigate to <Code>/workspaces</Code> → <strong className="text-white">New Workspace</strong>.
            Give it a name (e.g. <em>"Acme Corp Interview"</em>) and add your tech stack
            (e.g. <Code>nestjs</Code>, <Code>react</Code>, <Code>mongodb</Code>). The stack drives
            the Knowledge Score and Dev Feed.
          </Step>
          <Step n={3} title="Add your first note">
            Go to <Code>/notes/new</Code>, select your workspace, and type anything you learned or built.
            Hit <strong className="text-white">Save Note</strong>. The AI enrichment pipeline runs in the
            background within seconds (if Ollama is running).
          </Step>
          <Step n={4} title="Compute your Knowledge Score">
            Go to <Code>/score</Code>, select your workspace and role (Backend / Frontend / Fullstack),
            then click <strong className="text-white">⚡ Compute Score</strong>. Your notes are matched
            against the role syllabus and scored.
          </Step>
          <Step n={5} title="Ask questions in Interview Mode">
            Go to <Code>/interview</Code> and ask any question. The AI searches your notes
            semantically and answers using your own knowledge as context.
          </Step>

          <InfoBox type="tip">
            You don't need Ollama or Claude to use the app. Notes, scores, feed, and workspaces all
            work without AI. AI only enhances enrichment and Interview Mode.
          </InfoBox>

          <Divider />

          {/* ── 3. Dashboard ── */}
          <SectionTitle id="dashboard" icon="⚡">Dashboard</SectionTitle>
          <P>The dashboard (<Code>/</Code>) gives you a bird's-eye view of your knowledge base.</P>
          <ul className="space-y-2 mb-4">
            {[
              ['Workspaces count', 'Number of active project workspaces'],
              ['Avg Knowledge Score', 'Average score across all your workspaces'],
              ['Notes Captured', 'Total notes saved (fetched live from API)'],
              ['Workspace cards', 'Each card shows tech stack pills and a knowledge score bar'],
              ['Daily Prompt', 'A reminder to capture one thing you learned today'],
            ].map(([name, desc]) => (
              <li key={name as string} className="flex gap-2 text-sm">
                <span className="text-sky-400 shrink-0">→</span>
                <span><strong className="text-white">{name}</strong> — <span className="text-gray-400">{desc}</span></span>
              </li>
            ))}
          </ul>

          <Divider />

          {/* ── 4. Workspaces ── */}
          <SectionTitle id="workspaces" icon="🗂️">Workspaces</SectionTitle>
          <P>
            A <strong className="text-white">Workspace</strong> represents a project, company, or learning context.
            Each workspace has its own notes, knowledge score, and dev feed.
          </P>
          <SubTitle>Fields</SubTitle>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 pr-4 text-gray-400 font-medium">Field</th>
                  <th className="text-left py-2 pr-4 text-gray-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {[
                  ['Name', 'e.g. "Google SWE Prep", "Side Project", "Current Job"'],
                  ['Stack', 'Comma-separated tech keywords — drives score & feed'],
                  ['Git Path', 'Optional. Path to local repo for git-commit auto-capture'],
                  ['Score', 'Computed knowledge score (0–100). Updated after each note.'],
                ].map(([f, d]) => (
                  <tr key={f as string}>
                    <td className="py-2 pr-4 font-mono text-sky-300 text-xs">{f}</td>
                    <td className="py-2 text-gray-400 text-xs">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <InfoBox type="tip">
            Use specific tech keywords in the stack field: <Code>nestjs</Code>, <Code>react</Code>,
            {' '}<Code>mongodb</Code>, <Code>redis</Code>, <Code>docker</Code>, <Code>typescript</Code>.
            These map to real GitHub repos and dev.to tags.
          </InfoBox>

          <Divider />

          {/* ── 5. Notes ── */}
          <SectionTitle id="notes" icon="📝">Notes & Knowledge Capture</SectionTitle>
          <P>
            Notes are the core of DevBrain. A note is anything you learned, built, debugged, or researched.
            Keep them short (1–3 paragraphs) and focused on one topic for best AI enrichment.
          </P>
          <SubTitle>What happens after you save a note?</SubTitle>
          <div className="space-y-2 mb-5">
            {[
              ['1. Saved to MongoDB', 'Raw content stored immediately'],
              ['2. Enrich Queue (BullMQ)', 'Job queued in Redis for background processing'],
              ['3. AI Enrichment', 'Ollama/Claude generates: enriched summary, interview questions, tags'],
              ['4. Vector Embedding', 'nomic-embed-text model creates a 768-dim embedding'],
              ['5. Qdrant Storage', 'Embedding stored for semantic search'],
              ['6. Score Recompute', 'Knowledge score recomputed for the workspace'],
            ].map(([step, desc]) => (
              <div key={step as string} className="flex gap-3 text-xs">
                <span className="text-sky-400 font-mono shrink-0">{step}</span>
                <span className="text-gray-400">→ {desc}</span>
              </div>
            ))}
          </div>
          <SubTitle>Note Sources</SubTitle>
          <P>Notes can be captured from three sources:</P>
          <ul className="space-y-1.5 mb-4 text-sm text-gray-400">
            <li><Code>web</Code> — The web UI at <Code>/notes/new</Code></li>
            <li><Code>cli</Code> — The <Code>devbrain add</Code> terminal command</li>
            <li><Code>git-commit</Code> — Auto-captured from git commit messages (via CLI hook)</li>
          </ul>
          <SubTitle>Searching Notes</SubTitle>
          <P>
            The search bar on <Code>/notes</Code> uses MongoDB full-text search across
            <Code>rawContent</Code> and <Code>enrichedContent</Code>. For semantic/AI search,
            use Interview Mode.
          </P>

          <Divider />

          {/* ── 6. Score ── */}
          <SectionTitle id="score" icon="🎯">Knowledge Health Score</SectionTitle>
          <P>
            The Knowledge Score (<Code>/score</Code>) measures how well your notes cover the
            expected topics for a given developer role. It's like a study progress tracker
            for interview prep.
          </P>
          <SubTitle>How it's calculated</SubTitle>
          <CodeBlock lang="formula">{`
Final Score = (Coverage × 0.4) + (Depth × 0.4) + (Recency × 0.2)

Coverage  = % of syllabus topics with at least 1 matching note
Depth     = avg keyword match density across covered topics
Recency   = bonus for notes created in the last 30 days
          `}</CodeBlock>
          <SubTitle>Score Tiers</SubTitle>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { range: '90–100%', label: 'Expert', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
              { range: '70–89%', label: 'Proficient', color: 'text-sky-400 border-sky-500/30 bg-sky-500/5' },
              { range: '50–69%', label: 'Learning', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' },
              { range: '< 50%', label: 'Beginner', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
            ].map((t) => (
              <div key={t.label} className={`border rounded-lg px-3 py-2 flex justify-between items-center ${t.color}`}>
                <span className="font-semibold text-sm">{t.label}</span>
                <span className="text-xs opacity-70">{t.range}</span>
              </div>
            ))}
          </div>
          <SubTitle>Interview Readiness</SubTitle>
          <div className="space-y-1 mb-4 text-sm text-gray-400">
            <div className="flex justify-between"><span>Senior Ready</span><Code>≥ 85%</Code></div>
            <div className="flex justify-between"><span>Mid Ready</span><Code>≥ 75%</Code></div>
            <div className="flex justify-between"><span>Junior Ready</span><Code>≥ 65%</Code></div>
            <div className="flex justify-between"><span>Not Ready</span><Code>{'< 65%'}</Code></div>
          </div>
          <SubTitle>Available Roles</SubTitle>
          <P>Backend (12 topics), Frontend (9 topics), Fullstack (11 topics) — all defined in <Code>syllabus.data.ts</Code>.</P>

          <Divider />

          {/* ── 7. Dev Feed ── */}
          <SectionTitle id="feed" icon="📡">Dev Feed</SectionTitle>
          <P>
            The Dev Feed (<Code>/feed</Code>) surfaces the latest GitHub releases and dev.to articles
            matched to your workspace's tech stack — keeping you up to date without leaving the app.
          </P>
          <SubTitle>Data Sources</SubTitle>
          <ul className="space-y-1.5 mb-4 text-sm text-gray-400">
            <li>🔮 <strong className="text-white">GitHub Releases API</strong> — fetches latest releases from mapped repos (e.g. <Code>nestjs/nest</Code>, <Code>facebook/react</Code>)</li>
            <li>📰 <strong className="text-white">dev.to API</strong> — fetches top articles by tag (e.g. <Code>#nestjs</Code>, <Code>#typescript</Code>)</li>
          </ul>
          <SubTitle>Stack → Feed Mapping</SubTitle>
          <P>When you add <Code>nestjs</Code> to your workspace stack, the feed fetches:</P>
          <CodeBlock lang="mapping">{`
nestjs   → github: nestjs/nest       + devto: #nestjs
react    → github: facebook/react    + devto: #react
mongodb  → github: mongodb/node-mongodb-native
redis    → github: redis/ioredis     + devto: #redis
docker   → github: docker/compose    + devto: #docker
          `}</CodeBlock>
          <InfoBox type="info">
            Feed results are cached for 15 minutes to avoid GitHub's 60 req/hour unauthenticated rate limit.
            Set <Code>GITHUB_TOKEN</Code> in the API <Code>.env</Code> to increase this to 5,000 req/hour.
          </InfoBox>

          <Divider />

          {/* ── 8. Interview Mode ── */}
          <SectionTitle id="interview" icon="🤖">Interview Mode</SectionTitle>
          <P>
            Interview Mode (<Code>/interview</Code>) is an AI chat interface that answers questions
            using your notes as context — a <strong className="text-white">RAG (Retrieval-Augmented Generation)</strong> pipeline.
          </P>
          <SubTitle>How RAG works in DevBrain</SubTitle>
          <CodeBlock lang="pipeline">{`
1. You ask:  "How does JWT authentication work in my project?"

2. Embed:    Ollama nomic-embed-text → 768-dim vector

3. Search:   Qdrant finds top-8 notes semantically similar
             (optionally filtered by workspace)

4. Fetch:    MongoDB retrieves full note content

5. Prompt:   System: "Here are the dev's notes: [context]..."
             User:   "Question: How does JWT work?"

6. Generate: Claude or Ollama answers grounded in your notes

7. Return:   { answer, sources: [note1, note2, ...] }
          `}</CodeBlock>
          <SubTitle>Tips for best results</SubTitle>
          <ul className="space-y-1.5 mb-4 text-sm text-gray-400 list-none">
            <li>→ Write detailed notes — more content = better semantic matches</li>
            <li>→ Select a specific workspace to scope the search</li>
            <li>→ Ask about concepts you've captured notes on</li>
            <li>→ If Ollama isn't running, the AI falls back to a helpful error message</li>
          </ul>
          <InfoBox type="warn">
            Interview Mode requires Ollama to be running for embeddings. Even if you use Claude API for answering,
            embeddings always use Ollama's <Code>nomic-embed-text</Code> model.
          </InfoBox>

          <Divider />

          {/* ── 9. CLI ── */}
          <SectionTitle id="cli" icon="⌨️">CLI Tool</SectionTitle>
          <P>
            The DevBrain CLI lets you capture notes directly from your terminal — no browser needed.
            Install it once and capture learnings while you code.
          </P>
          <SubTitle>Install</SubTitle>
          <CodeBlock lang="bash">{`
cd apps/cli
pnpm build
npm link          # makes 'devbrain' available globally
          `}</CodeBlock>
          <SubTitle>Commands</SubTitle>
          <CodeBlock lang="bash">{`
# Login (saves JWT token locally)
devbrain login

# Add a note interactively
devbrain add

# Add a note inline
devbrain add -c "Learned about Redis TTL invalidation patterns"

# Search your notes
devbrain search "redis caching"

# Manage workspaces
devbrain workspace list
devbrain workspace use <id>
          `}</CodeBlock>
          <SubTitle>Git Commit Hook</SubTitle>
          <P>Auto-capture every git commit message as a note:</P>
          <CodeBlock lang="bash">{`
# In your repo root
echo 'devbrain add -c "$(git log -1 --pretty=%B)"' >> .git/hooks/post-commit
chmod +x .git/hooks/post-commit
          `}</CodeBlock>
          <InfoBox type="tip">
            The CLI stores its config (token, active workspace) in <Code>~/.config/devbrain/config.json</Code> via the <Code>conf</Code> package.
          </InfoBox>

          <Divider />

          {/* ── 10. AI Setup ── */}
          <SectionTitle id="ai-setup" icon="⚙️">AI Setup</SectionTitle>
          <P>
            DevBrain supports two AI providers. You can use either — or both. Ollama is free and runs
            locally; Claude API is cloud-based and produces higher-quality results.
          </P>
          <SubTitle>Option A — Ollama (Free, Local)</SubTitle>
          <CodeBlock lang="bash">{`
# 1. Install Ollama
# https://ollama.ai

# 2. Pull required models
ollama pull llama3            # for note enrichment
ollama pull nomic-embed-text  # for vector embeddings (REQUIRED)

# 3. Start Ollama
ollama serve                  # runs on localhost:11434
          `}</CodeBlock>
          <SubTitle>Option B — Claude API (Cloud, Better Quality)</SubTitle>
          <CodeBlock lang="bash">{`
# Add to apps/api/.env
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxx
          `}</CodeBlock>
          <P>
            When <Code>CLAUDE_API_KEY</Code> is set, the enrichment pipeline uses Claude for text generation.
            Ollama is still used for embeddings (Claude has no embedding API).
          </P>
          <SubTitle>Environment Variables</SubTitle>
          <CodeBlock lang=".env">{`
# apps/api/.env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/devbrain
REDIS_HOST=localhost
REDIS_PORT=6379
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
CLAUDE_API_KEY=           # optional — enables Claude enrichment
          `}</CodeBlock>

          <Divider />

          {/* ── 11. Tech Stack ── */}
          <SectionTitle id="tech-stack" icon="🏗️">Tech Stack</SectionTitle>
          <P>DevBrain is a Turborepo monorepo with three apps and two shared packages.</P>
          <SubTitle>Monorepo Structure</SubTitle>
          <CodeBlock lang="tree">{`
devbrain/
├── apps/
│   ├── api/         NestJS REST API (port 3001)
│   ├── web/         React + Vite + Tailwind (port 5173)
│   └── cli/         Node.js CLI (Commander.js)
├── packages/
│   ├── shared/      Shared TypeScript types & DTOs
│   └── ai-core/     AI provider abstraction (Ollama + Claude)
├── docker-compose.yml   Redis only (MongoDB & Qdrant run locally)
├── turbo.json
└── pnpm-workspace.yaml
          `}</CodeBlock>
          <SubTitle>Key Dependencies</SubTitle>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { layer: 'API', items: 'NestJS, Mongoose, BullMQ, Passport JWT, Axios' },
              { layer: 'Web', items: 'React 18, Vite, Tailwind CSS, TanStack Query, Zustand' },
              { layer: 'Databases', items: 'MongoDB (notes/users), Qdrant (vectors), Redis (queues)' },
              { layer: 'AI', items: 'Ollama (local), Claude API (cloud), nomic-embed-text' },
            ].map((r) => (
              <div key={r.layer} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-sky-400 mb-1">{r.layer}</p>
                <p className="text-xs text-gray-400">{r.items}</p>
              </div>
            ))}
          </div>
          <SubTitle>NestJS Modules</SubTitle>
          <CodeBlock lang="modules">{`
AppModule
├── AuthModule        JWT auth, login, register
├── UsersModule       User CRUD
├── WorkspacesModule  Workspace CRUD
├── NotesModule       Note CRUD + text search + stats
├── AgentsModule      BullMQ: EnrichProcessor
├── ScoreModule       BullMQ: ScoreProcessor + scoring logic
├── FeedModule        GitHub releases + dev.to feed
├── InterviewModule   RAG Q&A pipeline
├── QdrantModule      @Global() — vector DB service
└── ConfigModule      @Global() — env vars
          `}</CodeBlock>

          <Divider />

          {/* ── 12. API Reference ── */}
          <SectionTitle id="api-reference" icon="📡">API Reference</SectionTitle>
          <P>All endpoints are prefixed with <Code>/api</Code> and require a JWT Bearer token (except auth routes).</P>
          <SubTitle>Auth</SubTitle>
          <CodeBlock lang="http">{`
POST /api/auth/register   { name, email, password }
POST /api/auth/login      { email, password }  → { token, user }
          `}</CodeBlock>
          <SubTitle>Workspaces</SubTitle>
          <CodeBlock lang="http">{`
GET    /api/workspaces
POST   /api/workspaces        { name, stack[], gitPath? }
GET    /api/workspaces/:id
DELETE /api/workspaces/:id
          `}</CodeBlock>
          <SubTitle>Notes</SubTitle>
          <CodeBlock lang="http">{`
POST   /api/notes                 { workspaceId, rawContent, source? }
GET    /api/notes/stats           → { count }
GET    /api/notes/workspace/:id
GET    /api/notes/search?query=&workspaceId=
GET    /api/notes/:id
PATCH  /api/notes/:id             { rawContent?, tags? }
DELETE /api/notes/:id
          `}</CodeBlock>
          <SubTitle>Knowledge Score</SubTitle>
          <CodeBlock lang="http">{`
GET  /api/scores/workspace/:id
POST /api/scores/workspace/:id/compute          (async via queue)
POST /api/scores/workspace/:id/compute-now?role=Backend
          `}</CodeBlock>
          <SubTitle>Feed</SubTitle>
          <CodeBlock lang="http">{`
GET /api/feed/workspace/:id          (uses workspace stack)
GET /api/feed?stack=nestjs,react     (manual stack)
          `}</CodeBlock>
          <SubTitle>Interview</SubTitle>
          <CodeBlock lang="http">{`
POST /api/interview/ask   { question, workspaceId? }
→ { answer, sources: Note[], model }
          `}</CodeBlock>

          {/* Footer */}
          <div className="mt-12 mb-6 p-6 bg-gradient-to-r from-sky-500/5 to-purple-500/5 border border-sky-500/10 rounded-2xl text-center">
            <p className="text-2xl mb-2">🧠</p>
            <p className="text-sm text-gray-300 font-medium">DevBrain — Your developer second brain</p>
            <p className="text-xs text-gray-600 mt-1">Built with NestJS · React · Ollama · Qdrant · MongoDB</p>
          </div>
        </main>
      </div>
    </Layout>
  );
}
