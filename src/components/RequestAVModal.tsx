import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { X, Mic, Volume2, Radio, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { AVEquipmentRequest } from '../types';

interface RequestAVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  defaultRoomCode?: string;
}

export const RequestAVModal: React.FC<RequestAVModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultRoomCode 
}) => {
  const { classrooms, createAVRequest } = useClassroom();
  const { user, role } = useAuth();

  const [selectedRoom, setSelectedRoom] = useState(defaultRoomCode || 'NLT2');
  const [equipmentType, setEquipmentType] = useState<AVEquipmentRequest['equipmentType']>('wireless-handheld-mic');
  const [date, setDate] = useState('2026-11-05');
  const [timeSlot, setTimeSlot] = useState('14:00 - 16:00');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'immediate'>(role === 'lecturer' ? 'urgent' : 'normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getEquipmentName = (type: AVEquipmentRequest['equipmentType']) => {
    switch (type) {
      case 'wireless-handheld-mic':
        return 'Shure ULXD4 Wireless Handheld Mic Kit';
      case 'wireless-lapel-mic':
        return 'Sennheiser Wireless Lapel Mic Beta';
      case 'auditorium-pa-sound':
        return 'Bose Panaray Acoustic Line Array PA Calibration';
      case 'laser-pointer-clicker':
        return 'Logitech Spotlight Wireless Presentation Clicker';
      case 'hdmi-dual-adapter':
        return 'Dual HDMI / USB-C 4K Video Adapter Kit';
      case 'full-av-kit':
        return 'Full NLT Multimedia & Audio Staging Kit';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetRoom = classrooms.find(r => r.code === selectedRoom);

    setTimeout(() => {
      createAVRequest({
        userId: user?.id || 'usr-1',
        userName: user?.name || (role === 'lecturer' ? 'Dr. Adane' : 'Kwame Mensah'),
        userRole: role || 'student',
        department: user?.department || 'MATHS AND ICT',
        classroomId: targetRoom?.id || `nlt-${selectedRoom.replace('NLT', '')}`,
        classroomCode: selectedRoom,
        equipmentType,
        equipmentName: getEquipmentName(equipmentType),
        date,
        timeSlot,
        purpose: purpose || `${role === 'lecturer' ? 'Faculty Lecture & Sound Reinforcement' : 'Student Academic Presentation'} in ${selectedRoom}`,
        urgency,
      });

      setIsSubmitting(false);
      onClose();
      if (onSuccess) {
        onSuccess(`AV Requisition for ${getEquipmentName(equipmentType)} in ${selectedRoom} submitted to Facility Support.`);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Audio-Visual Equipment Requisition</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {role || 'USER'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Request wireless microphones, acoustic PA arrays, or presentation hardware for NLT halls
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* User Profile Banner */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                {user?.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {user?.department} · {user?.studentId || user?.lecturerTitle || 'Authorized UCC User'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium uppercase font-mono">
              {role}
            </span>
          </div>

          {/* Equipment Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select AV Equipment / Hardware:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'wireless-handheld-mic', label: 'Wireless Handheld Mic', desc: 'Shure ULXD4 Digital' },
                { id: 'wireless-lapel-mic', label: 'Wireless Lapel / Bodypack', desc: 'Sennheiser EW-DX' },
                { id: 'auditorium-pa-sound', label: 'Auditorium PA Sound Array', desc: 'Bose Panaray Line Array' },
                { id: 'laser-pointer-clicker', label: 'Presentation Clicker', desc: 'USB / Bluetooth Range' },
                { id: 'hdmi-dual-adapter', label: 'Dual HDMI & USB-C Cable', desc: 'Dual 4K Laser Mirroring' },
                { id: 'full-av-kit', label: 'Full Multimedia Staging Kit', desc: 'Mic + Sound + Video' },
              ].map((item) => {
                const isSelected = equipmentType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEquipmentType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Classroom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Classroom (NLT1 to NLT21):
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            >
              {classrooms.map((room) => (
                <option key={room.id} value={room.code}>
                  {room.code} - {room.name} ({room.building})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time & Urgency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time Slot:
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                <option value="08:00 - 10:00">08:00 - 10:00 AM</option>
                <option value="10:00 - 12:00">10:00 - 12:00 PM</option>
                <option value="12:00 - 14:00">12:00 - 02:00 PM</option>
                <option value="14:00 - 16:00">02:00 - 04:00 PM</option>
                <option value="16:00 - 18:00">04:00 - 06:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="immediate">Immediate Dispatch</option>
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Course Title:
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. EIT311 Cloud Computing Lecture or Project Defense"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Dispatch AV Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
