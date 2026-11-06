import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Heart,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Droplet,
  Building2,
  MapPin,
  XCircle
} from 'lucide-react';

export default function DonorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDonorDashboard() {
      try {
        const res = await api.get('/donor/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load donor dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDonorDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { profile, eligibility, badge, metrics, appointments, donationHistory, shortageAlert } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner with Donor Blood Group Badge */}
      <div className="bg-gradient-to-r from-blood-800 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Volunteer Donor Portal
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, Lifesaver {profile?.blood_group ? `(${profile.blood_group})` : ''}
          </h1>
          <p className="text-sm text-slate-200 max-w-xl">
            Your voluntary blood donations save critically ill patients and trauma victims. Thank you for your selfless commitment!
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-2xl bg-white text-blood-700 flex flex-col items-center justify-center shadow-lg shrink-0">
            <Droplet className="w-6 h-6 fill-blood-700" />
            <span className="text-2xl font-black leading-none mt-1">{profile?.blood_group}</span>
          </div>

          <div>
            <Link
              to="/donor/schedule"
              className={`px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 ${
                eligibility?.isEligible
                  ? 'bg-white text-blood-800 hover:bg-slate-100'
                  : 'bg-white/20 text-white cursor-not-allowed opacity-80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Donation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Month Donation Eligibility Rule Alert Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        eligibility?.isEligible
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-2xl shrink-0 ${
            eligibility?.isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {eligibility?.isEligible ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base">
                {eligibility?.isEligible ? '✓ You Are Eligible to Donate Blood' : '⏳ 3-Month Recovery Period Active'}
              </h3>
              <StatusBadge status={eligibility?.isEligible ? 'ELIGIBLE' : 'INELIGIBLE'} size="sm" />
            </div>
            <p className="text-xs mt-1 leading-relaxed max-w-2xl opacity-90">
              {eligibility?.statusMessage}
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold mt-2 text-slate-600">
              <span>Last Donated: <strong>{profile?.last_donation_date || 'Never Donated'}</strong></span>
              <span>Next Eligible Date: <strong>{eligibility?.nextEligibleDate}</strong></span>
              {!eligibility?.isEligible && (
                <span className="text-amber-800 font-bold">({eligibility?.daysRemaining} days remaining)</span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/donor/eligibility"
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm shrink-0 self-start sm:self-center"
        >
          View Eligibility Details
        </Link>
      </div>

      {/* Shortage Alert for Donor's Blood Group (if low stock) */}
      {shortageAlert?.hasShortage && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-800">
                Critical Shortage Alert: {shortageAlert.bloodGroup} Blood
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Partner hospitals currently have only {shortageAlert.availableCount} available units of your blood group ({shortageAlert.bloodGroup}). If eligible, your donation could save a life today.
              </p>
            </div>
          </div>
          <Link
            to="/donor/schedule"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-sm"
          >
            Donate Today
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Donations"
          value={metrics?.totalDonations ?? 0}
          subtitle="Lifetime blood donations"
          icon={Droplet}
          color="blood"
        />
        <StatCard
          title="Lives Impacted"
          value={(metrics?.totalDonations || 0) * 3}
          subtitle="Up to 3 patients per bag"
          icon={Heart}
          color="emerald"
        />
        <StatCard
          title="Upcoming Appointments"
          value={metrics?.upcomingAppointmentsCount ?? 0}
          subtitle="Scheduled hospital bookings"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="Milestone Rank"
          value={badge}
          subtitle="Donor recognition badge"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Upcoming Appointments & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Appointments Column */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Your Donation Appointments</h3>
              <p className="text-xs text-slate-500">Upcoming and pending visits</p>
            </div>
            <Link
              to="/donor/schedule"
              className="text-xs font-bold text-blood-700 hover:underline"
            >
              Book Slot
            </Link>
          </div>

          {appointments?.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No scheduled appointments</p>
              <p className="mt-0.5">Select a hospital blood bank slot or nearby donation camp.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.appointment_id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-navy-950">{appt.hospital_name}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>📅 {appt.appointment_date}</span>
                      <span>⏰ {appt.time_slot}</span>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">Verified Donation History</h3>
              <p className="text-xs text-slate-500">Completed and screened donations</p>
            </div>
            <Link
              to="/donor/history"
              className="text-xs font-bold text-blood-700 hover:underline"
            >
              View Full History
            </Link>
          </div>

          {donationHistory?.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              <Droplet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No completed donations yet</p>
              <p className="mt-0.5">Complete your first appointment to earn lifesaver certificates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donationHistory.slice(0, 3).map((rec) => (
                <div
                  key={rec.record_id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-navy-950">{rec.hospital_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Donation Date: {rec.donation_date} • Volume: {rec.quantity_ml}ml
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blood-50 text-blood-700 border border-blood-100">
                    {rec.blood_group}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Privacy Disclaimer for Donors */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-navy-950 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-navy-950 block">Donor Privacy Protection Notice</span>
          <span>
            In accordance with BloodBridge medical security protocols and HIPAA/GDPR health data privacy laws, voluntary donors do not have access to patient prescriptions, medical diagnoses, or personal identity details.
          </span>
        </div>
      </div>
    </div>
  );
}
