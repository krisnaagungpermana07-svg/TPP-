/**
 * Dual Adaptive CAT Engine & 2-Subtest / 5-Subtest Structure Adapter.
 *
 * 1. Personality Adaptive Branching (`adaptiveConfig`):
 *    Dynamically tailors follow-up Potensi Pribadi items based on prior personality responses.
 * 2. Cognitive Adaptive Difficulty (`adaptiveDifficulty`):
 *    Dynamically escalates calibration items to Level Sulit (HOTS) when prior domain items
 *    are answered accurately, or serves Level Standar (Kalibrasi) otherwise.
 */

const STANDARD_TO_LIKERT = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const PEEPL_TO_LIKERT = { A: 5, B: 4, C: 3, D: 2, E: 1 };

const STANDARD_LABELS = {
  A: 'Sangat Tidak Sesuai (1)',
  B: 'Tidak Sesuai (2)',
  C: 'Netral (3)',
  D: 'Sesuai (4)',
  E: 'Sangat Sesuai (5)',
};

const PEEPL_LABELS = {
  A: 'Sangat sesuai',
  B: 'Sesuai',
  C: 'Ragu-ragu',
  D: 'Tidak sesuai',
  E: 'Sangat tidak sesuai',
};

/**
 * Resolves a question dynamically for BOTH Cognitive Adaptive Difficulty and Personality Branching.
 */
export function resolveAdaptiveQuestion(question, answers = {}, questionLookup = {}) {
  if (!question) return question;

  // 1. Cognitive Adaptive Difficulty (Tes Penalaran)
  if (question.adaptiveDifficulty) {
    const { checkQuestionIds = [], domainLabel = 'Penalaran', hard, standard } = question.adaptiveDifficulty;
    let correctSoFar = 0;
    let answeredSoFar = 0;

    checkQuestionIds.forEach((qid) => {
      const refQ = questionLookup[qid];
      const userAns = answers[qid];
      if (userAns) {
        answeredSoFar += 1;
        if (refQ && userAns === refQ.correctOption) {
          correctSoFar += 1;
        }
      }
    });

    const isHardTier = answeredSoFar > 0 && correctSoFar >= Math.ceil(checkQuestionIds.length * 0.65);
    const branchKey = isHardTier ? 'hard' : 'standard';
    const chosen = isHardTier ? hard : standard;

    if (chosen) {
      return {
        ...question,
        prompt: chosen.prompt ?? question.prompt,
        passageTitle: chosen.passageTitle ?? question.passageTitle,
        passage: chosen.passage ?? question.passage,
        tableData: chosen.tableData ?? question.tableData,
        chartData: chosen.chartData ?? question.chartData,
        figuralData: chosen.figuralData ?? question.figuralData,
        options: chosen.options ?? question.options,
        correctOption: chosen.correctOption ?? question.correctOption,
        explanation: chosen.explanation ?? question.explanation,
        adaptiveResolved: {
          isAdaptive: true,
          kind: 'cognitive',
          branchKey,
          branchName:
            chosen.difficultyBadge ||
            (isHardTier ? 'Adaptif Naik: Level Sulit (HOTS)' : 'Adaptif Kalibrasi: Level Standar'),
          sourceLabel: `Akurasi awal ${domainLabel}`,
          triggerAnswerText:
            answeredSoFar === 0
              ? 'Belum ada respons sebelumnya (Kalibrasi Standar)'
              : `${correctSoFar}/${checkQuestionIds.length} benar (${isHardTier ? 'Naik ke HOTS' : 'Level Standar'})`,
        },
      };
    }
  }

  // 2. Personality Adaptive Branching (Tes Potensi Pribadi)
  if (question.adaptiveConfig) {
    const { dependsOn, sourceLabel, branches } = question.adaptiveConfig;
    const triggerAns = answers[dependsOn];
    const triggerQ = questionLookup[dependsOn];
    const triggerOpt = triggerQ?.options?.find((o) => o.id === triggerAns);

    const isPeeplOrder = Boolean(triggerQ ? triggerQ.peeplOrder : question.peeplOrder);
    const scaleMap = isPeeplOrder ? PEEPL_TO_LIKERT : STANDARD_TO_LIKERT;
    const labelMap = isPeeplOrder ? PEEPL_LABELS : STANDARD_LABELS;

    const likertVal =
      typeof triggerOpt?.emojiLevel === 'number'
        ? triggerOpt.emojiLevel
        : scaleMap[triggerAns] || null;
    const resolvedTriggerLabel = triggerAns
      ? triggerOpt?.text || labelMap[triggerAns] || triggerAns
      : 'Belum Dijawab (Default Netral)';

    let branchKey = 'neutral';
    if (likertVal !== null) {
      if (likertVal >= 4) branchKey = 'high';
      else if (likertVal <= 2) branchKey = 'low';
      else branchKey = 'neutral';
    }

    const chosenBranch = branches?.[branchKey] || branches?.neutral || null;
    if (chosenBranch) {
      return {
        ...question,
        prompt: chosenBranch.prompt || question.prompt,
        explanation: chosenBranch.explanation || question.explanation,
        options: chosenBranch.options || question.options,
        correctOption: chosenBranch.correctOption || question.correctOption,
        adaptiveResolved: {
          isAdaptive: true,
          kind: 'personality',
          branchKey,
          branchName: chosenBranch.branchName,
          dependsOn,
          sourceLabel,
          triggerAnswerId: triggerAns || null,
          triggerAnswerText: resolvedTriggerLabel,
        },
      };
    }
  }

  return question;
}

/**
 * Helper to create a flat { [questionId]: question } map across all subtests of a package.
 */
