import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GitBranch, ShieldAlert, CheckCircle2, Droplet, Info } from 'lucide-react';

export default function BloodRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRules() {
      try {
        const res = await api.get('/admin/blood-rules');
        if (res.data.success) {
          setRules(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRules();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Blood Group Rules & Compatibility Matrix</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review standard ABO and Rh antigenic compatibility guidelines enforced throughout BloodBridge.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-sm block">Clinical Governance Notice:</span>
          <span className="leading-relaxed">
            While BloodBridge assists in filtering compatible blood types, system compatibility rules <strong>never replace mandatory laboratory cross-matching</strong> and bedside compatibility verification by licensed healthcare practitioners.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <div
              key={rule.group_name}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-3">
                <span className="w-12 h-12 rounded-2xl bg-blood-50 text-blood-700 font-black text-xl flex items-center justify-center border border-blood-100">
                  {rule.group_name}
                </span>
                <div>
                  <h3 className="font-black text-navy-950 text-base">Blood Group {rule.group_name}</h3>
                  <p className="text-[11px] text-slate-500">{rule.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
                  <span className="font-bold block uppercase text-[10px] text-emerald-800">Can Donate Red Cells To:</span>
                  <span className="font-semibold text-xs mt-0.5 block">{rule.can_donate_to}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-950">
                  <span className="font-bold block uppercase text-[10px] text-sky-800">Can Receive Red Cells From:</span>
                  <span className="font-semibold text-xs mt-0.5 block">{rule.can_receive_from}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
