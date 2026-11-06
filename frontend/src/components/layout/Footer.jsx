import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Phone, Mail, MapPin, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blood-700 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Blood<span className="text-blood-500">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A centralized, transparent healthcare platform uniting voluntary blood donors, patients in critical need, and accredited hospital blood banks.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Non-Commercial Donation Model</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/blood-availability" className="hover:text-white transition-colors">Real-Time Blood Availability</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Our Mission</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Account Portals */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Portals</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Unified Login</Link></li>
              <li><Link to="/register?role=donor" className="hover:text-white transition-colors">Become a Donor</Link></li>
              <li><Link to="/register?role=patient" className="hover:text-white transition-colors">Patient Blood Request</Link></li>
              <li><Link to="/register?role=hospital" className="hover:text-white transition-colors">Hospital Blood Bank Registration</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">System Admin Console</Link></li>
            </ul>
          </div>

          {/* 24/7 Hotline & Emergency */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Emergency & Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3 text-slate-300">
                <Phone className="w-4 h-4 text-blood-500 shrink-0" />
                <span className="font-semibold text-white">+1 (800) 555-BLOOD (24/7)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blood-500 shrink-0" />
                <span>support@bloodbridge.org</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
                <span>450 Health Sciences Blvd, Manhattan, NY 10016</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BloodBridge Platform. All rights reserved. Connecting Lives Through Blood Donation.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400">Security & Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
