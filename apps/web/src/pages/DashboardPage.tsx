import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/Layout';
import client from '../api/client';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-sky-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  const label = score >= 80 ? 'Expert' : score >= 60 ? 'Proficient' : score >= 40 ? 'Learning' : 'Beginner';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{score}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  const { data: noteStats } = useQuery({
    queryKey: ['notes-stats'],
    queryFn: () => client.get('/notes/stats').then((r) => r.data),
  });

  const avgScore = workspaces.length
    ? Math.round(workspaces.reduce((sum: number, ws: any) => sum + (ws.score || 0), 0) / workspaces.length)
    : 0;

  return (
    <Layout>
      <div className="px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Good day, <span className="text-sky-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">What did you build today?</p>
        </div>

        {/* Quick actions */}
        <div className="mb-8 flex gap-3">
          <Link to="/notes/new" className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">
            ✏️ Add Note
          </Link>
          <Link to="/notes" className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
            📝 View Notes
          </Link>
          <Link to="/workspaces" className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
            🗂️ Workspaces
          </Link>
          <Link to="/interview" className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-sm font-semibold text-purple-400 transition-colors">
            🤖 Interview Mode
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Workspaces" value={workspaces.length} sub="Active projects" color="text-sky-400" />
          <StatCard label="Avg Knowledge Score" value={`${avgScore}%`} sub="Across all workspaces" color="text-green-400" />
          <StatCard label="Notes Captured" value={noteStats?.count ?? 0} sub="Total learnings saved" color="text-purple-400" />
        </div>

        {/* Workspaces */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Workspaces</h2>
            <Link to="/workspaces" className="text-sm text-sky-400 hover:underline">View all →</Link>
          </div>

          {workspaces.length === 0 ? (
            <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
              <p className="text-4xl mb-3">🗂️</p>
              <p className="text-gray-400 font-medium">No workspaces yet</p>
              <p className="text-gray-600 text-sm mt-1 mb-4">Create a workspace for each project or company</p>
              <Link to="/workspaces" className="inline-block px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">
                Create Workspace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws: any) => (
                <div key={ws._id} className="bg-gray-900 border border-gray-800 hover:border-sky-500/50 rounded-xl p-5 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-xl">🗂️</div>
                    <span className="text-xs text-gray-500">{new Date(ws.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-sky-400 transition-colors">{ws.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ws.stack.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 bg-gray-800 rounded-md text-xs text-gray-300">{tech}</span>
                    ))}
                    {ws.stack.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded-md text-xs text-gray-500">+{ws.stack.length - 4}</span>
                    )}
                  </div>
                  <ScoreBar score={ws.score || 0} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Daily prompt */}
        <div className="mt-8 bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/20 rounded-xl p-6">
          <p className="text-sm text-sky-400 font-semibold mb-1">Daily Prompt</p>
          <p className="text-lg font-medium">"What's one thing you learned or built today?"</p>
          <p className="text-gray-400 text-sm mt-1">Takes 30 seconds. Your future self will thank you.</p>
          <Link to="/notes/new" className="inline-block mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">
            Capture Now →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
