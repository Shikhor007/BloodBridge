import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Droplet, ShieldCheck, Heart, Award, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-blood-50/70 to-white py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blood-100 text-blood-800 text-xs font-bold uppercase tracking-wider">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Ethical Healthcare Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-navy-950 tracking-tight">
            Connecting Lives Through Ethical Blood Donation
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            BloodBridge was founded on the principle that human blood is a life-saving gift, never a commercial commodity.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Non-Negotiable Standards</h2>
            <p className="text-3xl font-extrabold text-navy-950 mt-1">Our Core Operating Principles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blood-100 text-blood-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-950">100% Voluntary Donation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Donors never pay money to donate blood, and donors never receive financial compensation. This maintains the purest safety standards and prevents exploitation.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-navy-100 text-navy-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-950">Transparent Service Fees</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patients pay only a small, non-profit administrative fee covering sterile collection bags, cold-chain transport, infectious disease testing, and cross-matching.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-950">Strict Patient Privacy</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Donors NEVER access patient prescriptions, medical diagnoses, or personal health records. Privacy and confidentiality are safeguarded by strict backend RBAC rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Protocol */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blood-700">Safety First</h2>
            <p className="text-3xl font-extrabold text-navy-950 mt-1">The 3-Month Donation Interval</p>
            <p className="text-sm text-slate-600 mt-2">
              BloodBridge automatically calculates donor eligibility. A minimum interval of 3 calendar months is mandatory before scheduling a new donation to safeguard donor hemoglobin levels and well-being.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h4 className="font-extrabold text-navy-950 text-base mb-4">Mandatory Screening Before Bag Assignment:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hemoglobin level & blood pressure validation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Infectious disease screening (HIV, HBV, HCV, Syphilis)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Double-entry blood unit unique identification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cold-chain storage tracking at 2°C to 6°C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to Save Lives in Your Community?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join thousands of voluntary donors and healthcare professionals committed to an accessible, reliable blood supply.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/register?role=donor"
              className="px-8 py-3.5 bg-blood-700 hover:bg-blood-800 rounded-xl font-bold text-sm shadow-lg shadow-blood-700/30 transition-all"
            >
              Register as Donor
            </Link>
            <Link
              to="/register?role=hospital"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm border border-slate-700 transition-all"
            >
              Hospital Accreditation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
