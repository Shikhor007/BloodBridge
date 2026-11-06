import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { Search, Filter, Droplet, Building2, MapPin, Phone, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function BloodAvailabilityPage() {
  const [summary, setSummary] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedGroup !== 'ALL') queryParams.append('bloodGroup', selectedGroup);
        if (cityFilter) queryParams.append('city', cityFilter);

        const res = await api.get(`/public/blood-availability?${queryParams.toString()}`);
        if (res.data.success) {
          setSummary(res.data.summary);
          setHospitals(res.data.hospitals);
        }
      } catch (err) {
        console.error('Failed to load blood availability', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedGroup, cityFilter]);

  const filteredHospitals = hospitals.filter(h => {
    if (!searchQuery) return true;
    return h.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
           h.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-blood-700 uppercase tracking-widest">Real-Time Blood Inventory</span>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 mt-1">
              Live Blood Availability Tracker
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Browse currently available, screened, and verified blood bags across our accredited network of hospital blood banks.
            </p>
          </div>

          {/* Quick Group Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-8">
            {summary.map(s => (
              <button
                key={s.bloodGroup}
                onClick={() => setSelectedGroup(s.bloodGroup === selectedGroup ? 'ALL' : s.bloodGroup)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedGroup === s.bloodGroup
                    ? 'bg-blood-700 text-white border-blood-700 shadow-md transform -translate-y-0.5'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className="block text-xl font-black leading-tight">{s.bloodGroup}</span>
                <span className={`block text-xs font-bold mt-1 ${selectedGroup === s.bloodGroup ? 'text-blood-100' : 'text-slate-500'}`}>
                  {s.availableUnits} bags
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by hospital name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blood-700"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs font-bold uppercase text-slate-500 shrink-0">Filter Group:</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy-950 bg-white"
              >
                <option value="ALL">All Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs font-bold uppercase text-slate-500 shrink-0">City:</span>
              <input
                type="text"
                placeholder="e.g. New York"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-950 bg-white w-32"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blood-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium mt-3">Loading live blood inventories...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Hospitals Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching blood stock was found for your specific search criteria. You can submit a shortage waitlist request to be alerted as soon as donors donate!
            </p>
            <Link
              to="/register?role=patient"
              className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blood-700 text-white font-bold text-xs"
            >
              <span>Register Patient Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHospitals.map((hosp, idx) => (
              <div
                key={hosp.hospitalId || idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="p-2.5 rounded-xl bg-slate-100 text-navy-950">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-navy-950 text-base">{hosp.hospitalName}</h3>
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

                  {/* Breakdown if ALL groups */}
                  {hosp.breakdown && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {Object.entries(hosp.breakdown).map(([grp, count]) => (
                        <span
                          key={grp}
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                            count > 0 ? 'bg-slate-50 text-slate-800 border-slate-200' : 'bg-slate-50 text-slate-300 border-slate-100'
                          }`}
                        >
                          <span className="text-blood-700 font-extrabold mr-1.5">{grp}:</span>
                          <span>{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                  {hosp.availableCount !== undefined && (
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Available {hosp.bloodGroup}:</span>
                      <span className="text-2xl font-black text-slate-900">{hosp.availableCount} bags</span>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/patient/request-blood?hospitalId=${hosp.hospitalId}&group=${encodeURIComponent(selectedGroup !== 'ALL' ? selectedGroup : 'O+')}`)}
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

      <Footer />
    </div>
  );
}
