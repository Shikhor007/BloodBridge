import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { useNotification } from '../../context/NotificationContext';
import { Users, Shield, CheckCircle, Ban, Search, Filter } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { addToast } = useNotification();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`User account status updated to ${newStatus}`, 'success');
        loadUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleVerifyDonor = async (donorId) => {
    try {
      const res = await api.put(`/admin/donors/${donorId}/verify`, { verificationStatus: 'VERIFIED' });
      if (res.data.success) {
        addToast('Donor verified successfully', 'success');
        loadUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to verify donor', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.roleName === roleFilter;
    const matchesSearch = !searchQuery ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Platform User Management & RBAC</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered Donors, Patients, and Hospital Admins. Manage account permissions, suspensions, and donor certifications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blood-700"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-bold uppercase text-slate-500">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-950 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="DONOR">DONOR</option>
            <option value="PATIENT">PATIENT</option>
            <option value="HOSPITAL">HOSPITAL</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role Specifics</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {u.roleName}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">{u.phone}</td>
                    <td className="py-4 px-4">
                      {u.roleName === 'DONOR' && u.details && (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-blood-50 font-black text-blood-700 text-[11px]">
                            {u.details.blood_group}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {u.details.total_donations} donation(s)
                          </span>
                          <StatusBadge status={u.details.verification_status} size="sm" />
                        </div>
                      )}
                      {u.roleName === 'PATIENT' && u.details && (
                        <span className="text-slate-500 text-[11px]">
                          City: {u.details.city} • {u.details.total_requests} request(s)
                        </span>
                      )}
                      {u.roleName === 'HOSPITAL' && u.details && (
                        <span className="text-slate-500 text-[11px]">
                          Reg: {u.details.registration_number}
                        </span>
                      )}
                      {u.roleName === 'ADMIN' && (
                        <span className="text-slate-400 text-[11px] font-bold">System Operator</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      {/* Verify donor if pending */}
                      {u.roleName === 'DONOR' && u.details?.verification_status === 'PENDING' && (
                        <button
                          onClick={() => handleVerifyDonor(u.details.donor_id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Verify Donor
                        </button>
                      )}

                      {/* Block / Unblock User */}
                      {u.roleName !== 'ADMIN' && (
                        u.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleUpdateStatus(u.userId, 'BLOCKED')}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px]"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.userId, 'ACTIVE')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                          >
                            Unblock
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
