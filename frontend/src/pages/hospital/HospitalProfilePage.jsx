import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Building2, KeyRound, Save, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function HospitalProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotification();

  const hosp = user?.hospital;

  const [phone, setPhone] = useState(hosp?.phone || '');
  const [address, setAddress] = useState(hosp?.address || '');
  const [district, setDistrict] = useState(hosp?.district || '');
  const [city, setCity] = useState(hosp?.city || '');
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        phone,
        address,
        district,
        city
      });
      if (res.data.success) {
        addToast('Hospital contact details updated', 'success');
        refreshUser();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setPassSaving(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        addToast('Password updated', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Hospital Settings</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Hospital Blood Bank Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review accredited facility details, public emergency dispatch hotlines, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Hospital Details Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">{hosp?.hospital_name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">License: {hosp?.registration_number}</p>
            </div>
            <StatusBadge status={hosp?.approval_status || 'APPROVED'} size="sm" />
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Bank Hotline Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Physical Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <p>Official Email: <strong className="text-slate-900">{hosp?.hospital_email}</strong></p>
              <p>Medical Director: <strong className="text-slate-900">{hosp?.contact_person}</strong></p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Hospital Contact'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-navy-950" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={passSaving}
                className="w-full py-3 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                {passSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
