import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import client from '../api/client';

const QUICK_TAGS = ['bug-fix', 'feature', 'learning', 'architecture', 'performance', 'security'];

export default function NewNotePage() {
  const [content, setContent] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || !content.trim()) return;
    setLoading(true);
    try {
      await client.post('/notes', { workspaceId, rawContent: content, tags, source: 'web' });
      setSaved(true);
      setTimeout(() => navigate('/notes'), 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="px-8 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Add Note</h1>
          <p className="text-gray-400 text-sm mt-0.5">Capture what you learned today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workspace */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Workspace</label>
            <select
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-sky-500 text-white"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              required
            >
              <option value="">Select a workspace</option>
              {workspaces.map((ws: any) => (
                <option key={ws._id} value={ws._id}>{ws.name}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What did you learn?</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-sky-500 resize-none text-white placeholder-gray-500 leading-relaxed"
              rows={6}
              placeholder="e.g. Fixed a NestJS interceptor issue where the response was being transformed twice when using global interceptors alongside route-level ones..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <p className="text-xs text-gray-600 mt-1.5">{content.length} characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_TAGS.map((qt) => (
                <button
                  key={qt}
                  type="button"
                  onClick={() => addTag(qt)}
                  className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                    tags.includes(qt)
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  #{qt}
                </button>
              ))}
            </div>

            {/* Tag input */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg min-h-[48px] focus-within:border-sky-500 transition-colors">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded text-xs">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-sky-600 hover:text-sky-300 ml-0.5">×</button>
                </span>
              ))}
              <input
                className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput && addTag(tagInput)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || saved}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 rounded-lg font-semibold transition-colors text-sm"
            >
              {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save Note'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
