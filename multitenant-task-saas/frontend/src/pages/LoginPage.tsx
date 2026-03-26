import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAppStore } from '../context/store';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const [form, setForm] = useState({ slug: 'zenith-demo', email: 'admin@zenith.local', password: 'Admin123!' });
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setAuth(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="subtle">Demo credentials are prefilled.</p>
        </div>
        <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="workspace slug" />
        <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" />
        <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password" />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button className="btn w-full">Sign in</button>
        <p className="subtle text-sm">Need a workspace? <Link className="text-accent" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
