import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Heart, User, Building2, ShieldCheck, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'donor';
  const [activeTab, setActiveTab] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const { registerDonor, registerPatient, registerHospital, getDashboardPath } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['donor', 'patient', 'hospital'].includes(r)) {
      setActiveTab(r);
    }
  }, [searchParams]);

  // Form states
  const [donorData, setDonorData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    district: '',
    city: '',
    emergencyContact: '',
    lastDonationDate: ''
  });

  const [patientData, setPatientData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    district: '',
    city: '',
    emergencyContact: ''
  });

  const [hospitalData, setHospitalData] = useState({
    hospitalName: '',
    hospitalEmail: '',
    phone: '',
    registrationNumber: '',
    address: '',
    district: '',
    city: '',
    contactPerson: '',
    password: ''
  });
  const [hospitalFile, setHospitalFile] = useState(null);

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await registerDonor(donorData);
      if (res.success) {
        addToast('Donor registration successful! Welcome to BloodBridge.', 'success');
        navigate('/donor');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await registerPatient(patientData);
      if (res.success) {
        addToast('Patient account created successfully.', 'success');
        navigate('/patient');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const formData = new FormData();
      Object.keys(hospitalData).forEach(key => {
        formData.append(key, hospitalData[key]);
      });
      if (hospitalFile) {
        formData.append('hospital_document', hospitalFile);
      }

      const res = await registerHospital(formData);
      if (res.success) {
        setSuccessNotice(res.message);
        addToast('Hospital application submitted for review.', 'info');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Hospital registration submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-blood-700 flex items-center justify-center text-white shadow-md shadow-blood-700/30">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black text-navy-950">
              Blood<span className="text-blood-700">Bridge</span>
            </span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-navy-950">Create an Account</h2>
          <p className="mt-1 text-xs text-slate-500">Select your registration role to proceed.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1.5 bg-slate-200/80 rounded-2xl mb-8">
          <button
            onClick={() => { setActiveTab('donor'); setErrorMessage(''); setSuccessNotice(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'donor'
                ? 'bg-white text-blood-700 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Blood Donor</span>
          </button>

          <button
            onClick={() => { setActiveTab('patient'); setErrorMessage(''); setSuccessNotice(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-navy-950 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient</span>
          </button>

          <button
            onClick={() => { setActiveTab('hospital'); setErrorMessage(''); setSuccessNotice(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'hospital'
                ? 'bg-white text-navy-950 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital Blood Bank</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <p className="font-bold text-sm">Application Received!</p>
              <p className="leading-relaxed">{successNotice}</p>
              <Link to="/login" className="inline-block mt-2 font-bold text-emerald-800 underline">
                Return to Login
              </Link>
            </div>
          )}

          {/* DONOR REGISTRATION FORM */}
          {activeTab === 'donor' && !successNotice && (
            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div className="p-3 bg-blood-50 border border-blood-100 rounded-xl text-xs text-blood-900 font-medium">
                ❤️ <strong>Donation Principle:</strong> Donors never pay to donate and never receive financial compensation. A minimum 3-month safety recovery is required between donations.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={donorData.fullName}
                    onChange={(e) => setDonorData({ ...donorData, fullName: e.target.value })}
                    placeholder="Sarah Jenkins"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={donorData.email}
                    onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={donorData.phone}
                    onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
                    placeholder="+1-555-0301"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={donorData.password}
                    onChange={(e) => setDonorData({ ...donorData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={donorData.bloodGroup}
                    onChange={(e) => setDonorData({ ...donorData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blood-700 focus:outline-none focus:ring-2 focus:ring-blood-700"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={donorData.dateOfBirth}
                    onChange={(e) => setDonorData({ ...donorData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Gender *</label>
                  <select
                    value={donorData.gender}
                    onChange={(e) => setDonorData({ ...donorData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={donorData.city}
                    onChange={(e) => setDonorData({ ...donorData, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District / Region</label>
                  <input
                    type="text"
                    value={donorData.district}
                    onChange={(e) => setDonorData({ ...donorData, district: e.target.value })}
                    placeholder="Manhattan"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={donorData.address}
                  onChange={(e) => setDonorData({ ...donorData, address: e.target.value })}
                  placeholder="Street and building number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    value={donorData.emergencyContact}
                    onChange={(e) => setDonorData({ ...donorData, emergencyContact: e.target.value })}
                    placeholder="Relative or guardian phone"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Last Donation Date (if any)
                  </label>
                  <input
                    type="date"
                    value={donorData.lastDonationDate}
                    onChange={(e) => setDonorData({ ...donorData, lastDonationDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty if you have never donated before.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-blood-700/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register as Blood Donor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* PATIENT REGISTRATION FORM */}
          {activeTab === 'patient' && !successNotice && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="p-3 bg-navy-50 border border-navy-100 rounded-xl text-xs text-navy-950 font-medium">
                🏥 <strong>Patient Blood Access:</strong> Register to search real-time blood stock across accredited hospitals, request blood units, and track fulfillment in real-time.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientData.fullName}
                    onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                    placeholder="Johnathan Archer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={patientData.email}
                    onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                    placeholder="+1-555-0401"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={patientData.password}
                    onChange={(e) => setPatientData({ ...patientData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Gender *</label>
                  <select
                    value={patientData.gender}
                    onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={patientData.city}
                    onChange={(e) => setPatientData({ ...patientData, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={patientData.emergencyContact}
                    onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                    placeholder="Immediate family contact"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={patientData.address}
                  onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                  placeholder="Street and apartment number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl text-sm shadow-lg shadow-navy-950/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register Patient Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* HOSPITAL REGISTRATION FORM */}
          {activeTab === 'hospital' && !successNotice && (
            <form onSubmit={handleHospitalSubmit} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                ⚠️ <strong>Administrative Review Required:</strong> Hospital blood bank registrations remain in <strong>PENDING</strong> status until verified and approved by the BloodBridge System Administrator.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Hospital / Institute Name *</label>
                  <input
                    type="text"
                    required
                    value={hospitalData.hospitalName}
                    onChange={(e) => setHospitalData({ ...hospitalData, hospitalName: e.target.value })}
                    placeholder="City General Central Hospital"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Official Hospital Email *</label>
                  <input
                    type="email"
                    required
                    value={hospitalData.hospitalEmail}
                    onChange={(e) => setHospitalData({ ...hospitalData, hospitalEmail: e.target.value })}
                    placeholder="bloodbank@citygeneral.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Hospital Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={hospitalData.registrationNumber}
                    onChange={(e) => setHospitalData({ ...hospitalData, registrationNumber: e.target.value })}
                    placeholder="HOSP-NY-84920"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Bank Hotline Phone *</label>
                  <input
                    type="tel"
                    required
                    value={hospitalData.phone}
                    onChange={(e) => setHospitalData({ ...hospitalData, phone: e.target.value })}
                    placeholder="+1-555-0201"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Person / Medical Officer *</label>
                  <input
                    type="text"
                    required
                    value={hospitalData.contactPerson}
                    onChange={(e) => setHospitalData({ ...hospitalData, contactPerson: e.target.value })}
                    placeholder="Dr. Robert Davis (Director)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={hospitalData.password}
                    onChange={(e) => setHospitalData({ ...hospitalData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={hospitalData.city}
                    onChange={(e) => setHospitalData({ ...hospitalData, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District / County *</label>
                  <input
                    type="text"
                    required
                    value={hospitalData.district}
                    onChange={(e) => setHospitalData({ ...hospitalData, district: e.target.value })}
                    placeholder="Manhattan"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  value={hospitalData.address}
                  onChange={(e) => setHospitalData({ ...hospitalData, address: e.target.value })}
                  placeholder="450 Health Sciences Blvd"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Health Department License / Accreditation Document (PDF/Image)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600 justify-center">
                      <label className="relative cursor-pointer font-bold text-blood-700 hover:text-blood-800">
                        <span>Upload accreditation certificate</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setHospitalFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 5MB</p>
                    {hospitalFile && (
                      <p className="text-xs font-bold text-emerald-600 mt-2">
                        ✓ Selected: {hospitalFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl text-sm shadow-lg shadow-navy-950/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Submitting Application...' : 'Submit Hospital for Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blood-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
