import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import client from '../api/client';

// ── Types ─────────────────────────────────────────────────────────────────

interface Source {
  _id: string;
  rawContent: string;
  enrichedContent?: string;
  tags: string[];
  workspaceId: string;
  score: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  model?: string;
  loading?: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SourceCard({ source }: { source: Source }) {
  const [expanded, setExpanded] = useState(false);
  const text = source.enrichedContent || source.rawContent;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex gap-1 flex-wrap">
          {source.tags.slice(0, 4).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[10px]">
              #{t}
            </span>
          ))}
        </div>
        <span className="text-gray-600 text-[10px]">{source.score}% match</span>
      </div>
      <p className="text-gray-300 leading-relaxed">
        {expanded ? text : text.slice(0, 160)}
        {text.length > 160 && !expanded && '…'}
      </p>
      {text.length > 160 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-sky-400 hover:text-sky-300 mt-1 text-[10px]"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function AssistantMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3 max-w-full">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-sm">🧠</span>
      </div>

      <div className="flex-1 min-w-0">
        {msg.loading ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-2 px-1">
                  📚 {msg.sources.length} note{msg.sources.length !== 1 ? 's' : ''} used as context
                  {msg.model && (
                    <span className="ml-2 text-gray-600">· {msg.model}</span>
                  )}
                </p>
                <div className="space-y-2">
                  {msg.sources.slice(0, 3).map((s) => (
                    <SourceCard key={s._id} source={s} />
                  ))}
                </div>
              </div>
            )}

            {msg.sources?.length === 0 && (
              <p className="text-[11px] text-gray-600 mt-2 px-1">
                💡 No matching notes found — answered from general knowledge. Capture notes on this topic!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[75%] bg-sky-500/15 border border-sky-500/20 rounded-2xl rounded-tr-sm px-4 py-3">
        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
        U
      </div>
    </div>
  );
}

// ── Suggested questions ───────────────────────────────────────────────────

const SUGGESTIONS = [
  'Explain JWT authentication and how I use it in my notes',
  'What are the common patterns I use for REST APIs?',
  'Summarize what I know about Docker and containers',
  'What interview questions have I captured about databases?',
  'How does my Redis caching setup work?',
  'What are the key NestJS concepts I should review?',
];

// ── Main Page ─────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: workspaces = [] } = useQuery<any[]>({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim(),
    };
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await client.post('/interview/ask', {
        question: question.trim(),
        workspaceId: workspaceId || undefined,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                loading: false,
                content: data.answer,
                sources: data.sources,
                model: data.model,
              }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                loading: false,
                content: '⚠️ Failed to get an answer. Make sure Ollama is running (`ollama serve`) or set CLAUDE_API_KEY.',
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              🤖 Interview Mode
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Ask questions — answers are grounded in your own notes
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace scope */}
            <select
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
            >
              <option value="">All workspaces</option>
              {workspaces.map((ws: any) => (
                <option key={ws._id} value={ws._id}>{ws.name}</option>
              ))}
            </select>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700 rounded-lg"
              >
                Clear chat
              </button>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty state + suggestions */
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🧠
                </div>
                <h2 className="text-lg font-semibold mb-2">Your AI Study Partner</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Ask anything — I'll answer using your captured notes as context,<br />
                  then fill in gaps with general knowledge.
                </p>
              </div>

              <p className="text-xs text-gray-600 mb-3 text-center">Try asking…</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left px-4 py-3 bg-gray-900 border border-gray-800 hover:border-sky-500/40 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} msg={msg} />
                ) : (
                  <AssistantMessage key={msg.id} msg={msg} />
                ),
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-8 py-4 border-t border-gray-800 shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 items-end bg-gray-900 border border-gray-700 focus-within:border-sky-500 rounded-2xl px-4 py-3 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your notes… (Enter to send, Shift+Enter for new line)"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                style={{ minHeight: '24px' }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-gray-700 mt-2 text-center">
              Powered by your notes + {workspaceId ? 'workspace' : 'all'} knowledge base
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
