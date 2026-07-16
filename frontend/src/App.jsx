import { useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('pg-admin-key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('pg-admin-key')));

  const handleLogin = (event) => {
    event.preventDefault();
    const submittedKey = event.target.adminKey.value.trim();
    if (!submittedKey) {
      return;
    }

    localStorage.setItem('pg-admin-key', submittedKey);
    setAdminKey(submittedKey);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pg-admin-key');
    setAdminKey('');
    setIsAuthenticated(false);
  };

  const headerText = useMemo(() => (isAuthenticated ? 'Secure admin portal' : 'Access required'), [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Central payment gateway</p>
              <h2 className="text-2xl font-semibold text-white">{headerText}</h2>
            </div>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">TLS protected</div>
          </div>
        </header>

        {!isAuthenticated ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-white">Admin access</h3>
              <p className="mt-2 text-sm text-slate-400">Enter the shared admin key to unlock the routing console.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <input name="adminKey" type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none" placeholder="Enter admin key" />
                <button type="submit" className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">Unlock dashboard</button>
              </form>
            </div>
          </main>
        ) : (
          <Dashboard adminKey={adminKey} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}
