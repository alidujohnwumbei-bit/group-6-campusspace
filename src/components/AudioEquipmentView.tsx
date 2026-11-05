import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Microphone, Speaker } from '../types';
import { 
  Mic, 
  Volume2, 
  BatteryCharging, 
  BatteryWarning, 
  Battery, 
  Radio, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Sliders, 
  Sparkles,
  Search,
  VolumeX
} from 'lucide-react';

export const AudioEquipmentView: React.FC = () => {
  const { 
    microphones, 
    speakers, 
    classrooms, 
    updateMicrophone, 
    updateSpeaker, 
    rechargeMic, 
    playAudioDiagnostic 
  } = useClassroom();

  const [activeGearTab, setActiveGearTab] = useState<'mics' | 'speakers'>('mics');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Microphones
  const filteredMics = microphones.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchModel = m.brandModel.toLowerCase().includes(q);
      const matchFreq = m.channelFrequency.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchFreq) return false;
    }
    if (statusFilter !== 'All' && m.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Filter Speakers
  const filteredSpeakers = speakers.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchModel = s.brandModel.toLowerCase().includes(q);
      const matchAmp = s.amplifierModel.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchAmp) return false;
    }
    if (statusFilter !== 'All' && s.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleTestMic = (mic: Microphone) => {
    playAudioDiagnostic('ping');
    showToast(`Pinging RF frequency for ${mic.name} (${mic.channelFrequency}). Signal confirmed.`);
  };

  const handleTestSpeaker = (speaker: Speaker) => {
    playAudioDiagnostic('sweep');
    showToast(`Acoustic sweep generated on ${speaker.brandModel} (${speaker.outputDecibels} dB).`);
  };

  const handleRecharge = (micId: string) => {
    rechargeMic(micId);
    showToast('Microphone battery swapped & fully charged to 100%.');
  };

  const handleToggleMicStatus = (mic: Microphone) => {
    const nextStatus = mic.status === 'repair-needed' ? 'operational' : 'repair-needed';
    updateMicrophone(mic.id, { 
      status: nextStatus,
      notes: nextStatus === 'repair-needed' ? 'Marked under inspection by AV staff' : 'Checked and certified operational',
    });
    showToast(`Microphone marked as ${nextStatus}.`);
  };

  const handleToggleSpeakerStatus = (spk: Speaker) => {
    const nextStatus = spk.status === 'operational' ? 'buzzing-issue' : 'operational';
    updateSpeaker(spk.id, {
      status: nextStatus,
      notes: nextStatus === 'buzzing-issue' ? 'Ground-loop hum / buzzing reported' : 'Acoustics calibrated and verified',
    });
    showToast(`Speaker output status updated to ${nextStatus}.`);
  };

  const handleCalibrateDb = (spk: Speaker, delta: number) => {
    const newDb = Math.min(105, Math.max(50, spk.outputDecibels + delta));
    updateSpeaker(spk.id, { outputDecibels: newDb });
    playAudioDiagnostic('ping');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Audio &amp; AV Equipment Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time tracking of wireless microphones, battery levels, RF channels, ceiling line arrays, and speakers.
          </p>
        </div>

        {/* Global Acoustic Diagnostic Generator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playAudioDiagnostic('chime');
              showToast('Calibrated acoustic reference chime played.');
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            title="Play acoustic verification chime through Web Audio"
          >
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            <span>Audio Ping Test</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-indigo-500 font-bold">×</button>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Gear Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          <button
            onClick={() => {
              setActiveGearTab('mics');
              setStatusFilter('All');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeGearTab === 'mics'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-sky-500" />
            <span>Microphones ({microphones.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveGearTab('speakers');
              setStatusFilter('All');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeGearTab === 'speakers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Speakers &amp; Soundbars ({speakers.length})</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by model, channel, frequency..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Conditions</option>
            <option value="operational">Operational</option>
            <option value="in-use">In-Use</option>
            {activeGearTab === 'mics' ? (
              <>
                <option value="low-battery">Low Battery (&lt;20%)</option>
                <option value="repair-needed">Needs Repair</option>
              </>
            ) : (
              <>
                <option value="buzzing-issue">Reported Buzzing/Hum</option>
                <option value="offline">Offline</option>
              </>
            )}
          </select>
        </div>

      </div>

      {/* Tab Content: Microphones */}
      {activeGearTab === 'mics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMics.map((mic) => {
            const assignedClassroom = classrooms.find((c) => c.id === mic.classroomId);
            const isLowBattery = mic.batteryPercentage < 20;

            return (
              <div
                key={mic.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top: Model & Condition */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-sky-500 shrink-0" />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {mic.name}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {mic.brandModel}
                      </div>
                    </div>

                    <span className="text-xs font-semibold capitalize">
                      {mic.status === 'operational' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Ready</span>
                      ) : mic.status === 'in-use' ? (
                        <span className="text-amber-600 dark:text-amber-400">Live In Session</span>
                      ) : mic.status === 'low-battery' ? (
                        <span className="text-rose-600 dark:text-rose-400">Low Battery</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">Needs Repair</span>
                      )}
                    </span>
                  </div>

                  {/* Assigned Classroom */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 flex items-center justify-between">
                    <span>
                      Room:{' '}
                      <strong className="font-mono text-slate-800 dark:text-slate-200">
                        {assignedClassroom ? assignedClassroom.code : 'AV Storage'}
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {mic.type.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Battery Level Indicator */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {isLowBattery ? (
                          <BatteryWarning className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Battery className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        Battery Level:
                      </span>
                      <span className={`font-mono tabular-nums font-bold text-xs ${
                        isLowBattery ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {mic.batteryPercentage}%
                      </span>
                    </div>

                    {/* Battery Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowBattery ? 'bg-rose-500' : mic.batteryPercentage < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${mic.batteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* RF Frequency Channel */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Radio className="w-3 h-3" /> Channel:
                      </span>
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {mic.channelFrequency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Last Tested:</span>
                      <span>{mic.lastTestedAt}</span>
                    </div>
                    {mic.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                        "{mic.notes}"
                      </div>
                    )}
                  </div>

                </div>

                {/* Microphones Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleTestMic(mic)}
                    className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Emit RF audio ping test"
                  >
                    <Play className="w-3 h-3 text-sky-500" />
                    <span>Ping Test</span>
                  </button>

                  <button
                    onClick={() => handleRecharge(mic.id)}
                    className="flex-1 py-1.5 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Swap battery with 100% freshly charged pack"
                  >
                    <BatteryCharging className="w-3 h-3" />
                    <span>Recharge</span>
                  </button>

                  <button
                    onClick={() => handleToggleMicStatus(mic)}
                    className="py-1.5 px-2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={mic.status === 'repair-needed' ? 'Mark Operational' : 'Flag for Repair'}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Speakers */}
      {activeGearTab === 'speakers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpeakers.map((spk) => {
            const assignedClassroom = classrooms.find((c) => c.id === spk.classroomId);
            const hasIssue = spk.status === 'buzzing-issue' || spk.status === 'offline';

            return (
              <div
                key={spk.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top: Speaker Brand & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-purple-500 shrink-0" />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {spk.name}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {spk.brandModel}
                      </div>
                    </div>

                    <span className="text-xs font-semibold">
                      {spk.status === 'operational' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Nominal</span>
                      ) : spk.status === 'in-use' ? (
                        <span className="text-amber-600 dark:text-amber-400">Active</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">Buzzing / Issue</span>
                      )}
                    </span>
                  </div>

                  {/* Assigned Room */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 flex items-center justify-between">
                    <span>
                      Room:{' '}
                      <strong className="font-mono text-slate-800 dark:text-slate-200">
                        {assignedClassroom ? assignedClassroom.code : 'Auditorium'}
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {spk.type.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Output SPL Decibel Calibration */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        Target SPL Volume:
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                        {spk.outputDecibels} dB SPL
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCalibrateDb(spk, -2)}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-mono font-bold"
                      >
                        -2 dB
                      </button>
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, (spk.outputDecibels / 100) * 100)}%` }}
                        />
                      </div>
                      <button
                        onClick={() => handleCalibrateDb(spk, 2)}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-mono font-bold"
                      >
                        +2 dB
                      </button>
                    </div>
                  </div>

                  {/* Amplifier & Notes */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Amplifier / DSP:</span>
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                        {spk.amplifierModel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Last Calibrated:</span>
                      <span>{spk.lastTestedAt}</span>
                    </div>
                    {spk.notes && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 italic mt-1 line-clamp-1">
                        "{spk.notes}"
                      </div>
                    )}
                  </div>

                </div>

                {/* Speaker Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleTestSpeaker(spk)}
                    className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Play 200Hz - 2.4kHz acoustic sine sweep test"
                  >
                    <Play className="w-3 h-3 text-purple-500" />
                    <span>Acoustic Sweep</span>
                  </button>

                  <button
                    onClick={() => handleToggleSpeakerStatus(spk)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      hasIssue
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40'
                        : 'text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40'
                    }`}
                    title={hasIssue ? 'Mark issue resolved' : 'Flag acoustic buzz'}
                  >
                    {hasIssue ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Clear Issue</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Report Buzz</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
