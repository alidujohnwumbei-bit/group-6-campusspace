import React, { useState } from 'react';
import { Classroom } from '../types';
import { useClassroom } from '../context/ClassroomContext';
import { ClassroomCard } from './ClassroomCard';
import { ClassroomFilterBar } from './ClassroomFilterBar';
import { 
  AlertCircle, 
  Calendar, 
  Mic, 
  Volume2, 
  Info, 
  ArrowUpDown, 
  CalendarX, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Users
} from 'lucide-react';

interface ClassroomGridProps {
  onSelectRoom: (room: Classroom) => void;
  onBookRoom: (room: Classroom) => void;
  onEmergencySwap: (room: Classroom) => void;
  onCancelClass: (room: Classroom) => void;
}

export const ClassroomGrid: React.FC<ClassroomGridProps> = ({
  onSelectRoom,
  onBookRoom,
  onEmergencySwap,
  onCancelClass,
}) => {
  const {
    classrooms,
    searchQuery,
    buildingFilter,
    statusFilter,
    typeFilter,
    minCapacityFilter,
    avReadyOnly,
    microphones,
    speakers,
  } = useClassroom();

  const [viewMode, setViewMode] = useState<'grid' | 'matrix' | 'table'>('grid');

  // Filter classrooms
  const filteredClassrooms = classrooms.filter((room) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const numOnly = q.replace(/^nlt/i, '');
      const matchCode = room.code.toLowerCase().includes(q) || (numOnly && room.code.toLowerCase() === `nlt${numOnly}`);
      const matchName = room.name.toLowerCase().includes(q);
      const matchBuilding = room.building.toLowerCase().includes(q);
      const matchSessionCourse = room.currentSession?.courseCode.toLowerCase().includes(q);
      const matchSessionName = room.currentSession?.courseName.toLowerCase().includes(q);
      const matchSessionProf = room.currentSession?.instructor.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchBuilding && !matchSessionCourse && !matchSessionName && !matchSessionProf) {
        return false;
      }
    }

    // Level / Floor filter
    if (buildingFilter !== 'All') {
      if (buildingFilter === 'Level 1' && room.floor !== 1) return false;
      if (buildingFilter === 'Level 2' && room.floor !== 2) return false;
      if (buildingFilter === 'Level 3' && room.floor !== 3) return false;
      if (buildingFilter === 'Level 4' && room.floor !== 4) return false;
    }

    // Status filter
    if (statusFilter !== 'All' && room.status !== statusFilter) {
      return false;
    }

    // Room Type filter
    if (typeFilter !== 'All' && room.type !== typeFilter) {
      return false;
    }

    // Capacity filter
    if (minCapacityFilter > 0 && room.capacity < minCapacityFilter) {
      return false;
    }

    // AV Ready Only filter
    if (avReadyOnly) {
      const roomMics = microphones.filter((m) => m.classroomId === room.id);
      const roomSpeakers = speakers.filter((s) => s.classroomId === room.id);
      const micOk = roomMics.some((m) => (m.status === 'operational' || m.status === 'in-use' || m.status === 'charging') && m.batteryPercentage >= 20);
      const spkOk = roomSpeakers.some((s) => s.status === 'operational' || s.status === 'in-use');
      if (!micOk || !spkOk) return false;
    }

    return true;
  });

  // Group rooms for the 21-cell Matrix
  const levels = [
    { level: 1, label: 'Level 1 · Ground Floor (NLT 1 - NLT 7)', rooms: filteredClassrooms.filter(r => r.floor === 1) },
    { level: 2, label: 'Level 2 · Middle Tier (NLT 8 - NLT 14)', rooms: filteredClassrooms.filter(r => r.floor === 2) },
    { level: 3, label: 'Level 3 · Upper Wing (NLT 15 - NLT 21)', rooms: filteredClassrooms.filter(r => r.floor === 3) },
  ].filter(g => g.rooms.length > 0);

  const getTileStatusColors = (status: Classroom['status']) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/50';
      case 'occupied':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/70 hover:bg-amber-100 dark:hover:bg-amber-900/50';
      case 'reserved':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/70 hover:bg-purple-100 dark:hover:bg-purple-900/50';
      case 'emergency-standby':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/50';
      case 'maintenance':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/50';
    }
  };

  return (
    <div>
      {/* Filter and Search Bar */}
      <ClassroomFilterBar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Results Count & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Showing <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{filteredClassrooms.length}</span> of {classrooms.length} classrooms in NLT Block
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">NLT1 to NLT21</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Available</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Occupied</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Reserved</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Standby</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Maintenance</span>
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No classrooms found matching criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or capacity threshold to see more of the NLT block.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* 1. Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassrooms.map((room) => (
            <ClassroomCard
              key={room.id}
              classroom={room}
              onSelectRoom={onSelectRoom}
              onBookRoom={onBookRoom}
              onEmergencySwap={onEmergencySwap}
              onCancelClass={onCancelClass}
            />
          ))}
        </div>
      ) : viewMode === 'matrix' ? (
        /* 2. 100-Room Interactive Block Matrix View */
        <div className="space-y-6">
          {levels.map((grp) => (
            <div key={grp.level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  {grp.label}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {grp.rooms.length} rooms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7 gap-2.5">
                {grp.rooms.map((room) => {
                  const tileClass = getTileStatusColors(room.status);
                  return (
                    <div
                      key={room.id}
                      className={`border rounded-lg p-2.5 text-xs transition-all flex flex-col justify-between cursor-pointer select-none ${tileClass}`}
                      onClick={() => onSelectRoom(room)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-sm">
                          {room.code}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums opacity-80">
                          {room.capacity} seats
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold truncate capitalize mb-2">
                        {room.status === 'occupied' && room.currentSession ? (
                          <span className="truncate block font-mono">
                            {room.currentSession.courseCode} · Live
                          </span>
                        ) : room.status === 'reserved' && room.currentSession ? (
                          <span className="truncate block font-mono">
                            {room.currentSession.courseCode} · Res
                          </span>
                        ) : (
                          <span>{room.status.replace('-', ' ')}</span>
                        )}
                      </div>

                      {/* Quick action buttons on matrix tile */}
                      <div className="flex items-center gap-1 pt-1 border-t border-black/10 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                        {room.status === 'available' ? (
                          <button
                            onClick={() => onBookRoom(room)}
                            className="flex-1 py-1 px-1.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors text-center shadow-xs"
                          >
                            Book
                          </button>
                        ) : room.status === 'occupied' || room.status === 'reserved' ? (
                          <button
                            onClick={() => onCancelClass(room)}
                            className="flex-1 py-1 px-1.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors text-center shadow-xs"
                          >
                            Cancel
                          </button>
                        ) : room.status === 'emergency-standby' ? (
                          <button
                            onClick={() => onEmergencySwap(room)}
                            className="flex-1 py-1 px-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-center shadow-xs"
                          >
                            Dispatch
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectRoom(room)}
                            className="flex-1 py-1 px-1.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded text-center"
                          >
                            Info
                          </button>
                        )}

                        <button
                          onClick={() => onSelectRoom(room)}
                          className="p-1 text-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 rounded"
                          title="Details"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 3. Dense Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="py-3 px-4">Room Code</th>
                  <th className="py-3 px-4">Floor / Level</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Session / Reservation</th>
                  <th className="py-3 px-4">Audio Ready</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClassrooms.map((room) => {
                  const roomMics = microphones.filter((m) => m.classroomId === room.id);
                  const roomSpeakers = speakers.filter((s) => s.classroomId === room.id);
                  const avOk = roomMics.some(m => m.status === 'operational' || m.status === 'in-use');

                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {room.code}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        Level {room.floor}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {room.capacity} seats
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                        {room.type.replace('-', ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          room.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : room.status === 'occupied'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : room.status === 'reserved'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                            : room.status === 'emergency-standby'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            room.status === 'available' ? 'bg-emerald-500' :
                            room.status === 'occupied' ? 'bg-amber-500' :
                            room.status === 'reserved' ? 'bg-purple-500' :
                            room.status === 'emergency-standby' ? 'bg-indigo-500' : 'bg-rose-500'
                          }`} />
                          {room.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {room.currentSession ? (
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block font-mono text-[11px]">
                              {room.currentSession.courseCode}: {room.currentSession.courseName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {room.currentSession.instructor} ({room.currentSession.startTime} - {room.currentSession.endTime})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {avOk ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        ) : (
                          <span className="text-slate-400">Basic</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {room.status === 'available' ? (
                            <button
                              onClick={() => onBookRoom(room)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                            >
                              Book
                            </button>
                          ) : room.status === 'occupied' || room.status === 'reserved' ? (
                            <button
                              onClick={() => onCancelClass(room)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          ) : null}

                          <button
                            onClick={() => onEmergencySwap(room)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Emergency"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSelectRoom(room)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Inspect details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
