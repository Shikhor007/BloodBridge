import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  MapPin,
  FileText,
  Droplet,
  PackageCheck
} from 'lucide-react';

export default function RequestDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadTracking() {
      try {
        const res = await api.get(`/patient/requests/${id}/tracking`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setErrorMessage(res.data.message);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to load tracking details');
      } finally {
        setLoading(false);
      }
    }
    loadTracking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-navy-950">Error Loading Request Tracking</h3>
        <p className="text-xs text-slate-500 mt-1">{errorMessage || 'Request not found'}</p>
        <Link to="/patient/my-requests" className="mt-4 inline-block text-xs font-bold text-blood-700 underline">
          Back to My Requests
        </Link>
      </div>
    );
  }

  const { request, hospital, documents, timeline } = data;

  const lifecycleSteps = [
    { key: 'SUBMITTED', title: 'Submitted', desc: 'Request lodged in platform' },
    { key: 'UNDER_REVIEW', title: 'Under Review', desc: 'Prescription & lab test checked' },
    { key: 'APPROVED', title: 'Approved', desc: 'Blood bank verified supply' },
    { key: 'BLOOD_ASSIGNED', title: 'Blood Assigned', desc: 'Specific units reserved' },
    { key: 'READY_FOR_COLLECTION', title: 'Ready for Pickup', desc: 'Cold box dispatch packed' },
    { key: 'COMPLETED', title: 'Completed', desc: 'Transfusion collected' }
  ];

  // Helper to determine step completion index
  const getStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'APPROVED': return 2;
      case 'BLOOD_ASSIGNED': return 3;
      case 'READY_FOR_COLLECTION': return 4;
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(request.status);
  const isRejected = request.status === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Title */}
      <div>
        <Link
          to="/patient/my-requests"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-navy-950 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Requests</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-950">
              Live Requisition Tracking #{request.request_id}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Patient: <strong className="text-slate-900">{request.patient_name}</strong> • Required Group: <strong className="text-blood-700">{request.blood_group}</strong> ({request.required_units} bags)
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Visual Timeline Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
          Fulfillment Progress Lifecycle
        </h3>

        {isRejected ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-extrabold text-sm">Request Rejected by Hospital</p>
            <p className="mt-1">{request.rejection_reason || 'Doctor prescription could not be validated or stock incompatible.'}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-between min-w-[600px] relative">
                {/* Horizontal line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
                  style={{ width: `${(Math.min(currentIndex, 5) / 5) * 85}%` }}
                />

                {lifecycleSteps.map((step, idx) => {
                  const isDone = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-28">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`text-xs mt-3 font-extrabold ${isCurrent ? 'text-blood-700' : isDone ? 'text-navy-950' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Dispatch & Assigned Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hospital Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-navy-950 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-blood-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy-950 text-sm">{hospital?.hospitalName}</h4>
              <p className="text-xs text-slate-500">Accredited Blood Dispatch Partner</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{hospital?.address}, {hospital?.city}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{hospital?.phone}</span>
            </div>
          </div>

          {request.status === 'READY_FOR_COLLECTION' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Blood is cold-packed and waiting for pickup at Dispatch Counter!</span>
            </div>
          )}
        </div>

        {/* Assigned Units */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy-950 text-sm">Allocated Blood Bags</h4>
              <p className="text-xs text-slate-500">Unit-Level Traceability</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {request.assigned_units && request.assigned_units.length > 0 ? (
              <div className="space-y-2">
                {request.assigned_units.map(unitId => (
                  <div key={unitId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{unitId}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Screened & Reserved
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Blood bags are currently undergoing laboratory cross-matching. Once allocated, specific Unit IDs will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Transition Audit Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-sm mb-4">Detailed Audit Log & Activity History</h3>
        <div className="space-y-4">
          {timeline?.map((hist) => (
            <div key={hist.history_id} className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-blood-700 shrink-0 mt-1.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{hist.status.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(hist.changed_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{hist.comments}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
