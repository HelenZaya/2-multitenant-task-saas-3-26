import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export function ReportsPage() {
  const [stats, setStats] = useState<any>();
  useEffect(() => { api.get('/dashboard/stats').then((res) => setStats(res.data)); }, []);
  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Tasks by status</h2>
          <div className="space-y-3">{stats?.tasksByStatus?.map((item: any) => <div key={item.status} className="flex items-center justify-between rounded-lg border border-line px-4 py-3"><span>{item.status}</span><span>{item._count}</span></div>)}</div>
        </div>
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Tasks by priority</h2>
          <div className="space-y-3">{stats?.tasksByPriority?.map((item: any) => <div key={item.priority} className="flex items-center justify-between rounded-lg border border-line px-4 py-3"><span>{item.priority}</span><span>{item._count}</span></div>)}</div>
        </div>
      </div>
    </Layout>
  );
}