export function buildQuestionLookup(subtests = []) {
  const map = {};
  subtests.forEach((st) => {
    (st.questions || []).forEach((q) => {
      map[q.id] = q;
    });
  });
  return map;
}

/**
 * Builds the active subtests array for the chosen exam format ('2-modul' | '5-subtes').
 */
export function buildActiveSubtests(pkg, examFormat = '2-modul') {
  if (!pkg || !Array.isArray(pkg.subtests)) return [];

  const rawSubtests = pkg.subtests;

  if (examFormat === '5-subtes') {
    return rawSubtests.map((st) => ({
      ...st,
      questions: st.questions.map((q) => ({
        ...q,
        domainCode: st.code,
        domainTitle: st.title,
        domainNumber: st.number,
      })),
    }));
  }

  const cognitiveSubtests = rawSubtests.filter((st) => st.code !== 'SJT_KEPRIBADIAN');
  const personalitySubtest = rawSubtests.find((st) => st.code === 'SJT_KEPRIBADIAN');

  const combinedCognitiveQuestions = [];
  let runningNum = 1;
  const domainSections = [];

  cognitiveSubtests.forEach((st) => {
    const startNumber = runningNum;
    st.questions.forEach((q) => {
      combinedCognitiveQuestions.push({
        ...q,
        number: runningNum,
        originalNumber: q.number,
        domainCode: st.code,
        domainTitle: st.title,
        domainNumber: st.number,
        subCategory: q.subCategory || st.title,
      });
      runningNum += 1;
    });
    domainSections.push({
      code: st.code,
      title: st.title,
      shortTitle:
        st.code === 'VERBAL'
          ? 'Verbal'
          : st.code === 'NUMERIK'
          ? 'Numerik'
          : st.code === 'ABSTRAK'
          ? 'Figural/Logika'
          : 'Kecermatan',
      startNumber,
      endNumber: runningNum - 1,
    });
  });

  const totalCognitiveMins = cognitiveSubtests.reduce((acc, st) => acc + st.durationMinutes, 0);

  const penalaranModule = {
    id: 'modul-penalaran',
    number: 1,
    code: 'PENALARAN',
    title: 'Tes Penalaran (Kognitif Adaptif PEEPL)',
    category: 'Penalaran',
    durationMinutes: totalCognitiveMins,
    description:
      'Format PEEPL TPP 2026: VCR-S 3 opsi + VGR (1–10), NCR-S Grafik & Tabel 6 opsi + Analogi Angka NGR (11–20), Figural SVG opsi gambar A–E & Ability to Learn (21–30), serta Kecermatan Hilang Karakter & Klerikal (31–40) dengan kalibrasi soal adaptif (✦).',
    instructions: [
      `Subtes Penalaran ini terdiri dari ${combinedCognitiveQuestions.length} soal terpadu dengan total durasi efektif ${totalCognitiveMins} menit (siapkan kertas HVS coretan untuk hitungan manual Numerik).`,
      'Soal mencakup 4 klaster format PEEPL: Verbal (VCR-S 3 opsi & VGR), Numerik (NCR-S Grafik/Tabel 6 opsi A–F & Analogi Angka NGR), Figural SVG (opsi gambar A–E) + Ability to Learn, serta Kecermatan Hilang Karakter.',
      'Sistem CAT Adaptif aktif: Butir bertanda ✦ otomatis menyesuaikan tingkat kesulitan (Level Sulit HOTS vs Level Standar) berdasarkan akurasi jawaban Anda sebelumnya.',
      'Pada halaman evaluasi akhir, skor tetap dipecah dalam grafik terpisah untuk keempat klaster kognitif tersebut.',
    ],
    sampleQuestion: cognitiveSubtests[0]?.sampleQuestion || null,
    domainSections,
    questions: combinedCognitiveQuestions,
  };

  const potensiPribadiModule = personalitySubtest
    ? {
        ...personalitySubtest,
        id: 'modul-potensi-pribadi',
        number: 2,
        code: 'SJT_KEPRIBADIAN',
        title: 'Tes Potensi Pribadi (P2 Karakter Bergerak & Adaptif)',
        category: 'Potensi Pribadi',
        description:
          'Format Kuesioner P2 PEEPL dengan 5 karakter orang bergerak (Sangat sesuai → Sangat tidak sesuai), Kepribadian 1 (3 pilihan karakter Setuju/?/Tidak setuju), SJT Split-Pane, Soal Adaptif (✦), serta Indeks Konsistensi.',
        instructions: [
          `Subtes Potensi Pribadi terdiri dari ${personalitySubtest.questions.length} butir soal dengan durasi ${personalitySubtest.durationMinutes} menit (14 butir P2 PEEPL 5 karakter bergerak, 4 butir Kepribadian 1 skala 3 karakter, dan 2 SJT Split-Pane).`,
          'Pilih gambar karakter orang bergerak yang paling mencerminkan diri Anda. Anda juga dapat mematikan opsi "Tampilkan tulisan di bawah gambar karakter" agar persis seperti simulasi P2 PEEPL asli.',
          'Sistem Adaptif Aktif: Soal bertanda ✦ akan berubah otomatis mengikuti profil jawaban kepribadian Anda sebelumnya (misalnya jalur Reflektif/Pendiam vs Ekspresif).',
          'Sistem juga mengevaluasi Indeks Konsistensi Psikologi (Validity Check) dan memetakan 5 dimensi sikap kerja utama.',
        ],
        questions: personalitySubtest.questions.map((q) => ({
          ...q,
          domainCode: 'SJT_KEPRIBADIAN',
          domainTitle: 'Potensi Pribadi',
          domainNumber: 5,
        })),
      }
    : null;

  return potensiPribadiModule ? [penalaranModule, potensiPribadiModule] : [penalaranModule];
}
