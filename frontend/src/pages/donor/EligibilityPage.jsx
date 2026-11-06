import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Heart,
  ShieldCheck,
  Droplet,
  ArrowRight
} from 'lucide-react';

export default function EligibilityPage() {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEligibility() {
      try {
        const res = await api.get('/donor/eligibility');
        if (res.data.success) {
          setEligibility(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load eligibility', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEligibility();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEligible = eligibility?.isEligible;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Medical Safety Engine</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Donation Eligibility Status</h1>
        <p className="text-xs text-slate-500 mt-1">
          The 3-month donation recovery interval protects donor red blood cell count and iron stores.
        </p>
      </div>

      {/* Main Status Hero Card */}
      <div className={`p-8 rounded-3xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isEligible
          ? 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white border-emerald-400'
          : 'bg-gradient-to-r from-amber-500 to-amber-700 text-white border-amber-400'
      }`}>
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            {isEligible ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span>{isEligible ? 'Eligible for Donation' : 'Mandatory Recovery Period'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            {isEligible
              ? 'You are eligible to schedule a blood donation!'
              : `Eligible in ${eligibility.daysRemaining} days`}
          </h2>

          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            {eligibility?.statusMessage}
          </p>

          <div className="pt-2 flex flex-wrap gap-6 text-xs text-white/80 font-medium">
            <span>Last Donated: <strong className="text-white">{eligibility?.lastDonationDate || 'None on record'}</strong></span>
            <span>Next Eligible: <strong className="text-white">{eligibility?.nextEligibleDate}</strong></span>
          </div>
        </div>

        <div className="shrink-0">
          {isEligible ? (
            <button
              onClick={() => navigate('/donor/schedule')}
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center space-x-2"
            >
              <span>Schedule Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-black/20 text-white text-center text-xs font-semibold backdrop-blur-sm">
              <span className="block text-2xl font-black">{eligibility.daysRemaining}</span>
              <span>Days Remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
            <Heart className="w-5 h-5 text-blood-700" />
            <span>Why the 3-Month Rule Matters</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you donate 450ml of whole blood, your body replaces the fluid volume within 24–48 hours. However, replenishing red blood cells and rebuilding ferritin (iron stores) takes up to 10–12 weeks.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blood-700" />
              <span>Prevents donor chronic fatigue and anemia</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blood-700" />
              <span>Ensures high hemoglobin quality in donated bags</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blood-700" />
              <span>Protects cardiovascular endurance</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Clinical Pre-Donation Screening</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Meeting the 3-month calendar interval is the initial platform check. Prior to collection at the hospital, you will complete a routine 5-minute health check:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span>Hemoglobin level ≥ 12.5 g/dL (tested with finger prick)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span>Blood pressure between 90/60 mmHg and 140/90 mmHg</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span>Weight ≥ 50 kg (110 lbs)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
