import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  FileText,
  CheckCircle,
  XCircle,
  Droplet,
  PackageCheck,
  Eye,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function PatientRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUnitsToAssign, setSelectedUnitsToAssign] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Prescription verification failed or doctor contact unreachable');

  const { addToast } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, invRes] = await Promise.all([
        api.get('/hospital/requests'),
        api.get('/hospital/inventory?status=AVAILABLE')
      ]);
      if (reqRes.data.success) setRequests(reqRes.data.data);
      if (invRes.data.success) setAvailableUnits(invRes.data.data);
    } catch (err) {
      console.error('Failed to load hospital requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (req) => {
    setSelectedRequest(req);
    // Find matching available units of requested blood group
    const matching = availableUnits.filter(u => u.blood_group === req.blood_group);
    // Select first N matching units by default
    const defaultSelected = matching.slice(0, req.required_units).map(u => u.unit_id);
    setSelectedUnitsToAssign(defaultSelected);
    setIsAssignModalOpen(true);
  };

  const handleAssignUnits = async (e) => {
    e.preventDefault();
    if (!selectedRequest || selectedUnitsToAssign.length === 0) {
      addToast('Please select at least one unit to assign', 'error');
      return;
    }

    try {
      const res = await api.post(`/hospital/requests/${selectedRequest.request_id}/assign-units`, {
        unitIds: selectedUnitsToAssign
      });
      if (res.data.success) {
        addToast(`Successfully assigned units to Request #${selectedRequest.request_id}`, 'success');
        setIsAssignModalOpen(false);
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Assignment failed (concurrency check triggered)', 'error');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus, reason = '') => {
    try {
      const res = await api.put(`/hospital/requests/${requestId}/status`, {
        status: newStatus,
        rejectionReason: reason
      });
      if (res.data.success) {
        addToast(`Request #${requestId} status updated to ${newStatus}`, 'success');
        if (isRejectModalOpen) setIsRejectModalOpen(false);
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update request status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Patient Blood Requisition Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review clinical prescriptions, approve requisitions, and allocate screened blood units.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-950">No Patient Requests on File</h3>
          <p className="text-xs text-slate-500 mt-1">Incoming blood requisitions for this hospital will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Req #</th>
                  <th className="py-3.5 px-4">Patient & Doctor</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Treatment Ward</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assigned Bags</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.request_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-navy-950">#{req.request_id}</td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900">{req.patient_name} ({req.patient_age}y)</p>
                      <p className="text-[11px] text-slate-500">Dr. {req.doctor_name} ({req.doctor_contact})</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900">{req.required_units}</td>
                    <td className="py-4 px-4 text-slate-700 max-w-xs truncate">{req.treatment_location}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px]">
                      {req.assigned_units && req.assigned_units.length > 0 ? (
                        <span className="text-emerald-700 font-bold">{req.assigned_units.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400 italic">None assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* View details & docs */}
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px]"
                        title="View clinical details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Assign Units Button (when pending/approved/assigned) */}
                      {!['COMPLETED', 'REJECTED', 'CANCELLED'].includes(req.status) && (
                        <button
                          onClick={() => openAssignModal(req)}
                          className="px-3 py-1.5 rounded-lg bg-blood-700 hover:bg-blood-800 text-white font-bold text-[11px] shadow-sm"
                        >
                          Assign Units
                        </button>
                      )}

                      {/* Ready for collection -> Mark Completed */}
                      {req.status === 'READY_FOR_COLLECTION' && (
                        <button
                          onClick={() => handleUpdateStatus(req.request_id, 'COMPLETED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Mark Completed
                        </button>
                      )}

                      {/* Reject Button */}
                      {!['COMPLETED', 'REJECTED', 'CANCELLED'].includes(req.status) && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRejectModalOpen(true);
                          }}
                          className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px]"
                        >
                          Reject
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

      {/* Clinical Details & Medical Prescription Modal */}
      <Modal
        isOpen={!!selectedRequest && !isAssignModalOpen && !isRejectModalOpen}
        onClose={() => setSelectedRequest(null)}
        title={`Requisition #${selectedRequest?.request_id} Clinical Details`}
        maxWidth="max-w-2xl"
      >
        {selectedRequest && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Patient</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRequest.patient_name} ({selectedRequest.patient_age} years)</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Blood Group & Bags</span>
                <p className="font-black text-blood-700 text-sm mt-0.5">{selectedRequest.blood_group} ({selectedRequest.required_units} Bags)</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Attending Doctor</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.doctor_name} ({selectedRequest.doctor_contact})</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Treatment Location</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.treatment_location}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Required Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.required_date}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Priority Level</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.priority}</p>
              </div>
            </div>

            {selectedRequest.additional_notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="font-bold text-amber-900 block text-[11px]">Doctor / Patient Clinical Notes:</span>
                <p className="text-amber-800 mt-0.5">{selectedRequest.additional_notes}</p>
              </div>
            )}

            {/* Uploaded Documents */}
            <div>
              <span className="font-bold text-navy-950 block uppercase tracking-wider text-[11px] mb-2">
                Attached Medical Prescriptions & Lab Requisitions:
              </span>
              {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedRequest.documents.map(doc => (
                    <div key={doc.document_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blood-700" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{doc.original_name}</p>
                          <p className="text-[10px] text-slate-400">{doc.document_type}</p>
                        </div>
                      </div>
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-navy-950 text-white font-bold text-[10px]"
                      >
                        Inspect Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No prescription document attached.</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Atomic Blood Unit Assignment Modal (Concurrency Locked) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Screened Blood Units to Request #${selectedRequest?.request_id}`}
        maxWidth="max-w-xl"
      >
        {selectedRequest && (
          <form onSubmit={handleAssignUnits} className="space-y-4 text-xs">
            <div className="p-3 bg-blood-50 border border-blood-200 rounded-xl text-blood-950">
              <span className="font-bold block">Patient Requirement:</span>
              <span>Needs <strong>{selectedRequest.required_units} Bag(s)</strong> of <strong>{selectedRequest.blood_group}</strong> blood for {selectedRequest.patient_name}.</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                Select Available Screened Units in Storage ({selectedRequest.blood_group}):
              </label>

              {availableUnits.filter(u => u.blood_group === selectedRequest.blood_group).length === 0 ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-rose-600" />
                  <p className="font-bold">No available units of {selectedRequest.blood_group} in local inventory!</p>
                  <p className="text-[11px] mt-0.5">Please add screened units or defer request.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto border border-slate-200 p-2 rounded-xl">
                  {availableUnits
                    .filter(u => u.blood_group === selectedRequest.blood_group)
                    .map(unit => {
                      const isChecked = selectedUnitsToAssign.includes(unit.unit_id);
                      return (
                        <label
                          key={unit.unit_id}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked ? 'bg-blood-50 border-blood-200' : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUnitsToAssign([...selectedUnitsToAssign, unit.unit_id]);
                                } else {
                                  setSelectedUnitsToAssign(selectedUnitsToAssign.filter(id => id !== unit.unit_id));
                                }
                              }}
                              className="w-4 h-4 rounded text-blood-700"
                            />
                            <div>
                              <span className="font-mono font-bold text-slate-900 block">{unit.unit_id}</span>
                              <span className="text-[10px] text-slate-500 block">
                                Expiry: {unit.expiry_date} • Loc: {unit.storage_status}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Available
                          </span>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-700">
                Selected: {selectedUnitsToAssign.length} of {selectedRequest.required_units} Required
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedUnitsToAssign.length === 0}
                  className="px-5 py-2 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold shadow-md shadow-blood-700/25 disabled:opacity-50"
                >
                  Confirm Unit Assignment
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Request Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Requisition #${selectedRequest?.request_id}`}
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Please specify the clinical or administrative reason for rejecting this blood requisition. The patient will be notified immediately.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
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
                onClick={() => handleUpdateStatus(selectedRequest.request_id, 'REJECTED', rejectionReason)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
