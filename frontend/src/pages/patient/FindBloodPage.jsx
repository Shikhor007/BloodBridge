import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Search, MapPin, Phone, Building2, Droplet, ArrowRight, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function FindBloodPage() {
  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get('group') || 'ALL';

  const [bloodGroup, setBloodGroup] = useState(initialGroup);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function searchStock() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (bloodGroup !== 'ALL') params.append('bloodGroup', bloodGroup);
        if (city) params.append('city', city);
        if (district) params.append('district', district);

        const res = await api.get(`/public/blood-availability?${params.toString()}`);
        if (res.data.success) {
          setHospitals(res.data.hospitals);
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Failed to search blood availability', err);
      } finally {
        setLoading(false);
      }
    }
    searchStock();
  }, [bloodGroup, city, district]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-navy-950">Search Blood Availability</h1>
        <p className="text-xs text-slate-500 mt-1">
          Locate available, verified blood bags in accredited hospital blood banks across your region.
        </p>
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Required Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blood-700 bg-white focus:outline-none focus:ring-2 focus:ring-blood-700"
            >
              <option value="ALL">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              City
            </label>
            <input
              type="text"
              placeholder="e.g. New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              District / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Manhattan, Brooklyn"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium mt-3">Searching live hospital inventories...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Droplet className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="text-lg font-bold text-navy-950">No Current Available Units for Selected Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no matching units in storage. You can register for our Shortage Waitlist, and our automated notification system will alert you as soon as a donor donates or units enter inventory.
          </p>
          <button
            onClick={() => navigate(`/patient/future-requests?group=${encodeURIComponent(bloodGroup !== 'ALL' ? bloodGroup : 'O+')}`)}
            className="px-6 py-3 rounded-xl bg-blood-700 text-white font-bold text-xs hover:bg-blood-800 transition-colors shadow-md shadow-blood-700/20"
          >
            Register on Shortage Waitlist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {hospitals.map((hosp, idx) => (
            <div
              key={hosp.hospitalId || idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-navy-950 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-blood-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-navy-950">{hosp.hospitalName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-blood-700 mr-1" />
                        {hosp.address}, {hosp.city} ({hosp.district})
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {hosp.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {hosp.breakdown && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {Object.entries(hosp.breakdown).map(([grp, count]) => (
                      <span
                        key={grp}
                        className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          count > 0 ? 'bg-slate-50 text-slate-800 border-slate-200' : 'bg-slate-50 text-slate-300 border-slate-100'
                        }`}
                      >
                        <span className="text-blood-700 font-black mr-1">{grp}:</span>
                        <span>{count} bag(s)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 border-t md:border-t-0 pt-4 md:pt-0 justify-between md:justify-end">
                {hosp.availableCount !== undefined && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Available {hosp.bloodGroup}:</span>
                    <span className="text-2xl font-black text-slate-900">{hosp.availableCount}</span>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/patient/request-blood?hospitalId=${hosp.hospitalId}&group=${encodeURIComponent(bloodGroup !== 'ALL' ? bloodGroup : 'O+')}`)}
                  className="px-6 py-3 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-xs shadow-md shadow-blood-700/20 transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <span>Request Blood</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
