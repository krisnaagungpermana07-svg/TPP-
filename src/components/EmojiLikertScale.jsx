import React from 'react';

/**
 * Animated PEEPL P2 Character Gesture Illustrations (Orang yang bergerak):
 * - Level 5 (Sangat sesuai): Beaming character nodding happily with TWO raised thumbs up & sparkles
 * - Level 4 (Sesuai): Warm smiling character gently nodding with one raised thumb
 * - Level 3 (Ragu-ragu / ?): Pondering character with hand on chin, head tilting + floating '?'
 * - Level 2 (Tidak sesuai): Mildly displeased character wagging raised index finger left-right
 * - Level 1 (Sangat tidak sesuai): Firmly frowning character shaking head with arms crossed in an X
 */
export function AnimatedCharacterSVG({ level, active = false, size = 76 }) {
  const skin = '#fde0c4';
  const skinShadow = '#f4c59c';
  const hair = '#1e293b';
  const shirtMap = {
    5: active ? '#059669' : '#10b981',
    4: active ? '#0284c7' : '#38bdf8',
    3: active ? '#d97706' : '#f59e0b',
    2: active ? '#ea580c' : '#fb923c',
    1: active ? '#e11d48' : '#f43f5e',
  };
  const bgMap = {
    5: active ? '#d1fae5' : '#ecfdf5',
    4: active ? '#bae6fd' : '#f0f9ff',
    3: active ? '#fef08a' : '#fefce8',
    2: active ? '#fed7aa' : '#fff7ed',
    1: active ? '#fecdd3' : '#fff1f2',
  };
  const ringMap = {
    5: '#059669',
    4: '#0284c7',
    3: '#d97706',
    2: '#ea580c',
    1: '#e11d48',
  };

  const shirt = shirtMap[level] || '#334e68';
  const bg = bgMap[level] || '#f8fafc';
  const ring = ringMap[level] || '#334e68';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Soft circular backdrop */}
      <circle cx="48" cy="48" r="44" fill={bg} stroke={active ? ring : '#cbd5e1'} strokeWidth={active ? 2.5 : 1.5} />

      {/* Torso / Shirt base */}
      <path
        d="M24 85 C25 68, 34 62, 48 62 C62 62, 71 68, 72 85 Z"
        fill={shirt}
        stroke="#102a43"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* White Collar */}
      <path d="M40 62 L48 70 L56 62" fill="#ffffff" stroke="#102a43" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Neck */}
      <rect x="43.5" y="54" width="9" height="10" rx="4" fill={skinShadow} />

      {/* LEVEL 5: Sangat Sesuai — Happy nod + TWO animated thumbs up + sparkles */}
      {level === 5 && (
        <g>
          {/* Sparkles */}
          <g className="anim-sparkle" fill="#059669">
            <path d="M16 24 L18 19 L20 24 L25 26 L20 28 L18 33 L16 28 L11 26 Z" />
            <path d="M77 20 L78.5 16 L80 20 L84 21.5 L80 23 L78.5 27 L77 23 L73 21.5 Z" />
          </g>
          {/* Head */}
          <g className="anim-nod-happy">
            <circle cx="48" cy="39" r="18" fill={skin} stroke="#102a43" strokeWidth="2.2" />
            {/* Hair */}
            <path d="M30 37 C30 23, 40 18, 49 18 C59 18, 66 24, 66 36 C61 29, 53 27, 46 28 C38 29, 34 32, 30 37 Z" fill={hair} />
            {/* Happy curved eyes */}
            <path d="M38 38 C40 34.5, 44 34.5, 45.5 38" stroke="#102a43" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50.5 38 C52 34.5, 56 34.5, 58 38" stroke="#102a43" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rosy cheeks */}
            <circle cx="36" cy="43" r="2.6" fill="#fda4af" opacity="0.65" />
            <circle cx="60" cy="43" r="2.6" fill="#fda4af" opacity="0.65" />
            {/* Big beaming smile */}
            <path d="M39 44.5 C42 52, 54 52, 57 44.5 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
          </g>
          {/* Two Thumbs Up */}
          <g className="anim-thumbs-bounce">
            {/* Left thumb up */}
            <rect x="14" y="55" width="12" height="13" rx="4" fill={skin} stroke="#102a43" strokeWidth="2" />
            <path d="M22 55 L22 46 C22 44, 26 44, 26 47 L26 55" fill={skin} stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
            {/* Right thumb up */}
            <rect x="70" y="55" width="12" height="13" rx="4" fill={skin} stroke="#102a43" strokeWidth="2" />
            <path d="M74 55 L74 46 C74 44, 70 44, 70 47 L70 55" fill={skin} stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* LEVEL 4: Sesuai — Gentle smile nod + single friendly thumb up */}
      {level === 4 && (
        <g>
          <g className="anim-nod-gentle">
            <circle cx="48" cy="39" r="18" fill={skin} stroke="#102a43" strokeWidth="2.2" />
            <path d="M30 37 C30 23, 40 18, 49 18 C59 18, 66 24, 66 36 C61 29, 53 27, 46 28 C38 29, 34 32, 30 37 Z" fill={hair} />
            {/* Friendly eyes */}
            <circle cx="41.5" cy="38" r="2.3" fill="#102a43" />
            <circle cx="54.5" cy="38" r="2.3" fill="#102a43" />
            {/* Warm smile */}
            <path d="M40.5 45.5 C43.5 50, 52.5 50, 55.5 45.5" stroke="#102a43" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          {/* Single Right Thumb Up */}
          <g className="anim-thumbs-bounce">
            <rect x="68" y="58" width="12" height="12" rx="4" fill={skin} stroke="#102a43" strokeWidth="2" />
            <path d="M72 58 L72 49 C72 47, 68 47, 68 50 L68 58" fill={skin} stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* LEVEL 3: Ragu-ragu / ? — Head tilting thoughtfully + hand on chin + floating '?' */}
      {level === 3 && (
        <g>
          {/* Floating Question Mark */}
          <g className="anim-float-soft">
            <circle cx="76" cy="24" r="9" fill="#ffffff" stroke="#d97706" strokeWidth="2" />
            <text x="76" y="28.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b45309">
              ?
            </text>
          </g>
          <g className="anim-think-tilt">
            <circle cx="48" cy="39" r="18" fill={skin} stroke="#102a43" strokeWidth="2.2" />
            <path d="M30 37 C30 23, 40 18, 49 18 C59 18, 66 24, 66 36 C61 29, 53 27, 46 28 C38 29, 34 32, 30 37 Z" fill={hair} />
            {/* Thinking eyebrows & side-glancing eyes */}
            <path d="M37 33 L44 34" stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
            <path d="M51 34.5 L58 32" stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
            <circle cx="43" cy="39" r="2.2" fill="#102a43" />
            <circle cx="56" cy="39" r="2.2" fill="#102a43" />
            {/* Neutral wavy/flat mouth */}
            <path d="M43 47 Q48 45.5 53 47.5" stroke="#102a43" strokeWidth="2.3" strokeLinecap="round" />
            {/* Hand resting on chin */}
            <path d="M37 56 C39 52, 46 52, 50 55 L48 63 L36 62 Z" fill={skin} stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>
      )}

      {/* LEVEL 2: Tidak Sesuai — Raised wagging index finger + mild frown */}
      {level === 2 && (
        <g>
          <g className="anim-nod-gentle">
            <circle cx="46" cy="39" r="18" fill={skin} stroke="#102a43" strokeWidth="2.2" />
            <path d="M28 37 C28 23, 38 18, 47 18 C57 18, 64 24, 64 36 C59 29, 51 27, 44 28 C36 29, 32 32, 28 37 Z" fill={hair} />
            <path d="M36 33.5 L42 35" stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
            <path d="M56 33.5 L50 35" stroke="#102a43" strokeWidth="2" strokeLinecap="round" />
            <circle cx="39.5" cy="39" r="2.2" fill="#102a43" />
            <circle cx="52.5" cy="39" r="2.2" fill="#102a43" />
            {/* Mild frown */}
            <path d="M40 48.5 C43 45.5, 49 45.5, 52 48.5" stroke="#102a43" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          {/* Raised Index Finger Wagging Left-Right */}
          <g className="anim-finger-wag">
            <rect x="69" y="55" width="12" height="13" rx="4" fill={skin} stroke="#102a43" strokeWidth="2" />
            <rect x="72" y="38" width="5.5" height="19" rx="2.75" fill={skin} stroke="#102a43" strokeWidth="2" />
          </g>
        </g>
      )}

      {/* LEVEL 1: Sangat Tidak Sesuai — Shaking head + BOTH ARMS CROSSED in firm X */}
      {level === 1 && (
        <g>
          <g className="anim-head-shake">
            <circle cx="48" cy="37" r="17.5" fill={skin} stroke="#102a43" strokeWidth="2.2" />
            <path d="M30.5 35 C30.5 21.5, 40 17, 49 17 C59 17, 65.5 22.5, 65.5 34.5 C61 28, 53 26, 46 27 C38 28, 34 31, 30.5 35 Z" fill={hair} />
            {/* Strong furrowed brows */}
            <path d="M36 31.5 L44 35" stroke="#102a43" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M60 31.5 L52 35" stroke="#102a43" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="41.5" cy="38.5" r="2.2" fill="#102a43" />
            <circle cx="54.5" cy="38.5" r="2.2" fill="#102a43" />
            {/* Strong frown */}
            <path d="M40 48 C43 43, 53 43, 56 48" stroke="#102a43" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Crossed Arms X Gesture in front of chest */}
          <g className="anim-cross-pulse">
            <path d="M28 57 L68 79" stroke={shirt} strokeWidth="9" strokeLinecap="round" />
            <path d="M28 57 L68 79" stroke="#102a43" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M68 57 L28 79" stroke={shirt} strokeWidth="9" strokeLinecap="round" />
            <path d="M68 57 L28 79" stroke="#102a43" strokeWidth="2.2" strokeLinecap="round" />
            {/* Hands at ends of crossed arms */}
            <circle cx="27" cy="57" r="4.5" fill={skin} stroke="#102a43" strokeWidth="1.8" />
            <circle cx="69" cy="57" r="4.5" fill={skin} stroke="#102a43" strokeWidth="1.8" />
          </g>
        </g>
      )}
    </svg>
  );
}

