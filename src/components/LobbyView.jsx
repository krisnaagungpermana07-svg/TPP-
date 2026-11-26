import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  Calendar,
  BookOpen,
  Play,
  Camera,
  CheckCircle2,
  Layers,
  MonitorCheck,
  Package,
  Sparkles,
  LayoutList,
} from 'lucide-react';
import { buildActiveSubtests, getEffectiveSubtestMinutes } from '../utils/examAdapter';

export default function LobbyView({ examData, onStartAssessment }) {
  const packages = examData.packages || [];
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || 'paket-1');
  const [packageFilter, setPackageFilter] = useState('all'); // 'all' | 'inti' | 'eksternal'
  const [examFormat, setExamFormat] = useState('2-modul'); // '2-modul' (Slide PPT) | '5-subtes'
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('STAN-2026-04829');
  const [selectedMode, setSelectedMode] = useState('peepl'); // 'peepl' | 'full' | 'fast'
  const [agreedRules, setAgreedRules] = useState(true);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] = useState(false);
  const [nameError, setNameError] = useState(false);

  const { examMeta } = examData;
  const currentPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const intiCount = packages.filter((p) => (p.group || 'inti') === 'inti').length;
  const eksternalCount = packages.filter((p) => p.group === 'eksternal').length;
  const totalBankQuestions = useMemo(
    () =>
      packages.reduce(
        (sum, pkg) => sum + (pkg.subtests || []).reduce((s2, st) => s2 + st.questions.length, 0),
        0
      ),
    [packages]
  );

  const visiblePackages = useMemo(() => {
    if (packageFilter === 'inti') return packages.filter((p) => (p.group || 'inti') === 'inti');
    if (packageFilter === 'eksternal') return packages.filter((p) => p.group === 'eksternal');
    return packages;
  }, [packages, packageFilter]);

  const previewSubtests = useMemo(
    () => buildActiveSubtests(currentPackage, examFormat),
    [currentPackage, examFormat]
  );

  const totalQuestionsInPackage = previewSubtests.reduce((acc, st) => acc + st.questions.length, 0);
  const totalMinutesDisplay = previewSubtests.reduce(
    (acc, st) => acc + getEffectiveSubtestMinutes(st, selectedMode),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = participantName.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    onStartAssessment({
      name: trimmed,
      participantId: participantId.trim() || 'STAN-2026-04829',
      packageId: currentPackage.id,
      examFormat,
      mode: selectedMode,
      enterFullscreen: requestFullscreenOnStart,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Institutional Header */}
      <header className="bg-navy-900 text-white border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg tracking-wider">
              CAT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-navy-200">
                  {examMeta.institution}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded">
                  Adaptive CAT Ready
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {examMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-navy-100">
            <div className="flex items-center gap-1.5 bg-navy-800/80 px-3 py-1.5 rounded-lg border border-navy-700">
              <Calendar className="w-3.5 h-3.5 text-navy-300" />
              <span>
                Jendela Sesi: <strong className="text-white">{examMeta.sessionWindow}</strong>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-navy-800/80 px-3 py-1.5 rounded-lg border border-navy-700">
              <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{examMeta.platformStyle}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Lobby Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Session Info, Subtests Summary & Rules */}
          <div className="lg:col-span-7 space-y-6">
            {/* Session Overview Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-navy-50 text-navy-800 border border-navy-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Adaptive Psychological & Behavioral Profiling (Peepl Style)
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Informasi Sesi & Struktur Subtes
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Meniru alur asesmen <strong>peepl.tech</strong> untuk seleksi PKN STAN: dilengkapi <strong>Karakter Orang Bergerak (P2, P1, P3 & EPPS)</strong>, <strong>CAT Dual-Adaptif (Penalaran HOTS + Kepribadian)</strong>, serta <strong>{packages.length} Paket Lintas Sumber TPP & PEEPL</strong> (termasuk adaptasi ODP Mandiri, Magang/MT BCA, dan Kisi-Kisi Psikologi PKN STAN & Kemenkeu).
                </p>
              </div>

              {/* 3 Key Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Jendela Sesi Ujian</div>
                  <div className="text-sm sm:text-base font-bold text-navy-900 mt-0.5">
                    {examMeta.sessionWindow}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Jadwal Sesi Pagi</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Total Durasi Efektif</div>
                  <div className="text-sm sm:text-base font-bold text-navy-900 mt-0.5">
                    {totalMinutesDisplay} Menit
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedMode === 'peepl'
                      ? 'Pace Ketat Asli PEEPL'
                      : selectedMode === 'fast'
                      ? 'Drill Cepat (1/3 Durasi)'
                      : 'Kuota Maksimal Sesi (120m)'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Struktur Aktif</div>
                  <div className="text-sm sm:text-base font-bold text-navy-900 mt-0.5">
                    {previewSubtests.length} Subtes • {totalQuestionsInPackage} Soal
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {examFormat === '2-modul' ? '60 Penalaran + 60 Pribadi' : '5 Bagian Terpisah'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Subtests Breakdown Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-navy-800" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {examFormat === '2-modul'
                      ? `Struktur 2 Subtes Utama (Slide PPT) — ${currentPackage?.code}`
                      : `Daftar 5 Subtes Terpisah — ${currentPackage?.code}`}
                  </h3>
                </div>
                <span className="text-xs font-medium text-navy-700 bg-navy-50 px-2.5 py-0.5 rounded border border-navy-200">
                  {currentPackage?.name}
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {previewSubtests.map((st) => {
                  const effectiveMins = getEffectiveSubtestMinutes(st, selectedMode);
                  return (
                    <div
                      key={st.id}
                      className="px-6 py-4 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          0{st.number}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                                st.code === 'SJT_KEPRIBADIAN'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-navy-50 text-navy-700 border border-navy-200'
                              }`}
                            >
                              {st.category}
                            </span>
                            {st.code === 'SJT_KEPRIBADIAN' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 text-sky-800 border border-sky-200">
                                <Sparkles className="w-3 h-3" />
                                Karakter Bergerak & Adaptif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {st.description}
                          </p>
                          {/* Show 4 cognitive sub-clusters cleanly when in 2-Modul format */}
                          {st.domainSections && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {st.domainSections.map((sec) => (
                                <span
                                  key={sec.code}
                                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                                >
                                  No. {sec.startNumber}–{sec.endNumber}: {sec.shortTitle}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-navy-900 font-mono text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-navy-700" />
                          {effectiveMins} Menit
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-medium">
                          {st.questions.length} Butir Soal
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rules & Anti-Distraction Protocol */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-navy-800" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Aturan Pengerjaan & Protokol Anti-Distraksi
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                {examMeta.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (5 cols): Participant Login, Format Selector, Package Selector, Mode & Launch */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
                    Registrasi Sesi Peserta
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Camera className="w-3.5 h-3.5" />
                    Sensor Fokus Siap
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Mulai Simulasi Asesmen
                </h3>
              </div>

              {/* Participant Name & ID */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label
                    htmlFor="participant-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Nama Peserta <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    value={participantName}
                    onChange={(e) => {
                      setParticipantName(e.target.value);
                      if (nameError) setNameError(false);
                    }}
                    placeholder="Nama lengkap Anda..."
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      nameError
                        ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50/30'
                        : 'border-slate-300 focus:border-navy-700 focus:ring-navy-700/15 bg-white'
                    }`}
                  />
                </div>
                <div className="sm:col-span-5">
                  <label
                    htmlFor="participant-id"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    No. BPU / Kode
                  </label>
                  <input
                    id="participant-id"
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-navy-700"
                  />
                </div>
              </div>
              {nameError && (
                <p className="text-xs text-rose-600 -mt-3 font-medium">
                  Harap isi nama lengkap peserta terlebih dahulu sebelum memulai simulasi.
                </p>
              )}

              {/* Structure Format Selector: 2 Subtes (PPT) vs 5 Subtes Terpisah */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  <LayoutList className="w-3.5 h-3.5 text-navy-800" />
                  <span>Format Struktur Subtes</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExamFormat('2-modul')}
                    className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      examFormat === '2-modul'
                        ? 'border-navy-800 bg-navy-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900">2 Subtes (PPT)</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 rounded">
                        Resmi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Penalaran (60 soal) + Pribadi (60 butir).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamFormat('5-subtes')}
                    className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      examFormat === '5-subtes'
                        ? 'border-navy-800 bg-navy-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900">5 Subtes Terpisah</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                        Per Bagian
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Timer terpisah 15+20+13+7+25m (PEEPL).
                    </p>
                  </button>
                </div>
              </div>

              {/* Package Selector with Multi-Source Category Filter Tabs */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Package className="w-3.5 h-3.5 text-navy-800" />
                    <span>Pilih Paket Soal ({packages.length} Paket • {totalBankQuestions} Soal)</span>
                  </label>
                </div>

                {eksternalCount > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    {[
                      { id: 'all', label: `Semua (${packages.length})` },
                      { id: 'inti', label: `Inti TPP (${intiCount})` },
                      { id: 'eksternal', label: `Sumber Lain (${eksternalCount})` },
                    ].map((tab) => {
                      const active = packageFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setPackageFilter(tab.id);
                            const nextList =
                              tab.id === 'inti'
                                ? packages.filter((p) => (p.group || 'inti') === 'inti')
                                : tab.id === 'eksternal'
                                ? packages.filter((p) => p.group === 'eksternal')
                                : packages;
                            if (nextList.length > 0 && !nextList.some((p) => p.id === selectedPackageId)) {
                              setSelectedPackageId(nextList[0].id);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-navy-900 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-white/70'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {visiblePackages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    const isExternal = pkg.group === 'eksternal';
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-navy-800 bg-navy-50/60 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-navy-800 bg-navy-800 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {pkg.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded border shrink-0 ${
                                isExternal
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-slate-100 text-navy-900 border-slate-200'
                              }`}
                            >
                              {pkg.badge}
                            </span>
                          </div>
                          {pkg.sourceOrigin && (
                            <div className="mt-1">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-semibold">
                                Sumber: {pkg.sourceOrigin}
                              </span>
                            </div>
                          )}
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selection: PEEPL Pace (80m) vs Full Quota (120m) vs Fast Drill (1/3) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Pilih Mode Timer Pengerjaan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('peepl')}
                    className={`text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMode === 'peepl'
                        ? 'border-navy-800 bg-navy-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900">Pace PEEPL</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-600 text-white rounded">
                        80m
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      55m Penalaran + 25m P2 (Asli).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('full')}
                    className={`text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMode === 'full'
                        ? 'border-navy-800 bg-navy-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900">Kuota Sesi</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-navy-900 text-white rounded">
                        120m
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      90m Penalaran + 30m P2 (Penuh).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('fast')}
                    className={`text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMode === 'fast'
                        ? 'border-navy-800 bg-navy-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900">Drill Cepat</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                        1/3
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Timer 1/3 (~26m) uji coba.
                    </p>
                  </button>
                </div>
              </div>

              {/* Optional Fullscreen & Rules Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requestFullscreenOnStart}
                    onChange={(e) => setRequestFullscreenOnStart(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
                  />
                  <span className="text-xs text-slate-600">
                    Aktifkan <strong>Mode Layar Penuh (Fullscreen)</strong> otomatis saat memulai sesi.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedRules}
                    onChange={(e) => setAgreedRules(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
                  />
                  <span className="text-xs text-slate-600">
                    Saya menyetujui aturan simulasi dan pemantauan anti-distraksi selama pengerjaan berlangsung.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!agreedRules}
                className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  Mulai {currentPackage?.code} — {examFormat === '2-modul' ? 'Subtes 1: Penalaran' : 'Transisi Subtes 1'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-[11px] text-slate-500">
        Aplikasi simulasi latihan mandiri untuk persiapan seleksi — tidak berafiliasi resmi dengan PKN STAN, Kementerian Keuangan, maupun PT Aneka Search Indonesia (Peepl). Seluruh soal, skor, dan profil psikologi merupakan sarana latihan edukatif.
      </footer>
    </div>
  );
}
