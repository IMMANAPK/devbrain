import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import client from '../api/client';

const sourceIcon = (source: string) =>
  source === 'cli' ? '💻' : source === 'git-commit' ? '🔀' : '🌐';

export default function NotesPage() {
  const [workspaceId, setWorkspaceId] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', workspaceId],
    queryFn: () => client.get(`/notes/workspace/${workspaceId}`).then((r) => r.data),
    enabled: !!workspaceId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', workspaceId] }),
  });

  const filtered = search
    ? notes.filter((n: any) =>
        n.rawContent.toLowerCase().includes(search.toLowerCase()) ||
        n.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : notes;

  return (
    <Layout>
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notes</h1>
            <p className="text-gray-400 text-sm mt-0.5">Your captured learnings</p>
          </div>
          <Link to="/notes/new" className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">
            ✏️ Add Note
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            className="px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">Select Workspace</option>
            {workspaces.map((ws: any) => (
              <option key={ws._id} value={ws._id}>{ws.name}</option>
            ))}
          </select>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white placeholder-gray-500"
              placeholder="Search notes or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        {!workspaceId ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">📂</p>
            <p>Select a workspace to view notes</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-400">No notes yet</p>
            <Link to="/notes/new" className="inline-block mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">
              Add your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{filtered.length} note{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((note: any) => (
              <div key={note._id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-white leading-relaxed flex-1">{note.rawContent}</p>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-600 mb-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                    <span title={note.source}>{sourceIcon(note.source)}</span>
                  </div>
                </div>
                {note.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {note.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded text-xs">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <span className="text-xs text-gray-600 capitalize">{note.source}</span>
                  <button
                    onClick={() => deleteMutation.mutate(note._id)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
