import { useEffect, useState } from 'react';
import ServiceForm from './ServiceForm';
import WebhookLogsList from './WebhookLogsList';

export default function Dashboard({ adminKey, onLogout }) {
  const [summary, setSummary] = useState({ totalTransactions: 0, activeIntegrations: 0, successRate: 0 });
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [error, setError] = useState('');

  const api = '/api/v1/admin';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-key': adminKey
  });

  const fetchData = async () => {
    try {
      const [summaryResponse, routesResponse, logsResponse] = await Promise.all([
        fetch(`${api}/dashboard-summary`, { headers: getHeaders() }),
        fetch(`${api}/service-routes`, { headers: getHeaders() }),
        fetch(`${api}/webhook-logs?limit=10`, { headers: getHeaders() })
      ]);

      const summaryData = await summaryResponse.json();
      const routesData = await routesResponse.json();
      const logsData = await logsResponse.json();

      if (summaryData.success) setSummary(summaryData.data);
      if (routesData.success) setRoutes(routesData.data);
      if (logsData.success) setLogs(logsData.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminKey]);

  const handleSubmit = async (form) => {
    try {
      const method = editingRoute ? 'PUT' : 'POST';
      const url = editingRoute ? `${api}/service-routes/${editingRoute._id}` : `${api}/service-routes`;
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to save route');
      setEditingRoute(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${api}/service-routes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to delete route');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Marthington PG</p>
          <h1 className="text-3xl font-semibold text-white">Payment routing command center</h1>
        </div>
        <button onClick={onLogout} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:bg-slate-800">Logout</button>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total routed transactions" value={summary.totalTransactions} />
        <MetricCard title="Active integrations" value={summary.activeIntegrations} />
        <MetricCard title="Webhook success rate" value={`${summary.successRate}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Routing configuration</h2>
              <button onClick={() => setEditingRoute(null)} className="text-sm text-emerald-400">New route</button>
            </div>
            <ServiceForm editingRoute={editingRoute} onSubmit={handleSubmit} onCancel={() => setEditingRoute(null)} />
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Configured routes</h2>
            <div className="space-y-3">
              {routes.map((route) => (
                <div key={route._id} className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{route.serviceName}</p>
                    <p className="text-sm text-slate-400">{route.serviceKey} • {route.actionType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${route.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/20 text-slate-300'}`}>{route.status}</span>
                    <button onClick={() => setEditingRoute(route)} className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200">Edit</button>
                    <button onClick={() => handleDelete(route._id)} className="rounded-lg border border-rose-500/30 px-3 py-1 text-sm text-rose-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <WebhookLogsList logs={logs} />
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
