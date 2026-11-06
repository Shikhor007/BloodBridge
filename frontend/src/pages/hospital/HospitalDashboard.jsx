import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Package,
  FileText,
  Calendar,
  AlertTriangle,
  PlusCircle,
  BarChart3,
  Droplet,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export default function HospitalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHospitalDashboard() {
      try {
        const res = await api.get('/hospital/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load hospital dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadHospitalDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { hospital, metrics, groupDistribution, monthlyAnalytics, recentRequests } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-blood-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blood-700 text-white text-xs font-bold uppercase tracking-wider">
              Hospital Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">Reg: {hospital?.registration_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{hospital?.hospital_name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Centralized blood bank unit inventory, cross-matching assignments, donor scheduling, and clinical reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/hospital/inventory"
            className="px-5 py-3 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
          <Link
            to="/hospital/requests"
            className="px-5 py-3 rounded-xl bg-white text-navy-950 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Patient Requests</span>
          </Link>
        </div>
      </div>

      {/* Critical Expiry / Shortage Warnings */}
      {(metrics?.expiringSoonCount > 0 || metrics?.currentShortages?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics?.expiringSoonCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">Expiring Blood Units Alert</span>
                  <span>{metrics.expiringSoonCount} blood unit(s) expiring within 7 days. Prioritize assignment or cold storage checks.</span>
                </div>
              </div>
              <Link to="/hospital/expiry" className="text-xs font-bold text-amber-800 underline shrink-0 ml-3">
                Review Units
              </Link>
            </div>
          )}

          {metrics?.currentShortages?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs">
                <Droplet className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block">Low Stock / Shortage Warning</span>
                  <span>Critical supply below reserve for groups: <strong className="text-rose-700">{metrics.currentShortages.join(', ')}</strong></span>
                </div>
              </div>
              <Link to="/hospital/camps" className="text-xs font-bold text-rose-800 underline shrink-0 ml-3">
                Host Camp
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Available Blood Units"
          value={metrics?.totalAvailableBags ?? 0}
          subtitle="Screened ready for dispatch"
          icon={Package}
          color="blood"
        />
        <StatCard
          title="Pending Requests"
          value={metrics?.pendingRequests ?? 0}
          subtitle="Awaiting cross-matching"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Upcoming Appointments"
          value={metrics?.upcomingAppointments ?? 0}
          subtitle="Donors scheduled this week"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="Completed Transfusions"
          value={metrics?.completedRequests ?? 0}
          subtitle="Fulfilled and dispatched"
          icon={Droplet}
          color="emerald"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Blood Group Inventory Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Blood Group Stock Distribution</h3>
              <p className="text-xs text-slate-500">Available verified blood bags by group</p>
            </div>
            <Link to="/hospital/inventory" className="text-xs font-bold text-blood-700 hover:underline">
              Full Inventory
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="units" fill="#b91c1c" radius={[6, 6, 0, 0]} name="Available Bags" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Collection vs Usage Trend Area Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Monthly Collection & Usage</h3>
              <p className="text-xs text-slate-500">Collected vs Patient Requisition volume</p>
            </div>
            <Link to="/hospital/reports" className="text-xs font-bold text-blood-700 hover:underline">
              View Reports
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="collected" stroke="#2563eb" fill="#dbeafe" name="Collected" />
                <Area type="monotone" dataKey="used" stroke="#16a34a" fill="#dcfce7" name="Distributed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Patient Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-navy-950 text-base">Recent Patient Requisitions</h3>
            <p className="text-xs text-slate-500">Review doctor prescriptions and assign available units</p>
          </div>
          <Link to="/hospital/requests" className="text-xs font-bold text-blood-700 hover:underline">
            Manage All Requests
          </Link>
        </div>

        {recentRequests?.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No requests submitted yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Req #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests?.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">#{r.request_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{r.patient_name}</td>
                    <td className="py-3.5 px-4 font-black text-blood-700">{r.blood_group}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.required_units}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.doctor_name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} size="sm" /></td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/hospital/requests"
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blood-700 hover:text-white text-navy-950 font-bold text-[11px] transition-colors"
                      >
                        Review
                      </Link>
                    </td>
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
