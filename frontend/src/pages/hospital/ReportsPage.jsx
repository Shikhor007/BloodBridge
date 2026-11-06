import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Download, Printer, Droplet, Layers, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/hospital/reports');
        if (res.data.success) {
          setReports(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCSV = () => {
    if (!reports?.bloodGroupBreakdown) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Blood Group,Total Bags,Available Bags,Assigned Bags,Discarded Bags\n';

    reports.bloodGroupBreakdown.forEach(row => {
      csvContent += `${row.bloodGroup},${row.totalBags},${row.available},${row.assigned},${row.discarded}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BloodBridge_Hospital_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const { summary, bloodGroupBreakdown } = reports || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Hospital Blood Supply & Clinical Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified reports covering blood collection, patient distribution, wastage rates, and inventory movements.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Donated Units</span>
          <p className="text-2xl font-black text-navy-950 mt-1">{summary?.totalDonationsRecorded ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Patient Requests Handled</span>
          <p className="text-2xl font-black text-navy-950 mt-1">{summary?.totalRequestsHandled ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Cumulative Inventory Units</span>
          <p className="text-2xl font-black text-navy-950 mt-1">{summary?.totalInventoryEver ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Report Generated At</span>
          <p className="text-xs font-bold text-slate-700 mt-2 font-mono">
            {new Date(summary?.generatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Detailed Blood Group Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-navy-950 text-base">Blood Group Utilization Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Total Received Bags</th>
                <th className="py-3 px-4">Currently Available</th>
                <th className="py-3 px-4">Assigned to Patients</th>
                <th className="py-3 px-4">Discarded / Expired</th>
                <th className="py-3 px-4 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bloodGroupBreakdown?.map((row) => {
                const utilRate = row.totalBags > 0
                  ? ((row.assigned / row.totalBags) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={row.bloodGroup} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-black text-blood-700 text-sm">{row.bloodGroup}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{row.totalBags}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{row.available}</td>
                    <td className="py-3.5 px-4 font-semibold text-sky-700">{row.assigned}</td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">{row.discarded}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">{utilRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
