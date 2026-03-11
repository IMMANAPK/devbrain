import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import client from '../api/client';

// ── Types ─────────────────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  type: 'github' | 'devto';
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  source: string;
  tags: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Sub-components ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: FeedItem['type'] }) {
  if (type === 'github') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Release
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18z" />
        <path d="M0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.29zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.6-2.43.15-.15h1.4l-.08.37c-.1.4-.4 1.6-.71 2.74-.59 2.23-.61 2.3-.14 2.98.5.71.39.66-.88 1.85z" />
      </svg>
      Article
    </span>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900 border border-gray-800 hover:border-sky-500/40 rounded-xl p-5 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TypeBadge type={item.type} />
            <span className="text-xs text-gray-500">{item.source}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{timeAgo(item.publishedAt)}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors leading-snug mb-2">
            {item.title}
          </h3>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{item.summary}</p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <span className="text-gray-700 group-hover:text-sky-500 transition-colors shrink-0 mt-1 text-sm">→</span>
      </div>
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
          <div className="flex gap-2 mb-3">
            <div className="h-4 w-16 bg-gray-800 rounded-full" />
            <div className="h-4 w-24 bg-gray-800 rounded" />
          </div>
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-full mb-1" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [workspaceId, setWorkspaceId] = useState('');
  const [filter, setFilter] = useState<'all' | 'github' | 'devto'>('all');

  const { data: workspaces = [] } = useQuery<any[]>({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  const { data: feedItems = [], isLoading, isFetching } = useQuery<FeedItem[]>({
    queryKey: ['feed', workspaceId],
    queryFn: () => client.get(`/feed/workspace/${workspaceId}`).then((r) => r.data),
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000, // 10 min — feed doesn't change often
  });

  const filtered = filter === 'all' ? feedItems : feedItems.filter((i) => i.type === filter);

  const selectedWorkspace = workspaces.find((ws: any) => ws._id === workspaceId);

  return (
    <Layout>
      <div className="px-8 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dev Feed</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Latest releases &amp; articles matched to your stack
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Workspace selector */}
          <select
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">Select Workspace</option>
            {workspaces.map((ws: any) => (
              <option key={ws._id} value={ws._id}>
                {ws.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          {workspaceId && (
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {(['all', 'github', 'devto'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'github' ? '🔮 Releases' : '📰 Articles'}
                </button>
              ))}
            </div>
          )}

          {/* Stack pills */}
          {selectedWorkspace && (
            <div className="flex gap-1.5 flex-wrap">
              {selectedWorkspace.stack.slice(0, 6).map((tech: string) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 border border-gray-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {!workspaceId ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📡</p>
            <p className="text-gray-300 font-medium">Pick a workspace to load your feed</p>
            <p className="text-gray-500 text-sm mt-2">
              We'll match your stack to the latest GitHub releases and dev.to articles
            </p>
          </div>
        ) : isLoading || isFetching ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-300 font-medium">No feed items found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adding popular tech keywords to your workspace stack (e.g. react, nestjs, docker)
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-4">
              {filtered.length} items · refreshes every 15 min
            </p>
            <div className="space-y-3">
              {filtered.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
