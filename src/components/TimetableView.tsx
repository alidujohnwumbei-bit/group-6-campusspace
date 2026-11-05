import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Classroom, Booking } from '../types';
import { Clock, Calendar, Users, Building2, Plus, Sparkles } from 'lucide-react';

interface TimetableViewProps {
  onBookSlot: (room: Classroom, timeSlot: string) => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({ onBookSlot }) => {
  const { classrooms, bookings, simulatedTime } = useClassroom();
  const [selectedBuilding, setSelectedBuilding] = useState('All');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const buildings = ['All Levels (NLT 1-21)', 'Level 1 (NLT 1-7)', 'Level 2 (NLT 8-14)', 'Level 3 (NLT 15-21)'];

  const filteredRooms = selectedBuilding === 'All Levels (NLT 1-21)'
    ? classrooms 
    : selectedBuilding.includes('Level 1')
    ? classrooms.filter(r => r.floor === 1)
    : selectedBuilding.includes('Level 2')
    ? classrooms.filter(r => r.floor === 2)
    : classrooms.filter(r => r.floor === 3);

  // Check if a room has a booking covering a specific hour slot
  const getSlotBooking = (roomId: string, hourStr: string) => {
    const slotHour = parseInt(hourStr.split(':')[0], 10);
    
    // Check active bookings
    const foundBooking = bookings.find(b => {
      if (b.classroomId !== roomId || b.status !== 'active') return false;
      const startH = parseInt(b.startTime.split(':')[0], 10);
      const endH = parseInt(b.endTime.split(':')[0], 10);
      const endM = parseInt(b.endTime.split(':')[1], 10);
      const adjustedEnd = endM > 0 ? endH + 1 : endH;
      return slotHour >= startH && slotHour < adjustedEnd;
    });

    if (foundBooking) return { type: 'booking', data: foundBooking };

    // Check ongoing currentSession from classroom
    const room = classrooms.find(r => r.id === roomId);
    if (room?.currentSession) {
      const startH = parseInt(room.currentSession.startTime.split(':')[0], 10);
      const endH = parseInt(room.currentSession.endTime.split(':')[0], 10);
      const endM = parseInt(room.currentSession.endTime.split(':')[1], 10);
      const adjustedEnd = endM > 0 ? endH + 1 : endH;
      if (slotHour >= startH && slotHour < adjustedEnd) {
        return { type: 'session', data: room.currentSession };
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header and Building Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus Timetable &amp; Schedule Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hourly visual occupancy grid. Click any empty slot to book that room instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Wing:</span>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {buildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend & Current Simulated Time Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800" />
            <span>Available (Click to book)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800" />
            <span>Class in session / Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800" />
            <span>Emergency Standby</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Current Time: <strong>{simulatedTime}</strong></span>
        </div>
      </div>

      {/* Timetable Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/80 min-w-[140px] border-r border-slate-200 dark:border-slate-800">
                  Classroom
                </th>
                {timeSlots.map(slot => (
                  <th key={slot} className="py-2.5 px-2 text-center font-mono tabular-nums border-r border-slate-200 dark:border-slate-800 last:border-r-0 min-w-[68px]">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.map((room) => {
                const isMaintenance = room.status === 'maintenance';
                const isEmergencyStandby = room.status === 'emergency-standby';

                return (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    
                    {/* Classroom Code Column (Sticky Left) */}
                    <td className="py-2 px-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {room.code}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {room.capacity} seats · Fl {room.floor}
                      </div>
                    </td>

                    {/* Hourly Slots */}
                    {timeSlots.map(slot => {
                      if (isMaintenance) {
                        return (
                          <td key={slot} className="p-1 border-r border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 text-center text-[10px] text-rose-500">
                            Maint
                          </td>
                        );
                      }

                      if (isEmergencyStandby) {
                        return (
                          <td key={slot} className="p-1 border-r border-slate-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-center text-[10px] text-indigo-500">
                            Standby
                          </td>
                        );
                      }

                      const occupant = getSlotBooking(room.id, slot);

                      if (occupant) {
                        const title = occupant.type === 'booking' 
                          ? (occupant.data as Booking).courseCode || (occupant.data as Booking).title
                          : (occupant.data as Classroom['currentSession'])?.courseCode;

                        const prof = occupant.type === 'booking'
                          ? (occupant.data as Booking).instructorName.split(' ').pop()
                          : (occupant.data as Classroom['currentSession'])?.instructor.split(' ').pop();

                        return (
                          <td key={slot} className="p-1 border-r border-slate-100 dark:border-slate-800">
                            <div 
                              className="w-full h-full p-1 rounded bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-[10px] leading-tight text-amber-900 dark:text-amber-200 overflow-hidden"
                              title={`${title} (${prof})`}
                            >
                              <div className="font-mono font-bold truncate">{title}</div>
                              <div className="truncate text-[9px] text-amber-700 dark:text-amber-400">{prof}</div>
                            </div>
                          </td>
                        );
                      }

                      // Empty Slot - Click to book
                      return (
                        <td key={slot} className="p-1 border-r border-slate-100 dark:border-slate-800 text-center">
                          <button
                            onClick={() => onBookSlot(room, slot)}
                            className="w-full h-8 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors group"
                            title={`Book ${room.code} starting at ${slot}`}
                          >
                            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
