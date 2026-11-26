import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Printer,
  RotateCcw,
  BookOpen,
  UserCheck,
  Filter,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  calculateExamResults,
  formatDurationHuman,
  formatMMSS,
} from '../utils/scoring';
import { resolveAdaptiveQuestion, buildQuestionLookup } from '../utils/examAdapter';
import AbstractPatternSVG from './AbstractPatternSVG';
import EmojiLikertScale from './EmojiLikertScale';
import MissingCharPanel from './MissingCharPanel';
import DataChartSVG from './DataChartSVG';
import { FiguralQuestionStimulus, FiguralOptionsGrid } from './VisualFiguralSVG';

export default function ResultView({
  currentPackage,
  activeSubtests,
  examFormat,
  participantName,
  participantId,
  mode,
  answers,
  subtestTimeSpent,
  warningCount,
  completedAt,
  onRestart,
}) {
  const rawSubtests = currentPackage.subtests;
  const [activeSubtestTab, setActiveSubtestTab] = useState(rawSubtests[0].id);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'

  const report = useMemo(
    () =>
      calculateExamResults(
        rawSubtests,
        answers,
        subtestTimeSpent,
        warningCount,
        mode,
        currentPackage.consistencyPairs || [],
        activeSubtests
      ),
    [
      rawSubtests,
      answers,
      subtestTimeSpent,
      warningCount,
      mode,
      currentPackage.consistencyPairs,
      activeSubtests,
    ]
  );

  const selectedSubtestForReview =
    rawSubtests.find((s) => s.id === activeSubtestTab) || rawSubtests[0];

  const isSjtReview = selectedSubtestForReview.code === 'SJT_KEPRIBADIAN';

  const fullQuestionLookup = useMemo(() => buildQuestionLookup(rawSubtests), [rawSubtests]);

  const filteredQuestions = useMemo(() => {
    return selectedSubtestForReview.questions
      .map((rawQ) => resolveAdaptiveQuestion(rawQ, answers, fullQuestionLookup))
      .filter((q) => {
        const userAns = answers[q.id];
        const isAnswered = Boolean(userAns);
        const isOptimal = userAns === q.correctOption;

        if (statusFilter === 'unanswered') return !isAnswered;
        if (statusFilter === 'correct') return isAnswered && isOptimal;
        if (statusFilter === 'incorrect') return isAnswered && !isOptimal;
        return true;
      });
  }, [selectedSubtestForReview, answers, fullQuestionLookup, statusFilter]);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Result Header Bar */}
      <header className="bg-navy-900 text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">
              CAT
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-navy-200">
                <span>Laporan Hasil Simulasi & Profiling Psikologi — PKN STAN</span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] tracking-normal">
                  {currentPackage.code} • {examFormat === '2-modul' ? '2 Subtes Resmi PPT' : '5 Subtes Terpisah'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {participantName}{' '}
                <span className="text-navy-200 font-mono text-sm">({participantId})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Export Hasil ke PDF / Print</span>
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi / Pilih Paket Lain</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* SECTION 1: Executive Score Card & Execution Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between print-shadow-none">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
                  Indeks Evaluasi Gabungan
                </span>
                <span className="text-xs text-slate-500">
                  {completedAt} • {mode === 'fast' ? 'Mode Cepat (1/3)' : 'Simulasi Penuh (120m)'}
                </span>
              </div>

              <div className="flex items-baseline gap-4 my-2">
                <div className="text-5xl font-extrabold text-navy-900 font-mono">
                  {report.compositeScore}
                  <span className="text-xl font-normal text-slate-400">/100</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    report.isRecommended
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {report.isRecommended
                    ? 'MEMENUHI STANDAR REKOMENDASI'
                    : 'PERLU PENGUATAN LATIHAN'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Indeks gabungan dihitung dari bobot{' '}
                <strong>70% Tes Penalaran (4 Klaster Kognitif)</strong> dan{' '}
                <strong>30% Tes Potensi Pribadi (SJT & Kepribadian Adaptif)</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-100">
              <div className="p-3 rounded-lg bg-navy-50/60 border border-navy-100">
                <div className="text-xs text-slate-600 font-medium">Tes Penalaran</div>
                <div className="text-xl font-bold text-navy-900 font-mono mt-0.5">
                  {report.cognitiveAccuracy}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {report.totalCognitiveCorrect} benar dari {report.totalCognitiveQuestions} soal
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs text-slate-600 font-medium">Tes Potensi Pribadi</div>
                <div className="text-xl font-bold text-emerald-900 font-mono mt-0.5">
                  {report.sjtSubtestReport?.percentage || 0}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {report.sjtSubtestReport?.earnedPoints || 0} dari{' '}
                  {report.sjtSubtestReport?.maxPoints || 100} poin
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between print-shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy-800" />
                Statistik Pengerjaan & Pemantauan Fokus
              </h2>
              <span className="text-xs text-slate-500">
                Total Dijawab:{' '}
                <strong>
                  {report.totalAnsweredAll}/{report.totalQuestionsAll} Soal
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  Total Waktu Efektif
                </div>
                <div className="text-xl font-bold text-navy-950 font-mono mt-1">
                  {formatDurationHuman(report.totalTimeSpentSeconds)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Dari kuota {formatDurationHuman(report.totalAllocatedSeconds)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  Rata-rata Waktu / Soal
                </div>
                <div className="text-xl font-bold text-navy-950 font-mono mt-1">
                  {report.avgTimePerQuestionOverall} detik
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Kecepatan respons lintas {report.totalQuestionsAll} soal
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  report.warningCount === 0
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : report.warningCount <= 3
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="text-xs font-semibold text-slate-600 uppercase flex items-center justify-between">
                  <span>Peringatan Pindah Tab</span>
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                </div>
                <div
                  className={`text-xl font-bold font-mono mt-1 ${
                    report.warningCount === 0
                      ? 'text-emerald-800'
                      : report.warningCount <= 3
                      ? 'text-amber-800'
                      : 'text-rose-800'
                  }`}
                >
                  {report.warningCount}x Peringatan
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {report.warningCount === 0
                    ? 'Fokus penuh tanpa distraksi'
                    : 'Tercatat perpindahan tab/jendela'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                Rincian Waktu Efektif Terpakai ({report.activeTimeBreakdown.length} Subtes):
              </div>
              <div
                className={`grid gap-2 ${
                  report.activeTimeBreakdown.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-5'
                }`}
              >
                {report.activeTimeBreakdown.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-slate-700 truncate">
                      {item.number}. {item.shortTitle}
                    </span>
                    <span className="font-mono font-bold text-navy-900 shrink-0">
                      {formatMMSS(item.spentSeconds)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Cognitive Performance Chart & Breakdown (4 Cognitive Domains) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm print-shadow-none print-break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-navy-800" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Analisis Performa Tes Penalaran (4 Domain Kognitif)
                </h2>
                <p className="text-xs text-slate-500">
                  Grafik persentase akurasi jawaban benar pada Verbal, Numerik, Abstrak SVG, dan Ketelitian
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold">
              Ambang Referensi Penalaran: ≥ 65%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Grafik Persentase Akurasi per Domain Penalaran
              </div>
              {report.cognitiveSubtests.map((cog) => {
                const isPassing = cog.accuracy >= 65;
                return (
                  <div key={cog.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        0{cog.number}. {cog.title}
                      </span>
                      <span className="font-mono font-bold text-navy-900">
                        {cog.accuracy}% ({cog.correctCount}/{cog.totalQuestions})
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cog.accuracy >= 80
                            ? 'bg-emerald-600'
                            : isPassing
                            ? 'bg-navy-800'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, cog.accuracy)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-3.5 font-bold">Domain Penalaran</th>
                    <th className="py-3 px-2.5 font-bold text-center">Benar</th>
                    <th className="py-3 px-2.5 font-bold text-center">Salah</th>
                    <th className="py-3 px-2.5 font-bold text-center">Kosong</th>
                    <th className="py-3 px-3 font-bold text-right whitespace-nowrap">Rerata Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.cognitiveSubtests.map((cog) => (
                    <tr key={cog.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3.5 font-semibold text-slate-900">
                        0{cog.number}. {cog.title}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold text-emerald-700">
                        {cog.correctCount}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold text-rose-600">
                        {cog.incorrectCount}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono text-slate-500">
                        {cog.unansweredCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {cog.avgTimePerQuestion} dtk/soal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cognitive Adaptive Difficulty Trace Panel */}
          {report.cognitiveAdaptiveTrace && report.cognitiveAdaptiveTrace.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-700" />
                <div>
                  <h3 className="text-sm font-bold text-sky-950">
                    Jejak Kalibrasi Kesulitan Adaptif Penalaran (CAT Difficulty)
                  </h3>
                  <p className="text-xs text-sky-900/80">
                    Soal kalibrasi otomatis naik ke Level Sulit (HOTS) bila akurasi awal ≥ 65%, atau tetap pada Level Standar
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {report.cognitiveAdaptiveTrace.map((tr) => (
                  <div
                    key={tr.questionId}
                    className="p-3 rounded-lg bg-white border border-sky-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-navy-900 truncate">{tr.domainTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                          tr.branchKey === 'hard'
                            ? 'bg-navy-900 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tr.branchKey === 'hard' ? 'HOTS' : 'Standar'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-sky-900">{tr.branchName}</div>
                    <div className="text-[11px] text-slate-600">
                      Pemicu: {tr.triggerAnswerText} • Hasil:{' '}
                      <strong className={tr.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>
                        {!tr.answered ? 'Kosong' : tr.isCorrect ? 'Benar' : 'Salah'}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Potensi Pribadi Profile, Consistency Index & Adaptive Trace */}
        {report.sjtSubtestReport && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm print-shadow-none space-y-6 print-break-inside-avoid">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-navy-800" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Profil Tes Potensi Pribadi — Kepribadian Adaptif & SJT
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pemetaan 5 dimensi sikap kerja, validitas konsistensi jawaban, dan jejak percabangan soal adaptif
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Total Skor Potensi Pribadi: {report.sjtSubtestReport.earnedPoints} /{' '}
                {report.sjtSubtestReport.maxPoints} Poin ({report.sjtSubtestReport.percentage}%)
              </span>
            </div>

            {/* 5 Psychological Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.sjtSubtestReport.dimensionsProfile.map((dim) => (
                <div
                  key={dim.key}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{dim.label}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${dim.badgeClass}`}
                      >
                        {dim.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{dim.description}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600">
                        Skor: <strong>{dim.earnedPoints}/{dim.maxPoints}</strong> ({dim.questionCount} butir)
                      </span>
                      <span className="font-bold text-navy-900">{dim.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dim.barClass}`}
                        style={{ width: `${Math.max(5, dim.percentage)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-700 pt-1 italic">“{dim.interpretation}”</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Adaptive Personality Branching Trace Panel */}
            {report.sjtSubtestReport.adaptiveTrace &&
              report.sjtSubtestReport.adaptiveTrace.length > 0 && (
                <div className="p-5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    <div>
                      <h3 className="text-sm font-bold text-sky-950">
                        Jejak Percabangan Soal Adaptif (Adaptive CAT Branching)
                      </h3>
                      <p className="text-xs text-sky-900/80">
                        Berikut adalah 4 butir soal pendalaman yang secara dinamis berubah mengikuti respons kepribadian Anda sebelumnya
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.sjtSubtestReport.adaptiveTrace.map((tr) => (
                      <div
                        key={tr.questionId}
                        className="p-3.5 rounded-lg bg-white border border-sky-200/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-navy-900">
                            Soal #{tr.questionNumber} — {tr.branchName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-mono text-[10px] font-bold shrink-0">
                            Skor {tr.earnedScore}/5
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Pemicu: <strong>{tr.sourceLabel}</strong> →{' '}
                          <span className="font-semibold text-navy-800">{tr.triggerAnswerText}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Respons Anda pada soal adaptif: <strong>{tr.userAnswerText}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Psychological Consistency Check Panel */}
            {report.sjtSubtestReport.consistencyReport &&
              report.sjtSubtestReport.consistencyReport.totalPairs > 0 && (
                <div className="p-5 rounded-xl bg-navy-50/40 border border-navy-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-navy-800" />
                      <div>
                        <h3 className="text-sm font-bold text-navy-950">
                          Indeks Konsistensi Jawaban Psikologi (Validity Check)
                        </h3>
                        <p className="text-xs text-slate-600">
                          Mengevaluasi keselarasan jawaban pada pasangan pernyataan kepribadian yang saling berlawanan (gaya peepl.tech)
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white border border-navy-200 text-xs font-mono font-bold text-navy-900">
                      Konsistensi: {report.sjtSubtestReport.consistencyReport.overallScore}% —{' '}
                      {report.sjtSubtestReport.consistencyReport.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.sjtSubtestReport.consistencyReport.details.map((pair) => (
                      <div
                        key={pair.id}
                        className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{pair.label}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${pair.badgeClass}`}
                          >
                            {pair.statusText}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          <div>
                            • <em>“{pair.descA}”</em> →{' '}
                            <strong className="text-navy-900">
                              {pair.labelA || (pair.valA ? `Skala ${pair.valA}` : '—')}
                            </strong>
                          </div>
                          <div>
                            • <em>“{pair.descB}”</em> →{' '}
                            <strong className="text-navy-900">
                              {pair.labelB || (pair.valB ? `Skala ${pair.valB}` : '—')}
                            </strong>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{pair.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* SECTION 4: Mode Pembahasan Lengkap (Discussion & Answer Key) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm print-shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-navy-800" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Mode Pembahasan & Kunci Jawaban Lengkap
                </h2>
                <p className="text-xs text-slate-500">
                  Tinjau kembali setiap butir soal (termasuk cabang soal adaptif yang Anda terima), jawaban Anda, kunci, dan penjelasannya
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap no-print">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {[
                { id: 'all', label: 'Semua Soal' },
                { id: 'correct', label: isSjtReview ? 'Respons Optimal (Skor 5)' : 'Jawaban Benar' },
                { id: 'incorrect', label: isSjtReview ? 'Belum Optimal (<5)' : 'Jawaban Salah' },
                { id: 'unanswered', label: 'Tidak Dijawab' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Column Domain Tabs (Always fits cleanly without horizontal scroll) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 py-4 border-b border-slate-100 no-print">
            {rawSubtests.map((st) => {
              const isActive = st.id === activeSubtestTab;
              const shortNames = {
                VERBAL: 'Verbal & Logika',
                NUMERIK: 'Numerik & Data',
                ABSTRAK: 'Abstrak / Pola',
                KETELITIAN: 'Ketelitian',
                SJT_KEPRIBADIAN: 'Potensi Pribadi',
              };
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveSubtestTab(st.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-1.5 text-left ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="truncate">
                    {st.number}. {shortNames[st.code] || st.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {st.questions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Questions Review List */}
          <div className="divide-y divide-slate-200 mt-2">
            {filteredQuestions.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Tidak ada soal pada bagian ini yang sesuai dengan filter yang dipilih.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const userAns = answers[q.id] || null;
                const isOptimalOrCorrect = userAns === q.correctOption;
                const chosenOptObj = q.options.find((o) => o.id === userAns);
                const correctOptObj = q.options.find((o) => o.id === q.correctOption);
                const hasVisualOptions = q.options.some((o) => Boolean(o.svgSpec));

                return (
                  <div key={q.id} className="py-6 space-y-4 print-break-inside-avoid">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-navy-900 text-white font-mono text-xs font-bold">
                          Soal #{q.number}
                        </span>
                        {q.subCategory && (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            {q.subCategory}
                          </span>
                        )}
                        {q.adaptiveResolved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold">
                            <Sparkles className="w-3 h-3" />
                            {q.adaptiveResolved.branchName}
                          </span>
                        )}
                      </div>

                      <div>
                        {!userAns ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            <MinusCircle className="w-3.5 h-3.5" />
                            Tidak Dijawab
                          </span>
                        ) : isOptimalOrCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {isSjtReview ? 'Respons Optimal (Skor 5/5)' : 'Jawaban Benar'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            {isSjtReview
                              ? `Skor Pilihan Anda: ${chosenOptObj?.score || 0}/5`
                              : 'Jawaban Kurang Tepat'}
                          </span>
                        )}
                      </div>
                    </div>

                    {q.passage && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {q.passageTitle && (
                          <div className="text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                            {q.passageTitle}
                          </div>
                        )}
                        {q.passage}
                      </div>
                    )}

                    {q.svgPatternId && (
                      <AbstractPatternSVG patternId={q.svgPatternId} showAnswerFrame={true} />
                    )}

                    {q.figuralData && (
                      <FiguralQuestionStimulus
                        figuralData={q.figuralData}
                        answerSpec={correctOptObj?.svgSpec || null}
                      />
                    )}

                    {q.chartData && <DataChartSVG chartData={q.chartData} />}

                    {q.missingCharData && (
                      <MissingCharPanel missingCharData={q.missingCharData} />
                    )}

                    {q.comparisonPair && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            {q.comparisonPair.labelLeft}
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-navy-950 break-all">
                            {q.comparisonPair.valueLeft}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            {q.comparisonPair.labelRight}
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-navy-950 break-all">
                            {q.comparisonPair.valueRight}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-sm sm:text-base font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                      {q.prompt}
                    </p>

                    {q.tableData && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {q.tableData.caption && (
                          <div className="bg-slate-100 px-3.5 py-2 text-xs font-bold text-navy-900 border-b border-slate-200">
                            {q.tableData.caption}
                          </div>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                {q.tableData.headers.map((h, i) => (
                                  <th key={i} className="px-3.5 py-2 font-bold text-slate-700">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {q.tableData.rows.map((r, ri) => (
                                <tr key={ri}>
                                  {r.map((c, ci) => (
                                    <td key={ci} className="px-3.5 py-2 font-mono text-slate-800">
                                      {c}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Render Emoji Scale OR Visual SVG Options OR Standard List */}
                    {q.isLikert ? (
                      <EmojiLikertScale
                        options={q.options}
                        selectedOptionId={userAns}
                        correctOptionId={q.correctOption}
                        peeplOrder={Boolean(q.peeplOrder)}
                        showSolution={true}
                        compact
                      />
                    ) : hasVisualOptions ? (
                      <FiguralOptionsGrid
                        options={q.options}
                        selectedOptionId={userAns}
                        correctOptionId={q.correctOption}
                        showSolution={true}
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt) => {
                          const isUserChoice = userAns === opt.id;
                          const isKey = q.correctOption === opt.id;

                          let rowClass = 'border-slate-200 bg-white text-slate-700';
                          if (isKey) {
                            rowClass =
                              'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold';
                          } else if (isUserChoice && !isKey) {
                            rowClass =
                              'border-rose-400 bg-rose-50/70 text-rose-950 font-medium';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 ${rowClass}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    isKey
                                      ? 'bg-emerald-600 text-white'
                                      : isUserChoice
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="leading-relaxed">{opt.text}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {typeof opt.score === 'number' && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                                    Skor {opt.score}
                                  </span>
                                )}
                                {isUserChoice && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      isKey
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-rose-600 text-white'
                                    }`}
                                  >
                                    Pilihan Anda
                                  </span>
                                )}
                                {isKey && !isUserChoice && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                                    Kunci Jawaban
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-1">
                      <div className="font-bold text-navy-900">
                        Pembahasan (Kunci: {q.correctOption}
                        {correctOptObj && typeof correctOptObj.score === 'number'
                          ? ` — Skor Maksimal ${correctOptObj.score} Poin`
                          : ''}
                        ):
                      </div>
                      <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
