import {
  resolveAdaptiveQuestion,
  buildQuestionLookup,
  getEffectiveSubtestMinutes,
} from './examAdapter.js';

/**
 * Utility functions for scoring, time formatting, psychological consistency checking,
 * dual adaptive CAT trace logging (Cognitive + Personality), and behavioral profiling.
 */

export function formatMMSS(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationHuman(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}j ${mins}m ${secs}d`;
  }
  if (mins > 0) {
    return `${mins} menit ${secs} detik`;
  }
  return `${secs} detik`;
}

export const DIMENSION_META = {
  integritas: {
    key: 'integritas',
    label: 'Integritas & Kepatuhan Etika',
    shortLabel: 'Integritas',
    description:
      'Konsistensi menjaga kejujuran, menolak gratifikasi, mendeklarasikan konflik kepentingan, dan mematuhi kode etik pengelolaan keuangan negara.',
  },
  resiliensi: {
    key: 'resiliensi',
    label: 'Resiliensi & Stabilitas Emosi',
    shortLabel: 'Resiliensi',
    description:
      'Ketenangan regulasi emosi, daya adaptasi terhadap perubahan regulasi mendadak, dan ketangguhan menyelesaikan target di bawah tekanan deadline.',
  },
  kerjaSama: {
    key: 'kerjaSama',
    label: 'Kerja Sama & Orientasi Pelayanan',
    shortLabel: 'Kerja Sama',
    description:
      'Empati dalam melayani publik/wajib pajak, keterbukaan terhadap masukan tim, serta inisiatif kolaborasi lintas unit.',
  },
  ketelitian: {
    key: 'ketelitian',
    label: 'Ketelitian & Akuntabilitas Prosedur',
    shortLabel: 'Ketelitian',
    description:
      'Kecermatan memverifikasi data dan dokumen, keteraturan kerja, disiplin terhadap tenggat waktu, serta akuntabilitas detail.',
  },
  komunikasiSosial: {
    key: 'komunikasiSosial',
    label: 'Komunikasi & Gaya Sosial (Ekstraversi)',
    shortLabel: 'Gaya Sosial',
    description:
      'Keseimbangan keterbukaan interpersonal, kemampuan mencairkan suasana, serta asertivitas menyampaikan gagasan dalam diskusi tim.',
  },
};

export function getDimensionLevel(percentage) {
  if (percentage >= 85) {
    return {
      grade: 'Sangat Tinggi (Optimal)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barClass: 'bg-emerald-600',
      interpretation:
        'Menunjukkan kematangan sikap kerja dan profil psikologis yang sangat kuat serta selaras penuh dengan nilai dasar ASN Kementerian Keuangan.',
    };
  }
  if (percentage >= 70) {
    return {
      grade: 'Tinggi (Memenuhi Standar)',
      badgeClass: 'bg-navy-50 text-navy-800 border-navy-200',
      barClass: 'bg-navy-700',
      interpretation:
        'Memiliki kecenderungan perilaku positif dan adaptif, namun masih dapat dipertajam pada situasi dilema atau tekanan tinggi.',
    };
  }
  if (percentage >= 55) {
    return {
      grade: 'Cukup (Perlu Penguatan)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      barClass: 'bg-amber-500',
      interpretation:
        'Cukup memahami norma kerja dasar, tetapi rentan ragu-ragu atau mengambil kompromi ketika menghadapi tekanan waktu maupun sosial.',
    };
  }
  return {
    grade: 'Perlu Pembinaan Intensif',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    barClass: 'bg-rose-600',
    interpretation:
      'Membutuhkan refleksi mendalam terkait konsistensi perilaku kerja, keterbukaan sosial, dan kepatuhan prosedur.',
  };
}

const OPTION_TO_LIKERT = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const PEEPL_OPTION_TO_LIKERT = { A: 5, B: 4, C: 3, D: 2, E: 1 };

function evaluateConsistencyPairs(consistencyPairs = [], answers = {}, questionLookup = {}) {
  if (!Array.isArray(consistencyPairs) || consistencyPairs.length === 0) {
    return {
      overallScore: 100,
      statusLabel: 'Terverifikasi',
      answeredPairs: 0,
      totalPairs: 0,
      details: [],
    };
  }

  let totalScoreSum = 0;
  let evaluatedCount = 0;

  const details = consistencyPairs.map((pair) => {
    const qA = questionLookup[pair.questionA];
    const qB = questionLookup[pair.questionB];
    const ansA = answers[pair.questionA];
    const ansB = answers[pair.questionB];

    const optA = qA?.options?.find((o) => o.id === ansA);
    const optB = qB?.options?.find((o) => o.id === ansB);
    const mapA = qA?.peeplOrder ? PEEPL_OPTION_TO_LIKERT : OPTION_TO_LIKERT;
    const mapB = qB?.peeplOrder ? PEEPL_OPTION_TO_LIKERT : OPTION_TO_LIKERT;

    const valA =
      typeof optA?.emojiLevel === 'number' ? optA.emojiLevel : mapA[ansA] || null;
    const valB =
      typeof optB?.emojiLevel === 'number' ? optB.emojiLevel : mapB[ansB] || null;
    const labelA = ansA ? optA?.text || `Skala ${valA}` : '—';
    const labelB = ansB ? optB?.text || `Skala ${valB}` : '—';

    if (!valA || !valB) {
      return {
        ...pair,
        valA,
        valB,
        labelA,
        labelB,
        status: 'incomplete',
        statusText: 'Belum Lengkap',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
        pairScore: null,
        note: 'Salah satu atau kedua butir pasangan belum dijawab.',
      };
    }

    evaluatedCount += 1;
    const deviation =
      pair.relation === 'same'
        ? Math.abs(valA - valB)
        : Math.abs(valA + valB - 6);

    let pairScore = 100;
    let status = 'consistent';
    let statusText = 'Konsisten';
    let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let note = 'Respons pada kedua pernyataan saling selaras dan dapat dipercaya.';

    if (deviation <= 1) {
      pairScore = 100;
    } else if (deviation === 2) {
      pairScore = 70;
      status = 'moderate';
      statusText = 'Cukup Selaras';
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      note = 'Terdapat sedikit perbedaan intensitas jawaban, namun masih dalam batas wajar.';
    } else {
      pairScore = 25;
      status = 'inconsistent';
      statusText = 'Kontradiktif';
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
      note =
        'Jawaban pada dua pernyataan yang berlawanan arah bertentangan. Dalam tes psikologi asli, pola ini menurunkan validitas profil.';
    }

    totalScoreSum += pairScore;
    return {
      ...pair,
      valA,
      valB,
      labelA,
      labelB,
      status,
      statusText,
      badgeClass,
      pairScore,
      note,
    };
  });

  const overallScore =
    evaluatedCount > 0 ? Math.round(totalScoreSum / evaluatedCount) : 0;

  let statusLabel = 'Belum Dievaluasi';
  if (evaluatedCount > 0) {
    if (overallScore >= 85) statusLabel = 'Sangat Konsisten (Valid)';
    else if (overallScore >= 65) statusLabel = 'Cukup Konsisten';
    else statusLabel = 'Terindikasi Inkonsistensi';
  }

  return {
    overallScore,
    statusLabel,
    answeredPairs: evaluatedCount,
    totalPairs: consistencyPairs.length,
    details,
  };
}

export function calculateExamResults(
  rawPackageSubtests,
  answers,
  subtestTimeSpent,
  warningCount,
  mode,
  consistencyPairs = [],
  activeSubtests = null
) {
  const timingSubtests =
    Array.isArray(activeSubtests) && activeSubtests.length > 0
      ? activeSubtests
      : rawPackageSubtests;

  const fullQuestionLookup = buildQuestionLookup(rawPackageSubtests);

  let totalTimeSpentSeconds = 0;
  let totalAllocatedSeconds = 0;

  const activeTimeBreakdown = timingSubtests.map((st) => {
    const allocatedSec = Math.max(60, getEffectiveSubtestMinutes(st, mode) * 60);
    const spentSec = Math.min(allocatedSec, Math.max(0, subtestTimeSpent[st.id] || 0));
    totalTimeSpentSeconds += spentSec;
    totalAllocatedSeconds += allocatedSec;
    return {
      id: st.id,
      number: st.number,
      title: st.title,
      shortTitle:
        st.code === 'PENALARAN'
          ? 'Penalaran'
          : st.code === 'SJT_KEPRIBADIAN'
          ? 'Potensi Pribadi'
          : `Subtes ${st.number}`,
      spentSeconds: spentSec,
      allocatedSeconds: allocatedSec,
    };
  });

  const cognitiveSubtests = [];
  const cognitiveAdaptiveTrace = [];
  let totalCognitiveQuestions = 0;
  let totalCognitiveCorrect = 0;
  let totalCognitiveAnswered = 0;
  let totalQuestionsAll = 0;
  let totalAnsweredAll = 0;

  const penalaranModuleSpent = subtestTimeSpent['modul-penalaran'] || 0;
  const isTwoModul = timingSubtests.some((s) => s.code === 'PENALARAN');
  const totalCogQCountForSplit = rawPackageSubtests
    .filter((s) => s.code !== 'SJT_KEPRIBADIAN')
    .reduce((acc, s) => acc + s.questions.length, 0);

  let sjtSubtestReport = null;

  rawPackageSubtests.forEach((subtest) => {
    const qCount = subtest.questions.length;
    totalQuestionsAll += qCount;

    if (subtest.code !== 'SJT_KEPRIBADIAN') {
      let correctCount = 0;
      let answeredCount = 0;

      subtest.questions.forEach((rawQ) => {
        const q = resolveAdaptiveQuestion(rawQ, answers, fullQuestionLookup);
        const userAns = answers[q.id];
        const isCorrect = Boolean(userAns && userAns === q.correctOption);
        if (userAns) {
          answeredCount += 1;
          totalAnsweredAll += 1;
          if (isCorrect) {
            correctCount += 1;
          }
        }
        if (q.adaptiveResolved) {
          cognitiveAdaptiveTrace.push({
            questionId: q.id,
            domainTitle: subtest.title,
            questionNumber: q.number,
            branchName: q.adaptiveResolved.branchName,
            branchKey: q.adaptiveResolved.branchKey,
            sourceLabel: q.adaptiveResolved.sourceLabel,
            triggerAnswerText: q.adaptiveResolved.triggerAnswerText,
            isCorrect,
            answered: Boolean(userAns),
          });
        }
      });

      totalCognitiveQuestions += qCount;
      totalCognitiveCorrect += correctCount;
      totalCognitiveAnswered += answeredCount;

      const accuracy = qCount > 0 ? Math.round((correctCount / qCount) * 100) : 0;
      const domainSpentSec = isTwoModul
        ? totalCogQCountForSplit > 0
          ? Math.round((penalaranModuleSpent * qCount) / totalCogQCountForSplit)
          : 0
        : subtestTimeSpent[subtest.id] || 0;
      const avgTimePerQuestion = qCount > 0 ? Math.round(domainSpentSec / qCount) : 0;

      cognitiveSubtests.push({
        id: subtest.id,
        number: subtest.number,
        code: subtest.code,
        title: subtest.title,
        totalQuestions: qCount,
        answeredCount,
        correctCount,
        incorrectCount: answeredCount - correctCount,
        unansweredCount: qCount - answeredCount,
        accuracy,
        spentSeconds: domainSpentSec,
        avgTimePerQuestion,
      });
    } else {
      let totalSjtPoints = 0;
      const maxSjtPoints = qCount * 5;
      let answeredCount = 0;
      let optimalCount = 0;
      const adaptiveTrace = [];

      const dimensionsRaw = {
        integritas: { earned: 0, max: 0, count: 0 },
        resiliensi: { earned: 0, max: 0, count: 0 },
        kerjaSama: { earned: 0, max: 0, count: 0 },
        ketelitian: { earned: 0, max: 0, count: 0 },
        komunikasiSosial: { earned: 0, max: 0, count: 0 },
      };

      subtest.questions.forEach((rawQ) => {
        const q = resolveAdaptiveQuestion(rawQ, answers, fullQuestionLookup);
        const dimKey = q.dimension || 'integritas';
        if (!dimensionsRaw[dimKey]) {
          dimensionsRaw[dimKey] = { earned: 0, max: 0, count: 0 };
        }
        dimensionsRaw[dimKey].max += 5;
        dimensionsRaw[dimKey].count += 1;

        const userAns = answers[q.id];
        const chosenOpt = userAns ? q.options.find((o) => o.id === userAns) : null;
        if (userAns) {
          answeredCount += 1;
          totalAnsweredAll += 1;
          const pts = chosenOpt && typeof chosenOpt.score === 'number' ? chosenOpt.score : 0;
          totalSjtPoints += pts;
          dimensionsRaw[dimKey].earned += pts;
          if (pts === 5 || userAns === q.correctOption) {
            optimalCount += 1;
          }
        }

        if (q.adaptiveResolved) {
          adaptiveTrace.push({
            questionId: q.id,
            questionNumber: q.number,
            branchName: q.adaptiveResolved.branchName,
            branchKey: q.adaptiveResolved.branchKey,
            sourceLabel: q.adaptiveResolved.sourceLabel,
            triggerAnswerText: q.adaptiveResolved.triggerAnswerText,
            userAnswerText: chosenOpt ? chosenOpt.text : 'Tidak Dijawab',
            earnedScore: chosenOpt?.score || 0,
          });
        }
      });

      const sjtPercentage =
        maxSjtPoints > 0 ? Math.round((totalSjtPoints / maxSjtPoints) * 100) : 0;

      const dimensionsProfile = Object.keys(DIMENSION_META)
        .filter((key) => dimensionsRaw[key] && dimensionsRaw[key].count > 0)
        .map((key) => {
          const raw = dimensionsRaw[key];
          const pct = raw.max > 0 ? Math.round((raw.earned / raw.max) * 100) : 0;
          const level = getDimensionLevel(pct);
          return {
            ...DIMENSION_META[key],
            earnedPoints: raw.earned,
            maxPoints: raw.max,
            questionCount: raw.count,
            percentage: pct,
            ...level,
          };
        });

      const consistencyReport = evaluateConsistencyPairs(
        consistencyPairs,
        answers,
        fullQuestionLookup
      );
      const sjtSpentSec = isTwoModul
        ? subtestTimeSpent['modul-potensi-pribadi'] || 0
        : subtestTimeSpent[subtest.id] || 0;

      sjtSubtestReport = {
        id: subtest.id,
        number: subtest.number,
        code: subtest.code,
        title: subtest.title,
        totalQuestions: qCount,
        answeredCount,
        unansweredCount: qCount - answeredCount,
        optimalCount,
        earnedPoints: totalSjtPoints,
        maxPoints: maxSjtPoints,
        percentage: sjtPercentage,
        spentSeconds: sjtSpentSec,
        avgTimePerQuestion: qCount > 0 ? Math.round(sjtSpentSec / qCount) : 0,
        dimensionsProfile,
        consistencyReport,
        adaptiveTrace,
      };
    }
  });

  const cognitiveAccuracy =
    totalCognitiveQuestions > 0
      ? Math.round((totalCognitiveCorrect / totalCognitiveQuestions) * 100)
      : 0;

  const sjtScorePct = sjtSubtestReport ? sjtSubtestReport.percentage : 0;
  const compositeScore = Math.round(cognitiveAccuracy * 0.7 + sjtScorePct * 0.3);
  const avgTimePerQuestionOverall =
    totalQuestionsAll > 0 ? Math.round(totalTimeSpentSeconds / totalQuestionsAll) : 0;
  const isRecommended = cognitiveAccuracy >= 65 && sjtScorePct >= 75 && warningCount <= 3;

  return {
    compositeScore,
    isRecommended,
    cognitiveAccuracy,
    totalCognitiveCorrect,
    totalCognitiveQuestions,
    totalCognitiveAnswered,
    cognitiveSubtests,
    cognitiveAdaptiveTrace,
    sjtSubtestReport,
    totalTimeSpentSeconds,
    totalAllocatedSeconds,
    activeTimeBreakdown,
    totalQuestionsAll,
    totalAnsweredAll,
    avgTimePerQuestionOverall,
    warningCount,
  };
}
