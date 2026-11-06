import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Users, PlusCircle, MapPin, Calendar, Clock, Target } from 'lucide-react';

export default function CampsPage() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [campData, setCampData] = useState({
    campName: '',
    location: '',
    district: '',
    city: '',
    startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    targetUnits: 100
  });

  const { addToast } = useNotification();

  const loadCamps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hospital/camps');
      if (res.data.success) {
        setCamps(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/hospital/camps', campData);
      if (res.data.success) {
        addToast('Donation camp organized successfully', 'success');
        setIsModalOpen(false);
        loadCamps();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create camp', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Community Blood Donation Camps</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize mobile blood drives, manage field sites, and register community donors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md shadow-blood-700/25 transition-all flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Organize Donation Camp</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-950">No Active Donation Camps</h3>
          <p className="text-xs text-slate-500 mt-1">Organize mobile blood drives in universities, civic halls, and corporations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {camps.map(camp => (
            <div
              key={camp.camp_id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-navy-950 text-base">{camp.camp_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-blood-700 mr-1 shrink-0" />
                    {camp.location}, {camp.city} ({camp.district})
                  </p>
                </div>
                <StatusBadge status={camp.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{camp.start_date} to {camp.end_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{camp.start_time} - {camp.end_time}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blood-700" />
                  <span className="text-slate-600 font-semibold">Target Units: <strong className="text-slate-900">{camp.target_units}</strong></span>
                </div>
                <span className="font-extrabold text-emerald-700">
                  {camp.collected_units || 0} Bags Collected
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organize Camp Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Organize New Blood Donation Camp"
      >
        <form onSubmit={handleCreateCamp} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Camp Title / Drive Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Civic Center Spring Blood Drive"
              value={campData.campName}
              onChange={(e) => setCampData({ ...campData, campName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Venue / Physical Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Main Auditorium, City Hall Plaza"
              value={campData.location}
              onChange={(e) => setCampData({ ...campData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={campData.city}
                onChange={(e) => setCampData({ ...campData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District / County *</label>
              <input
                type="text"
                required
                value={campData.district}
                onChange={(e) => setCampData({ ...campData, district: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={campData.startDate}
                onChange={(e) => setCampData({ ...campData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={campData.endDate}
                onChange={(e) => setCampData({ ...campData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={campData.startTime}
                onChange={(e) => setCampData({ ...campData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                value={campData.endTime}
                onChange={(e) => setCampData({ ...campData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Target Units</label>
              <input
                type="number"
                min={10}
                max={1000}
                value={campData.targetUnits}
                onChange={(e) => setCampData({ ...campData, targetUnits: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold shadow-md shadow-blood-700/25"
            >
              {submitting ? 'Publishing...' : 'Publish Camp Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
