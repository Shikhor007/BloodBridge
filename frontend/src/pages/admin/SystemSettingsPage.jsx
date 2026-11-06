import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Settings, Save, AlertTriangle, ShieldCheck, DollarSign, Bell } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const { addToast } = useNotification();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
        setCharges(res.data.charges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateSetting = async (key, value) => {
    setSavingKey(key);
    try {
      const res = await api.put('/admin/settings', {
        settingKey: key,
        settingValue: value
      });
      if (res.data.success) {
        addToast(`Setting ${key} updated successfully`, 'success');
        loadSettings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update setting', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdateCharge = async (chargeId, amount, isActive) => {
    try {
      const res = await api.put(`/admin/service-charges/${chargeId}`, {
        amount,
        isActive
      });
      if (res.data.success) {
        addToast('Service charge configuration saved', 'success');
        loadSettings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update charge', 'error');
    }
  };

  const getSetting = (key, defaultVal = '') => {
    const s = settings.find(item => item.setting_key === key);
    return s ? s.setting_value : defaultVal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Platform Governance</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">System Configuration & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure platform parameters, clinical recovery intervals, service fee subsidies, and emergency announcements.
        </p>
      </div>

      {/* Emergency Announcement Broadcast Control */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-blood-700" />
          <h3 className="font-extrabold text-navy-950 text-base">Public Emergency Announcement Broadcast</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Display Emergency Banner across Homepage & Dashboards:</span>
            <button
              onClick={() => handleUpdateSetting('EMERGENCY_BANNER_ACTIVE', getSetting('EMERGENCY_BANNER_ACTIVE') === '1' ? '0' : '1')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                getSetting('EMERGENCY_BANNER_ACTIVE') === '1'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {getSetting('EMERGENCY_BANNER_ACTIVE') === '1' ? 'ACTIVE (BROADCASTING)' : 'DISABLED'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Emergency Announcement Text</label>
            <textarea
              rows={2}
              defaultValue={getSetting('EMERGENCY_BANNER_TEXT')}
              onBlur={(e) => handleUpdateSetting('EMERGENCY_BANNER_TEXT', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">Changes are saved automatically when leaving the text area.</p>
          </div>
        </div>
      </div>

      {/* Clinical Interval Setting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="font-extrabold text-navy-950 text-base">Donation Safety Interval Parameter</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Minimum Interval Between Donations (Calendar Months)
            </label>
            <input
              type="number"
              min="2"
              max="6"
              defaultValue={getSetting('DONATION_INTERVAL_MONTHS', '3')}
              onBlur={(e) => handleUpdateSetting('DONATION_INTERVAL_MONTHS', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-blood-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">Default clinical protocol is 3 calendar months.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
            <span className="font-bold text-navy-950 block">Enforcement Mode:</span>
            <span>All donor appointment scheduling endpoints enforce this interval on the backend before booking confirmation.</span>
          </div>
        </div>
      </div>

      {/* Transparent Service Charge Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <DollarSign className="w-5 h-5 text-blood-700" />
          <h3 className="font-extrabold text-navy-950 text-base">Transparent Service Charge Configuration</h3>
        </div>

        <p className="text-xs text-slate-500">
          BloodBridge follows a donation-based model. Donors are never paid or charged. These administrative fees cover lab consumables and cold chain logistics per unit.
        </p>

        <div className="space-y-3">
          {charges.map(charge => (
            <div
              key={charge.charge_id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-extrabold text-navy-950 text-sm block">{charge.charge_name}</span>
                <span className="text-slate-500 block text-[11px]">{charge.description}</span>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-700">$</span>
                  <input
                    type="number"
                    step="1"
                    defaultValue={charge.amount}
                    onBlur={(e) => handleUpdateCharge(charge.charge_id, parseFloat(e.target.value) || 0, charge.is_active)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 text-center"
                  />
                  <span className="text-slate-400 font-semibold">/ bag</span>
                </div>

                <button
                  onClick={() => handleUpdateCharge(charge.charge_id, charge.amount, charge.is_active ? 0 : 1)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] ${
                    charge.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {charge.is_active ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
