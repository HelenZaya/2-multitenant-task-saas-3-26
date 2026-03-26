import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAppStore } from '../context/store';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const [form, setForm] = useState({ companyName: '', slug: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register-tenant', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setAuth(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-xl grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h1 className="text-2xl font-bold">Create workspace</h1></div>
        {['companyName', 'slug', 'name', 'email', 'password'].map((key) => (
          <input key={key} className="input" type={key === 'password' ? 'password' : 'text'} placeholder={key} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        ))}
        {error && <div className="md:col-span-2 text-sm text-red-400">{error}</div>}
        <button className="btn md:col-span-2">Register workspace</button>
        <p className="subtle md:col-span-2 text-sm">Already have one? <Link className="text-accent" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
