import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Clock, PlusCircle, Bell, CheckCircle2, AlertTriangle, Droplet } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useNotification } from '../../context/NotificationContext';

export default function FutureRequestsPage() {
  const [searchParams] = useSearchParams();
  const prefillGroup = searchParams.get('group') || 'O-';

  const [bloodGroup, setBloodGroup] = useState(prefillGroup);
  const [requiredUnits, setRequiredUnits] = useState(1);
  const [preferredCity, setPreferredCity] = useState('');
  const [notes, setNotes] = useState('');
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useNotification();

  const loadWaitlist = async () => {
    try {
      const res = await api.get('/patient/dashboard');
      if (res.data.success) {
        setWaitlist(res.data.data.futureRequests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/patient/future-requests', {
        bloodGroup,
        requiredUnits,
        preferredCity,
        notes
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setNotes('');
        loadWaitlist();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register waitlist entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Inventory Shortage Assistance</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Shortage Waitlist & Future Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          When your required blood group is currently in low supply or out of stock, register on the waitlist to receive instant automated alerts the moment matching bags enter hospital inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Register Form */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blood-700" />
            <span>Join Blood Shortage Waitlist</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Group Needed *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-blood-700 bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Quantity (Bags) *</label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={requiredUnits}
                onChange={(e) => setRequiredUnits(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Preferred City / Region</label>
              <input
                type="text"
                placeholder="e.g. New York, Brooklyn"
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Clinical Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Specific surgery date or treatment timing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Waitlist Notification'}</span>
            </button>
          </form>
        </div>

        {/* Active Waitlist Items */}
        <div className="md:col-span-6 space-y-4">
          <h3 className="font-extrabold text-navy-950 text-base">Your Active Shortage Alerts</h3>

          {waitlist.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No active waitlist requests</p>
              <p className="mt-0.5">Register on the left if you are seeking a rare or out-of-stock blood group.</p>
            </div>
          ) : (
            waitlist.map((item) => (
              <div
                key={item.future_request_id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-9 h-9 rounded-xl bg-blood-50 text-blood-700 font-black text-sm flex items-center justify-center border border-blood-100">
                      {item.blood_group}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-navy-950 text-xs">
                        Waitlist for {item.required_units} Unit(s)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Target City: {item.preferred_city}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    "{item.notes}"
                  </p>
                )}

                <p className="text-[10px] text-slate-400 pt-1">
                  Registered: {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
