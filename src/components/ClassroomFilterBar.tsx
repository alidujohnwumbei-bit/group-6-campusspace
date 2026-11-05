import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Search, X, Mic2, LayoutGrid, List, Grid3X3, Building2 } from 'lucide-react';

interface ClassroomFilterBarProps {
  viewMode: 'grid' | 'matrix' | 'table';
  setViewMode: (mode: 'grid' | 'matrix' | 'table') => void;
}

export const ClassroomFilterBar: React.FC<ClassroomFilterBarProps> = ({ viewMode, setViewMode }) => {
  const {
    searchQuery,
    setSearchQuery,
    buildingFilter,
    setBuildingFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    minCapacityFilter,
    setMinCapacityFilter,
    avReadyOnly,
    setAvReadyOnly,
    classrooms,
  } = useClassroom();

  const floors = [
    { id: 'All', label: 'All NLT Levels (NLT 1-21)' },
    { id: 'Level 1', label: 'Level 1 (NLT 1 - NLT 7)' },
    { id: 'Level 2', label: 'Level 2 (NLT 8 - NLT 14)' },
    { id: 'Level 3', label: 'Level 3 (NLT 15 - NLT 21)' },
  ];

  const statuses = [
    { id: 'All', label: 'All', count: classrooms.length },
    { 
      id: 'available', 
      label: 'Available', 
      count: classrooms.filter(r => r.status === 'available').length,
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    { 
      id: 'occupied', 
      label: 'Occupied', 
      count: classrooms.filter(r => r.status === 'occupied').length,
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    { 
      id: 'reserved', 
      label: 'Reserved', 
      count: classrooms.filter(r => r.status === 'reserved').length,
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    { 
      id: 'emergency-standby', 
      label: 'Standby', 
      count: classrooms.filter(r => r.status === 'emergency-standby').length,
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      count: classrooms.filter(r => r.status === 'maintenance').length,
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
  ];

  const clearAllFilters = () => {
    setSearchQuery('');
    setBuildingFilter('All');
    setStatusFilter('All');
    setTypeFilter('All');
    setMinCapacityFilter(0);
    setAvReadyOnly(false);
  };

  const isFiltered = searchQuery || buildingFilter !== 'All' || statusFilter !== 'All' || typeFilter !== 'All' || minCapacityFilter > 0 || avReadyOnly;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-xs">
      
      {/* Top Search & Primary Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NLT room (e.g. NLT7 or 7), course (EIT311, STP330, ACC301), lecturer (Dr Adane, Sir John)..."
            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Floor & Level Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              {floors.map((fl) => (
                <option key={fl.id} value={fl.id}>
                  {fl.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Grid Cards, 100-Room Matrix, Table */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Classroom Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="100-Room Block Matrix View (NLT1 - NLT100 Map)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Secondary Row: Status Check Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        
        {/* Status Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Status Filter:</span>
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{st.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                statusFilter === st.id
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Capacity & AV Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Capacity selection */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">Min Capacity:</span>
            <select
              value={minCapacityFilter}
              onChange={(e) => setMinCapacityFilter(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={0}>Any Size</option>
              <option value={60}>60+ seats</option>
              <option value={100}>100+ seats</option>
              <option value={150}>150+ seats</option>
              <option value={200}>200+ seats</option>
              <option value={250}>250+ seats (Auditoriums)</option>
            </select>
          </div>

          {/* AV Ready Only checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={avReadyOnly}
              onChange={(e) => setAvReadyOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 cursor-pointer"
            >
            </input>
            <span className="flex items-center gap-1">
              <Mic2 className="w-3 h-3 text-sky-500" />
              <span>AV Certified (Ready Mic &amp; Spk)</span>
            </span>
          </label>

          {/* Clear filters if active */}
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
