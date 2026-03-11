import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import client from '../api/client';

const ROLES = ['Fullstack', 'Backend', 'Frontend'];

const scoreColor = (score: number) =>
  score >= 80 ? 'text-green-400' : score >= 60 ? 'text-sky-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';

const barColor = (score: number) =>
  score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-sky-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';

const readinessColor = (r: string) => {
  if (r === 'Senior Ready') return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (r === 'Mid Ready') return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
  if (r === 'Junior Ready') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</p>
        <p className="text-xs text-gray-500">/ 100</p>
      </div>
    </div>
  );
}

export default function ScorePage() {
  const [workspaceId, setWorkspaceId] = useState('');
  const [role, setRole] = useState('Fullstack');
  const queryClient = useQueryClient();

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.get('/workspaces').then((r) => r.data),
  });

  const { data: score, isLoading } = useQuery({
    queryKey: ['score', workspaceId],
    queryFn: () => client.get(`/scores/workspace/${workspaceId}`).then((r) => r.data),
    enabled: !!workspaceId,
  });

  const computeMutation = useMutation({
    mutationFn: () => client.post(`/scores/workspace/${workspaceId}/compute-now?role=${role}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['score', workspaceId] }),
  });

  return (
    <Layout>
      <div className="px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Health Score</h1>
            <p className="text-gray-400 text-sm mt-0.5">See how you stack up against industry standards</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8">
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

          <select
            className="px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>

          <button
            onClick={() => computeMutation.mutate()}
            disabled={!workspaceId || computeMutation.isPending}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            {computeMutation.isPending ? 'Computing...' : '⚡ Compute Score'}
          </button>
        </div>

        {!workspaceId ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-400">Select a workspace to see your knowledge score</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : !score ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-400 mb-4">No score yet for this workspace</p>
            <button
              onClick={() => computeMutation.mutate()}
              disabled={computeMutation.isPending}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors"
            >
              {computeMutation.isPending ? 'Computing...' : 'Compute Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall score card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-8">
              <ScoreRing score={score.overallScore} />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Overall Knowledge Score</p>
                <p className={`text-4xl font-bold mb-2 ${scoreColor(score.overallScore)}`}>
                  {score.overallScore}%
                </p>
                <span className={`inline-block px-3 py-1 rounded-full border text-sm font-semibold ${readinessColor(score.interviewReadiness)}`}>
                  {score.interviewReadiness}
                </span>
                <p className="text-gray-500 text-xs mt-2">
                  Role: {score.role} · Last updated: {new Date(score.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Score tier legend */}
              <div className="hidden lg:flex flex-col gap-2 text-xs">
                {[['Expert', '90-100%', 'text-green-400'], ['Proficient', '70-89%', 'text-sky-400'], ['Learning', '50-69%', 'text-yellow-400'], ['Beginner', '<50%', 'text-red-400']].map(([label, range, color]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${barColor(label === 'Expert' ? 100 : label === 'Proficient' ? 75 : label === 'Learning' ? 55 : 30)}`} />
                    <span className={color}>{label}</span>
                    <span className="text-gray-600">{range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic scores */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold mb-5">Topic Breakdown</h2>
              <div className="space-y-4">
                {score.topics
                  .slice()
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((t: any) => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{t.topic}</span>
                          {t.noteCount > 0 && (
                            <span className="text-xs text-gray-600">{t.noteCount} note{t.noteCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${scoreColor(t.score)}`}>{t.label}</span>
                          <span className={`text-sm font-bold ${scoreColor(t.score)}`}>{t.score}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor(t.score)} rounded-full transition-all duration-700`}
                          style={{ width: `${t.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold mb-4">Top Gaps to Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {score.topics
                  .slice()
                  .sort((a: any, b: any) => a.score - b.score)
                  .slice(0, 3)
                  .map((t: any, i: number) => (
                    <div key={t.topic} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{i === 0 ? '🔴' : i === 1 ? '🟡' : '🟠'}</span>
                        <span className="text-sm font-medium">{t.topic}</span>
                      </div>
                      <p className={`text-2xl font-bold ${scoreColor(t.score)}`}>{t.score}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.noteCount === 0 ? 'No notes yet — start capturing!' : `${t.noteCount} notes — add more depth`}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
