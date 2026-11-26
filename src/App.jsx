import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import questionsData from './data/questions.json';
import LobbyView from './components/LobbyView';
import TopBar from './components/TopBar';
import TransitionView from './components/TransitionView';
import ExamView from './components/ExamView';
import ResultView from './components/ResultView';
import { buildActiveSubtests, buildQuestionLookup, resolveAdaptiveQuestion } from './utils/examAdapter';
import { ShieldAlert, X } from 'lucide-react';

export default function App() {
  const packages = questionsData.packages || [];

  // Phase: 'lobby' | 'transition' | 'exam' | 'result'
  const [phase, setPhase] = useState('lobby');
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('STAN-2026-04829');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || 'paket-1');
  const [examFormat, setExamFormat] = useState('2-modul'); // '2-modul' (PPT) | '5-subtes'
  const [mode, setMode] = useState('full'); // 'full' | 'fast'

  // Subtest & Question pointers
  const [currentSubtestIndex, setCurrentSubtestIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers & Doubtful Flags
  const [answers, setAnswers] = useState({});
  const [doubtfulMap, setDoubtfulMap] = useState({});

  // Independent Subtest Timer & Time Spent Tracking
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [allocatedSeconds, setAllocatedSeconds] = useState(0);
  const [subtestTimeSpent, setSubtestTimeSpent] = useState({});
  const [autoAdvancedReason, setAutoAdvancedReason] = useState(null);
  const [completedAt, setCompletedAt] = useState('');

  // Focus & Anti-Distraction State
  const [warningCount, setWarningCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningBannerMessage, setWarningBannerMessage] = useState(null);

  const lastViolationTimestampRef = useRef(0);
  const currentPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const activeSubtests = useMemo(
    () => buildActiveSubtests(currentPackage, examFormat),
    [currentPackage, examFormat]
  );
  const questionLookup = useMemo(
    () => buildQuestionLookup(currentPackage.subtests),
    [currentPackage]
  );
  const currentSubtest = activeSubtests[currentSubtestIndex] || activeSubtests[0];

  // Always reset scroll cleanly on phase or subtest transitions
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [phase, currentSubtestIndex]);

  // Guard against accidental tab refresh/close while an exam session is in progress
  useEffect(() => {
    if (phase !== 'exam' && phase !== 'transition') return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  const getSubtestAllocatedSeconds = useCallback((subtestObj, selectedMode) => {
    const multiplier = selectedMode === 'fast' ? 1 / 3 : 1;
    return Math.max(60, Math.round(subtestObj.durationMinutes * 60 * multiplier));
  }, []);

  // Start assessment from Lobby -> moves to Subtest 1 Transition Page
  const handleStartAssessment = ({
    name,
    participantId: pid,
    packageId,
    examFormat: chosenFormat,
    mode: chosenMode,
    enterFullscreen,
  }) => {
    const chosenPkg = packages.find((p) => p.id === packageId) || packages[0];
    const nextFormat = chosenFormat || '2-modul';
    const nextActiveSubtests = buildActiveSubtests(chosenPkg, nextFormat);

    setSelectedPackageId(chosenPkg.id);
    setExamFormat(nextFormat);
    setParticipantName(name);
    setParticipantId(pid);
    setMode(chosenMode);
    setCurrentSubtestIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setDoubtfulMap({});
    setSubtestTimeSpent({});
    setWarningCount(0);
    setAutoAdvancedReason(null);
    setWarningBannerMessage(null);

    const firstAlloc = getSubtestAllocatedSeconds(nextActiveSubtests[0], chosenMode);
    setAllocatedSeconds(firstAlloc);
    setTimeLeftSeconds(firstAlloc);
    setPhase('transition');

    if (enterFullscreen && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Start active Subtest timer from Transition Page
  const handleStartSubtest = () => {
    const alloc = getSubtestAllocatedSeconds(currentSubtest, mode);
    setAllocatedSeconds(alloc);
    setTimeLeftSeconds(alloc);
    setCurrentQuestionIndex(0);
    setAutoAdvancedReason(null);
    setPhase('exam');
  };

  // Advance to next subtest transition or finish exam
  const handleFinishCurrentSubtest = useCallback(
    (fromTimeout = false) => {
      const spent = Math.max(0, allocatedSeconds - (fromTimeout ? 0 : timeLeftSeconds));
      setSubtestTimeSpent((prev) => ({
        ...prev,
        [currentSubtest.id]: spent,
      }));

      const nextIndex = currentSubtestIndex + 1;
      if (nextIndex < activeSubtests.length) {
        const nextSubtest = activeSubtests[nextIndex];
        const nextAlloc = getSubtestAllocatedSeconds(nextSubtest, mode);
        setCurrentSubtestIndex(nextIndex);
        setCurrentQuestionIndex(0);
        setAllocatedSeconds(nextAlloc);
        setTimeLeftSeconds(nextAlloc);
        setAutoAdvancedReason(
          fromTimeout
            ? `Waktu pengerjaan Subtes ${currentSubtest.number} (${currentSubtest.title}) telah habis. Seluruh jawaban Anda telah disimpan secara otomatis.`
            : null
        );
        setPhase('transition');
      } else {
        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setCompletedAt(`${nowStr} WIB`);
        setPhase('result');
      }
    },
    [
      allocatedSeconds,
      timeLeftSeconds,
      currentSubtest,
      currentSubtestIndex,
      activeSubtests,
      getSubtestAllocatedSeconds,
      mode,
    ]
  );

  // Countdown Timer Effect (Runs ONLY during 'exam' phase)
  useEffect(() => {
    if (phase !== 'exam') return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentSubtestIndex]);

  // Auto-advance trigger when timeLeftSeconds reaches 0 in 'exam' phase
  useEffect(() => {
    if (phase === 'exam' && timeLeftSeconds === 0 && allocatedSeconds > 0) {
      handleFinishCurrentSubtest(true);
    }
  }, [phase, timeLeftSeconds, allocatedSeconds, handleFinishCurrentSubtest]);

  const recordFocusViolation = useCallback((reason) => {
    const now = Date.now();
    if (now - lastViolationTimestampRef.current < 1200) return;
    lastViolationTimestampRef.current = now;

    setWarningCount((prev) => prev + 1);
    setWarningBannerMessage(reason);
  }, []);

  // Anti-Distraction Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
        if (phase === 'exam') {
          recordFocusViolation(
            'Terdeteksi berpindah tab browser atau meminimalkan jendela selama subtes berlangsung.'
          );
        }
      } else {
        setIsWindowFocused(true);
      }
    };

    const handleWindowBlur = () => {
      setIsWindowFocused(false);
      if (phase === 'exam') {
        recordFocusViolation(
          'Terdeteksi kehilangan fokus jendela ujian (membuka aplikasi lain di luar browser).'
        );
      }
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    const handleFullscreenChange = () => {
      const isNowFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFull);
      if (!isNowFull && phase === 'exam') {
        recordFocusViolation(
          'Terdeteksi keluar dari mode Layar Penuh (Fullscreen) saat pengerjaan subtes.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase, recordFocusViolation]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Select answer + cleanly reset dependent adaptive question (personality OR cognitive difficulty) if its branch changed
  const handleSelectAnswer = useCallback(
    (questionId, optionId) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: optionId };
        if (currentSubtest?.questions) {
          currentSubtest.questions.forEach((q) => {
            const dependsPersonality = q.adaptiveConfig && q.adaptiveConfig.dependsOn === questionId;
            const dependsCognitive =
              q.adaptiveDifficulty &&
              Array.isArray(q.adaptiveDifficulty.checkQuestionIds) &&
              q.adaptiveDifficulty.checkQuestionIds.includes(questionId);

            if (dependsPersonality || dependsCognitive) {
              const oldBranch = resolveAdaptiveQuestion(q, prev, questionLookup).adaptiveResolved?.branchKey;
              const newBranch = resolveAdaptiveQuestion(q, next, questionLookup).adaptiveResolved?.branchKey;
              if (oldBranch !== newBranch && next[q.id]) {
                delete next[q.id];
              }
            }
          });
        }
        return next;
      });
    },
    [currentSubtest, questionLookup]
  );

  const handleClearAnswer = useCallback((questionId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const handleToggleDoubtful = useCallback((questionId) => {
    setDoubtfulMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  const handleRestartSimulation = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setPhase('lobby');
  };

  if (phase === 'lobby') {
    return (
      <LobbyView
        examData={questionsData}
        onStartAssessment={handleStartAssessment}
      />
    );
  }

  if (phase === 'result') {
    return (
      <ResultView
        currentPackage={currentPackage}
        activeSubtests={activeSubtests}
        examFormat={examFormat}
        participantName={participantName}
        participantId={participantId}
        mode={mode}
        answers={answers}
        subtestTimeSpent={subtestTimeSpent}
        warningCount={warningCount}
        completedAt={completedAt}
        onRestart={handleRestartSimulation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar
        participantName={participantName}
        packageCode={currentPackage.code}
        mode={mode}
        phase={phase}
        currentSubtest={currentSubtest}
        totalSubtests={activeSubtests.length}
        timeLeftSeconds={timeLeftSeconds}
        allocatedSeconds={allocatedSeconds}
        warningCount={warningCount}
        isWindowFocused={isWindowFocused}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onSimulateTabWarning={() =>
          recordFocusViolation(
            'Simulasi Uji Peringatan Fokus: Sistem mencatat aktivitas perpindahan fokus layar.'
          )
        }
      />

      {/* Non-blocking Anti-Distraction Warning Toast Banner */}
      {warningBannerMessage && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-sm no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong>Peringatan Anti-Distraksi #{warningCount}:</strong> {warningBannerMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWarningBannerMessage(null)}
              className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
              title="Tutup peringatan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {phase === 'transition' ? (
          <TransitionView
            subtest={currentSubtest}
            allSubtests={activeSubtests}
            currentSubtestIndex={currentSubtestIndex}
            mode={mode}
            autoAdvancedReason={autoAdvancedReason}
            onStartSubtest={handleStartSubtest}
          />
        ) : (
          <ExamView
            subtest={currentSubtest}
            totalSubtests={activeSubtests.length}
            questionLookup={questionLookup}
            currentQuestionIndex={currentQuestionIndex}
            onSelectQuestionIndex={setCurrentQuestionIndex}
            answers={answers}
            doubtfulMap={doubtfulMap}
            onSelectAnswer={handleSelectAnswer}
            onClearAnswer={handleClearAnswer}
            onToggleDoubtful={handleToggleDoubtful}
            onFinishSubtest={() => handleFinishCurrentSubtest(false)}
            warningCount={warningCount}
            isWindowFocused={isWindowFocused}
          />
        )}
      </main>
    </div>
  );
}
