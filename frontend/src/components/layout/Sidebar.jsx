import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Droplet,
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  Clock,
  User,
  CheckCircle,
  Calendar,
  Award,
  Package,
  Users,
  Building2,
  AlertTriangle,
  BarChart3,
  GitBranch,
  ShieldAlert,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.roleName;

  const patientNav = [
    { label: 'Overview', to: '/patient', icon: LayoutDashboard },
    { label: 'Find Blood', to: '/patient/find-blood', icon: Search },
    { label: 'Request Blood', to: '/patient/request-blood', icon: PlusCircle },
    { label: 'My Requests', to: '/patient/my-requests', icon: FileText },
    { label: 'Shortage Waitlist', to: '/patient/future-requests', icon: Clock },
    { label: 'My Profile', to: '/patient/profile', icon: User },
  ];

  const donorNav = [
    { label: 'Overview', to: '/donor', icon: LayoutDashboard },
    { label: 'Eligibility Check', to: '/donor/eligibility', icon: CheckCircle },
    { label: 'Book Appointment', to: '/donor/schedule', icon: Calendar },
    { label: 'Donation History', to: '/donor/history', icon: FileText },
    { label: 'Certificates & Badges', to: '/donor/certificates', icon: Award },
    { label: 'Donor Profile', to: '/donor/profile', icon: User },
  ];

  const hospitalNav = [
    { label: 'Overview', to: '/hospital', icon: LayoutDashboard },
    { label: 'Blood Inventory', to: '/hospital/inventory', icon: Package },
    { label: 'Patient Requests', to: '/hospital/requests', icon: FileText },
    { label: 'Donor Appointments', to: '/hospital/appointments', icon: Calendar },
    { label: 'Blood Expiry Alert', to: '/hospital/expiry', icon: AlertTriangle },
    { label: 'Donation Camps', to: '/hospital/camps', icon: Users },
    { label: 'Reports & Export', to: '/hospital/reports', icon: BarChart3 },
    { label: 'Hospital Profile', to: '/hospital/profile', icon: Building2 },
  ];

  const adminNav = [
    { label: 'Platform Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Hospital Verifications', to: '/admin/hospitals', icon: Building2 },
    { label: 'User Management', to: '/admin/users', icon: Users },
    { label: 'All Blood Requests', to: '/admin/requests', icon: FileText },
    { label: 'Deep Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Blood Compatibility', to: '/admin/rules', icon: GitBranch },
    { label: 'System Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'System Settings', to: '/admin/settings', icon: Settings },
  ];

  let currentNav = [];
  if (role === 'PATIENT') currentNav = patientNav;
  else if (role === 'DONOR') currentNav = donorNav;
  else if (role === 'HOSPITAL') currentNav = hospitalNav;
  else if (role === 'ADMIN') currentNav = adminNav;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Box */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-slate-800`}>
        {/* Brand */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blood-700 flex items-center justify-center text-white shadow-md shadow-blood-700/30">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">
                Blood<span className="text-blood-500">Bridge</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 block">
                {role} PORTAL
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/patient' || item.to === '/donor' || item.to === '/hospital' || item.to === '/admin'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blood-700 text-white shadow-md shadow-blood-700/20 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase border border-slate-600">
              {user?.fullName ? user.fullName.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
