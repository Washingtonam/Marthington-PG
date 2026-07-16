export default function WebhookLogsList({ logs }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-lg">
      <div className="border-b border-slate-700 bg-slate-950/80 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Recent webhook activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-left text-slate-400">
            <tr>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Service key</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t border-slate-800">
                <td className="px-5 py-3 font-medium text-white">{log.transactionId}</td>
                <td className="px-5 py-3">{log.serviceKey || '—'}</td>
                <td className="px-5 py-3">{log.amount} {log.currency}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${log.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-5 py-3">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
