import React, { useState, useEffect } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { CampusWeather } from '../types';
import { 
  Clock, 
  Sun, 
  CloudRain, 
  Wind, 
  CloudSun, 
  Umbrella, 
  Glasses, 
  AlertTriangle, 
  Sparkles, 
  RotateCw, 
  Thermometer, 
  Droplets,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check
} from 'lucide-react';

export const LiveWeatherTimeBar: React.FC = () => {
  const { weather, setWeatherCondition } = useClassroom();

  // 1. Live ticking clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format live time string with seconds
  const formatLiveTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: !is24Hour,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format live date string
  const formatLiveDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Live Auto-Refresh simulation / Open-Meteo polling
  const handleRefreshWeather = async () => {
    setIsRefreshing(true);
    try {
      // Attempt live Open-Meteo fetch (lat/lon for Kumasi/Accra academic belt, fallback gracefully)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=5.6037&longitude=-0.1870&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const temp = Math.round(data.current?.temperature_2m ?? 31);
        const wind = Math.round(data.current?.wind_speed_10m ?? 14);
        const code = data.current?.weather_code ?? 0;

        // Interpret code
        if (code >= 51 && code <= 99) {
          setWeatherCondition('raining');
        } else if (wind >= 25) {
          setWeatherCondition('windy');
        } else if (temp >= 28) {
          setWeatherCondition('warm');
        } else {
          setWeatherCondition('mild');
        }
      }
    } catch {
      // Network timeout / offline fallback - keep current or cycle
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Determine weather visual icon
  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'warm':
        return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow shrink-0" />;
      case 'raining':
        return <CloudRain className="w-5 h-5 text-sky-500 animate-bounce shrink-0" />;
      case 'windy':
        return <Wind className="w-5 h-5 text-teal-500 animate-pulse shrink-0" />;
      case 'mild':
        return <CloudSun className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  // Advisory badge configuration
  const isWarmOrRaining = weather.condition === 'warm' || weather.condition === 'raining' || weather.temperatureC >= 29;
  const isWindy = weather.condition === 'windy' || weather.windSpeedKmh >= 25;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        
        {/* Main Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* SECTION 1: LIVE CLOCK (Always Visible) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-emerald-400">
                LIVE TIME
              </span>
              <span className="text-white/30">|</span>
              <span className="font-mono text-xs sm:text-sm font-extrabold tracking-tight text-white tabular-nums">
                {formatLiveTime()}
              </span>
            </div>

            <span className="text-[11px] text-indigo-200 hidden md:inline font-medium">
              {formatLiveDate()}
            </span>

            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className="text-[10px] text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/10 font-mono transition-colors hidden sm:inline"
              title="Toggle 12h/24h format"
            >
              {is24Hour ? '24H' : '12H'}
            </button>
          </div>

          {/* SECTION 2: LIVE WEATHER BRIEF */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 transition-colors">
              {getWeatherIcon()}
              
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white tabular-nums">
                <span>{weather.temperatureC}°C</span>
                <span className="text-white/40 text-[10px]">({Math.round(weather.temperatureC * 9/5 + 32)}°F)</span>
              </div>

              <span className="text-white/30 hidden sm:inline">·</span>

              <span className="text-[11px] text-indigo-100 hidden sm:inline font-medium truncate max-w-[140px] lg:max-w-none">
                {weather.description}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-indigo-200">
              <span className="flex items-center gap-1 font-mono">
                <Droplets className="w-3 h-3 text-sky-400" />
                <span>{weather.humidity}% hum</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Wind className="w-3 h-3 text-teal-400" />
                <span>{weather.windSpeedKmh} km/h wind</span>
              </span>
            </div>

            {/* Refresh Live Sensor Button */}
            <button
              onClick={handleRefreshWeather}
              disabled={isRefreshing}
              className="p-1 rounded-md text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh live weather reading"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* SECTION 3: WEATHER CONDITION SWITCHER (Easy test of warm, raining, windy) */}
          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/10">
            <span className="text-[10px] text-indigo-300 px-1.5 hidden xl:inline">Simulate:</span>
            <button
              onClick={() => setWeatherCondition('warm')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                weather.condition === 'warm'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
              title="Set weather to Warm (triggers Umbrella recommendation)"
            >
              ☀️ Warm
            </button>
            <button
              onClick={() => setWeatherCondition('raining')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                weather.condition === 'raining'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
              title="Set weather to Raining (triggers Umbrella recommendation)"
            >
              🌧️ Rain
            </button>
            <button
              onClick={() => setWeatherCondition('windy')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                weather.condition === 'windy'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
              title="Set weather to Windy (triggers Nose Mask & Specks recommendation)"
            >
              💨 Windy
            </button>
            <button
              onClick={() => setWeatherCondition('mild')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all hidden sm:inline ${
                weather.condition === 'mild'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
              title="Set weather to Mild"
            >
              ⛅ Mild
            </button>
          </div>

        </div>

        {/* SECTION 4: SMART CAMPUS ADVISORY BANNER (UMBRELLA OR NOSE MASK WITH SPECKS) */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200">
            
            {/* Recommendation 1: Warm or Raining -> Suggest Umbrella */}
            {isWarmOrRaining ? (
              <div className="flex items-center gap-2.5 bg-amber-500/15 border border-amber-400/40 text-amber-200 px-3 py-1.5 rounded-lg flex-1">
                <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Umbrella className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-amber-300 mr-1.5">
                    ☂️ Umbrella Suggested:
                  </span>
                  <span className="text-amber-100">
                    Weather is {weather.condition === 'raining' ? 'raining heavily' : 'very warm and sunny'} ({weather.temperatureC}°C)! Suggest the use of an <strong>umbrella</strong> for shade and rain protection across NLT pathways.
                  </span>
                </div>
              </div>
            ) : isWindy ? (
              /* Recommendation 2: Windy -> Suggest Nose Mask with Specks */
              <div className="flex items-center gap-2.5 bg-teal-500/15 border border-teal-400/40 text-teal-200 px-3 py-1.5 rounded-lg flex-1">
                <div className="w-6 h-6 rounded-md bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Glasses className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-teal-300 mr-1.5">
                    😷 Nose Mask &amp; Specks Suggested:
                  </span>
                  <span className="text-teal-100">
                    High dusty winds active ({weather.windSpeedKmh} km/h gusts)! Suggest wearing a <strong>nose mask</strong> with protective <strong>specks (glasses)</strong> to guard eyes and breathing along campus walkways.
                  </span>
                </div>
              </div>
            ) : (
              /* Mild Conditions */
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-indigo-200 px-3 py-1.5 rounded-lg flex-1 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Campus Weather Clear:</strong> Optimal pleasant conditions across NLT1 to NLT21 lecture halls.
                </span>
              </div>
            )}

            {/* Quick Status Pill */}
            <div className="text-[11px] text-white/60 font-mono flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span>NLT Block Weather Station</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
