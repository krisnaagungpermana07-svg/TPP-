import React, { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  FileText,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import AbstractPatternSVG from './AbstractPatternSVG';
import EmojiLikertScale, { PersonalitySceneSVG } from './EmojiLikertScale';
import MissingCharPanel from './MissingCharPanel';
import DataChartSVG from './DataChartSVG';
import { FiguralQuestionStimulus, FiguralOptionsGrid } from './VisualFiguralSVG';
import { getEffectiveSubtestMinutes } from '../utils/examAdapter';

export default function TransitionView({
  subtest,
  allSubtests,
  currentSubtestIndex,
  mode,
  autoAdvancedReason,
  onStartSubtest,
}) {
  const [sampleAnswer, setSampleAnswer] = useState(null);
  const [showSampleSolution, setShowSampleSolution] = useState(false);
  const [showEmojiLabels, setShowEmojiLabels] = useState(true);

  useEffect(() => {
    setSampleAnswer(null);
    setShowSampleSolution(false);
  }, [subtest.id]);

  const effectiveMinutes = getEffectiveSubtestMinutes(subtest, mode);
  const { sampleQuestion } = subtest;
  const stepperGridClass = allSubtests.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5';

  const hasVisualOptions =
    sampleQuestion?.options && sampleQuestion.options.some((o) => Boolean(o.svgSpec));
  const sampleCorrectSpec =
    showSampleSolution && hasVisualOptions
      ? sampleQuestion.options.find((o) => o.id === sampleQuestion.correctOption)?.svgSpec || null
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {autoAdvancedReason && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-amber-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Transisi Otomatis (Auto-Advance): </span>
            {autoAdvancedReason}
          </div>
        </div>
      )}

      {/* Dynamic Subtest Progress Stepper */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-3">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            Alur Tahapan Subtes (1 → {allSubtests.length})
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Clock className="w-3.5 h-3.5" />
            Waktu Membaca Instruksi Tidak Memotong Timer Soal
          </span>
        </div>

        <div className={`grid ${stepperGridClass} gap-2.5`}>
          {allSubtests.map((st, idx) => {
            const isCompleted = idx < currentSubtestIndex;
            const isCurrent = idx === currentSubtestIndex;
            return (
              <div
                key={st.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'bg-navy-900 text-white border-navy-950 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Subtes {st.number}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">Siap</span>
                  )}
                </div>
                <div className="truncate mt-0.5 font-medium opacity-90">{st.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Subtest Briefing Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-navy-900 text-white px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/15 text-white">
                Subtes {subtest.number} dari {allSubtests.length}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Kategori: {subtest.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{subtest.title}</h2>
            <p className="text-xs sm:text-sm text-navy-100 mt-1 max-w-2xl">
              {subtest.description}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-navy-800/90 border border-navy-700 px-4 py-3 rounded-xl">
            <div className="pr-3 border-r border-navy-700 text-center">
              <div className="text-[11px] uppercase text-navy-200">Jumlah Soal</div>
              <div className="text-lg font-bold font-mono">{subtest.questions.length} Soal</div>
            </div>
            <div className="pl-1 text-center">
              <div className="text-[11px] uppercase text-navy-200">Durasi Subtes</div>
              <div className="text-lg font-bold font-mono text-emerald-300">
                {effectiveMinutes} Menit
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-navy-800" />
              Petunjuk Pengerjaan Subtes {subtest.number}
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <ul className="space-y-2 text-sm text-slate-700">
                {subtest.instructions.map((inst, i) => {
                  const displayInst =
                    effectiveMinutes !== subtest.durationMinutes
                      ? inst.replace(
                          new RegExp(`\\b${subtest.durationMinutes}\\s*menit\\b`, 'gi'),
                          `${effectiveMinutes} menit (${
                            mode === 'fast' ? 'Drill Cepat 1/3' : 'Mode Kuota 120 Menit'
                          })`
                        )
                      : inst;
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{displayInst}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Interactive Sample Question */}
          {sampleQuestion && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-navy-800" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                    {sampleQuestion.tag || `Contoh Soal Subtes ${subtest.number}`}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Coba pilih salah satu opsi di bawah untuk melihat pembahasan contoh
                </span>
              </div>

              <div className="p-5 bg-white space-y-4">
                {sampleQuestion.passage && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                      Teks Wacana Contoh
                    </div>
                    {sampleQuestion.passage}
                  </div>
                )}

                {sampleQuestion.svgPatternId && (
                  <AbstractPatternSVG
                    patternId={sampleQuestion.svgPatternId}
                    showAnswerFrame={showSampleSolution}
                  />
                )}

                {sampleQuestion.figuralData && (
                  <FiguralQuestionStimulus
                    figuralData={sampleQuestion.figuralData}
                    answerSpec={sampleCorrectSpec}
                  />
                )}

                {sampleQuestion.chartData && (
                  <DataChartSVG chartData={sampleQuestion.chartData} />
                )}

                {sampleQuestion.isLikert && (
                  <PersonalitySceneSVG dimension={sampleQuestion.dimension} />
                )}

                {sampleQuestion.missingCharData && (
                  <MissingCharPanel missingCharData={sampleQuestion.missingCharData} />
                )}

                {sampleQuestion.comparisonPair && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {sampleQuestion.comparisonPair.labelLeft}
                      </div>
                      <div className="font-mono text-sm font-bold text-navy-950 break-all">
                        {sampleQuestion.comparisonPair.valueLeft}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {sampleQuestion.comparisonPair.labelRight}
                      </div>
                      <div className="font-mono text-sm font-bold text-navy-950 break-all">
                        {sampleQuestion.comparisonPair.valueRight}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm sm:text-base font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                  {sampleQuestion.prompt}
                </p>

                {/* Options: Emoji Likert OR Visual SVG Grid OR Standard List */}
                {sampleQuestion.isLikert ? (
                  <EmojiLikertScale
                    options={sampleQuestion.options}
                    selectedOptionId={sampleAnswer}
                    onSelect={(optId) => {
                      setSampleAnswer(optId);
                      setShowSampleSolution(true);
                    }}
                    correctOptionId={sampleQuestion.correctOption}
                    showSolution={showSampleSolution}
                    peeplOrder={Boolean(sampleQuestion.peeplOrder)}
                    showLabels={showEmojiLabels}
                    onToggleShowLabels={setShowEmojiLabels}
                    compact
                  />
                ) : hasVisualOptions ? (
                  <FiguralOptionsGrid
                    options={sampleQuestion.options}
                    selectedOptionId={sampleAnswer}
                    onSelect={(optId) => {
                      setSampleAnswer(optId);
                      setShowSampleSolution(true);
                    }}
                    correctOptionId={sampleQuestion.correctOption}
                    showSolution={showSampleSolution}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {sampleQuestion.options.map((opt) => {
                      const isSelected = sampleAnswer === opt.id;
                      const isCorrect = opt.id === sampleQuestion.correctOption;

                      let cardStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                      if (showSampleSolution) {
                        if (isCorrect) {
                          cardStyle =
                            'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          cardStyle = 'border-rose-400 bg-rose-50/60 text-rose-900';
                        }
                      } else if (isSelected) {
                        cardStyle = 'border-navy-800 bg-navy-50/70 text-navy-950 font-semibold';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSampleAnswer(opt.id);
                            setShowSampleSolution(true);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                                showSampleSolution && isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isSelected
                                  ? 'bg-navy-900 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {showSampleSolution && typeof opt.score === 'number' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-200 text-slate-700 shrink-0">
                              Skor: {opt.score}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSampleSolution((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 hover:text-navy-950 cursor-pointer"
                  >
                    {showSampleSolution ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan Kunci & Pembahasan Contoh</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Kunci & Pembahasan Contoh Soal</span>
                      </>
                    )}
                  </button>
                </div>

                {showSampleSolution && (
                  <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1">
                    <div className="font-bold">
                      Kunci Jawaban Contoh: Pilihan {sampleQuestion.correctOption}
                    </div>
                    <p className="leading-relaxed text-emerald-900">{sampleQuestion.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Countdown timer <strong>{effectiveMinutes} menit</strong> baru akan berjalan setelah tombol di kanan diklik.
              </span>
            </div>

            <button
              type="button"
              onClick={onStartSubtest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Mulai Subtes {subtest.number} Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
