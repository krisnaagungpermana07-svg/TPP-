import React from 'react';

/**
 * Renders crisp, lightweight SVG pattern sequences for Subtes 3 (Penalaran Abstrak / Pola).
 * Each sequence displays 5 frames: Frame 1, Frame 2, Frame 3, Frame 4, and Frame 5 ('?' or solved answer).
 */
export default function AbstractPatternSVG({ patternId, showAnswerFrame = false }) {
  const frames = [0, 1, 2, 3, 4];

  const getPolygonPoints = (sides, cx, cy, r, rotationDeg = -90) => {
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const angle = ((rotationDeg + (360 / sides) * i) * Math.PI) / 180;
      pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const renderShapeByName = (shape, cx, cy, r, filled = false) => {
    const fill = filled ? '#102a43' : '#ffffff';
    const stroke = '#102a43';
    const strokeWidth = 2.2;

    if (shape === 'circle') {
      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    }
    if (shape === 'square') {
      const side = r * 1.65;
      return (
        <rect
          x={cx - side / 2}
          y={cy - side / 2}
          width={side}
          height={side}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (shape === 'triangle') {
      return (
        <polygon
          points={getPolygonPoints(3, cx, cy + 3, r * 1.15)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (shape === 'diamond') {
      return (
        <polygon
          points={`${cx},${cy - r * 1.15} ${cx + r * 1.15},${cy} ${cx},${cy + r * 1.15} ${cx - r * 1.15},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    return null;
  };

  const renderFrameContent = (stepIndex) => {
    switch (patternId) {
      case 'sample_rotation': {
        // Arrow rotates 0, 90, 180, 270, 0(360) deg; tail circle toggles filled/hollow
        const angle = stepIndex * 90;
        const isFilled = stepIndex % 2 === 0;
        return (
          <g transform={`rotate(${angle}, 50, 50)`}>
            <line x1="50" y1="74" x2="50" y2="24" stroke="#102a43" strokeWidth="3.5" strokeLinecap="round" />
            <polyline
              points="38,36 50,22 62,36"
              fill="none"
              stroke="#102a43"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="50"
              cy="76"
              r="6.5"
              fill={isFilled ? '#102a43' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.5"
            />
          </g>
        );
      }

      case 'q3_1_polygons': {
        // Sides: 3, 4, 5, 6, 7. Center dot: filled, hollow, filled, hollow, filled
        const sides = 3 + stepIndex;
        const isFilled = stepIndex % 2 === 0;
        return (
          <g>
            <polygon
              points={getPolygonPoints(sides, 50, 50, 31)}
              fill="#f0f4f8"
              stroke="#102a43"
              strokeWidth="2.5"
            />
            <circle
              cx="50"
              cy="50"
              r="6.5"
              fill={isFilled ? '#102a43' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.2"
            />
            <text x="50" y="93" textAnchor="middle" fontSize="9.5" fill="#486581" fontWeight="600">
              {sides} Sisi
            </text>
          </g>
        );
      }

      case 'q3_2_grid_shift': {
        // 3x3 grid. Black dot moves CW on corners: (0,0)->(2,0)->(2,2)->(0,2)->(0,0)
        // Hollow ring moves CCW on mid-edges: (1,0)->(0,1)->(1,2)->(2,1)->(1,0)
        const corners = [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
          [0, 0],
        ];
        const edges = [
          [1, 0],
          [0, 1],
          [1, 2],
          [2, 1],
          [1, 0],
        ];
        const [bx, by] = corners[stepIndex];
        const [rx, ry] = edges[stepIndex];
        const cellCoords = (c) => 24 + c * 26;

        return (
          <g>
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={11 + c * 26}
                  y={11 + r * 26}
                  width="26"
                  height="26"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
              ))
            )}
            <circle cx={cellCoords(bx)} cy={cellCoords(by)} r="7.5" fill="#102a43" />
            <circle
              cx={cellCoords(rx)}
              cy={cellCoords(ry)}
              r="7.5"
              fill="#ffffff"
              stroke="#102a43"
              strokeWidth="2.8"
            />
          </g>
        );
      }

      case 'q3_3_concentric': {
        // Step 0: Outer circle, Inner square (filled)
        // Step 1: Outer square, Inner triangle (hollow)
        // Step 2: Outer triangle, Inner circle (filled)
        // Step 3: Outer circle, Inner diamond (hollow)
        // Step 4: Outer diamond, Inner circle (filled)
        const pairs = [
          ['circle', 'square', true],
          ['square', 'triangle', false],
          ['triangle', 'circle', true],
          ['circle', 'diamond', false],
          ['diamond', 'circle', true],
        ];
        const [outer, inner, innerFilled] = pairs[stepIndex];
        return (
          <g>
            {renderShapeByName(outer, 50, 50, 32, false)}
            {renderShapeByName(inner, 50, 50, 14, innerFilled)}
          </g>
        );
      }

      case 'q3_4_dual_hands': {
        // Long hand: +90 deg CW (0, 90, 180, 270, 0)
        // Short hand: -45 deg CCW (0, 315, 270, 225, 180)
        const longAngle = stepIndex * 90;
        const shortAngle = -stepIndex * 45;
        return (
          <g>
            <circle cx="50" cy="50" r="33" fill="#f8fafc" stroke="#102a43" strokeWidth="2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg}, 50, 50)`}>
                <line x1="50" y1="17" x2="50" y2="21" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            ))}
            {/* Long Hand */}
            <g transform={`rotate(${longAngle}, 50, 50)`}>
              <line x1="50" y1="50" x2="50" y2="21" stroke="#102a43" strokeWidth="3.2" strokeLinecap="round" />
              <polygon points="50,18 46,25 54,25" fill="#102a43" />
            </g>
            {/* Short Hand with bulb */}
            <g transform={`rotate(${shortAngle}, 50, 50)`}>
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="31"
                stroke="#0284c7"
                strokeWidth="2.6"
                strokeDasharray="3,2"
                strokeLinecap="round"
              />
              <circle cx="50" cy="29" r="4.2" fill="#0284c7" />
            </g>
            <circle cx="50" cy="50" r="3.5" fill="#102a43" />
          </g>
        );
      }

      case 'q3_5_bars': {
        // Count = stepIndex + 1 (1..5). Even index = vertical, Odd index = horizontal.
        // Corner marker moves CW: TL, TR, BR, BL, TL
        const count = stepIndex + 1;
        const isVertical = stepIndex % 2 === 0;
        const corners = [
          [16, 16],
          [84, 16],
          [84, 84],
          [16, 84],
          [16, 16],
        ];
        const [cx, cy] = corners[stepIndex];
        const positions = Array.from({ length: count }, (_, i) => {
          const span = 48;
          const start = 50 - span / 2;
          return count === 1 ? 50 : start + (i * span) / (count - 1);
        });

        return (
          <g>
            {positions.map((pos, idx) =>
              isVertical ? (
                <line
                  key={idx}
                  x1={pos}
                  y1="24"
                  x2={pos}
                  y2="76"
                  stroke="#102a43"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              ) : (
                <line
                  key={idx}
                  x1="24"
                  y1={pos}
                  x2="76"
                  y2={pos}
                  stroke="#102a43"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )
            )}
            <circle cx={cx} cy={cy} r="5.5" fill="#0284c7" />
          </g>
        );
      }

      case 'q3_6_quadrants': {
        // Quadrants filled: step 0->1 (TL), step 1->2 (TL,TR), step 2->3 (TL,TR,BR), step 3->4 (all), step 4->1 (TL)
        const fillCounts = [1, 2, 3, 4, 1];
        const numFilled = fillCounts[stepIndex];
        const isPlus = stepIndex % 2 === 0;
        const quads = [
          { x: 18, y: 18 }, // TL
          { x: 50, y: 18 }, // TR
          { x: 50, y: 50 }, // BR
          { x: 18, y: 50 }, // BL
        ];
        return (
          <g>
            {quads.map((q, idx) => (
              <rect
                key={idx}
                x={q.x}
                y={q.y}
                width="32"
                height="32"
                fill={idx < numFilled ? '#334e68' : '#ffffff'}
                stroke="#102a43"
                strokeWidth="2"
              />
            ))}
            <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#102a43" strokeWidth="1.8" />
            {isPlus ? (
              <g stroke="#102a43" strokeWidth="2.4" strokeLinecap="round">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            ) : (
              <g stroke="#102a43" strokeWidth="2.4" strokeLinecap="round">
                <line x1="45" y1="45" x2="55" y2="55" />
                <line x1="55" y1="45" x2="45" y2="55" />
              </g>
            )}
          </g>
        );
      }

      case 'q3_7_reflection': {
        // Triangle flips vertically: Up, Down, Up, Down, Up
        // Satellite moves CCW: Right (0), Top (1), Left (2), Bottom (3), Right (4)
        const isUp = stepIndex % 2 === 0;
        const satPositions = [
          [82, 50], // Right
          [50, 16], // Top
          [18, 50], // Left
          [50, 84], // Bottom
          [82, 50], // Right
        ];
        const [sx, sy] = satPositions[stepIndex];
        return (
          <g>
            {isUp ? (
              <polygon points="50,26 72,68 28,68" fill="#d9e2ec" stroke="#102a43" strokeWidth="2.5" />
            ) : (
              <polygon points="50,74 72,32 28,32" fill="#d9e2ec" stroke="#102a43" strokeWidth="2.5" />
            )}
            <circle cx={sx} cy={sy} r="6" fill="#102a43" />
          </g>
        );
      }

      case 'q3_8_domino': {
        // Top dots: 1, 2, 3, 4, 5
        // Bottom dots: 1, 3, 5, 1, 3
        const topDots = [1, 2, 3, 4, 5][stepIndex];
        const bottomDots = [1, 3, 5, 1, 3][stepIndex];

        const renderPips = (count, offsetY) => {
          const layouts = {
            1: [[50, offsetY + 18]],
            2: [
              [38, offsetY + 10],
              [62, offsetY + 26],
            ],
            3: [
              [36, offsetY + 9],
              [50, offsetY + 18],
              [64, offsetY + 27],
            ],
            4: [
              [38, offsetY + 10],
              [62, offsetY + 10],
              [38, offsetY + 26],
              [62, offsetY + 26],
            ],
            5: [
              [36, offsetY + 9],
              [64, offsetY + 9],
              [50, offsetY + 18],
              [36, offsetY + 27],
              [64, offsetY + 27],
            ],
          };
          return (layouts[count] || []).map(([px, py], idx) => (
            <circle key={idx} cx={px} cy={py} r="3.6" fill="#102a43" />
          ));
        };

        return (
          <g>
            <rect x="26" y="12" width="48" height="76" rx="5" fill="#ffffff" stroke="#102a43" strokeWidth="2.4" />
            <line x1="26" y1="50" x2="74" y2="50" stroke="#102a43" strokeWidth="2" />
            {renderPips(topDots, 13)}
            {renderPips(bottomDots, 51)}
          </g>
        );
      }

      case 'q3_9_symbol_cipher': {
        // Sequence cyclic shift left: [▲, ●, ■, ◆]
        const base = ['▲', '●', '■', '◆'];
        const shifted = base.map((_, i) => base[(i + stepIndex) % 4]);
        const underlineFirst = stepIndex % 2 === 0; // Steps 0, 2, 4 (1st, 3rd, 5th box)
        return (
          <g>
            <rect x="10" y="32" width="80" height="36" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            {shifted.map((sym, idx) => {
              const x = 21 + idx * 19;
              return (
                <g key={idx}>
                  <text x={x} y="55" textAnchor="middle" fontSize="14.5" fill="#102a43" fontWeight="700">
                    {sym}
                  </text>
                  {idx === 0 && underlineFirst && (
                    <line x1={x - 7} y1="61" x2={x + 7} y2="61" stroke="#0284c7" strokeWidth="2.8" />
                  )}
                </g>
              );
            })}
          </g>
        );
      }

      case 'q3_10_orbit': {
        // Satellite orbits 45 deg CW starting from North (0, 45, 90, 135, 180)
        // Core alternates filled circle / hollow ring
        const angleDeg = stepIndex * 45 - 90;
        const rad = (angleDeg * Math.PI) / 180;
        const orbitR = 30;
        const sx = 50 + orbitR * Math.cos(rad);
        const sy = 50 + orbitR * Math.sin(rad);
        const coreFilled = stepIndex % 2 === 0;

        return (
          <g>
            <circle
              cx="50"
              cy="50"
              r={orbitR}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeDasharray="4,3"
            />
            <circle
              cx="50"
              cy="50"
              r="11"
              fill={coreFilled ? '#102a43' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.5"
            />
            <circle cx={sx} cy={sy} r="6" fill="#0284c7" stroke="#102a43" strokeWidth="1.8" />
          </g>
        );
      }

      /* ========== PAKET 2 SVG PATTERNS (10 NEW VISUAL PATTERNS) ========== */
      case 'p2_q3_1_lshape': {
        // L-shape rotates 90 deg CCW each step (0, -90, -180, -270, -360)
        // Corner dot toggles filled blue / hollow white
        const angle = -stepIndex * 90;
        const dotFilled = stepIndex % 2 === 0;
        return (
          <g transform={`rotate(${angle}, 50, 50)`}>
            <polyline
              points="32,24 32,68 70,68"
              fill="none"
              stroke="#102a43"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="58"
              cy="38"
              r="7.5"
              fill={dotFilled ? '#0284c7' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.4"
            />
          </g>
        );
      }

      case 'p2_q3_2_diag4x4': {
        // 4x4 grid. Dark square moves along main diagonal (0,0)->(1,1)->(2,2)->(3,3)->(0,0)
        // Blue circle moves along anti-diagonal (3,0)->(2,1)->(1,2)->(0,3)->(3,0)
        const idx = stepIndex % 4;
        const sqX = 12 + idx * 19;
        const sqY = 12 + idx * 19;
        const cCol = 3 - idx;
        const cRow = idx;
        const cx = 12 + cCol * 19 + 9.5;
        const cy = 12 + cRow * 19 + 9.5;

        return (
          <g>
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={12 + c * 19}
                  y={12 + r * 19}
                  width="19"
                  height="19"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
              ))
            )}
            <rect x={sqX + 2.5} y={sqY + 2.5} width="14" height="14" rx="2" fill="#102a43" />
            <circle cx={cx} cy={cy} r="6.2" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        );
      }

      case 'p2_q3_3_pie': {
        // Circle divided into 8 sectors; shaded sectors count = stepIndex + 1 (1..5) CW from -90 deg
        const filledCount = stepIndex + 1;
        const r = 34;
        const sectors = Array.from({ length: 8 }, (_, sIdx) => {
          const a1 = ((-90 + sIdx * 45) * Math.PI) / 180;
          const a2 = ((-90 + (sIdx + 1) * 45) * Math.PI) / 180;
          const x1 = (50 + r * Math.cos(a1)).toFixed(1);
          const y1 = (50 + r * Math.sin(a1)).toFixed(1);
          const x2 = (50 + r * Math.cos(a2)).toFixed(1);
          const y2 = (50 + r * Math.sin(a2)).toFixed(1);
          return `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
        });
        return (
          <g>
            {sectors.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx < filledCount ? '#102a43' : '#f8fafc'}
                stroke="#334e68"
                strokeWidth="1.6"
              />
            ))}
          </g>
        );
      }

      case 'p2_q3_4_diamond_dots': {
        // Outer square rotates 45 deg each step (0, 45, 90, 135, 180)
        // Internal dot count = 1, 2, 3, 4, 5
        const rot = stepIndex * 45;
        const dotCount = stepIndex + 1;
        const dotLayouts = {
          1: [[50, 50]],
          2: [[41, 50], [59, 50]],
          3: [[50, 40], [41, 57], [59, 57]],
          4: [[41, 41], [59, 41], [41, 59], [59, 59]],
          5: [[40, 40], [60, 40], [50, 50], [40, 60], [60, 60]],
        };
        return (
          <g>
            <g transform={`rotate(${rot}, 50, 50)`}>
              <rect
                x="23"
                y="23"
                width="54"
                height="54"
                fill="#f0f4f8"
                stroke="#102a43"
                strokeWidth="2.5"
              />
            </g>
            {(dotLayouts[dotCount] || []).map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r="4.2" fill="#102a43" />
            ))}
          </g>
        );
      }

      case 'p2_q3_5_balance': {
        // Left dots: 5,4,3,2,1; Right dots: 1,2,3,4,5
        const leftCount = 5 - stepIndex;
        const rightCount = 1 + stepIndex;
        const renderColDots = (count, xPos) => {
          const gap = 12;
          const startY = 50 - ((count - 1) * gap) / 2;
          return Array.from({ length: count }, (_, i) => (
            <circle key={i} cx={xPos} cy={startY + i * gap} r="4.2" fill="#102a43" />
          ));
        };
        return (
          <g>
            <rect x="14" y="16" width="72" height="68" rx="4" fill="#ffffff" stroke="#102a43" strokeWidth="2.2" />
            <line x1="50" y1="16" x2="50" y2="84" stroke="#102a43" strokeWidth="2.2" />
            {renderColDots(leftCount, 32)}
            {renderColDots(rightCount, 68)}
          </g>
        );
      }

      case 'p2_q3_6_chevrons': {
        // Stacked chevrons count = 1..5; orientation alternates Up (even step) / Down (odd step)
        const count = stepIndex + 1;
        const isUp = stepIndex % 2 === 0;
        const spacing = 12;
        const startY = 50 - ((count - 1) * spacing) / 2;

        return (
          <g>
            {Array.from({ length: count }, (_, i) => {
              const cy = startY + i * spacing;
              const pts = isUp
                ? `32,${cy + 5} 50,${cy - 5} 68,${cy + 5}`
                : `32,${cy - 5} 50,${cy + 5} 68,${cy - 5}`;
              return (
                <polyline
                  key={i}
                  points={pts}
                  fill="none"
                  stroke="#102a43"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        );
      }

      case 'p2_q3_7_corners': {
        // Shaded corner triangle rotates CW: TL(0), TR(1), BR(2), BL(3), TL(4)
        // Center small square alternates filled / hollow
        const cornerPolys = [
          '16,16 48,16 16,48',
          '84,16 84,48 52,16',
          '84,84 52,84 84,52',
          '16,84 16,52 48,84',
          '16,16 48,16 16,48',
        ];
        const centerFilled = stepIndex % 2 === 0;
        return (
          <g>
            <rect x="16" y="16" width="68" height="68" fill="#ffffff" stroke="#102a43" strokeWidth="2.4" />
            <polygon points={cornerPolys[stepIndex]} fill="#102a43" />
            <rect
              x="41"
              y="41"
              width="18"
              height="18"
              fill={centerFilled ? '#0284c7' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.2"
            />
          </g>
        );
      }

      case 'p2_q3_8_hex': {
        // Hexagon vertices 0..5 starting at Top (-90 deg) CW
        // Black dot at stepIndex % 6; Blue hollow ring at (stepIndex + 3) % 6
        const r = 32;
        const getV = (vIdx) => {
          const a = ((-90 + vIdx * 60) * Math.PI) / 180;
          return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
        };
        const [bx, by] = getV(stepIndex % 6);
        const [rx, ry] = getV((stepIndex + 3) % 6);

        return (
          <g>
            <polygon
              points={getPolygonPoints(6, 50, 50, r)}
              fill="#f8fafc"
              stroke="#102a43"
              strokeWidth="2.2"
            />
            <circle cx={bx} cy={by} r="6.8" fill="#102a43" />
            <circle cx={rx} cy={ry} r="6.8" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
          </g>
        );
      }

      case 'p2_q3_9_edgebar': {
        // 3x3 grid. Dark 3-cell edge bar rotates CW: Top row(0), Right col(1), Bottom row(2), Left col(3), Top row(4)
        // Center cell circle toggles black filled / white hollow
        const edgeIdx = stepIndex % 4;
        const centerFilled = stepIndex % 2 === 0;
        const isEdgeCell = (r, c) => {
          if (edgeIdx === 0) return r === 0;
          if (edgeIdx === 1) return c === 2;
          if (edgeIdx === 2) return r === 2;
          return c === 0;
        };

        return (
          <g>
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={14 + c * 24}
                  y={14 + r * 24}
                  width="24"
                  height="24"
                  fill={isEdgeCell(r, c) ? '#102a43' : '#ffffff'}
                  stroke="#334e68"
                  strokeWidth="1.6"
                />
              ))
            )}
            <circle
              cx="50"
              cy="50"
              r="6.8"
              fill={centerFilled ? '#0284c7' : '#ffffff'}
              stroke="#102a43"
              strokeWidth="2.2"
            />
          </g>
        );
      }

      case 'p2_q3_10_stairs': {
        // 4 vertical bars cyclic shift right: [1,2,3,4], [4,1,2,3], [3,4,1,2], [2,3,4,1], [1,2,3,4]
        const sequences = [
          [1, 2, 3, 4],
          [4, 1, 2, 3],
          [3, 4, 1, 2],
          [2, 3, 4, 1],
          [1, 2, 3, 4],
        ];
        const heights = sequences[stepIndex];
        return (
          <g>
            <line x1="14" y1="80" x2="86" y2="80" stroke="#102a43" strokeWidth="2.2" />
            {heights.map((h, i) => {
              const barH = h * 14;
              const x = 19 + i * 17;
              const y = 80 - barH;
              const isTallest = h === 4;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="12"
                  height={barH}
                  rx="2"
                  fill={isTallest ? '#0284c7' : '#102a43'}
                />
              );
            })}
          </g>
        );
      }

      default: {
        // Generic fallback pattern if user adds custom pattern IDs
        const angle = stepIndex * 72;
        return (
          <g transform={`rotate(${angle}, 50, 50)`}>
            <polygon points="50,18 76,68 24,68" fill="#d9e2ec" stroke="#102a43" strokeWidth="2.4" />
            <circle cx="50" cy="30" r="4.5" fill="#102a43" />
          </g>
        );
      }
    }
  };

  return (
    <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">
          Diagram Urutan Pola Visual (1 → 5)
        </span>
        <span className="text-xs text-slate-500">
          {showAnswerFrame ? 'Kotak ke-5 menampilkan pola jawaban benar' : 'Tentukan isi Kotak ke-5 (?)'}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2.5 sm:gap-4 items-center">
        {frames.map((stepIdx) => {
          const isTargetFrame = stepIdx === 4;
          const shouldHideTarget = isTargetFrame && !showAnswerFrame;

          return (
            <div key={stepIdx} className="flex flex-col items-center">
              <div
                className={`w-full aspect-square max-w-[115px] rounded-lg border-2 flex items-center justify-center transition-all ${
                  isTargetFrame
                    ? showAnswerFrame
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                      : 'bg-amber-50/50 border-dashed border-navy-700'
                    : 'bg-white border-slate-300 shadow-sm'
                }`}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {shouldHideTarget ? (
                    <g>
                      <circle
                        cx="50"
                        cy="50"
                        r="26"
                        fill="#f0f4f8"
                        stroke="#334e68"
                        strokeWidth="2"
                        strokeDasharray="4,3"
                      />
                      <text
                        x="50"
                        y="60"
                        textAnchor="middle"
                        fontSize="30"
                        fontWeight="700"
                        fill="#102a43"
                      >
                        ?
                      </text>
                    </g>
                  ) : (
                    renderFrameContent(stepIdx)
                  )}
                </svg>
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isTargetFrame
                    ? showAnswerFrame
                      ? 'text-emerald-700 font-bold'
                      : 'text-navy-900 font-bold'
                    : 'text-slate-500'
                }`}
              >
                {isTargetFrame ? (showAnswerFrame ? 'Kotak 5 (Kunci)' : 'Kotak 5 (?)') : `Kotak ${stepIdx + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
