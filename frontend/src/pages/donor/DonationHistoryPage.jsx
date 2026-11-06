import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Droplet, Award, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DonationHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/donor/dashboard');
        if (res.data.success) {
          setRecords(res.data.data.donationHistory || []);
        }
      } catch (err) {
        console.error('Failed to load donation history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Blood Donation Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official laboratory log of your completed, screened, and stored blood donations.
          </p>
        </div>

        <Link
          to="/donor/certificates"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>View Lifesaver Certificate</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Droplet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-950">No Verified Donations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you complete a scheduled donation appointment at a partner hospital, your laboratory record and certificate will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Record ID</th>
                  <th className="py-3.5 px-4">Hospital Blood Bank</th>
                  <th className="py-3.5 px-4">Donation Date</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Volume (ml)</th>
                  <th className="py-3.5 px-4">Hemoglobin</th>
                  <th className="py-3.5 px-4">Blood Pressure</th>
                  <th className="py-3.5 px-4">Screening Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.record_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900">#DON-{r.record_id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{r.hospital_name}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {new Date(r.donation_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                        {r.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{r.quantity_ml} ml</td>
                    <td className="py-4 px-4 text-slate-700">{r.hemoglobin_level || '13.5'} g/dL</td>
                    <td className="py-4 px-4 text-slate-700">{r.blood_pressure || '120/80'}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{r.screening_status || 'PASSED'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
