import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { User, KeyRound, Shield, Save, Bell, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function DonorProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotification();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.donor?.address || '');
  const [district, setDistrict] = useState(user?.donor?.district || '');
  const [city, setCity] = useState(user?.donor?.city || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.donor?.emergency_contact || '');
  const [allowShortageAlerts, setAllowShortageAlerts] = useState(user?.donor?.allow_shortage_alerts === 1);
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
        fullName,
        phone,
        address,
        district,
        city,
        emergencyContact,
        allowShortageAlerts
      });
      if (res.data.success) {
        addToast('Donor profile updated', 'success');
        refreshUser();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
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
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Donor Settings</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Donor Profile & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your contact information, blood group records, and alert preferences up to date.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Details Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
              <User className="w-5 h-5 text-blood-700" />
              <span>Donor Information</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 text-xs border border-blood-100">
                Blood: {user?.donor?.blood_group || 'O+'}
              </span>
              <StatusBadge status={user?.donor?.verification_status || 'PENDING'} size="sm" />
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District / Region</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            {/* Notification Preference Toggle */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowShortageAlerts}
                  onChange={(e) => setAllowShortageAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blood-700 focus:ring-blood-700 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Notify me when my blood group ({user?.donor?.blood_group}) faces shortage in nearby hospitals
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Donor Details'}</span>
            </button>
          </form>
        </div>

        {/* Password & Privacy Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-navy-950 text-base flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-navy-950" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
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

          {/* Privacy Wall Notice */}
          <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-navy-950">
              <Shield className="w-4 h-4 text-blood-700" />
              <span>Confidentiality & Privacy Wall</span>
            </div>
            <p className="leading-relaxed">
              Voluntary donors cannot view patient medical histories, clinical prescriptions, or identities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
