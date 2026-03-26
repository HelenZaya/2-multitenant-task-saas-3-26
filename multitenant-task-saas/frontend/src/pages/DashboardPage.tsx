import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { useAppStore } from '../context/store';
import { Project, Workspace } from '../types';

export function DashboardPage() {
  const setWorkspace = useAppStore((s) => s.setWorkspace);
  const setProjects = useAppStore((s) => s.setProjects);
  const projects = useAppStore((s) => s.projects);
  const [stats, setStats] = useState<any>();
  const [invite, setInvite] = useState({ name: '', email: '', role: 'TEAM_MEMBER' });

  useEffect(() => {
    Promise.all([
      api.get<Workspace>('/workspaces/me'),
      api.get<Project[]>('/projects'),
      api.get('/dashboard/stats')
    ]).then(([workspaceRes, projectsRes, statsRes]) => {
      setWorkspace(workspaceRes.data);
      setProjects(projectsRes.data);
      setStats(statsRes.data);
    });
  }, [setWorkspace, setProjects]);

  async function inviteMember() {
    await api.post('/workspaces/invite', invite);
    setInvite({ name: '', email: '', role: 'TEAM_MEMBER' });
    const refreshed = await api.get<Workspace>('/workspaces/me');
    setWorkspace(refreshed.data);
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card"><div className="subtle text-sm">Total Tasks</div><div className="mt-2 text-3xl font-bold">{stats?.total ?? '-'}</div></div>
            <div className="card"><div className="subtle text-sm">Completed</div><div className="mt-2 text-3xl font-bold">{stats?.completed ?? '-'}</div></div>
            <div className="card"><div className="subtle text-sm">Overdue</div><div className="mt-2 text-3xl font-bold text-red-400">{stats?.overdue ?? '-'}</div></div>
            <div className="card"><div className="subtle text-sm">Projects</div><div className="mt-2 text-3xl font-bold">{projects.length}</div></div>
          </div>
          <div className="card">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Projects</h2></div>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="rounded-xl border border-line p-4">
                  <div className="font-semibold">{project.name}</div>
                  <div className="subtle text-sm">{project.description}</div>
                  <div className="mt-3 flex gap-2">{project.boards.map((b) => <Link className="rounded-lg border border-line px-3 py-1 text-sm" key={b.id} to={`/board/${b.id}`}>Open {b.name}</Link>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-6">
          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Invite member</h3>
            <input className="input" placeholder="name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            <input className="input" placeholder="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <select className="input" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              <option>TENANT_ADMIN</option><option>PROJECT_MANAGER</option><option>TEAM_MEMBER</option><option>VIEWER</option>
            </select>
            <button className="btn w-full" onClick={inviteMember}>Invite</button>
          </div>
          <Link to="/reports" className="card block">
            <div className="text-lg font-semibold">Reporting Dashboard</div>
            <div className="subtle text-sm">See task status and productivity summary.</div>
          </Link>
        </aside>
      </div>
    </Layout>
  );
}
