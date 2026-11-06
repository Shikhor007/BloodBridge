import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Printer, Droplet, ShieldCheck, Heart } from 'lucide-react';

export default function DonorCertificatesPage() {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificate() {
      try {
        const res = await api.get('/donor/certificate');
        if (res.data.success) {
          setCert(res.data.certificate);
        }
      } catch (err) {
        console.error('Failed to load certificate', err);
      } finally {
        setLoading(false);
      }
    }
    loadCertificate();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Lifesaver Certificate of Honor</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recognizing your selfless contribution to community health and emergency patient care.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Certificate PDF</span>
        </button>
      </div>

      {/* Official Certificate Visual Box */}
      <div className="bg-white rounded-3xl p-8 sm:p-14 border-8 border-double border-amber-200 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Subtle Watermark Droplet */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <Droplet className="w-96 h-96 fill-blood-700" />
        </div>

        {/* Top Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-9 h-9" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-700">
            BloodBridge Global Healthcare Alliance
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy-950 tracking-tight">
            Certificate of Appreciation
          </h2>
          <p className="text-xs text-slate-500 italic">
            This certifies that voluntary blood donor
          </p>
        </div>

        {/* Donor Name */}
        <div className="py-4 border-b-2 border-dashed border-amber-300 max-w-lg mx-auto">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-blood-700 tracking-tight">
            {cert?.donorName || 'Sarah Jenkins'}
          </h3>
        </div>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Has selflessly donated blood to support critically ill patients and trauma victims. With an established record of{' '}
          <strong className="text-navy-950 font-black">{cert?.totalDonations || 1} successful donations</strong> of blood type{' '}
          <strong className="text-blood-700 font-black">{cert?.bloodGroup}</strong>, your dedication exemplifies the highest standard of community service.
        </p>

        {/* Signatures & Seal */}
        <div className="pt-8 grid grid-cols-2 gap-8 max-w-lg mx-auto border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <div className="font-serif italic font-bold text-slate-800 text-base">Dr. Eleanor Vance</div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Chief Medical Director</p>
            <p className="text-[10px] text-slate-400">BloodBridge Platform</p>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-xs font-bold text-slate-800">{cert?.issueDate}</div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Issue Date</p>
            <p className="text-[10px] text-amber-700 font-mono font-bold">{cert?.certificateId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
