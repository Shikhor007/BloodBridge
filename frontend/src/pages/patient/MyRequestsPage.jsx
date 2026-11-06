import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Clock,
  Printer,
  Download,
  ArrowRight,
  Droplet,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await api.get('/patient/dashboard');
        if (res.data.success) {
          setRequests(res.data.data.allRequests || []);
        }
      } catch (err) {
        console.error('Failed to load patient requests', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Blood Request History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete records of all your blood requests, tracking history, and printable official receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/patient/request-blood')}
          className="px-4 py-2.5 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          + New Blood Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-950">No Blood Requests On Record</h3>
          <p className="text-xs text-slate-500 mt-1">You have not submitted any blood requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Req #</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Hospital</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900">#{r.request_id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{r.patient_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {r.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{r.required_units} bag(s)</td>
                    <td className="py-4 px-4 text-slate-700">{r.hospital_name}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center space-x-1"
                        title="Download / View Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => navigate(`/patient/requests/${r.request_id}/tracking`)}
                        className="px-3 py-1.5 rounded-lg bg-blood-50 hover:bg-blood-700 hover:text-white text-blood-700 font-bold text-[11px] inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>Live Track</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Blood Requisition Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedReceipt && (
          <div className="space-y-6" id="printable-receipt">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blood-700 text-white flex items-center justify-center font-bold">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-extrabold text-navy-950 text-base">BloodBridge Platform</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Official Clinical Requisition Voucher</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">Voucher #{selectedReceipt.request_id}</span>
                <span className="text-[10px] text-slate-500 block">Date: {new Date(selectedReceipt.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedReceipt.patient_name} (Age: {selectedReceipt.patient_age})</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Blood Group & Quantity</span>
                <span className="font-black text-blood-700 text-sm mt-0.5 block">{selectedReceipt.blood_group} ({selectedReceipt.required_units} Bags)</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Fulfilling Hospital</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedReceipt.hospital_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Current Status</span>
                <span className="mt-0.5 inline-block"><StatusBadge status={selectedReceipt.status} size="sm" /></span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Attending Physician</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedReceipt.doctor_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Treatment Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedReceipt.treatment_location}</span>
              </div>
            </div>

            {/* Assigned Units If Any */}
            {selectedReceipt.assigned_units && selectedReceipt.assigned_units.length > 0 && (
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs">
                <span className="font-bold text-sky-900 block">Assigned Screened Unit IDs:</span>
                <span className="font-mono text-sky-800 font-bold block mt-1">
                  {selectedReceipt.assigned_units.join(', ')}
                </span>
              </div>
            )}

            {/* Service Charge Breakdown */}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Total Testing & Cold Chain Service Charge:</span>
                <span className="text-[10px] text-slate-400 italic">Subsidized mandatory cross-matching & viral screening fee</span>
              </div>
              <span className="text-lg font-black text-navy-950">${Number(selectedReceipt.service_charge || 40).toFixed(2)}</span>
            </div>

            {/* Print action buttons */}
            <div className="pt-4 flex justify-end space-x-3 no-print">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
