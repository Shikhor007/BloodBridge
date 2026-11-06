import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { Phone, Mail, MapPin, Send, HelpCircle, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/public/contact', formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit inquiry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blood-700">24/7 Support Center</span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-950">We Are Here to Help You</h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Whether you have urgent blood requisition questions, donation camp scheduling queries, or technical assistance needs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-navy-950 text-lg">Central Contact Details</h3>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-blood-50 text-blood-700">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Emergency & General Hotline</p>
                  <p className="text-base font-extrabold text-navy-950 mt-0.5">+1 (800) 555-BLOOD</p>
                  <p className="text-xs text-slate-500">Toll-free 24/7/365 Emergency Dispatch</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-navy-50 text-navy-950">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Support Desk</p>
                  <p className="text-base font-extrabold text-navy-950 mt-0.5">support@bloodbridge.org</p>
                  <p className="text-xs text-slate-500">Average response time: &lt; 2 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Platform Headquarters</p>
                  <p className="text-base font-extrabold text-navy-950 mt-0.5">450 Health Sciences Blvd</p>
                  <p className="text-xs text-slate-500">Manhattan Medical District, NY 10016</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blood-700 to-blood-800 text-white rounded-3xl p-6 shadow-md">
              <div className="flex items-center space-x-2 text-blood-200 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Life-Threatening Emergency?</span>
              </div>
              <p className="text-sm font-semibold mt-2 leading-relaxed">
                If a patient requires immediate emergency blood for ongoing trauma surgery, please dial 911 or call our priority dispatch directly at +1 (800) 555-BLOOD.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-navy-950 text-lg mb-6">Send an Inquiry or Feedback</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Inquiry Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="E.g., Question regarding donor appointment reschedule"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide detailed information regarding your inquiry..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blood-700/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Send Message to Support'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
