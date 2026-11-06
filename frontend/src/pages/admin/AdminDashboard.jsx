import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Users,
  Building2,
  Heart,
  Droplet,
  ShieldCheck,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const { metrics, demandVsSupply, userTrends, hospitalUsage, recentAuditLogs, recentUsers } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-blood-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blood-700 text-white text-xs font-black uppercase tracking-wider">
              System Administration
            </span>
            <span className="text-xs text-slate-300">Central Platform Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">BloodBridge System Console</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Network oversight, hospital accreditation approvals, role-based access management, and live audit logging.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {metrics?.pendingHospitalApprovals > 0 && (
            <Link
              to="/admin/hospitals"
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{metrics.pendingHospitalApprovals} Hospital Approvals Pending</span>
            </Link>
          )}

          <Link
            to="/admin/users"
            className="px-5 py-3 rounded-xl bg-white text-navy-950 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers ?? 0}
          subtitle="All platform accounts"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Registered Donors"
          value={metrics?.totalDonors ?? 0}
          subtitle="Voluntary blood donors"
          icon={Heart}
          color="blood"
        />
        <StatCard
          title="Accredited Hospitals"
          value={metrics?.totalHospitals ?? 0}
          subtitle={`${metrics?.pendingHospitalApprovals ?? 0} pending review`}
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Bags Distributed"
          value={metrics?.totalBagsDistributed ?? 0}
          subtitle="Direct clinical fulfillments"
          icon={Droplet}
          color="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Growth Trends */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Platform Registration Trends</h3>
              <p className="text-xs text-slate-500">Monthly new donors, patients, and hospitals</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-bold text-blood-700 hover:underline">
              Deep Analytics
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="donors" stroke="#b91c1c" fill="#fee2e2" name="Donors" />
                <Area type="monotone" dataKey="patients" stroke="#2563eb" fill="#dbeafe" name="Patients" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Demand vs Available Stock */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Demand vs Available Units</h3>
              <p className="text-xs text-slate-500">Live requisition demand vs screened units</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandVsSupply} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="demand" fill="#b91c1c" radius={[4, 4, 0, 0]} name="Requisitions" />
                <Bar dataKey="available" fill="#16a34a" radius={[4, 4, 0, 0]} name="Available Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live System Audit Trail Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blood-700" />
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Real-Time System Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable security and state mutation logs</p>
            </div>
          </div>
          <Link to="/admin/audit-logs" className="text-xs font-bold text-blood-700 hover:underline">
            View All Audit Logs
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAuditLogs?.map(log => (
                <tr key={log.log_id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-navy-950">{log.action}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{log.user_email}</td>
                  <td className="py-3 px-4 text-slate-600">{log.entity_name} #{log.entity_id}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ip_address}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
