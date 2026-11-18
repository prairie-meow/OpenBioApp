import React, { useEffect, useId, useMemo, useState } from 'react';
import { Download, RotateCcw, Search, X, ZoomIn } from 'lucide-react';
import { useLocale } from '../../lib/i18n/locale';
import {
  PlotPoint,
  ScientificPlotData,
  SequenceTrackData,
} from '../../lib/schema/bioAppSchema';

export { Molecule3DViewer } from './Molecule3DViewer';

/* =========================================================
   1. INTERACTIVE DATA TABLE VIEWER
   ========================================================= */
export const InteractiveDataTableViewer: React.FC<{
  rows: Record<string, unknown>[];
  onSelectRow?: (row: Record<string, unknown>) => void;
}> = ({ rows, onSelectRow }) => {
  const { tr } = useLocale();
  const filterInputId = useId();
  const [filterQuery, setFilterQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const columns = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]) : []), [rows]);

  const filteredAndSorted = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    const list = q
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
      <div className="bio-empty-state">
        {tr(
          'No tabular rows returned for these parameters.',
          '현재 파라미터 조건에서 반환된 결과 행이 없습니다.'
        )}
      </div>
    );
  }

  const renderCellBadge = (val: unknown) => {
    const s = String(val ?? '');
    if (s.includes('▲ High') || s === 'Lead-like / Clean') {
      return <span className="bio-status-pill ok">{s}</span>;
    }
    if (s === 'Pathogenic' || s.includes('Alert') || s === 'Up-regulated') {
      return <span className="bio-status-pill alert">{s}</span>;
    }
    if (s === 'Down-regulated') {
      return <span className="bio-status-pill info">{s}</span>;
    }
    if (typeof val === 'boolean') {
      return val ? tr('Yes', '예') : tr('No', '아니오');
    }
    if (s.length > 56) {
      return (
        <span title={s} className="bio-mono-cell">
          {s.slice(0, 54)}…
        </span>
      );
    }
    return s;
  };

  return (
    <div className="bio-table-block">
      <div className="bio-table-toolbar">
        <div className="mas-search-pill bio-table-search">
          <label htmlFor={filterInputId} className="sr-only">
            {tr('Filter result rows', '결과 행 검색 필터')}
          </label>
          <Search size={14} aria-hidden="true" />
          <input
            id={filterInputId}
            className="mas-search-input"
            placeholder={tr(`Filter ${rows.length} rows…`, `${rows.length}개 결과 행 필터…`)}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button
              type="button"
              className="mas-search-clear"
              aria-label={tr('Clear table filter', '테이블 필터 지우기')}
              onClick={() => setFilterQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="bio-table-toolbar-meta">
          <span className="bio-table-count">
            {tr(
              `Showing ${filteredAndSorted.length} of ${rows.length}`,
              `총 ${rows.length}개 중 ${filteredAndSorted.length}개 표시`
            )}
          </span>
          <button type="button" className="mas-get-pill" onClick={exportCsv}>
            <Download size={13} />
            <span>{tr('Export CSV', 'CSV 내보내기')}</span>
          </button>
        </div>
      </div>

      <div className="bio-table-scroll">
        <table className="bio-data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sortCol === col;
                const ariaSort = active ? (sortAsc ? 'ascending' : 'descending') : 'none';
                return (
                  <th key={col} scope="col" aria-sort={ariaSort}>
                    <button
                      type="button"
                      className="bio-th-sort-btn"
                      onClick={() => {
                        if (sortCol === col) setSortAsc((v) => !v);
                        else {
                          setSortCol(col);
                          setSortAsc(true);
                        }
                      }}
                    >
                      <span>{col.replace(/_/g, ' ')}</span>
                      <span className="bio-sort-indicator" aria-hidden="true">
                        {active ? (sortAsc ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.slice(0, 120).map((row, idx) => (
              <tr
                key={idx}
                className={onSelectRow ? 'is-selectable' : undefined}
                tabIndex={onSelectRow ? 0 : undefined}
                onClick={() => onSelectRow?.(row)}
                onKeyDown={
                  onSelectRow
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectRow(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col}>{renderCellBadge(row[col])}</td>
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
  const { tr } = useLocale();
  const [hovered, setHovered] = useState<{ label: string; x: number; y: number } | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (focusMzCenter && plot.kind === 'spectrum_overlay') {
      setZoomRange([focusMzCenter - 4.0, focusMzCenter + 4.0]);
    } else {
      setZoomRange(null);
    }
  }, [focusMzCenter, plot]);

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
      <div className="bio-plot-card">
        <div className="bio-plot-title">{plot.title}</div>
        <div className="bio-bar-list">
          {pts.map((pt, i) => (
            <div key={i} className="bio-bar-row">
              <div title={pt.label} className="bio-bar-label">
                {pt.label}
              </div>
              <div className="bio-bar-track">
                <div
                  className="bio-bar-fill"
                  style={{
                    width: `${Math.max(3, (pt.x / maxVal) * 100)}%`,
                    background: plot.series[0]?.color || 'var(--accent-blue)',
                  }}
                />
              </div>
              <div className="bio-bar-value">{pt.x.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="bio-plot-axis-caption">{plot.xLabel}</div>
      </div>
    );
  }

  const W = 820;
  const H = 340;
  const PAD = { top: 24, right: 24, bottom: 46, left: 66 };
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
    <div className="bio-plot-card">
      <div className="bio-plot-header">
        <div className="bio-plot-title">{plot.title}</div>

        <div className="bio-plot-actions">
          {overlayWindows.map((win, idx) => (
            <button
              key={idx}
              type="button"
              className="mas-get-pill"
              onClick={() => setZoomRange(win.range)}
            >
              <ZoomIn size={13} />
              <span>{tr(`Zoom ${win.label}`, `${win.label} 확대`)}</span>
            </button>
          ))}
          {zoomRange && (
            <button
              type="button"
              className="mas-get-pill"
              onClick={() => setZoomRange(null)}
            >
              <RotateCcw size={13} />
              <span>{tr('Full Range', '전체 범위')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="bio-plot-legend">
        {plot.series.map((s, idx) => (
          <div key={idx} className="bio-plot-legend-item">
            <span
              className={`bio-plot-swatch ${isLineMode ? 'line' : 'dot'}`}
              style={{ background: s.color }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      <div className="bio-plot-svg-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={plot.title}
          className="bio-plot-svg"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yVal = rawMinY + t * spanY;
            const py = sy(yVal);
            return (
              <g key={t}>
                <line x1={PAD.left} y1={py} x2={W - PAD.right} y2={py} stroke="#ededf2" strokeWidth={1} />
                <text x={PAD.left - 10} y={py + 4} textAnchor="end" fontSize={12} fill="#59595e">
                  {Math.abs(yVal) >= 1000 ? `${(yVal / 1000).toFixed(0)}k` : yVal.toFixed(yVal <= 1.5 ? 2 : 0)}
                </text>
              </g>
            );
          })}

          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
            const xVal = minX + t * spanX;
            const px = sx(xVal);
            return (
              <g key={t}>
                <line x1={px} y1={PAD.top} x2={px} y2={H - PAD.bottom} stroke="#f3f3f7" strokeWidth={1} />
                <text x={px} y={H - PAD.bottom + 18} textAnchor="middle" fontSize={12} fill="#59595e">
                  {xVal.toFixed(spanX < 20 ? 2 : 0)}
                </text>
              </g>
            );
          })}

          {plot.yThreshold !== undefined && (
            <line
              x1={PAD.left}
              y1={sy(plot.yThreshold)}
              x2={W - PAD.right}
              y2={sy(plot.yThreshold)}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth={1.3}
            />
          )}
          {(plot.xThresholds || []).map((xt, idx) => (
            <line
              key={idx}
              x1={sx(xt)}
              y1={PAD.top}
              x2={sx(xt)}
              y2={H - PAD.bottom}
              stroke="#68686e"
              strokeDasharray="4 4"
              strokeWidth={1.3}
            />
          ))}

          {visibleSeries.map((s, sIdx) => {
            if (!s.points.length) return null;
            if (isLineMode) {
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
                        opacity={0.78}
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

            return (
              <g key={sIdx}>
                {s.points.map((p, pIdx) => {
                  const px = sx(p.x);
                  const py = sy(p.y);
                  const pointLabel = p.label || `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;
                  const isFocusable = pIdx < 25;
                  return (
                    <g key={pIdx}>
                      <circle
                        cx={px}
                        cy={py}
                        r={p.size ? Math.min(9, p.size / 1.6) : 4.8}
                        fill={s.color}
                        opacity={0.86}
                        tabIndex={isFocusable ? 0 : undefined}
                        aria-label={isFocusable ? `${s.name}: ${pointLabel}` : undefined}
                        className="bio-plot-point"
                        onMouseEnter={() => setHovered({ label: pointLabel, x: px, y: py })}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered({ label: pointLabel, x: px, y: py })}
                        onBlur={() => setHovered(null)}
                      />
                      {plot.kind === 'volcano' && sIdx < 2 && pIdx < 5 && p.label && (
                        <text x={px + 6} y={py - 4} fontSize={12} fontWeight={600} fill="#1d1d1f">
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={12} fontWeight={500} fill="#59595e">
            {plot.xLabel}
          </text>
          <text
            x={16}
            y={H / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="#59595e"
            transform={`rotate(-90 16 ${H / 2})`}
          >
            {plot.yLabel}
          </text>

          {hovered && (
            <g transform={`translate(${Math.min(W - 220, Math.max(70, hovered.x + 10))}, ${Math.max(30, hovered.y - 16)})`}>
              <rect x={0} y={-18} width={208} height={26} rx={6} fill="rgba(29,29,31,0.92)" />
              <text x={9} y={-1} fontSize={12} fill="#ffffff">
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
   3. SEQUENCE & GENOMIC FEATURE TRACK VIEWER
   ========================================================= */
export const SequenceAndTrackViewer: React.FC<{ track: SequenceTrackData }> = ({ track }) => {
  const { tr } = useLocale();
  return (
    <div className="bio-plot-card">
      <div className="bio-seq-header">
        <span className="bio-plot-title">{track.sequenceName}</span>
        <span className="bio-seq-meta">
          {track.lengthBp} bp · {track.gcPercent}% GC
        </span>
      </div>

      <div className="bio-seq-track-box">
        <div className="bio-seq-backbone">
          {track.features.map((f, idx) => {
            const leftPct = Math.max(0, ((f.start - 1) / track.lengthBp) * 100);
            const widthPct = Math.max(2.5, ((f.end - f.start + 1) / track.lengthBp) * 100);
            return (
              <div
                key={idx}
                title={`${f.name} (${f.start}..${f.end}, ${f.strand}) ${f.detail || ''}`}
                className="bio-seq-feature"
                style={{
                  left: `${leftPct}%`,
                  width: `${Math.min(100 - leftPct, widthPct)}%`,
                  top: idx % 2 === 0 ? -7 : 5,
                  background: f.color,
                }}
              />
            );
          })}
        </div>
        <div className="bio-seq-chip-row">
          {track.features.map((f, idx) => (
            <span key={idx} className="bio-seq-chip">
              <strong style={{ color: f.color }}>{f.strand}</strong> {f.name} ({f.start}..{f.end})
            </span>
          ))}
        </div>
      </div>

      <div className="bio-seq-raw">{track.sequence}</div>

      {track.translatedProtein && (
        <div className="bio-seq-translation">
          <strong>{tr('Frame +1 Translation:', 'Frame +1 번역 아미노산:')}</strong>{' '}
          <span className="bio-mono-cell">{track.translatedProtein}</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   4. MARKDOWN SCIENTIFIC REPORT VIEWER
   ========================================================= */
const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="bio-md-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bio-md-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

export const InlineRichText: React.FC<{ text: string }> = ({ text }) => (
  <>{renderInlineMarkdown(text)}</>
);

export const MarkdownReportViewer: React.FC<{ markdown: string }> = ({ markdown }) => {
  const lines = markdown.split('\n');
  return (
    <div className="bio-md-report">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="bio-md-spacer" />;
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="bio-md-h4">
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="bio-md-h3">
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} className="bio-md-h2">
              {renderInlineMarkdown(line.slice(2))}
            </h2>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="bio-md-bullet">
              <span className="bio-md-dot" aria-hidden="true">•</span>
              <span>{renderInlineMarkdown(line.slice(2))}</span>
            </div>
          );
        }
        return <p key={idx} className="bio-md-p">{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
};
