import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Camera,
  Send,
  Keyboard,
  ShieldCheck,
  Brain,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import AbstractPatternSVG from './AbstractPatternSVG';
import EmojiLikertScale, { PersonalitySceneSVG } from './EmojiLikertScale';
import MissingCharPanel from './MissingCharPanel';
import DataChartSVG from './DataChartSVG';
import { FiguralQuestionStimulus, FiguralOptionsGrid } from './VisualFiguralSVG';
import { resolveAdaptiveQuestion } from '../utils/examAdapter';

export default function ExamView({
  subtest,
  totalSubtests,
  questionLookup = {},
  currentQuestionIndex,
  onSelectQuestionIndex,
  answers,
  doubtfulMap,
  onSelectAnswer,
  onClearAnswer,
  onToggleDoubtful,
  onFinishSubtest,
  warningCount,
  isWindowFocused,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fontScale, setFontScale] = useState('base'); // 'sm' | 'base' | 'lg'
  const [showEmojiLabels, setShowEmojiLabels] = useState(true);

  const questions = subtest.questions;
  const rawQuestion = questions[currentQuestionIndex] || questions[0];

  const currentQuestion = useMemo(
    () => resolveAdaptiveQuestion(rawQuestion, answers, questionLookup),
    [rawQuestion, answers, questionLookup]
  );

  const selectedOption = answers[currentQuestion.id] || null;
  const isDoubtful = Boolean(doubtfulMap[currentQuestion.id]);
  const isLikertItem = Boolean(currentQuestion.isLikert);
  const hasVisualOptions = currentQuestion.options.some((o) => Boolean(o.svgSpec));
  const hasSplitPane = Boolean(currentQuestion.passage);
  const adaptiveInfo = currentQuestion.adaptiveResolved || null;

  const textSizeClass =
    fontScale === 'sm'
      ? 'text-sm'
      : fontScale === 'lg'
      ? 'text-lg'
      : 'text-base';

  const optionTextSizeClass =
    fontScale === 'sm'
      ? 'text-xs sm:text-sm'
      : fontScale === 'lg'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const parseLikertPrompt = (rawPrompt) => {
    const lines = rawPrompt.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length >= 2) {
      return {
        header: lines[0],
        statement: lines.slice(1).join('\n'),
      };
    }
    return {
      header: 'Pernyataan Gambaran Diri Psikologi:',
      statement: rawPrompt,
    };
  };

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const doubtfulCount = questions.filter((q) => Boolean(doubtfulMap[q.id])).length;
  const unansweredCount = questions.length - answeredCount;
  const hasAdaptiveQuestions = questions.some((q) => Boolean(q.adaptiveConfig || q.adaptiveDifficulty));

  // Keyboard shortcuts: A-F or 1-6 to select option, Left/Right arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmModal) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const key = e.key.toUpperCase();
      const optionMap = {
        A: 'A',
        B: 'B',
        C: 'C',
        D: 'D',
        E: 'E',
        F: 'F',
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'F',
      };

      if (optionMap[key]) {
        const targetId = optionMap[key];
        const exists = currentQuestion.options.some((o) => o.id === targetId);
        if (exists) {
          e.preventDefault();
          onSelectAnswer(currentQuestion.id, targetId);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < questions.length - 1) {
          e.preventDefault();
          onSelectQuestionIndex(currentQuestionIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          e.preventDefault();
          onSelectQuestionIndex(currentQuestionIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentQuestion,
    currentQuestionIndex,
    questions.length,
    onSelectAnswer,
    onSelectQuestionIndex,
    showConfirmModal,
  ]);

  const likertParsed = isLikertItem ? parseLikertPrompt(currentQuestion.prompt) : null;

  const renderStandardOptions = () => (
    <div className="space-y-2.5 pt-2">
      {currentQuestion.options.map((opt) => {
        const isSelected = selectedOption === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectAnswer(currentQuestion.id, opt.id)}
            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer group ${
              isSelected
                ? 'border-navy-800 bg-navy-50/60 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isSelected
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
              }`}
            >
              {opt.id}
            </span>
            <span
              className={`${optionTextSizeClass} leading-relaxed ${
                isSelected ? 'font-semibold text-navy-950' : 'text-slate-800'
              }`}
            >
              {opt.text}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderQuestionButton = (q, idx) => {
    const isCurrent = idx === currentQuestionIndex;
    const isAns = Boolean(answers[q.id]);
    const isDbt = Boolean(doubtfulMap[q.id]);
    const isAdapt = Boolean(q.adaptiveConfig || q.adaptiveDifficulty);

    let btnStyle = 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50';
    if (isDbt) {
      btnStyle = 'bg-amber-500 border-amber-600 text-white font-bold';
    } else if (isAns) {
      btnStyle = 'bg-navy-900 border-navy-950 text-white font-bold';
    }

    return (
      <button
        key={q.id}
        type="button"
        onClick={() => onSelectQuestionIndex(idx)}
        title={isAdapt ? `Soal #${q.number} (Adaptif)` : `Soal #${q.number}`}
        className={`relative h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${btnStyle} ${
          isCurrent ? 'ring-2 ring-offset-2 ring-navy-700' : ''
        }`}
      >
        <span>{q.number}</span>
        {isAdapt && !isAns && (
          <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-sky-600 text-white text-[8px] flex items-center justify-center border border-white">
            ✦
          </span>
        )}
        {isAns && (
          <span
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border ${
              isDbt
                ? 'bg-amber-900 text-white border-white'
                : 'bg-emerald-500 text-white border-white'
            }`}
          >
            {answers[q.id]}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Question Area */}
        <div className="md:col-span-8 xl:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            {/* Question Top Bar + Font Size Toggle (Huruf A- A A+) */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-navy-900 text-white font-bold text-xs tracking-wide">
                  SOAL NO. {currentQuestion.number} / {questions.length}
                </span>
                {currentQuestion.subCategory && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700 font-semibold text-xs">
                    {currentQuestion.subCategory}
                  </span>
                )}
                {adaptiveInfo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-100 text-sky-900 border border-sky-200 font-bold text-xs">
                    <Sparkles className="w-3 h-3" />
                    Soal Adaptif
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Typography control matching PEEPL / latihan-tpp-nikzone */}
                <div
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs"
                  title="Atur ukuran huruf soal"
                >
                  <span className="px-2 text-[11px] font-medium text-slate-500 hidden sm:inline">
                    Huruf
                  </span>
                  {[
                    { id: 'sm', label: 'A-' },
                    { id: 'base', label: 'A' },
                    { id: 'lg', label: 'A+' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setFontScale(sz.id)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        fontScale === sz.id
                          ? 'bg-navy-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>

                {isDoubtful ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Flag className="w-3.5 h-3.5 fill-amber-500" />
                    Ragu-ragu
                  </span>
                ) : selectedOption ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Dijawab ({selectedOption})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Belum Dijawab
                  </span>
                )}
              </div>
            </div>

            {/* Question Content Body */}
            <div className="p-6 space-y-5">
              {/* Adaptive Branch Context Banner */}
              {adaptiveInfo && (
                <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 flex items-start gap-2.5 text-xs text-sky-950">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">{adaptiveInfo.branchName}</span> — Soal ini
                    disesuaikan otomatis berdasarkan respons Anda pada{' '}
                    <strong>{adaptiveInfo.sourceLabel}</strong>:{' '}
                    <span className="inline-block whitespace-nowrap px-1.5 py-0.5 rounded bg-white border border-sky-200 font-semibold text-sky-900">
                      {adaptiveInfo.triggerAnswerText}
                    </span>
                  </div>
                </div>
              )}

              {/* Split-Pane Layout for VCR-S (3 options), Ability to Learn (4 options), and PEEPL SJT */}
              {hasSplitPane ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Pane: Wacana / Aturan / Skenario */}
                  <div className="lg:col-span-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-800 border-b border-slate-200 pb-2">
                      <BookOpen className="w-4 h-4 text-navy-700" />
                      <span>{currentQuestion.passageTitle || 'Wacana / Skenario Kasus'}</span>
                    </div>
                    <p
                      className={`${textSizeClass} text-slate-800 leading-relaxed whitespace-pre-line`}
                    >
                      {currentQuestion.passage}
                    </p>
                  </div>

                  {/* Right Pane: Statement + Options */}
                  <div className="lg:col-span-6 space-y-4">
                    <div
                      className={`${textSizeClass} text-slate-900 leading-relaxed whitespace-pre-line font-semibold`}
                    >
                      {currentQuestion.prompt}
                    </div>
                    {renderStandardOptions()}
                  </div>
                </div>
              ) : (
                <>
                  {/* 1. Legacy Abstract Pattern SVG (Paket 1 & 2) */}
                  {currentQuestion.svgPatternId && (
                    <AbstractPatternSVG
                      patternId={currentQuestion.svgPatternId}
                      showAnswerFrame={false}
                    />
                  )}

                  {/* 2. PEEPL Declarative Visual Figural Stimulus (Series / Analogy / Matrix 3x3) */}
                  {currentQuestion.figuralData && (
                    <FiguralQuestionStimulus figuralData={currentQuestion.figuralData} />
                  )}

                  {/* 2b. PEEPL NCR-S Visual SVG Chart (Bar / Line) */}
                  {currentQuestion.chartData && (
                    <DataChartSVG chartData={currentQuestion.chartData} />
                  )}

                  {/* 3. Kecermatan Hilang Karakter Stimulus (5 Ref A-E + 4 Shown) */}
                  {currentQuestion.missingCharData && (
                    <MissingCharPanel missingCharData={currentQuestion.missingCharData} />
                  )}

                  {/* 4. Clerical Comparison Pair Box */}
                  {currentQuestion.comparisonPair && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-navy-800">
                        Panel Perbandingan Karakter & Kode Klerikal
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-sm">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            {currentQuestion.comparisonPair.labelLeft}
                          </div>
                          <div className="font-mono text-sm sm:text-base font-bold text-navy-950 tracking-wide break-all select-none">
                            {currentQuestion.comparisonPair.valueLeft}
                          </div>
                        </div>
                        <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-sm">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            {currentQuestion.comparisonPair.labelRight}
                          </div>
                          <div className="font-mono text-sm sm:text-base font-bold text-navy-950 tracking-wide break-all select-none">
                            {currentQuestion.comparisonPair.valueRight}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Psychological Animated Character Likert OR Visual SVG Options OR Standard Question */}
                  {isLikertItem ? (
                    <div className="space-y-6">
                      <div className="p-5 sm:p-6 rounded-xl bg-navy-50/60 border border-navy-200 text-center space-y-2.5">
                        <PersonalitySceneSVG dimension={currentQuestion.dimension} />
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-navy-200 text-[11px] font-bold uppercase tracking-wider text-navy-800">
                          <Brain className="w-3.5 h-3.5" />
                          <span>{likertParsed.header.replace(/:$/, '')}</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-navy-950 leading-relaxed max-w-2xl mx-auto">
                          {likertParsed.statement}
                        </p>
                        <p className="text-xs text-slate-600">
                          Pilih gambar karakter orang bergerak yang paling mencerminkan diri Anda secara jujur dan konsisten.
                        </p>
                      </div>

                      <EmojiLikertScale
                        options={currentQuestion.options}
                        selectedOptionId={selectedOption}
                        onSelect={(optId) => onSelectAnswer(currentQuestion.id, optId)}
                        peeplOrder={Boolean(currentQuestion.peeplOrder)}
                        showLabels={showEmojiLabels}
                        onToggleShowLabels={setShowEmojiLabels}
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${textSizeClass} text-slate-900 leading-relaxed whitespace-pre-line font-medium`}
                      >
                        {currentQuestion.prompt}
                      </div>

                      {currentQuestion.tableData && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          {currentQuestion.tableData.caption && (
                            <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-navy-900 border-b border-slate-200">
                              {currentQuestion.tableData.caption}
                            </div>
                          )}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                  {currentQuestion.tableData.headers.map((h, idx) => (
                                    <th key={idx} className="px-4 py-2.5 font-bold">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {currentQuestion.tableData.rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className={`px-4 py-2.5 ${
                                          cIdx === 0
                                            ? 'font-semibold text-slate-900'
                                            : 'font-mono text-slate-800'
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {hasVisualOptions ? (
                        <FiguralOptionsGrid
                          options={currentQuestion.options}
                          selectedOptionId={selectedOption}
                          onSelect={(optId) => onSelectAnswer(currentQuestion.id, optId)}
                        />
                      ) : (
                        renderStandardOptions()
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Question Bottom Action Bar */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelectQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleDoubtful(currentQuestion.id)}
                className={`px-3.5 py-2.5 rounded-lg border font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDoubtful
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isDoubtful ? 'Ragu-ragu Aktif' : 'Ragu-ragu'}</span>
              </button>

              {selectedOption && (
                <button
                  type="button"
                  onClick={() => onClearAnswer(currentQuestion.id)}
                  className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus pilihan jawaban pada soal ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              )}
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => onSelectQuestionIndex(currentQuestionIndex + 1)}
                className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Akhiri Subtes {subtest.number}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-4 xl:col-span-3 space-y-5 md:sticky md:top-20">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-navy-800" />
                Proctoring & Fokus
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isWindowFocused
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isWindowFocused ? 'ONLINE • AKTIF' : 'PERINGATAN TAB'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Anti-Distraksi</div>
                  <div className="text-[11px] text-slate-300 truncate">Deteksi tab aktif</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase text-slate-400">Pelanggaran</div>
                <div
                  className={`text-sm font-mono font-bold ${
                    warningCount === 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {warningCount}x
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Navigasi Nomor Soal
              </h3>
              <span className="text-xs font-semibold text-navy-800">
                Subtes {subtest.number}/{totalSubtests}
              </span>
            </div>

            {subtest.domainSections ? (
              <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                {subtest.domainSections.map((sec) => {
                  const secItems = questions
                    .map((q, idx) => ({ q, idx }))
                    .filter(({ q }) => q.domainCode === sec.code);
                  return (
                    <div key={sec.code} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-navy-800">
                        <span>{sec.shortTitle}</span>
                        <span className="font-mono text-slate-500">
                          No. {sec.startNumber}–{sec.endNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {secItems.map(({ q, idx }) => renderQuestionButton(q, idx))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`grid ${
                  questions.length >= 40 ? 'grid-cols-6 gap-1.5 max-h-[340px] overflow-y-auto pr-1' : 'grid-cols-5 gap-2'
                }`}
              >
                {questions.map((q, idx) => renderQuestionButton(q, idx))}
              </div>
            )}

            {hasAdaptiveQuestions && (
              <div className="px-2.5 py-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[9px] flex items-center justify-center shrink-0">
                  ✦
                </span>
                <span>
                  Nomor bertanda <strong>✦</strong> bersifat <strong>CAT Adaptif</strong> (menyesuaikan akurasi & jawaban Anda sebelumnya).
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-navy-900">
                  <span className="w-2.5 h-2.5 rounded-sm bg-navy-900 inline-block" />
                  <span>Dijawab</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{answeredCount}</div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-amber-900">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  <span>Ragu</span>
                </div>
                <div className="text-sm font-bold text-amber-900 mt-0.5">{doubtfulCount}</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-400 inline-block" />
                  <span>Kosong</span>
                </div>
                <div className="text-sm font-bold text-slate-700 mt-0.5">{unansweredCount}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <Keyboard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Pintasan: Tekan <strong>1–6 / A–F</strong> untuk memilih, <strong>← / →</strong> pindah soal.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {subtest.number < totalSubtests
                  ? `Selesaikan Subtes ${subtest.number} & Lanjut`
                  : 'Selesaikan Seluruh Tes & Lihat Hasil'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Akhiri Subtes {subtest.number}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Setelah mengakhiri <strong>{subtest.title}</strong>, Anda tidak dapat kembali ke subtes ini.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <div className="text-slate-500">Sudah Dijawab</div>
                <div className="text-base font-bold text-navy-900">{answeredCount}</div>
              </div>
              <div>
                <div className="text-slate-500">Ragu-ragu</div>
                <div className="text-base font-bold text-amber-700">{doubtfulCount}</div>
              </div>
              <div>
                <div className="text-slate-500">Belum Dijawab</div>
                <div className="text-base font-bold text-rose-700">{unansweredCount}</div>
              </div>
            </div>

            {(unansweredCount > 0 || doubtfulCount > 0) && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                Perhatian: Masih terdapat <strong>{unansweredCount} soal belum dijawab</strong> dan{' '}
                <strong>{doubtfulCount} soal ragu-ragu</strong>.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Kembali Periksa Soal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onFinishSubtest();
                }}
                className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs cursor-pointer"
              >
                Ya, Simpan & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