/**
 * Animated Contextual Scene Banner above each Personality Statement (gaya ilustrasi situasi PEEPL P2)
 */
export function PersonalitySceneSVG({ dimension = 'komunikasiSosial' }) {
  const skin = '#fde0c4';
  const navy = '#102a43';

  return (
    <div className="flex justify-center mb-1">
      <svg
        width="160"
        height="78"
        viewBox="0 0 180 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="6" y="6" width="168" height="74" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* komunikasiSosial: Two characters in discussion / quiet observer vs speaker */}
        {dimension === 'komunikasiSosial' && (
          <g>
            {/* Left Person */}
            <path d="M38 78 C39 62, 46 58, 56 58 C66 58, 73 62, 74 78 Z" fill="#334e68" />
            <g className="anim-nod-gentle">
              <circle cx="56" cy="40" r="13" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M43 38 C44 26, 67 26, 69 38 C64 33, 50 32, 43 38 Z" fill={navy} />
              <circle cx="52" cy="40" r="1.7" fill={navy} />
              <circle cx="60" cy="40" r="1.7" fill={navy} />
              <path d="M52 46 Q56 48 60 46" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Right Person */}
            <path d="M106 78 C107 62, 114 58, 124 58 C134 58, 141 62, 142 78 Z" fill="#0284c7" />
            <g className="anim-think-tilt">
              <circle cx="124" cy="40" r="13" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M111 38 C112 26, 135 26, 137 38 C132 33, 118 32, 111 38 Z" fill="#1e293b" />
              <circle cx="120" cy="40" r="1.7" fill={navy} />
              <circle cx="128" cy="40" r="1.7" fill={navy} />
              <path d="M120 46 Q124 49 128 46" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Animated Speech Bubble */}
            <g className="anim-float-soft">
              <rect x="74" y="14" width="32" height="19" rx="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.8" />
              <circle cx="83" cy="23.5" r="2" fill="#0284c7" />
              <circle cx="90" cy="23.5" r="2" fill="#0284c7" />
              <circle cx="97" cy="23.5" r="2" fill="#0284c7" />
            </g>
          </g>
        )}

        {/* ketelitian: Character inspecting checklist & magnifying glass */}
        {dimension === 'ketelitian' && (
          <g>
            <path d="M44 78 C45 62, 52 57, 64 57 C76 57, 83 62, 84 78 Z" fill="#102a43" />
            <g className="anim-nod-gentle">
              <circle cx="64" cy="39" r="13" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M51 37 C52 25, 76 25, 77 37 C72 32, 57 31, 51 37 Z" fill={navy} />
              <circle cx="60" cy="39" r="1.7" fill={navy} />
              <circle cx="68" cy="39" r="1.7" fill={navy} />
              <path d="M60 45 Q64 47.5 68 45" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Animated Checklist Board */}
            <g className="anim-float-soft">
              <rect x="100" y="18" width="44" height="52" rx="6" fill="#f8fafc" stroke="#334e68" strokeWidth="2" />
              <path d="M108 31 L112 35 L118 28" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="123" y1="32" x2="136" y2="32" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M108 45 L112 49 L118 42" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="123" y1="46" x2="136" y2="46" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="108" y1="58" x2="136" y2="58" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* resiliensi: Calm character next to deadline clock */}
        {dimension === 'resiliensi' && (
          <g>
            <path d="M46 78 C47 62, 54 57, 66 57 C78 57, 85 62, 86 78 Z" fill="#0369a1" />
            <g className="anim-nod-happy">
              <circle cx="66" cy="39" r="13" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M53 37 C54 25, 78 25, 79 37 C74 32, 59 31, 53 37 Z" fill={navy} />
              <circle cx="62" cy="39" r="1.7" fill={navy} />
              <circle cx="70" cy="39" r="1.7" fill={navy} />
              <path d="M62 45.5 Q66 48.5 70 45.5" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Animated Clock */}
            <g className="anim-float-soft">
              <circle cx="126" cy="43" r="20" fill="#fef9c3" stroke="#d97706" strokeWidth="2.4" />
              <line x1="126" y1="43" x2="126" y2="31" stroke={navy} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="126" y1="43" x2="135" y2="47" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="126" cy="43" r="2.2" fill={navy} />
            </g>
          </g>
        )}

        {/* kerjaSama: Team handshake / collaborating characters */}
        {dimension === 'kerjaSama' && (
          <g>
            <path d="M36 78 C37 63, 44 58, 54 58 C64 58, 71 63, 72 78 Z" fill="#059669" />
            <g className="anim-nod-gentle">
              <circle cx="54" cy="40" r="12.5" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M41.5 38 C42.5 27, 65.5 27, 66.5 38 C61 33, 47 32, 41.5 38 Z" fill={navy} />
              <path d="M50 45.5 Q54 48.5 58 45.5" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <path d="M108 78 C109 63, 116 58, 126 58 C136 58, 143 63, 144 78 Z" fill="#334e68" />
            <g className="anim-nod-gentle">
              <circle cx="126" cy="40" r="12.5" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M113.5 38 C114.5 27, 137.5 27, 138.5 38 C133 33, 119 32, 113.5 38 Z" fill="#1e293b" />
              <path d="M122 45.5 Q126 48.5 130 45.5" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <g className="anim-sparkle">
              <circle cx="90" cy="42" r="11" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
              <path d="M85 42 L89 46 L96 38" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* integritas: Character standing beside integrity shield */}
        {dimension === 'integritas' && (
          <g>
            <path d="M44 78 C45 62, 52 57, 64 57 C76 57, 83 62, 84 78 Z" fill="#102a43" />
            <g className="anim-nod-gentle">
              <circle cx="64" cy="39" r="13" fill={skin} stroke={navy} strokeWidth="2" />
              <path d="M51 37 C52 25, 76 25, 77 37 C72 32, 57 31, 51 37 Z" fill={navy} />
              <circle cx="60" cy="39" r="1.7" fill={navy} />
              <circle cx="68" cy="39" r="1.7" fill={navy} />
              <path d="M60 45.5 Q64 48 68 45.5" stroke={navy} strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <g className="anim-float-soft">
              <path
                d="M124 20 L143 27 V43 C143 55, 134 63, 124 67 C114 63, 105 55, 105 43 V27 Z"
                fill="#ecfdf5"
                stroke="#059669"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M117 43 L122 48 L132 37" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

const ACTIVE_CARD_THEMES = {
  1: 'border-rose-600 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/20',
  2: 'border-orange-500 bg-orange-50/90 text-orange-950 ring-2 ring-orange-500/20',
  3: 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-500/20',
  4: 'border-sky-600 bg-sky-50/90 text-sky-950 ring-2 ring-sky-500/20',
  5: 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20',
};

const HOVER_CARD_THEMES = {
  1: 'hover:border-rose-300 hover:bg-rose-50/40',
  2: 'hover:border-orange-300 hover:bg-orange-50/40',
  3: 'hover:border-amber-300 hover:bg-amber-50/40',
  4: 'hover:border-sky-300 hover:bg-sky-50/40',
  5: 'hover:border-emerald-300 hover:bg-emerald-50/40',
};

function inferCharacterLevel(opt, idx, totalOptions, peeplOrder) {
  if (typeof opt.emojiLevel === 'number') return opt.emojiLevel;
  // 2-option EPPS Forced-Choice: both cards show positive working characters (5 vs 4) so neither looks "wrong"
  if (totalOptions === 2) {
    return idx === 0 ? 5 : 4;
  }
  // 3-option Kepribadian 1: Setuju (5) / ? (3) / Tidak setuju (1)
  if (totalOptions === 3) {
    if (idx === 0) return 5;
    if (idx === 1) return 3;
    return 1;
  }
  if (peeplOrder) return 5 - idx;
  const lower = (opt.text || '').toLowerCase();
  if (lower.includes('sangat sesuai') || lower.includes('sangat setuju')) return 5;
  if (lower.includes('sangat tidak')) return 1;
  if (lower.includes('tidak sesuai') || lower.includes('tidak setuju')) return 2;
  if (lower.includes('netral') || lower.includes('ragu') || lower === '?') return 3;
  if (lower.includes('sesuai') || lower.includes('setuju')) return 4;
  return idx + 1;
}

export default function EmojiLikertScale({
  options,
  selectedOptionId,
  onSelect,
  correctOptionId = null,
  showSolution = false,
  compact = false,
  peeplOrder = true,
  showLabels = true,
  onToggleShowLabels = null,
}) {
  const isTwoChoice = options.length === 2;
  const isThreeScale = options.length === 3;
  const isP3Setuju =
    options.length === 5 && (options[0]?.text || '').toLowerCase().includes('setuju');

  const gridCols = isTwoChoice
    ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
    : isThreeScale
    ? 'grid-cols-3 max-w-2xl mx-auto'
    : 'grid-cols-2 sm:grid-cols-5';

  const formatHint = isTwoChoice
    ? 'Format Minat Kerja (EPPS Forced-Choice): Pilih pernyataan A atau B yang paling menggambarkan diri Anda'
    : isThreeScale
    ? 'Format Kepribadian 1 PEEPL: Setuju · ? (Ragu) · Tidak setuju'
    : isP3Setuju
    ? 'Format Kepribadian 3 PEEPL (Nilai & Sikap): Sangat setuju (kiri) → Tidak setuju (kanan)'
    : 'Format P2 PEEPL: Sangat sesuai (kiri) → Sangat tidak sesuai (kanan)';

  return (
    <div className="space-y-3">
      {typeof onToggleShowLabels === 'function' && !showSolution && (
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
          <span className="text-[11px] text-slate-500">{formatHint}</span>
          {!isTwoChoice && (
            <label className="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-navy-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => onToggleShowLabels(e.target.checked)}
                className="rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              <span>Tampilkan tulisan di bawah gambar karakter</span>
            </label>
          )}
        </div>
      )}

      <div className={`grid ${gridCols} gap-2.5`}>
        {options.map((opt, idx) => {
          const level = inferCharacterLevel(opt, idx, options.length, peeplOrder);
          const isSelected = selectedOptionId === opt.id;
          const isKey = showSolution && correctOptionId === opt.id;
          const cleanLabel = opt.text.replace(/^\d+\s*[—-]\s*/, '');
          const forceShowText = isTwoChoice || showLabels || showSolution;

          let cardClass = `border-slate-200 bg-white text-slate-800 ${HOVER_CARD_THEMES[level]}`;
          if (showSolution) {
            if (isKey) {
              cardClass =
                'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
            } else if (isSelected && !isKey) {
              cardClass = 'border-rose-400 bg-rose-50/70 text-rose-950';
            }
          } else if (isSelected) {
            cardClass = `${ACTIVE_CARD_THEMES[level]} shadow-sm`;
          }

          return (
            <button
              key={opt.id}
              type="button"
              title={cleanLabel}
              onClick={() => onSelect && onSelect(opt.id)}
              className={`relative ${
                compact ? 'p-2.5 sm:p-3' : isTwoChoice ? 'p-4 sm:p-5' : 'p-3 sm:p-3.5'
              } rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group ${cardClass}`}
            >
              <div className="group-hover:scale-105 transition-transform">
                <AnimatedCharacterSVG
                  level={level}
                  active={isSelected || isKey}
                  size={compact ? 64 : forceShowText ? 74 : 86}
                />
              </div>

              {forceShowText ? (
                <div className="flex flex-col items-center gap-0.5">
                  {isTwoChoice && (
                    <span className="px-2 py-0.5 mb-0.5 rounded bg-navy-900 text-white text-[10px] font-bold uppercase tracking-wider">
                      Pernyataan {opt.id}
                    </span>
                  )}
                  <span
                    className={`${
                      isTwoChoice ? 'text-xs sm:text-sm font-semibold' : 'text-[11px] sm:text-xs font-bold'
                    } leading-snug`}
                  >
                    {cleanLabel}
                  </span>
                  {!isTwoChoice && <span className="text-[10px] font-mono opacity-65">({opt.id})</span>}
                </div>
              ) : (
                <span className="text-[10px] font-mono font-bold opacity-50">{opt.id}</span>
              )}

              {showSolution && typeof opt.score === 'number' && (
                <span className="mt-0.5 px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                  Skor {opt.score}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
