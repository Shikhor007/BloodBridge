import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Package,
  PlusCircle,
  Filter,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Droplet,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function InventoryPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [selectedUnitForDiscard, setSelectedUnitForDiscard] = useState(null);
  const [discardReason, setDiscardReason] = useState('Hemolysis observed during routine cross-match');

  // Add Unit Form State
  const [newUnitData, setNewUnitData] = useState({
    bloodGroup: 'O+',
    collectionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0],
    donationReference: '',
    storageStatus: 'Main Cold Room - Bay A, Shelf 1'
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const { addToast } = useNotification();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterGroup !== 'ALL') params.append('bloodGroup', filterGroup);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);

      const res = await api.get(`/hospital/inventory?${params.toString()}`);
      if (res.data.success) {
        setUnits(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filterGroup, filterStatus]);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    setSubmittingAdd(true);
    try {
      const res = await api.post('/hospital/inventory', newUnitData);
      if (res.data.success) {
        addToast(`Registered blood unit ${res.data.data.unit_id} (${newUnitData.bloodGroup})`, 'success');
        setIsAddModalOpen(false);
        loadInventory();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register blood unit', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleDiscardUnit = async (e) => {
    e.preventDefault();
    if (!selectedUnitForDiscard) return;
    try {
      const res = await api.put(`/hospital/inventory/${selectedUnitForDiscard.unit_id}/discard`, {
        reason: discardReason
      });
      if (res.data.success) {
        addToast(`Unit ${selectedUnitForDiscard.unit_id} marked as discarded`, 'info');
        setIsDiscardModalOpen(false);
        loadInventory();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to discard unit', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Unit-Level Blood Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, assign, and monitor individual blood bags with certified barcodes and cold-room locations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md shadow-blood-700/25 transition-all flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Blood Unit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase text-slate-500">Blood Group:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-950 bg-white"
            >
              <option value="ALL">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase text-slate-500">Unit Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-950 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE (Usable)</option>
              <option value="ASSIGNED">ASSIGNED (Allocated)</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="DISCARDED">DISCARDED</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{units.length}</strong> unit record(s)
        </span>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-950">No Blood Units Match Filter</h3>
          <p className="text-xs text-slate-500">Try adjusting your blood group or status filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Unit ID</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Collection Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Storage Location</th>
                  <th className="py-3.5 px-4">Donation Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => {
                  const isExpiringSoon = unit.status === 'AVAILABLE' && (new Date(unit.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 7;
                  return (
                    <tr key={unit.unit_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-navy-950">{unit.unit_id}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blood-50 font-black text-blood-700 border border-blood-100">
                          {unit.blood_group}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{unit.collection_date}</td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${isExpiringSoon ? 'text-amber-700 font-black' : 'text-slate-700'}`}>
                          {unit.expiry_date}
                        </span>
                        {isExpiringSoon && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                            &lt; 7 Days
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600">{unit.storage_status}</td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">{unit.donation_reference}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={unit.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        {unit.status === 'AVAILABLE' && (
                          <button
                            onClick={() => {
                              setSelectedUnitForDiscard(unit);
                              setIsDiscardModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-500 text-[11px] font-semibold transition-colors inline-flex items-center space-x-1"
                            title="Discard unit"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Discard</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Blood Unit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Screened Blood Unit into Usable Inventory"
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div className="p-3 bg-blood-50 border border-blood-100 rounded-xl text-xs text-blood-900 font-medium">
            🩸 <strong>Clinical Verification:</strong> Only blood units that have completed mandatory pathogen screening (HIV, Hepatitis B/C, Syphilis) and serum cross-matching may be marked AVAILABLE.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Group *</label>
            <select
              value={newUnitData.bloodGroup}
              onChange={(e) => setNewUnitData({ ...newUnitData, bloodGroup: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-blood-700"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Collection Date *</label>
              <input
                type="date"
                required
                value={newUnitData.collectionDate}
                onChange={(e) => {
                  const col = e.target.value;
                  const exp = new Date(new Date(col).getTime() + 42 * 86400000).toISOString().split('T')[0];
                  setNewUnitData({ ...newUnitData, collectionDate: col, expiryDate: exp });
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Expiry Date (42 Days) *</label>
              <input
                type="date"
                required
                value={newUnitData.expiryDate}
                onChange={(e) => setNewUnitData({ ...newUnitData, expiryDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Donation Reference / Donor ID</label>
            <input
              type="text"
              placeholder="e.g. DON-2026-8801 or CAMP-DRIVE-NYC"
              value={newUnitData.donationReference}
              onChange={(e) => setNewUnitData({ ...newUnitData, donationReference: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Storage Location & Shelf</label>
            <input
              type="text"
              required
              value={newUnitData.storageStatus}
              onChange={(e) => setNewUnitData({ ...newUnitData, storageStatus: e.target.value })}
              placeholder="Main Cold Room - Bay A, Shelf 1"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAdd}
              className="px-5 py-2 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md shadow-blood-700/25"
            >
              {submittingAdd ? 'Registering...' : 'Add Unit to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Discard Blood Unit Modal */}
      <Modal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        title="Mark Blood Unit as Discarded"
      >
        {selectedUnitForDiscard && (
          <form onSubmit={handleDiscardUnit} className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <span className="font-bold block">Safety Protocol Confirmation:</span>
              <span>
                You are about to discard unit <strong>{selectedUnitForDiscard.unit_id}</strong> ({selectedUnitForDiscard.blood_group}). This unit will be permanently marked DISCARDED and removed from patient availability.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Reason for Discard *</label>
              <select
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <option value="Shelf life expired (42 days)">Shelf life expired (42 days)</option>
                <option value="Hemolysis observed during routine cross-match">Hemolysis observed during routine cross-match</option>
                <option value="Cold chain temperature excursion violation">Cold chain temperature excursion violation</option>
                <option value="Sterile bag integrity compromised / micro-leak">Sterile bag integrity compromised / micro-leak</option>
                <option value="Pathogen test positive in confirmatory assay">Pathogen test positive in confirmatory assay</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25"
              >
                Confirm Discard
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
