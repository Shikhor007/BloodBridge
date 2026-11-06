import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import {
  Droplet,
  Heart,
  ShieldCheck,
  Building2,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Send,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useNotification } from '../../context/NotificationContext';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, availRes] = await Promise.all([
          api.get('/public/stats'),
          api.get('/public/blood-availability')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (availRes.data.success) setAvailability(availRes.data.summary);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await api.post('/public/contact', contactForm);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit contact message', 'error');
    } finally {
      setContactSubmitting(false);
    }
  };

  const filteredAvailability = selectedGroup === 'ALL'
    ? availability
    : availability.filter(a => a.bloodGroup === selectedGroup);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Emergency Announcement Banner */}
      {stats?.emergencyAnnouncement?.isActive && (
        <div className="bg-rose-700 text-white px-4 py-3 text-sm font-semibold flex items-center justify-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
          <span>{stats.emergencyAnnouncement.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-blood-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blood-100 text-blood-800 text-xs font-bold uppercase tracking-wider">
                <Droplet className="w-4 h-4 fill-blood-700 text-blood-700" />
                <span>Non-Profit Verified Blood Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.1]">
                Donate Blood. <br className="hidden sm:inline" />
                <span className="text-blood-700">Save Lives.</span> <br />
                Build a Healthier Community.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                BloodBridge connects voluntary donors, patients in urgent need, and accredited hospital blood banks through one secure, transparent platform. Find real-time blood stock and request support immediately.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/register?role=patient"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blood-700 text-white font-bold text-base shadow-lg shadow-blood-700/30 hover:bg-blood-800 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
                >
                  <span>Request Blood Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register?role=donor"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-navy-950 text-white font-bold text-base shadow-lg shadow-navy-950/20 hover:bg-navy-900 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5 text-blood-400" />
                  <span>Become a Donor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Hospitals Only</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Donor Remuneration</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3-Month Safety Interval</span>
                </span>
              </div>
            </div>

            {/* Visual Healthcare Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center shadow-md shadow-blood-600/30">
                      <Droplet className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-navy-950 text-base">Blood Availability Status</h3>
                      <p className="text-xs text-slate-500">Live Hospital Network Feed</p>
                    </div>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="w-10 h-10 rounded-lg bg-blood-100 text-blood-700 font-extrabold flex items-center justify-center text-sm">
                        O-
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Universal Donor Type</p>
                        <p className="text-[11px] text-slate-500">Emergency & Trauma Reserve</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Available
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="w-10 h-10 rounded-lg bg-navy-100 text-navy-800 font-extrabold flex items-center justify-center text-sm">
                        AB+
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Universal Recipient</p>
                        <p className="text-[11px] text-slate-500">Can receive all red cell types</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-100 text-sky-800">
                      Verified Stock
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blood-700 to-blood-800 text-white">
                    <p className="text-xs font-semibold text-blood-200 uppercase tracking-wider">Fast Emergency Search</p>
                    <p className="text-sm font-bold mt-1">Need blood units urgently?</p>
                    <button
                      onClick={() => navigate('/blood-availability')}
                      className="mt-3 w-full py-2.5 bg-white text-blood-800 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors shadow"
                    >
                      Search Hospitals by Location
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Statistics Section (Real DB records) */}
      <section className="py-16 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blood-400">Real-Time Platform Impact</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Verified Real-Time Statistics</p>
            <p className="text-sm text-slate-400 mt-2">Calculated directly from live database activity across all partner hospitals.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <Users className="w-7 h-7 text-blood-400 mx-auto mb-3" />
              <div className="text-4xl font-black text-white">{stats?.totalDonors ?? 0}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">Registered Donors</p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <Building2 className="w-7 h-7 text-sky-400 mx-auto mb-3" />
              <div className="text-4xl font-black text-white">{stats?.totalHospitals ?? 0}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">Accredited Hospitals</p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <Heart className="w-7 h-7 text-rose-400 mx-auto mb-3" />
              <div className="text-4xl font-black text-white">{stats?.totalPatientsServed ?? 0}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">Patients Served</p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <Droplet className="w-7 h-7 text-amber-400 mx-auto mb-3" />
              <div className="text-4xl font-black text-white">{stats?.totalDistributedBags ?? 0}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">Bags Distributed</p>
            </div>
          </div>

          {stats?.topHospitalName && stats.topHospitalName !== 'N/A' && (
            <div className="mt-8 text-center text-xs text-slate-400">
              Highest Blood Distribution Partner: <span className="font-bold text-white">{stats.topHospitalName}</span> • Most Requested Group: <span className="font-bold text-blood-400">{stats.mostRequestedGroup}</span>
            </div>
          )}
        </div>
      </section>

      {/* Real-Time Blood Availability Grid (8 Groups) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Stock Inventory Monitor</h2>
              <p className="text-3xl font-extrabold text-navy-950 mt-1">Real-Time Blood Availability</p>
              <p className="text-sm text-slate-600 mt-1">Live status across all eight primary blood groups.</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    selectedGroup === grp
                      ? 'bg-blood-700 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAvailability.map((item) => (
              <div
                key={item.bloodGroup}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blood-50 border border-blood-100 text-blood-700 font-black text-2xl flex items-center justify-center">
                    {item.bloodGroup}
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Available Bags:</span>
                    <span className="font-extrabold text-slate-900 text-lg">{item.availableUnits}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span>Hospitals with stock:</span>
                    <span className="font-semibold text-slate-700">{item.hospitalsCount}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    to={`/patient/request-blood?group=${encodeURIComponent(item.bloodGroup)}`}
                    className="block w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-blood-700 hover:text-white text-navy-950 font-bold text-xs transition-colors"
                  >
                    Request {item.bloodGroup} Unit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/blood-availability"
              className="inline-flex items-center space-x-2 text-blood-700 font-bold text-sm hover:underline"
            >
              <span>Explore detailed hospital-by-hospital inventory breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works (3 Simple Steps) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Verified Protocol</h2>
            <p className="text-3xl font-extrabold text-navy-950 mt-1">How BloodBridge Works</p>
            <p className="text-sm text-slate-600 mt-2">Connecting patients, voluntary donors, and hospitals in three reliable steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-blood-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-blood-700/25">
                1
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-2">Find Blood</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search verified hospital inventories in real-time by blood group, district, and city without exposing private patient data.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-navy-950 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-navy-950/20">
                2
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-2">Submit a Request</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide doctor information and upload prescription or medical report. Hospital admins review and verify orders rapidly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-700/25">
                3
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-2">Receive Verified Blood</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Specific screened blood units are assigned atomically. Track preparation status and collect ready blood at the dispatch cooler.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Our Sacred Mission</h2>
            <p className="text-3xl font-black text-navy-950">Ethical, Non-Commercial Blood Donation</p>
            <p className="text-slate-600 text-base leading-relaxed">
              BloodBridge operates on a strict non-profit donation model. Donors are selfless volunteers who never pay money and never receive financial remuneration. Patients only pay a minimal, completely transparent administrative fee for mandatory infectious disease testing, cross-matching, and temperature-controlled storage.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-700">
              <span className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">✓ Strict 3-Month Interval</span>
              <span className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">✓ Absolute Patient Privacy</span>
              <span className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">✓ Double-Assignment Concurrency Lock</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Get in Touch</h2>
                <p className="text-3xl font-black text-navy-950 mt-1">Contact Our Help Center</p>
                <p className="text-sm text-slate-600 mt-2">
                  Have a question about donation guidelines, hospital partnership, or an active request? Our 24/7 team is ready to assist.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="w-5 h-5 text-blood-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">24/7 Central Hotline</h4>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">+1 (800) 555-BLOOD</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-5 h-5 text-blood-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Helpdesk Email</h4>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">support@bloodbridge.org</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-5 h-5 text-blood-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Central Operations Office</h4>
                    <p className="text-sm text-slate-700 mt-0.5">450 Health Sciences Blvd, Manhattan, NY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <h3 className="text-lg font-bold text-navy-950 mb-6">Send an Inquiry or Support Ticket</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Johnathan Archer"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Blood donation question or hospital onboarding"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe your question or situation in detail..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full py-3.5 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-blood-700/25 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{contactSubmitting ? 'Sending...' : 'Submit Support Message'}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
