import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const links = [
  { to: '/', label: 'Dashboard', icon: '⚡' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/notes/new', label: 'Add Note', icon: '✏️' },
  { to: '/workspaces', label: 'Workspaces', icon: '🗂️' },
  { to: '/score', label: 'Knowledge Score', icon: '🎯' },
  { to: '/feed', label: 'Dev Feed', icon: '📡' },
  { to: '/interview', label: 'Interview Mode', icon: '🤖' },
  { to: '/help', label: 'Help & Docs', icon: '📖' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-xl font-bold text-sky-400">DevBrain</span>
          <p className="text-xs text-gray-500 mt-0.5">Developer's Second Brain</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
