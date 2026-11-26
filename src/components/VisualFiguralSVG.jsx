import React, { useId } from 'react';

/**
 * Declarative Vector Figural Renderer for PEEPL-style Abstract & Spatial Reasoning:
 * - Series (Deret Gambar: 1 -> 2 -> 3 -> 4 -> ?)
 * - Analogy (Analogi Gambar: A : B = C : ?)
 * - Matrix 3x3 (Matriks Raven 3x3 with bottom-right ?)
 * - Visual SVG Options Grid (A, B, C, D, E directly rendered as SVG cards!)
 */

function getPolygonPoints(sides, cx, cy, r, rotationDeg = -90) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((rotationDeg + (360 / sides) * i) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function FiguralTileSVG({ spec, sizeClass = 'w-full h-full' }) {
  const uid = useId().replace(/:/g, '');
  if (!spec) return null;

  const {
    shape = 'none',
    fill = 'none',
    rotation = 0,
    innerShape = 'none',
    innerFill = 'none',
    dotPos = null,
    dotColor = 'solid',
    dotsCount = 0,
    arrow = null,
    quadrants = null,
    bars = null,
    grid3 = null,
  } = spec;

  const resolveFill = (f) => {
    if (f === 'solid') return '#102a43';
    if (f === 'accent') return '#0284c7';
    if (f === 'light') return '#d9e2ec';
    if (f === 'stripe-h') return `url(#sh-${uid})`;
    if (f === 'stripe-v') return `url(#sv-${uid})`;
    if (f === 'stripe-d') return `url(#sd-${uid})`;
    return '#ffffff';
  };

  const renderBaseShape = (sh, cx, cy, r, fillType, strokeW = 2.4) => {
    const f = resolveFill(fillType);
    const stroke = '#102a43';
    switch (sh) {
      case 'circle':
        return <circle cx={cx} cy={cy} r={r} fill={f} stroke={stroke} strokeWidth={strokeW} />;
      case 'square':
        return (
          <rect
            x={cx - r * 0.85}
            y={cy - r * 0.85}
            width={r * 1.7}
            height={r * 1.7}
            fill={f}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={getPolygonPoints(3, cx, cy + r * 0.12, r * 1.12)}
            fill={f}
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${cx},${cy - r * 1.08} ${cx + r * 1.08},${cy} ${cx},${cy + r * 1.08} ${cx - r * 1.08},${cy}`}
            fill={f}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );
      case 'pentagon':
        return (
          <polygon
            points={getPolygonPoints(5, cx, cy + 2, r * 1.05)}
            fill={f}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );
      case 'hexagon':
        return (
          <polygon
            points={getPolygonPoints(6, cx, cy, r * 1.05)}
            fill={f}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );
      case 'cross': {
        const w = r * 0.45;
        const l = r * 0.98;
        const d = `M ${cx - w} ${cy - l} H ${cx + w} V ${cy - w} H ${cx + l} V ${cy + w} H ${cx + w} V ${cy + l} H ${cx - w} V ${cy + w} H ${cx - l} V ${cy - w} H ${cx - w} Z`;
        return <path d={d} fill={f} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />;
      }
      case 'dot':
        return <circle cx={cx} cy={cy} r={r * 0.72} fill={f === '#ffffff' ? '#102a43' : f} />;
      case 'ring':
        return <circle cx={cx} cy={cy} r={r * 0.8} fill="#ffffff" stroke={stroke} strokeWidth={2.6} />;
      case 'plus':
        return (
          <g stroke={f === '#0284c7' ? '#0284c7' : stroke} strokeWidth={3} strokeLinecap="round">
            <line x1={cx} y1={cy - r * 0.85} x2={cx} y2={cy + r * 0.85} />
            <line x1={cx - r * 0.85} y1={cy} x2={cx + r * 0.85} y2={cy} />
          </g>
        );
      case 'x':
        return (
          <g stroke={f === '#0284c7' ? '#0284c7' : stroke} strokeWidth={3} strokeLinecap="round">
            <line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} />
            <line x1={cx + r * 0.7} y1={cy - r * 0.7} x2={cx - r * 0.7} y2={cy + r * 0.7} />
          </g>
        );
      default:
        return null;
    }
  };

  const dotCoords = {
    tl: [18, 18],
    t: [50, 15],
    tr: [82, 18],
    r: [85, 50],
    br: [82, 82],
    b: [50, 85],
    bl: [18, 82],
    l: [15, 50],
    center: [50, 50],
  };

  const pipLayouts = {
    1: [[50, 50]],
    2: [[40, 50], [60, 50]],
    3: [[50, 39], [39, 57], [61, 57]],
    4: [[40, 40], [60, 40], [40, 60], [60, 60]],
    5: [[38, 38], [62, 38], [50, 50], [38, 62], [62, 62]],
  };

  return (
    <svg viewBox="0 0 100 100" className={sizeClass} aria-hidden="true">
      <defs>
        <pattern id={`sh-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ffffff" />
          <line x1="0" y1="4" x2="8" y2="4" stroke="#334e68" strokeWidth="2.2" />
        </pattern>
        <pattern id={`sv-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ffffff" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#334e68" strokeWidth="2.2" />
        </pattern>
        <pattern id={`sd-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#ffffff" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#334e68" strokeWidth="2.2" />
        </pattern>
      </defs>

      {/* Optional 3x3 Mini Grid */}
      {Array.isArray(grid3) && (
        <g>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={14 + c * 24}
                y={14 + r * 24}
                width="24"
                height="24"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.4"
              />
            ))
          )}
          {grid3.map(([r, c, st], i) => {
            const cx = 14 + c * 24 + 12;
            const cy = 14 + r * 24 + 12;
            if (st === 'cell-solid') {
              return <rect key={i} x={14 + c * 24 + 1} y={14 + r * 24 + 1} width="22" height="22" fill="#102a43" />;
            }
            if (st === 'cell-accent') {
              return <rect key={i} x={14 + c * 24 + 1} y={14 + r * 24 + 1} width="22" height="22" fill="#0284c7" />;
            }
            if (st === 'ring') {
              return <circle key={i} cx={cx} cy={cy} r="6.5" fill="#ffffff" stroke="#102a43" strokeWidth="2.4" />;
            }
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="6.5"
                fill={st === 'accent' ? '#0284c7' : '#102a43'}
              />
            );
          })}
        </g>
      )}

      {/* Optional 4-Quadrant Square */}
      {Array.isArray(quadrants) && (
        <g>
          {[
            { x: 18, y: 18 },
            { x: 50, y: 18 },
            { x: 50, y: 50 },
            { x: 18, y: 50 },
          ].map((q, idx) => (
            <rect
              key={idx}
              x={q.x}
              y={q.y}
              width="32"
              height="32"
              fill={quadrants.includes(idx) ? '#102a43' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2"
            />
          ))}
        </g>
      )}

      {/* Optional Parallel Bars */}
      {bars && (
        <g>
          {Array.from({ length: bars.count }, (_, i) => {
            const span = 48;
            const start = 50 - span / 2;
            const pos = bars.count === 1 ? 50 : start + (i * span) / (bars.count - 1);
            return bars.orientation === 'v' ? (
              <line
                key={i}
                x1={pos}
                y1="22"
                x2={pos}
                y2="78"
                stroke="#102a43"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ) : (
              <line
                key={i}
                x1="22"
                y1={pos}
                x2="78"
                y2={pos}
                stroke="#102a43"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* Base Shape with optional rotation */}
      {shape !== 'none' && (
        <g transform={`rotate(${rotation}, 50, 50)`}>
          {renderBaseShape(shape, 50, 50, 30, fill, 2.4)}
        </g>
      )}

      {/* Inner Shape */}
      {innerShape !== 'none' && renderBaseShape(innerShape, 50, 50, 12.5, innerFill, 2.2)}

      {/* Optional Arrow Pointer */}
      {typeof arrow === 'number' && (
        <g transform={`rotate(${arrow}, 50, 50)`}>
          <line x1="50" y1="74" x2="50" y2="24" stroke="#102a43" strokeWidth="3.4" strokeLinecap="round" />
          <polyline
            points="39,35 50,22 61,35"
            fill="none"
            stroke="#102a43"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Optional Multi-Dots inside center */}
      {dotsCount > 0 &&
        (pipLayouts[dotsCount] || []).map(([px, py], idx) => (
          <circle key={idx} cx={px} cy={py} r="4.2" fill="#102a43" />
        ))}

      {/* Optional Satellite Dot at Compass Position */}
      {dotPos && dotCoords[dotPos] && (
        <circle
          cx={dotCoords[dotPos][0]}
          cy={dotCoords[dotPos][1]}
          r="6.2"
          fill={
            dotColor === 'hollow'
              ? '#ffffff'
              : dotColor === 'accent'
              ? '#0284c7'
              : '#102a43'
          }
          stroke="#102a43"
          strokeWidth="2.2"
        />
      )}
    </svg>
  );
}

function QuestionMarkTile() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="26"
        fill="#f0f4f8"
        stroke="#334e68"
        strokeWidth="2"
        strokeDasharray="4,3"
      />
      <text x="50" y="61" textAnchor="middle" fontSize="32" fontWeight="700" fill="#102a43">
        ?
      </text>
    </svg>
  );
}

/**
 * Renders the visual stimulus for Series, Analogy (A : B = C : ?), or Matrix 3x3.
 */
export function FiguralQuestionStimulus({ figuralData, answerSpec = null }) {
  if (!figuralData) return null;
  const { mode, frames = [] } = figuralData;

  if (mode === 'analogy') {
    // frames = [A, B, C] -> displays A : B = C : ?
    return (
      <div className="my-4 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3">
          Analogi Gambar (A : B = C : ?)
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-slate-300 rounded-lg p-1 shadow-sm">
            <FiguralTileSVG spec={frames[0]} />
          </div>
          <span className="text-xl font-extrabold text-navy-800">:</span>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-slate-300 rounded-lg p-1 shadow-sm">
            <FiguralTileSVG spec={frames[1]} />
          </div>
          <span className="text-xl font-extrabold text-navy-800 px-1">=</span>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-slate-300 rounded-lg p-1 shadow-sm">
            <FiguralTileSVG spec={frames[2]} />
          </div>
          <span className="text-xl font-extrabold text-navy-800">:</span>
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg p-1 border-2 ${
              answerSpec
                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                : 'bg-amber-50/50 border-dashed border-navy-700'
            }`}
          >
            {answerSpec ? <FiguralTileSVG spec={answerSpec} /> : <QuestionMarkTile />}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'matrix3x3') {
    // frames = 8 specs + 9th target cell
    return (
      <div className="my-4 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
            Matriks Pola 3 × 3 (Raven)
          </span>
          <span className="text-xs text-slate-500">
            {answerSpec ? 'Sel kanan-bawah menampilkan kunci' : 'Lengkapi sel kanan-bawah (?)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 max-w-[300px] w-full">
          {frames.slice(0, 8).map((spec, idx) => (
            <div
              key={idx}
              className="aspect-square bg-white border-2 border-slate-300 rounded-lg p-1 shadow-sm"
            >
              <FiguralTileSVG spec={spec} />
            </div>
          ))}
          <div
            className={`aspect-square rounded-lg p-1 border-2 ${
              answerSpec
                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                : 'bg-amber-50/50 border-dashed border-navy-700'
            }`}
          >
            {answerSpec ? <FiguralTileSVG spec={answerSpec} /> : <QuestionMarkTile />}
          </div>
        </div>
      </div>
    );
  }

  // Default: mode === 'series' (4 frames + target frame 5)
  return (
    <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
          Deret Gambar Visual (1 → 5)
        </span>
        <span className="text-xs text-slate-500">
          {answerSpec ? 'Kotak 5 menampilkan kunci jawaban' : 'Pilih gambar A–E untuk Kotak 5 (?)'}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center">
        {frames.slice(0, 4).map((spec, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="w-full aspect-square max-w-[110px] bg-white border-2 border-slate-300 rounded-lg p-1 shadow-sm">
              <FiguralTileSVG spec={spec} />
            </div>
            <span className="mt-1 text-[11px] font-medium text-slate-500">Kotak {idx + 1}</span>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <div
            className={`w-full aspect-square max-w-[110px] rounded-lg p-1 border-2 ${
              answerSpec
                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                : 'bg-amber-50/50 border-dashed border-navy-700'
            }`}
          >
            {answerSpec ? <FiguralTileSVG spec={answerSpec} /> : <QuestionMarkTile />}
          </div>
          <span
            className={`mt-1 text-[11px] font-bold ${
              answerSpec ? 'text-emerald-700' : 'text-navy-900'
            }`}
          >
            {answerSpec ? 'Kotak 5 (Kunci)' : 'Kotak 5 (?)'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders 5 visual SVG answer option cards (A–E) side-by-side.
 */
export function FiguralOptionsGrid({
  options,
  selectedOptionId,
  onSelect,
  correctOptionId = null,
  showSolution = false,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
      {options.map((opt) => {
        const isSelected = selectedOptionId === opt.id;
        const isKey = showSolution && correctOptionId === opt.id;

        let cardClass = 'border-slate-200 bg-white hover:border-navy-400 hover:bg-slate-50';
        if (showSolution) {
          if (isKey) {
            cardClass = 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20';
          } else if (isSelected && !isKey) {
            cardClass = 'border-rose-400 bg-rose-50/80';
          }
        } else if (isSelected) {
          cardClass = 'border-navy-800 bg-navy-50/70 ring-2 ring-navy-700/20 shadow-sm';
        }

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect && onSelect(opt.id)}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${cardClass}`}
          >
            <div className="w-full flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center ${
                  isKey
                    ? 'bg-emerald-600 text-white'
                    : isSelected
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {opt.id}
              </span>
              {showSolution && isKey && (
                <span className="text-[10px] font-bold text-emerald-700">Kunci</span>
              )}
              {showSolution && isSelected && !isKey && (
                <span className="text-[10px] font-bold text-rose-700">Pilihanmu</span>
              )}
            </div>
            <div className="w-20 h-20 sm:w-22 sm:h-22 bg-white rounded-lg border border-slate-200 p-1">
              <FiguralTileSVG spec={opt.svgSpec} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
