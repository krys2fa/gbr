"use client";
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|undefined>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const res = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken: '', email, password }).toString(),
      redirect: 'follow',
    });
    if (!res.ok) setError('Invalid credentials');
    else window.location.href = '/';
  }

  return (
    <div className="card">
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit">Sign in</button>
        {error && <p style={{color:'crimson'}}>{error}</p>}
      </form>
    </div>
  );
}
