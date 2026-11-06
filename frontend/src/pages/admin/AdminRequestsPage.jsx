import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Search, Droplet, Building2, User } from 'lucide-react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      try {
        const res = await api.get('/admin/requests');
        if (res.data.success) {
          setRequests(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch = !searchQuery ||
      r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">System-Wide Blood Requests Oversight</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all incoming, assigned, and completed blood requisitions across all network hospitals.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by patient, hospital, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blood-700"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-950 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="BLOOD_ASSIGNED">BLOOD_ASSIGNED</option>
            <option value="READY_FOR_COLLECTION">READY_FOR_COLLECTION</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Req #</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Hospital Partner</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Required Date</th>
                  <th className="py-3.5 px-4">Assigned Unit IDs</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-navy-950">#{r.request_id}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{r.patient_name} ({r.patient_age}y)</p>
                      <p className="text-[11px] text-slate-400">Dr. {r.doctor_name}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{r.hospitalName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {r.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{r.required_units}</td>
                    <td className="py-4 px-4 text-slate-600">{r.required_date}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-emerald-700 font-bold">
                      {r.assigned_units && r.assigned_units.length > 0 ? r.assigned_units.join(', ') : '—'}
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={r.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
