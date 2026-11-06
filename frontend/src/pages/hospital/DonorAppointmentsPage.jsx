import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Droplet,
  User,
  Heart,
  ShieldCheck,
  Stethoscope,
  ArrowRight
} from 'lucide-react';

export default function DonorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screening / Completion Modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [screeningData, setScreeningData] = useState({
    hemoglobinLevel: '13.8',
    bloodPressure: '120/80',
    pulseRate: 72,
    screeningStatus: 'PASSED',
    processingStatus: 'TESTED_AND_STORED',
    addDirectlyToInventory: true
  });
  const [recordingLoading, setRecordingLoading] = useState(false);

  const { addToast } = useNotification();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hospital/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const res = await api.put(`/hospital/appointments/${appointmentId}/status`, { status });
      if (res.data.success) {
        addToast(`Appointment set to ${status}`, 'success');
        loadAppointments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update appointment status', 'error');
    }
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setRecordingLoading(true);
    try {
      const res = await api.post('/hospital/donations/record-completion', {
        appointmentId: selectedAppt.appointment_id,
        donorId: selectedAppt.donor_id,
        bloodGroup: selectedAppt.bloodGroup,
        ...screeningData
      });

      if (res.data.success) {
        addToast('Donation & medical screening successfully logged!', 'success');
        setIsRecordModalOpen(false);
        loadAppointments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record donation', 'error');
    } finally {
      setRecordingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Donor Appointments & Medical Screening</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review bookings, conduct donor pre-screening, and record completed blood donations into usable inventory.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-950">No Donor Appointments Scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">Appointments booked by voluntary donors will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Appt #</th>
                  <th className="py-3.5 px-4">Donor Name & Contact</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Appointment Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Past Donations</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-navy-950">#{appt.appointment_id}</td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900">{appt.donorName}</p>
                      <p className="text-[11px] text-slate-500">{appt.donorPhone} • {appt.donorEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {appt.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{appt.appointment_date}</td>
                    <td className="py-4 px-4 text-slate-600">{appt.time_slot}</td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{appt.totalDonations} donation(s)</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      {appt.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.appointment_id, 'CONFIRMED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm"
                        >
                          Confirm
                        </button>
                      )}

                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setIsRecordModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blood-700 hover:bg-blood-800 text-white font-bold text-[11px] shadow-sm inline-flex items-center space-x-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Screen & Record</span>
                        </button>
                      )}

                      {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                        <button
                          onClick={() => handleUpdateStatus(appt.appointment_id, 'CANCELLED')}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Completed Donation & Medical Screening Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={`Medical Screening & Donation Record (Donor: ${selectedAppt?.donorName})`}
        maxWidth="max-w-xl"
      >
        {selectedAppt && (
          <form onSubmit={handleRecordDonation} className="space-y-4 text-xs">
            <div className="p-3 bg-navy-50 border border-navy-200 rounded-xl text-navy-950 font-medium">
              🩺 <strong>Mandatory Rule:</strong> A donation does not automatically enter usable inventory. Screening, collection, testing, and processing must be certified before an approved blood unit enters inventory.
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Hemoglobin (g/dL) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="8"
                  max="20"
                  required
                  value={screeningData.hemoglobinLevel}
                  onChange={(e) => setScreeningData({ ...screeningData, hemoglobinLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Pressure *</label>
                <input
                  type="text"
                  required
                  placeholder="120/80"
                  value={screeningData.bloodPressure}
                  onChange={(e) => setScreeningData({ ...screeningData, bloodPressure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Pulse (bpm) *</label>
                <input
                  type="number"
                  min="40"
                  max="140"
                  required
                  value={screeningData.pulseRate}
                  onChange={(e) => setScreeningData({ ...screeningData, pulseRate: parseInt(e.target.value) || 72 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Screening Result *</label>
                <select
                  value={screeningData.screeningStatus}
                  onChange={(e) => setScreeningData({ ...screeningData, screeningStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                >
                  <option value="PASSED">PASSED (Fit to Donate)</option>
                  <option value="DEFERRED">DEFERRED (Temporary low hemoglobin)</option>
                  <option value="REJECTED">REJECTED (Permanent ineligibility)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Viral & Pathogen Testing *</label>
                <select
                  value={screeningData.processingStatus}
                  onChange={(e) => setScreeningData({ ...screeningData, processingStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                >
                  <option value="TESTED_AND_STORED">TESTED & STORED (All Negative)</option>
                  <option value="IN_TESTING">IN TESTING (Quarantine)</option>
                  <option value="DISCARDED">DISCARDED (Reactive)</option>
                </select>
              </div>
            </div>

            {screeningData.screeningStatus === 'PASSED' && screeningData.processingStatus === 'TESTED_AND_STORED' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screeningData.addDirectlyToInventory}
                    onChange={(e) => setScreeningData({ ...screeningData, addDirectlyToInventory: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-950">
                    Automatically register unit of {selectedAppt.bloodGroup} (450ml) into usable inventory (42-day lifespan)
                  </span>
                </label>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recordingLoading}
                className="px-5 py-2 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold shadow-md shadow-blood-700/25"
              >
                {recordingLoading ? 'Recording...' : 'Submit Certified Record'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
