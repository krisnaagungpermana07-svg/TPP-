import React from 'react';
import {
  Camera,
  ShieldAlert,
  Clock,
  Maximize2,
  Minimize2,
  User,
  Zap,
} from 'lucide-react';
import { formatMMSS } from '../utils/scoring';

export default function TopBar({
  participantName,
  packageCode,
  mode,
  phase, // 'transition' | 'exam'
  currentSubtest,
  totalSubtests,
  timeLeftSeconds,
  allocatedSeconds,
  warningCount,
  isWindowFocused,
  isFullscreen,
  onToggleFullscreen,
  onSimulateTabWarning,
}) {
  const isUrgent = phase === 'exam' && timeLeftSeconds <= 60;
  const isWarningTime = phase === 'exam' && timeLeftSeconds > 60 && timeLeftSeconds <= 180;
  const progressPct =
    allocatedSeconds > 0
      ? Math.max(0, Math.min(100, (timeLeftSeconds / allocatedSeconds) * 100))
      : 100;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Subtest Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0">
            CAT
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
                PKN STAN • {packageCode || 'PKT-01'}
              </span>
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                  mode === 'fast'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                {mode === 'fast' ? 'Latihan Cepat (1/3)' : 'Simulasi Penuh (120m)'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentSubtest
                ? `Subtes ${currentSubtest.number}/${totalSubtests}: ${currentSubtest.title}`
                : 'Sesi Asesmen Psikologi'}
            </p>
          </div>
        </div>

        {/* Center/Right: Proctoring Focus Status, Warning Counter, Fullscreen & Countdown Timer */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Candidate Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <User className="w-3.5 h-3.5 text-navy-700" />
            <span className="font-medium max-w-[140px] truncate">{participantName || 'Peserta'}</span>
          </div>

          {/* Camera / Focus Active Indicator */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isWindowFocused
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
            }`}
            title="Simulasi Visual Pemantauan Kamera & Fokus Layar"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isWindowFocused ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isWindowFocused ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <Camera className="w-3.5 h-3.5" />
            <span>{isWindowFocused ? 'Kamera/Fokus Aktif' : 'Fokus Terputus!'}</span>
          </div>

          {/* Warning Counter Badge */}
          <button
            type="button"
            onClick={onSimulateTabWarning}
            title="Jumlah peringatan berpindah tab / keluar fullscreen. Klik untuk uji simulasi peringatan."
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              warningCount === 0
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : warningCount <= 2
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <ShieldAlert
              className={`w-3.5 h-3.5 ${
                warningCount === 0
                  ? 'text-slate-500'
                  : warningCount <= 2
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            />
            <span>Peringatan: {warningCount}x</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar dari Mode Layar Penuh' : 'Aktifkan Mode Layar Penuh (Disarankan)'}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Subtest Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm font-bold transition-all ${
              phase === 'transition'
                ? 'bg-slate-100 border-slate-300 text-slate-600'
                : isUrgent
                ? 'bg-rose-600 border-rose-700 text-white animate-pulse'
                : isWarningTime
                ? 'bg-amber-50 border-amber-400 text-amber-900'
                : 'bg-navy-900 border-navy-950 text-white'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-sans font-normal uppercase opacity-80">
                {phase === 'transition' ? 'Timer Dijeda' : `Subtes ${currentSubtest?.number || ''}`}
              </span>
              <span className="text-base tracking-wider">
                {phase === 'transition' ? formatMMSS(allocatedSeconds) : formatMMSS(timeLeftSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Remaining Progress Bar */}
      {phase === 'exam' && (
        <div className="w-full h-1 bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isUrgent ? 'bg-rose-600' : isWarningTime ? 'bg-amber-500' : 'bg-navy-700'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </header>
  );
}
