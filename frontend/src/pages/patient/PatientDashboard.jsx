import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Search,
  Droplet,
  ArrowRight,
  Phone,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/patient/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-blood-700/60 text-blood-200 text-xs font-bold uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Blood Support & Request Center
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Search verified hospital supplies, place blood requests, and track real-time fulfillment with complete transparency.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/patient/request-blood"
            className="px-5 py-3 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Blood</span>
          </Link>
          <Link
            to="/patient/find-blood"
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Find Blood Stock</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={metrics.totalRequests ?? 0}
          subtitle="All lifetime submissions"
          icon={FileText}
          color="navy"
        />
        <StatCard
          title="Pending Review"
          value={metrics.pendingRequests ?? 0}
          subtitle="Awaiting hospital cross-match"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved / Assigned"
          value={metrics.approvedRequests ?? 0}
          subtitle="Ready or units allocated"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Completed"
          value={metrics.completedRequests ?? 0}
          subtitle="Dispatched & received"
          icon={Droplet}
          color="blood"
        />
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-navy-950">Active & Recent Blood Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track live progress and fulfillment status</p>
          </div>
          <Link
            to="/patient/my-requests"
            className="text-xs font-bold text-blood-700 hover:underline flex items-center space-x-1"
          >
            <span>View All ({data?.allRequests?.length || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentRequests?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <Droplet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No requests submitted yet</p>
            <p className="text-xs text-slate-400 mt-1">When you submit a blood request, track its live lifecycle here.</p>
            <Link
              to="/patient/request-blood"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blood-700 text-white font-bold text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit First Request</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Req ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentRequests.map((req) => (
                  <tr key={req.request_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900">#{req.request_id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{req.patient_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{req.required_units} bag(s)</td>
                    <td className="py-4 px-4 text-slate-700">{req.hospital_name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/patient/requests/${req.request_id}/tracking`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blood-700 hover:text-white text-navy-950 font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emergency & Transparent Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-blood-50 text-blood-700 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-navy-950 text-sm">24/7 Patient Emergency Hotline</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              If a surgeon or ICU requires immediate blood dispatch for trauma care, please call +1 (800) 555-BLOOD immediately to alert the hospital blood bank priority dispatch.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-navy-950 text-sm">Transparent Service Charge Guarantee</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Donated blood is never sold. Patients only pay a standardized fee ($40/bag) to cover pathogen testing, cross-matching, and temperature cold chain storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
