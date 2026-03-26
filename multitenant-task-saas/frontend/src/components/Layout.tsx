import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../context/store';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const workspace = useAppStore((s) => s.workspace);
  const auth = useAppStore((s) => s.auth);
  const setAuth = useAppStore((s) => s.setAuth);
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-bold">Zenith Tasks</div>
            <div className="text-xs subtle">{workspace?.name || 'Workspace'}</div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/">Dashboard</Link>
            <Link to="/reports">Reports</Link>
            <button onClick={() => { localStorage.clear(); setAuth(undefined); navigate('/login'); }} className="rounded-lg border border-line px-3 py-1">Logout</button>
            <span className="subtle">{auth?.user.name}</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
