import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Building2,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Shield,
  Eye,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function HospitalManagementPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Hospital license documentation expired or accreditation not verified');

  const { addToast } = useNotification();

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hospitals');
      if (res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleUpdateStatus = async (hospitalId, status, reason = '') => {
    try {
      const res = await api.put(`/admin/hospitals/${hospitalId}/approval`, {
        status,
        rejectionReason: reason
      });
      if (res.data.success) {
        addToast(`Hospital status updated to ${status}`, 'success');
        if (isRejectModalOpen) setIsRejectModalOpen(false);
        loadHospitals();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update hospital status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Hospital Accreditation & Blood Bank Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming hospital registration applications, verify health department licenses, and manage account statuses.
        </p>
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
                  <th className="py-3.5 px-4">Hospital Name</th>
                  <th className="py-3.5 px-4">License Reg #</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Official Email & Phone</th>
                  <th className="py-3.5 px-4">Accreditation Document</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((hosp) => (
                  <tr key={hosp.hospital_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-navy-950 text-sm">{hosp.hospital_name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{hosp.registration_number}</td>
                    <td className="py-4 px-4 text-slate-600">{hosp.city} ({hosp.district})</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{hosp.contact_person}</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{hosp.hospital_email}</p>
                      <p className="text-[11px] text-slate-500">{hosp.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      {hosp.documents && hosp.documents.length > 0 ? (
                        <a
                          href={hosp.documents[0].file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-blood-700" />
                          <span>View License</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No doc attached</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={hosp.approval_status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {hosp.approval_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(hosp.hospital_id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setIsRejectModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {hosp.approval_status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(hosp.hospital_id, 'SUSPENDED')}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 font-bold text-[11px]"
                        >
                          Suspend
                        </button>
                      )}

                      {['REJECTED', 'SUSPENDED'].includes(hosp.approval_status) && (
                        <button
                          onClick={() => handleUpdateStatus(hosp.hospital_id, 'APPROVED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Reactivate
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

      {/* Reject Hospital Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Hospital Application: ${selectedHospital?.hospital_name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Specify the official grounds for declining accreditation. This reason will be recorded and provided to the hospital applicant.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Reason for Rejection *</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateStatus(selectedHospital.hospital_id, 'REJECTED', rejectReason)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
