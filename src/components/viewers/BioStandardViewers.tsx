import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, Search, ZoomIn } from 'lucide-react';
import {
  PlotPoint,
  ScientificPlotData,
  SequenceTrackData,
  Structure3DData,
} from '../../lib/schema/bioAppSchema';

/* =========================================================
   1. INTERACTIVE DATA TABLE VIEWER
   ========================================================= */
export const InteractiveDataTableViewer: React.FC<{
  rows: Record<string, unknown>[];
  onSelectRow?: (row: Record<string, unknown>) => void;
}> = ({ rows, onSelectRow }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const columns = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]) : []), [rows]);

  const filteredAndSorted = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    let list = q
      ? rows.filter((r) =>
          Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
        )
      : [...rows];

    if (sortCol) {
      list.sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        const na = Number(va);
        const nb = Number(vb);
        if (!Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== '') {
          return sortAsc ? na - nb : nb - na;
        }
        return sortAsc
          ? String(va ?? '').localeCompare(String(vb ?? ''))
          : String(vb ?? '').localeCompare(String(va ?? ''));
      });
    }
    return list;
  }, [rows, filterQuery, sortCol, sortAsc]);

  const exportCsv = () => {
    if (!rows.length) return;
    const header = columns.join(',');
    const lines = filteredAndSorted.map((r) =>
      columns
        .map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openbioapp-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rows.length) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: 13.5,
        }}
      >
        No tabular rows returned for these parameters.
      </div>
    );
  }

  const renderCellBadge = (val: unknown) => {
    const s = String(val ?? '');
    if (s.includes('▲ High') || s === 'Lead-like / Clean' || s === 'Pathogenic') {
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 600,
            background: s === 'Pathogenic' ? 'rgba(255,59,48,0.12)' : 'rgba(52,199,89,0.14)',
            color: s === 'Pathogenic' ? '#d70015' : '#1b7f37',
          }}
        >
          {s}
        </span>
      );
    }
    if (s.includes('Alert') || s === 'Up-regulated') {
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 600,
            background: 'rgba(255,59,48,0.12)',
            color: '#d70015',
          }}
        >
          {s}
        </span>
      );
    }
    if (s === 'Down-regulated') {
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 600,
            background: 'rgba(0,122,255,0.12)',
            color: '#0066d6',
          }}
        >
          {s}
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    if (s.length > 56) {
      return (
        <span title={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
          {s.slice(0, 54)}…
        </span>
      );
    }
    return s;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <div
          className="mas-search-pill"
          style={{ width: 260, background: '#ffffff', border: '1px solid #e5e5ea' }}
        >
          <Search size={13} color="#86868b" />
          <input
            className="mas-search-input"
            placeholder={`Filter ${rows.length} rows…`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Showing {filteredAndSorted.length} of {rows.length} records
          </span>
          <button
            type="button"
            className="mas-get-pill"
            style={{ height: 28, padding: '0 12px', display: 'inline-flex', gap: 5, alignItems: 'center' }}
            onClick={exportCsv}
          >
            <Download size={12} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          maxHeight: 390,
          borderRadius: 12,
          border: '1px solid var(--divider-hairline)',
          background: '#ffffff',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12.5,
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                position: 'sticky',
                top: 0,
                background: '#f5f5f7',
                borderBottom: '1px solid var(--divider-hairline)',
                zIndex: 2,
              }}
            >
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => {
                    if (sortCol === col) setSortAsc((v) => !v);
                    else {
                      setSortCol(col);
                      setSortAsc(true);
                    }
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.replace(/_/g, ' ')}{' '}
                  {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.slice(0, 120).map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onSelectRow?.(row)}
                style={{
                  borderBottom: '1px solid #f0f0f3',
                  cursor: onSelectRow ? 'pointer' : 'default',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: '8.5px 12px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {renderCellBadge(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   2. SCIENTIFIC PLOT VIEWER (Spectrum Overlay, Volcano, KM, Scatter, Bar)
   ========================================================= */
export const ScientificPlotViewer: React.FC<{
  plot: ScientificPlotData;
  focusMzCenter?: number | null;
}> = ({ plot, focusMzCenter }) => {
  const [hovered, setHovered] = useState<{ label: string; x: number; y: number } | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (focusMzCenter && plot.kind === 'spectrum_overlay') {
      setZoomRange([focusMzCenter - 4.0, focusMzCenter + 4.0]);
    } else {
      setZoomRange(null);
    }
  }, [focusMzCenter, plot]);

  // Extract preset zoom windows from theoretical overlay traces on spectrum_overlay plots
  const overlayWindows = useMemo(() => {
    if (plot.kind !== 'spectrum_overlay' || plot.series.length < 2) return [];
    return plot.series.slice(1).map((s) => {
      const xs = s.points.map((p) => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const mid = (minX + maxX) / 2;
      return {
        label: s.name.replace('Theoretical: ', '').split(' (')[0],
        range: [mid - 3.5, mid + 3.5] as [number, number],
      };
    });
  }, [plot]);

  if (plot.kind === 'bar') {
    const pts = plot.series[0]?.points || [];
    const maxVal = Math.max(0.001, ...pts.map((p) => p.x));
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--divider-hairline)',
          padding: '18px 20px',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>
          {plot.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pts.map((pt, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 64px', gap: 12, alignItems: 'center' }}>
              <div
                title={pt.label}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pt.label}
              </div>
              <div style={{ height: 10, borderRadius: 999, background: '#f2f2f7', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(3, (pt.x / maxVal) * 100)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: plot.series[0]?.color || '#007AFF',
                  }}
                />
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                {pt.x.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'right' }}>
          {plot.xLabel}
        </div>
      </div>
    );
  }

  const W = 820;
  const H = 330;
  const PAD = { top: 24, right: 24, bottom: 42, left: 62 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const visibleSeries = plot.series.map((s) => ({
    ...s,
    points: zoomRange
      ? s.points.filter((p) => p.x >= zoomRange[0] && p.x <= zoomRange[1])
      : s.points,
  }));

  const allPts: PlotPoint[] = visibleSeries.flatMap((s) => s.points);
  const minX = zoomRange ? zoomRange[0] : allPts.length ? Math.min(...allPts.map((p) => p.x)) : 0;
  const maxX = zoomRange ? zoomRange[1] : allPts.length ? Math.max(...allPts.map((p) => p.x)) : 1;
  const rawMinY = plot.yDomain ? plot.yDomain[0] : allPts.length ? Math.min(0, ...allPts.map((p) => p.y)) : 0;
  const rawMaxY = plot.yDomain ? plot.yDomain[1] : allPts.length ? Math.max(...allPts.map((p) => p.y)) * 1.08 : 1;

  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, rawMaxY - rawMinY);

  const sx = (x: number) => PAD.left + ((x - minX) / spanX) * innerW;
  const sy = (y: number) => PAD.top + innerH - ((y - rawMinY) / spanY) * innerH;

  const isLineMode = plot.kind === 'spectrum_overlay' || plot.kind === 'line';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--divider-hairline)',
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {plot.title}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {overlayWindows.map((win, idx) => (
            <button
              key={idx}
              type="button"
              className="mas-get-pill"
              style={{ height: 25, padding: '0 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => setZoomRange(win.range)}
            >
              <ZoomIn size={11} />
              <span>Zoom {win.label}</span>
            </button>
          ))}
          {zoomRange && (
            <button
              type="button"
              className="mas-get-pill"
              style={{ height: 25, padding: '0 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => setZoomRange(null)}
            >
              <RotateCcw size={11} />
              <span>Full Range</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        {plot.series.map((s, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: isLineMode ? 2 : '50%',
                background: s.color,
                display: 'inline-block',
              }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yVal = rawMinY + t * spanY;
            const py = sy(yVal);
            return (
              <g key={t}>
                <line x1={PAD.left} y1={py} x2={W - PAD.right} y2={py} stroke="#f0f0f4" strokeWidth={1} />
                <text x={PAD.left - 8} y={py + 4} textAnchor="end" fontSize={10.5} fill="#86868b">
                  {Math.abs(yVal) >= 1000 ? `${(yVal / 1000).toFixed(0)}k` : yVal.toFixed(yVal <= 1.5 ? 2 : 0)}
                </text>
              </g>
            );
          })}

          {/* X-axis ticks */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
            const xVal = minX + t * spanX;
            const px = sx(xVal);
            return (
              <g key={t}>
                <line x1={px} y1={PAD.top} x2={px} y2={H - PAD.bottom} stroke="#f5f5f8" strokeWidth={1} />
                <text x={px} y={H - PAD.bottom + 16} textAnchor="middle" fontSize={10.5} fill="#86868b">
                  {xVal.toFixed(spanX < 20 ? 2 : 0)}
                </text>
              </g>
            );
          })}

          {/* Threshold lines */}
          {plot.yThreshold !== undefined && (
            <line
              x1={PAD.left}
              y1={sy(plot.yThreshold)}
              x2={W - PAD.right}
              y2={sy(plot.yThreshold)}
              stroke="#ff9500"
              strokeDasharray="4 4"
              strokeWidth={1.2}
            />
          )}
          {(plot.xThresholds || []).map((xt, idx) => (
            <line
              key={idx}
              x1={sx(xt)}
              y1={PAD.top}
              x2={sx(xt)}
              y2={H - PAD.bottom}
              stroke="#aeaeb2"
              strokeDasharray="4 4"
              strokeWidth={1.2}
            />
          ))}

          {/* Series */}
          {visibleSeries.map((s, sIdx) => {
            if (!s.points.length) return null;
            if (isLineMode) {
              // Build SVG path (step or polyline)
              let d = '';
              s.points.forEach((p, idx) => {
                const px = sx(p.x);
                const py = sy(p.y);
                if (idx === 0) {
                  d += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
                } else if (s.step) {
                  const prevY = sy(s.points[idx - 1].y);
                  d += ` L ${px.toFixed(1)} ${prevY.toFixed(1)} L ${px.toFixed(1)} ${py.toFixed(1)}`;
                } else {
                  d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
                }
              });

              // Optional stick bars for theoretical isotope overlays when zoomed in
              const isTheoreticalOverlay = plot.kind === 'spectrum_overlay' && sIdx > 0;
              return (
                <g key={sIdx}>
                  {isTheoreticalOverlay &&
                    s.points.map((p, pIdx) => (
                      <line
                        key={pIdx}
                        x1={sx(p.x)}
                        y1={sy(0)}
                        x2={sx(p.x)}
                        y2={sy(p.y)}
                        stroke={s.color}
                        strokeWidth={zoomRange ? 2.4 : 1.5}
                        opacity={0.75}
                      />
                    ))}
                  <path
                    d={d}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.lineWidth || 1.8}
                    opacity={isTheoreticalOverlay ? 0.95 : 0.88}
                  />
                </g>
              );
            }

            // Scatter / Volcano points
            return (
              <g key={sIdx}>
                {s.points.map((p, pIdx) => {
                  const px = sx(p.x);
                  const py = sy(p.y);
                  return (
                    <g key={pIdx}>
                      <circle
                        cx={px}
                        cy={py}
                        r={p.size ? Math.min(9, p.size / 1.6) : 4.5}
                        fill={s.color}
                        opacity={0.85}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() =>
                          setHovered({
                            label: p.label || `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`,
                            x: px,
                            y: py,
                          })
                        }
                        onMouseLeave={() => setHovered(null)}
                      />
                      {plot.kind === 'volcano' && sIdx < 2 && pIdx < 5 && p.label && (
                        <text x={px + 6} y={py - 4} fontSize={10} fontWeight={600} fill="#1d1d1f">
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Axes labels */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={11.5} fontWeight={500} fill="#6e6e73">
            {plot.xLabel}
          </text>
          <text
            x={15}
            y={H / 2}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight={500}
            fill="#6e6e73"
            transform={`rotate(-90 15 ${H / 2})`}
          >
            {plot.yLabel}
          </text>

          {hovered && (
            <g transform={`translate(${Math.min(W - 210, Math.max(70, hovered.x + 10))}, ${Math.max(28, hovered.y - 16)})`}>
              <rect x={0} y={-16} width={196} height={24} rx={6} fill="rgba(29,29,31,0.9)" />
              <text x={8} y={0} fontSize={11} fill="#ffffff">
                {hovered.label.slice(0, 28)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

/* =========================================================
   3. INTERACTIVE 3D PROTEIN STRUCTURE VIEWER (AlphaFold pLDDT Ribbon)
   ========================================================= */
export const Molecule3DViewer: React.FC<{ structure: Structure3DData }> = ({ structure }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [autoSpin, setAutoSpin] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const rotRef = useRef({ rx: 0.35, ry: 0.6 });
  const dragRef = useRef<{ active: boolean; lx: number; ly: number }>({
    active: false,
    lx: 0,
    ly: 0,
  });

  const caAtoms = useMemo(() => {
    const pts: { x: number; y: number; z: number; b: number }[] = [];
    for (const line of structure.pdbText.split('\n')) {
      if (line.startsWith('ATOM  ') && line.slice(12, 16).trim() === 'CA') {
        const x = parseFloat(line.slice(30, 38));
        const y = parseFloat(line.slice(38, 46));
        const z = parseFloat(line.slice(46, 54));
        const b = parseFloat(line.slice(60, 66));
        if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
          pts.push({ x, y, z, b: Number.isNaN(b) ? 80 : b });
        }
      }
    }
    if (!pts.length) return [];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const cz = pts.reduce((a, p) => a + p.z, 0) / pts.length;
    const maxR = Math.max(
      1,
      ...pts.map((p) => Math.hypot(p.x - cx, p.y - cy, p.z - cz))
    );
    return pts.map((p) => ({
      x: (p.x - cx) / maxR,
      y: (p.y - cy) / maxR,
      z: (p.z - cz) / maxR,
      b: p.b,
    }));
  }, [structure.pdbText]);

  useEffect(() => {
    let rafId = 0;
    const plddtColor = (b: number) => {
      if (b >= 90) return '#0053D6';
      if (b >= 70) return '#65CBF3';
      if (b >= 50) return '#FFDB13';
      return '#FF7D45';
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (autoSpin && !dragRef.current.active) {
        rotRef.current.ry += 0.008;
      }
      const { rx, ry } = rotRef.current;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const scale = Math.min(w, h) * 0.42 * zoom;

      const projected = caAtoms.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const persp = 2.6 / (2.6 - z2 * 0.85);
        return {
          sx: w / 2 + x1 * scale * persp,
          sy: h / 2 + y2 * scale * persp,
          z: z2,
          b: p.b,
        };
      });

      // Draw C-alpha backbone trace segments sorted smoothly
      ctx.lineCap = 'round';
      for (let i = 0; i < projected.length - 1; i++) {
        const a = projected[i];
        const b = projected[i + 1];
        if (Math.hypot(a.sx - b.sx, a.sy - b.sy) > scale * 0.35) continue;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = plddtColor((a.b + b.b) / 2);
        ctx.lineWidth = Math.max(2.0, (a.z + 1.4) * 2.2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [caAtoms, autoSpin, zoom]);

  const b = structure.confidenceBuckets;

  return (
    <div
      style={{
        background: '#0b1020',
        borderRadius: 14,
        padding: 18,
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#65CBF3', textTransform: 'uppercase' }}>
            ALPHAFOLD DB 3D COORDINATES · {structure.organism}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
            {structure.title} ({structure.accession})
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="mas-get-pill white-on-dark"
            style={{ height: 28, padding: '0 12px', fontSize: 12 }}
            onClick={() => setAutoSpin((v) => !v)}
          >
            {autoSpin ? 'Pause Spin' : 'Auto-Spin'}
          </button>
          <button
            type="button"
            className="mas-get-pill white-on-dark"
            style={{ height: 28, padding: '0 12px', fontSize: 12 }}
            onClick={() => setZoom((z) => (z >= 1.6 ? 1.0 : Number((z + 0.25).toFixed(2))))}
          >
            Zoom {zoom.toFixed(2)}×
          </button>
          <a
            href={structure.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mas-get-pill solid-blue"
            style={{ height: 28, padding: '0 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Download .PDB
          </a>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={760}
        height={320}
        style={{ width: '100%', height: 300, cursor: 'grab', display: 'block', margin: '8px 0' }}
        onMouseDown={(e) => {
          dragRef.current = { active: true, lx: e.clientX, ly: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current.active) return;
          const dx = e.clientX - dragRef.current.lx;
          const dy = e.clientY - dragRef.current.ly;
          rotRef.current.ry += dx * 0.01;
          rotRef.current.rx += dy * 0.01;
          dragRef.current.lx = e.clientX;
          dragRef.current.ly = e.clientY;
        }}
        onMouseUp={() => {
          dragRef.current.active = false;
        }}
        onMouseLeave={() => {
          dragRef.current.active = false;
        }}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11.5, opacity: 0.9 }}>
        <span><strong style={{ color: '#0053D6' }}>■</strong> Very high (&gt;90): {b.veryHigh} aa</span>
        <span><strong style={{ color: '#65CBF3' }}>■</strong> Confident (70–90): {b.confident} aa</span>
        <span><strong style={{ color: '#FFDB13' }}>■</strong> Low (50–70): {b.low} aa</span>
        <span><strong style={{ color: '#FF7D45' }}>■</strong> Disordered (&lt;50): {b.veryLow} aa</span>
        <span style={{ marginLeft: 'auto', opacity: 0.72 }}>Drag to rotate 3D backbone</span>
      </div>
    </div>
  );
};

/* =========================================================
   4. SEQUENCE & GENOMIC FEATURE TRACK VIEWER
   ========================================================= */
export const SequenceAndTrackViewer: React.FC<{ track: SequenceTrackData }> = ({ track }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--divider-hairline)',
        padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{track.sequenceName}</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {track.lengthBp} bp · {track.gcPercent}% GC
        </span>
      </div>

      {/* Visual Track Map */}
      <div style={{ background: '#f5f5f7', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#d4d4d8', margin: '14px 0 22px' }}>
          {track.features.map((f, idx) => {
            const leftPct = Math.max(0, ((f.start - 1) / track.lengthBp) * 100);
            const widthPct = Math.max(2.5, ((f.end - f.start + 1) / track.lengthBp) * 100);
            return (
              <div
                key={idx}
                title={`${f.name} (${f.start}..${f.end}, ${f.strand}) ${f.detail || ''}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${Math.min(100 - leftPct, widthPct)}%`,
                  top: idx % 2 === 0 ? -7 : 5,
                  height: 12,
                  borderRadius: 4,
                  background: f.color,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {track.features.map((f, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 11.5,
                padding: '3px 8px',
                borderRadius: 6,
                background: '#ffffff',
                border: '1px solid #e5e5ea',
              }}
            >
              <strong style={{ color: f.color }}>{f.strand}</strong> {f.name} ({f.start}..{f.end})
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
          lineHeight: 1.6,
          background: '#fbfbfd',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #eeeef2',
          wordBreak: 'break-all',
          maxHeight: 130,
          overflowY: 'auto',
        }}
      >
        {track.sequence}
      </div>

      {track.translatedProtein && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
          <strong>Frame +1 Translation:</strong>{' '}
          <span style={{ fontFamily: 'var(--font-mono)' }}>{track.translatedProtein}</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   5. MARKDOWN SCIENTIFIC REPORT VIEWER
   ========================================================= */
const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.92em',
            background: '#f2f2f7',
            padding: '1px 5px',
            borderRadius: 4,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

export const MarkdownReportViewer: React.FC<{ markdown: string }> = ({ markdown }) => {
  const lines = markdown.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-primary)' }}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} style={{ height: 2 }} />;
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} style={{ margin: '4px 0 2px', fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} style={{ margin: '6px 0 4px', fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em' }}>
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} style={{ margin: '6px 0 4px', fontSize: 19, fontWeight: 700 }}>
              {renderInlineMarkdown(line.slice(2))}
            </h2>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 4 }}>
              <span style={{ color: '#007aff', fontWeight: 700, lineHeight: 1.5 }}>•</span>
              <span>{renderInlineMarkdown(line.slice(2))}</span>
            </div>
          );
        }
        return <p key={idx} style={{ margin: 0 }}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
};
