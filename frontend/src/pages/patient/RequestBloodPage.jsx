import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Droplet,
  Upload,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';

export default function RequestBloodPage() {
  const [searchParams] = useSearchParams();
  const prefillGroup = searchParams.get('group') || 'O+';
  const prefillHospId = searchParams.get('hospitalId') || '';

  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [unitServiceFee, setUnitServiceFee] = useState(40);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    hospitalId: prefillHospId,
    bloodGroup: prefillGroup,
    requiredUnits: 1,
    requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'NORMAL',
    patientName: user?.fullName || '',
    patientAge: 35,
    treatmentLocation: '',
    doctorName: '',
    doctorContact: '',
    additionalNotes: ''
  });

  const [medicalFile, setMedicalFile] = useState(null);

  useEffect(() => {
    async function loadFormContext() {
      try {
        const [hospRes, chargeRes] = await Promise.all([
          api.get('/public/blood-availability'),
          api.get('/public/service-charges')
        ]);
        if (hospRes.data.success) {
          setHospitals(hospRes.data.hospitals);
          if (!formData.hospitalId && hospRes.data.hospitals.length > 0) {
            setFormData(prev => ({ ...prev, hospitalId: hospRes.data.hospitals[0].hospitalId }));
          }
        }
        if (chargeRes.data.success) {
          setServiceCharges(chargeRes.data.charges);
          setUnitServiceFee(chargeRes.data.totalServiceFee || 40);
        }
      } catch (err) {
        console.error('Failed to load request dependencies', err);
      }
    }
    loadFormContext();
  }, []);

  const totalCalculatedCharge = unitServiceFee * Number(formData.requiredUnits || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!formData.hospitalId) {
      setErrorMessage('Please select a preferred hospital for collection.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (medicalFile) {
        data.append('prescription', medicalFile);
      }

      const res = await api.post('/patient/requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        addToast('Blood request submitted successfully!', 'success');
        navigate(`/patient/requests/${res.data.requestId}/tracking`);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Requisition Form</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Submit Blood Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          Requests are screened and verified by hospital blood bank directors against clinical protocols.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Blood Requirements */}
          <div>
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-blood-700" />
              <span>1. Blood Requisition Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Required Blood Group *
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-blood-700 bg-white focus:outline-none focus:ring-2 focus:ring-blood-700"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Number of Bags (Units) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formData.requiredUnits}
                  onChange={(e) => setFormData({ ...formData, requiredUnits: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Priority Urgency *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blood-700 ${
                    formData.priority === 'EMERGENCY'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="EMERGENCY">🚨 Emergency (Surgery / Trauma)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Preferred Hospital Blood Bank *
                </label>
                <select
                  required
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blood-700"
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => (
                    <option key={h.hospitalId} value={h.hospitalId}>
                      {h.hospitalName} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Required By Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div>
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-navy-950" />
              <span>2. Patient & Clinical Location Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Johnathan Archer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Patient Age *</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Hospital / Treatment Location & Ward *
              </label>
              <input
                type="text"
                required
                value={formData.treatmentLocation}
                onChange={(e) => setFormData({ ...formData, treatmentLocation: e.target.value })}
                placeholder="City General Hospital - ICU Ward 4B, Bed 12"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Attending Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Dr. Gregory House"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Doctor Contact Phone</label>
                <input
                  type="tel"
                  value={formData.doctorContact}
                  onChange={(e) => setFormData({ ...formData, doctorContact: e.target.value })}
                  placeholder="+1-555-4499"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Upload */}
          <div>
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blood-700" />
              <span>3. Medical Prescription / Lab Requisition Upload</span>
            </h3>

            <div className="border-2 border-slate-300 border-dashed rounded-2xl p-6 bg-slate-50 text-center hover:bg-slate-100 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer text-xs font-bold text-blood-700 hover:text-blood-800">
                <span>Select Doctor's Prescription or Lab Report (PDF, PNG, JPG)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setMedicalFile(e.target.files[0])}
                  className="sr-only"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 5MB</p>
              {medicalFile && (
                <p className="text-xs font-bold text-emerald-700 mt-2">
                  ✓ Attached: {medicalFile.name} ({(medicalFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Additional Clinical Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Additional Notes (Optional)</label>
            <textarea
              rows={2}
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="e.g. Surgery scheduled at 8:00 AM, special cross-matching notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          {/* Transparent Service Charge Preview Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-navy-950">
              <Info className="w-4 h-4 text-blood-700" />
              <span>Transparent Service Charge Breakdown (No Hidden Fees)</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              {serviceCharges.map(sc => (
                <div key={sc.charge_id} className="flex justify-between">
                  <span>{sc.charge_name}:</span>
                  <span className="font-semibold text-slate-800">${sc.amount.toFixed(2)} / bag</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-navy-950">
                <span>Total Service Fee for {formData.requiredUnits} Bag(s):</span>
                <span className="text-blood-700 font-black">${totalCalculatedCharge.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Donors do not receive any payment. This fee strictly subsidizes blood compatibility testing, infectious disease screening, sterile bags, and 2-6°C cold storage.
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-blood-700/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Submitting Request...' : 'Confirm & Submit Blood Request'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
