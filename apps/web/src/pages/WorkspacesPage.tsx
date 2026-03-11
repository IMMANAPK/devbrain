import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import client from '../api/client';

const COMMON_STACKS = ['NestJS', 'React', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Node.js', 'Docker', 'Redis', 'GraphQL', 'Vue', 'Angular', 'Python', 'FastAPI', 'Go'];

function CreateModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => client.post('/workspaces', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      onClose();
    },
  });

  function toggleStack(tech: string) {
    setStack((prev) => prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]);
  }

  function addCustomStack() {
    const clean = stackInput.trim();
    if (clean && !stack.includes(clean)) setStack([...stack, clean]);
    setStackInput('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name, stack });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-5">New Workspace</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Workspace Name</label>
            <input
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-sky-500 text-white placeholder-gray-500"
              placeholder="e.g. My Startup, Work Project, Side Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_STACKS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleStack(tech)}
                  className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                    stack.includes(tech)
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white placeholder-gray-500"
                placeholder="Add custom tech..."
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomStack(); } }}
              />
              <button type="button" onClick={addCustomStack} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                Add
              </button>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-red-400 text-sm">Failed to create workspace. Try again.</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 rounded-lg font-semibold text-sm transition-colors"
            >
              {mutation.isPending ? 'Creating...' : 'Create Workspace'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorkspacesPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  return (
    <Layout>
      <div className="px-8 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-gray-400 text-sm mt-0.5">One workspace per project or company</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Workspace
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : workspaces.length === 0 ? (
          <div className="border border-dashed border-gray-700 rounded-xl p-16 text-center">
            <p className="text-5xl mb-4">🗂️</p>
            <p className="text-gray-300 font-semibold text-lg mb-1">No workspaces yet</p>
            <p className="text-gray-500 text-sm mb-6">Create a workspace for each project, job, or client</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws: any) => (
              <div key={ws._id} className="bg-gray-900 border border-gray-800 hover:border-sky-500/40 rounded-xl p-5 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center text-2xl">🗂️</div>
                  <span className="text-xs text-gray-600">{new Date(ws.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-base mb-3 group-hover:text-sky-400 transition-colors">{ws.name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ws.stack.slice(0, 5).map((tech: string) => (
                    <span key={tech} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{tech}</span>
                  ))}
                  {ws.stack.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-500">+{ws.stack.length - 5}</span>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Knowledge Score</span>
                  <span className="text-sm font-bold text-sky-400">{ws.score || 0}%</span>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <button
              onClick={() => setShowModal(true)}
              className="border border-dashed border-gray-700 hover:border-sky-500/50 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-sky-400 transition-colors min-h-[180px]"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm font-medium">New Workspace</span>
            </button>
          </div>
        )}
      </div>

      {showModal && <CreateModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
