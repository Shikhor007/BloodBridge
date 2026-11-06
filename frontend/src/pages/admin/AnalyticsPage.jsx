import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Droplet, Building2, Users } from 'lucide-react';

const COLORS = ['#b91c1c', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#06b6d4', '#4f46e5', '#e11d48'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const { demandVsSupply, userTrends, hospitalUsage } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Platform Intelligence</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Platform Analytics & Demand Forecasting</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep telemetry across voluntary registrations, clinical requests, hospital distribution rates, and group shortages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Blood Group Requisition Demand vs Availability */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-navy-950 text-base">Blood Group Demand vs Local Available Supply</h3>
            <p className="text-xs text-slate-500">Compares total patient bags requested vs verified units in cold-storage</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandVsSupply} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="demand" fill="#b91c1c" radius={[6, 6, 0, 0]} name="Patient Demand (Bags)" />
                <Bar dataKey="available" fill="#16a34a" radius={[6, 6, 0, 0]} name="Available Inventory (Bags)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hospital Usage Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-navy-950 text-base">Hospital Distribution Share</h3>
            <p className="text-xs text-slate-500">Transfusions fulfilled by accredited partner facilities</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalUsage} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="hospitalName" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="unitsDistributed" fill="#2563eb" radius={[0, 6, 6, 0]} name="Units Distributed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Registration Trajectory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-navy-950 text-base">User Community Onboarding Velocity</h3>
          <p className="text-xs text-slate-500">Monthly breakdown of volunteer donors vs patient registrations</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="donors" stroke="#b91c1c" fill="#fee2e2" name="Voluntary Donors" />
              <Area type="monotone" dataKey="patients" stroke="#2563eb" fill="#dbeafe" name="Registered Patients" />
              <Area type="monotone" dataKey="hospitals" stroke="#16a34a" fill="#dcfce7" name="Partner Hospitals" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
