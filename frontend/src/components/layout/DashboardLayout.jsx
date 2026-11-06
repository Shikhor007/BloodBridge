import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import api from '../../services/api';
import { AlertCircle } from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyBanner, setEmergencyBanner] = useState(null);

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await api.get('/public/stats');
        if (res.data.success && res.data.data.emergencyAnnouncement?.isActive) {
          setEmergencyBanner(res.data.data.emergencyAnnouncement.message);
        }
      } catch (err) {
        // Ignore banner failure
      }
    }
    loadBanner();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Emergency System Announcement Banner */}
        {emergencyBanner && (
          <div className="bg-rose-700 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{emergencyBanner}</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
