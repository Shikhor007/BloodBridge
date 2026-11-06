import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function ScheduleDonationPage() {
  const [hospitals, setHospitals] = useState([]);
  const [camps, setCamps] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const { addToast } = useNotification();

  const loadData = async () => {
    try {
      const [slotsRes, dashRes] = await Promise.all([
        api.get('/donor/available-slots'),
        api.get('/donor/dashboard')
      ]);

      if (slotsRes.data.success) {
        setHospitals(slotsRes.data.hospitals);
        setCamps(slotsRes.data.camps);
        setTimeSlots(slotsRes.data.timeSlots);
        if (slotsRes.data.hospitals.length > 0) {
          setSelectedHospital(slotsRes.data.hospitals[0].hospitalId);
        }
        if (slotsRes.data.timeSlots.length > 0) {
          setSelectedSlot(slotsRes.data.timeSlots[0]);
        }
      }

      if (dashRes.data.success) {
        setMyAppointments(dashRes.data.data.appointments || []);
        setEligibility(dashRes.data.data.eligibility);
      }
    } catch (err) {
      console.error('Failed to load scheduling data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default tomorrow's date
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setSelectedDate(tomorrow);
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!eligibility?.isEligible) {
      addToast(`Appointment booking blocked: 3-month recovery interval active until ${eligibility?.nextEligibleDate}`, 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/donor/appointments', {
        hospitalId: selectedHospital,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot
      });
      if (res.data.success) {
        addToast('Donation appointment scheduled successfully!', 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to schedule appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this donation appointment?')) return;
    try {
      const res = await api.put(`/donor/appointments/${appointmentId}/cancel`, {
        reason: 'Cancelled by donor through portal'
      });
      if (res.data.success) {
        addToast('Appointment cancelled', 'info');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEligible = eligibility?.isEligible;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Appointment Booking</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Schedule a Blood Donation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select an accredited hospital blood bank slot or register for an upcoming community donation drive.
        </p>
      </div>

      {/* Ineligibility Warning if active */}
      {!isEligible && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-sm block">Appointment Booking Restricted</span>
            <span className="leading-relaxed mt-0.5 block">
              You are currently within your 3-month physiological recovery window. You will become eligible on <strong>{eligibility?.nextEligibleDate}</strong>.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blood-700" />
            <span>Select Hospital & Time Slot</span>
          </h3>

          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Hospital Blood Bank *
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
              >
                {hospitals.map(h => (
                  <option key={h.hospitalId} value={h.hospitalId}>
                    {h.hospitalName} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Available Time Slot *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEligible || bookingLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                isEligible
                  ? 'bg-blood-700 hover:bg-blood-800 text-white shadow-blood-700/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {bookingLoading ? 'Reserving Slot...' : isEligible ? 'Confirm Appointment Booking' : 'Ineligible to Book (Interval Active)'}
              </span>
            </button>
          </form>

          {/* Upcoming Donation Camps */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="font-extrabold text-navy-950 text-xs uppercase tracking-wider mb-3">
              Upcoming Community Donation Camps
            </h4>
            <div className="space-y-3">
              {camps.map(camp => (
                <div key={camp.camp_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-navy-950 block">{camp.camp_name}</span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      📍 {camp.location}, {camp.city} • 📅 {camp.start_date} ({camp.start_time} - {camp.end_time})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blood-100 text-blood-800 shrink-0">
                    Target: {camp.target_units}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Appointments List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-extrabold text-navy-950 text-base">Your Scheduled Appointments</h3>

          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-400">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map(appt => (
                <div
                  key={appt.appointment_id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-navy-950 text-xs">{appt.hospital_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{appt.hospital_address}, {appt.hospital_city}</p>
                    </div>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl font-medium">
                    <span>📅 {appt.appointment_date}</span>
                    <span>⏰ {appt.time_slot}</span>
                  </div>

                  {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                    <button
                      onClick={() => handleCancel(appt.appointment_id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
