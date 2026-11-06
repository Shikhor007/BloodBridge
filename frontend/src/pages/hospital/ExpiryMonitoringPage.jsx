import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { AlertTriangle, Clock, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function ExpiryMonitoringPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hospital/inventory');
      if (res.data.success) {
        setUnits(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const expiringSoon = units.filter(u => u.status === 'AVAILABLE' && u.expiry_date >= todayStr && u.expiry_date <= sevenDaysFromNow);
  const alreadyExpired = units.filter(u => u.status === 'EXPIRED' || (u.status === 'AVAILABLE' && u.expiry_date < todayStr));
  const discarded = units.filter(u => u.status === 'DISCARDED');

  const handleDiscard = async (unitId) => {
    try {
      const res = await api.put(`/hospital/inventory/${unitId}/discard`, {
        reason: 'Expired beyond 42-day whole blood lifespan'
      });
      if (res.data.success) {
        addToast(`Unit ${unitId} discarded`, 'info');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to discard unit', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Quality Assurance</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Blood Expiry & Wastage Monitoring</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor shelf life adherence, prioritize units expiring soon (&lt; 7 days), and log discarded units.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-amber-800">Expiring Soon</p>
              <h3 className="text-3xl font-black text-amber-950 mt-1">{expiringSoon.length}</h3>
              <p className="text-[11px] text-amber-700 mt-1">&lt; 7 days shelf life remaining</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-rose-800">Expired (Unusable)</p>
              <h3 className="text-3xl font-black text-rose-950 mt-1">{alreadyExpired.length}</h3>
              <p className="text-[11px] text-rose-700 mt-1">Cannot be assigned to patients</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
        </div>

        <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-700">Discarded Log</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{discarded.length}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Incinerated / Bio-disposed</p>
            </div>
            <Trash2 className="w-8 h-8 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Expiring Soon Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <span>Priority Units Expiring Within 7 Days</span>
        </h3>

        {expiringSoon.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">No units approaching expiry in the next 7 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Unit ID</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringSoon.map(u => (
                  <tr key={u.unit_id} className="hover:bg-amber-50/40">
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">{u.unit_id}</td>
                    <td className="py-3 px-4 font-black text-blood-700">{u.blood_group}</td>
                    <td className="py-3 px-4 text-slate-600">{u.collection_date}</td>
                    <td className="py-3 px-4 font-bold text-amber-800">{u.expiry_date}</td>
                    <td className="py-3 px-4 text-slate-600">{u.storage_status}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDiscard(u.unit_id)}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold"
                      >
                        Discard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discarded Records Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
          <Trash2 className="w-5 h-5 text-slate-600" />
          <span>Discarded Units Historical Audit Log</span>
        </h3>

        {discarded.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">No discarded units on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Unit ID</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Discard Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discarded.map(u => (
                  <tr key={u.unit_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{u.unit_id}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{u.blood_group}</td>
                    <td className="py-3 px-4 text-slate-500">{u.collection_date}</td>
                    <td className="py-3 px-4 text-slate-500">{u.expiry_date}</td>
                    <td className="py-3 px-4 text-rose-700 font-semibold">{u.discard_reason || 'Expired'}</td>
                    <td className="py-3 px-4"><StatusBadge status={u.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
