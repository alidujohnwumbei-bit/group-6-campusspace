import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { CheckCircle2, Users, Calendar, Shield, Mic2, Building2 } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { classrooms, microphones, speakers, setActiveTab, setStatusFilter } = useClassroom();

  const totalRooms = classrooms.length;
  const availableRooms = classrooms.filter(r => r.status === 'available').length;
  const occupiedRooms = classrooms.filter(r => r.status === 'occupied').length;
  const reservedRooms = classrooms.filter(r => r.status === 'reserved').length;
  const emergencyRooms = classrooms.filter(r => r.status === 'emergency-standby').length;

  const operationalMics = microphones.filter(m => m.status === 'operational' || m.status === 'in-use').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
      
      {/* 1. Available */}
      <button
        onClick={() => {
          setStatusFilter('available');
          setActiveTab('overview');
        }}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group cursor-pointer"
        title="Check all currently available NLT classrooms"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">Available</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
          {availableRooms}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {totalRooms}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Ready for booking
        </div>
      </button>

      {/* 2. Occupied */}
      <button
        onClick={() => {
          setStatusFilter('occupied');
          setActiveTab('overview');
        }}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-400 dark:hover:border-amber-600 transition-colors group cursor-pointer"
        title="Check currently occupied NLT classrooms"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">Occupied</span>
          <Users className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
          {occupiedRooms}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {totalRooms}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Live lectures in session
        </div>
      </button>

      {/* 3. Reserved */}
      <button
        onClick={() => {
          setStatusFilter('reserved');
          setActiveTab('overview');
        }}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-purple-400 dark:hover:border-purple-600 transition-colors group cursor-pointer"
        title="Check reserved NLT classrooms"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">Reserved</span>
          <Calendar className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
          {reservedRooms}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {totalRooms}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Scheduled upcoming
        </div>
      </button>

      {/* 4. Emergency Standby */}
      <button
        onClick={() => {
          setStatusFilter('emergency-standby');
          setActiveTab('overview');
        }}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group cursor-pointer"
        title="Check emergency standby rooms"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">Emergency Standby</span>
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
          {emergencyRooms}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Instant swap reserve
        </div>
      </button>

      {/* 5. AV Audio Certified */}
      <button
        onClick={() => setActiveTab('audio-gear')}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-sky-400 dark:hover:border-sky-600 transition-colors group cursor-pointer"
        title="Inspect microphones & sound arrays"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">AV &amp; Microphones</span>
          <Mic2 className="w-3.5 h-3.5 text-sky-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
          {operationalMics}
          <span className="text-xs font-normal text-slate-400 ml-1">ready</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Tested sound systems
        </div>
      </button>

      {/* 6. Total NLT Block */}
      <button
        onClick={() => {
          setStatusFilter('All');
          setActiveTab('overview');
        }}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-slate-400 dark:hover:border-slate-600 transition-colors group cursor-pointer"
        title="View all 21 NLT Block classrooms"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-medium">NLT Block</span>
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          {totalRooms}
          <span className="text-xs font-normal text-slate-400 ml-1">halls</span>
        </div>
        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
          NLT1 to NLT21
        </div>
      </button>

    </div>
  );
};
