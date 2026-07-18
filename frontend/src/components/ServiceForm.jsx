import { useState, useEffect } from 'react';

const emptyForm = {
  serviceName: '',
  serviceKey: '',
  gatewayName: '',
  secretHash: '',
  signatureHeader: '',
  targetDatabaseURI: '',
  targetCollection: '',
  actionType: '',
  status: 'active'
};

export default function ServiceForm({ onSubmit, editingRoute, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingRoute) {
      setForm({
        serviceName: editingRoute.serviceName || '',
        serviceKey: editingRoute.serviceKey || '',
        gatewayName: editingRoute.gatewayName || '',
        secretHash: editingRoute.secretHash || '',
        signatureHeader: editingRoute.signatureHeader || '',
        targetDatabaseURI: editingRoute.targetDatabaseURI || '',
        targetCollection: editingRoute.targetCollection || '',
        actionType: editingRoute.actionType || '',
        status: editingRoute.status || 'active'
      });
    } else {
      setForm({ ...emptyForm });
    }
  }, [editingRoute]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Service name</span>
          <input name="serviceName" required value={form.serviceName} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Service key</span>
          <input name="serviceKey" required value={form.serviceKey} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Gateway name</span>
          <input name="gatewayName" required value={form.gatewayName} onChange={handleChange} placeholder="e.g. Flutterwave" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Webhook secret hash</span>
          <input name="secretHash" required type="password" value={form.secretHash} onChange={handleChange} placeholder="Enter the gateway secret" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Signature header name</span>
          <input name="signatureHeader" required value={form.signatureHeader} onChange={handleChange} placeholder="e.g. verif-hash or x-paystack-signature" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Target database URI</span>
          <input name="targetDatabaseURI" required value={form.targetDatabaseURI} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Target collection</span>
          <input name="targetCollection" required value={form.targetCollection} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Action type</span>
          <input name="actionType" required value={form.actionType} onChange={handleChange} placeholder="e.g. UPGRADE_PLAN or BUY_EBOOK" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Status</span>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400">Save route</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:bg-slate-800">Cancel</button>
        )}
      </div>
    </form>
  );
}
