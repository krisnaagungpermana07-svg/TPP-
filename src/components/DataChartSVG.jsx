import React from 'react';

/**
 * Lightweight, high-clarity SVG Bar/Line Chart Renderer for PEEPL NCR-S Numerical Reasoning.
 * Supports:
 * - type: 'bar' (grouped or single vertical bars with data labels)
 * - type: 'line' (trend line chart with points & value labels)
 */
export default function DataChartSVG({ chartData }) {
  if (!chartData) return null;

  const {
    type = 'bar',
    title = 'Grafik Data Keuangan',
    unit = '',
    labels = [],
    series = [], // [{ name: '2024', color: '#334e68', values: [120, 150, ...] }]
  } = chartData;

  const allVals = series.flatMap((s) => s.values || []);
  const rawMax = Math.max(4, ...allVals);
  const niceMax =
    rawMax <= 10
      ? Math.ceil(rawMax / 2) * 2
      : rawMax <= 25
      ? Math.ceil(rawMax / 5) * 5
      : rawMax <= 100
      ? Math.ceil(rawMax / 20) * 20
      : Math.ceil(rawMax / 50) * 50;

  const svgW = 560;
  const svgH = 240;
  const padL = 52;
  const padR = 24;
  const padT = 24;
  const padB = 42;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));
  const yOf = (val) => padT + plotH - (val / niceMax) * plotH;

  return (
    <div className="my-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <div className="text-xs font-bold text-navy-900">{title}</div>
          {unit && <div className="text-[11px] text-slate-500">Satuan: {unit}</div>}
        </div>
        {series.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: s.color || (idx === 0 ? '#102a43' : '#0284c7') }}
                />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[580px] mx-auto h-auto">
          {/* Horizontal grid lines & Y axis labels */}
          {yTicks.map((tv, i) => {
            const y = yOf(tv);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={svgW - padR}
                  y2={y}
                  stroke={tv === 0 ? '#64748b' : '#e2e8f0'}
                  strokeWidth={tv === 0 ? 1.5 : 1}
                  strokeDasharray={tv === 0 ? undefined : '3,3'}
                />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10.5" fill="#475569" fontFamily="monospace">
                  {tv}
                </text>
              </g>
            );
          })}

          {/* BAR CHART */}
          {type === 'bar' &&
            labels.map((lbl, gIdx) => {
              const groupW = plotW / Math.max(1, labels.length);
              const groupX = padL + gIdx * groupW;
              const barCount = series.length;
              const barGap = 4;
              const usableW = Math.min(groupW * 0.72, barCount * 36);
              const barW = (usableW - barGap * (barCount - 1)) / Math.max(1, barCount);
              const startX = groupX + (groupW - usableW) / 2;

              return (
                <g key={gIdx}>
                  {series.map((s, sIdx) => {
                    const v = s.values[gIdx] || 0;
                    const y = yOf(v);
                    const h = Math.max(2, padT + plotH - y);
                    const x = startX + sIdx * (barW + barGap);
                    const color = s.color || (sIdx === 0 ? '#102a43' : '#0284c7');
                    return (
                      <g key={sIdx}>
                        <rect x={x} y={y} width={barW} height={h} rx="3" fill={color} />
                        <text
                          x={x + barW / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#0f172a"
                          fontFamily="monospace"
                        >
                          {v}
                        </text>
                      </g>
                    );
                  })}
                  <text
                    x={groupX + groupW / 2}
                    y={svgH - 16}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

          {/* LINE CHART */}
          {type === 'line' &&
            (() => {
              const stepX = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
              const xOf = (idx) => (labels.length > 1 ? padL + idx * stepX : padL + plotW / 2);

              return (
                <g>
                  {labels.map((lbl, idx) => (
                    <text
                      key={idx}
                      x={xOf(idx)}
                      y={svgH - 16}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="#334155"
                    >
                      {lbl}
                    </text>
                  ))}

                  {series.map((s, sIdx) => {
                    const color = s.color || (sIdx === 0 ? '#102a43' : '#0284c7');
                    const pts = s.values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
                    return (
                      <g key={sIdx}>
                        <polyline
                          points={pts}
                          fill="none"
                          stroke={color}
                          strokeWidth="2.8"
                          strokeLinejoin="round"
                        />
                        {s.values.map((v, i) => {
                          const cx = xOf(i);
                          const cy = yOf(v);
                          return (
                            <g key={i}>
                              <circle cx={cx} cy={cy} r="4.5" fill="#ffffff" stroke={color} strokeWidth="2.6" />
                              <text
                                x={cx}
                                y={cy - 9}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="700"
                                fill={color}
                                fontFamily="monospace"
                              >
                                {v}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              );
            })()}
        </svg>
      </div>
    </div>
  );
}
