import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLocale } from '../../lib/i18n/locale';
import { Structure3DData } from '../../lib/schema/bioAppSchema';

interface VelocitySample {
  x: number;
  y: number;
  t: number;
}

export const Molecule3DViewer: React.FC<{ structure: Structure3DData }> = ({ structure }) => {
  const { tr } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Default to still at rest (0 idle rAF CPU); user can drag with momentum or toggle Auto-Spin.
  const [autoSpin, setAutoSpin] = useState(false);
  const [zoomTarget, setZoomTarget] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  const rotRef = useRef({ rx: 0.35, ry: 0.62 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const zoomCurrentRef = useRef(1.0);
  const sizeRef = useRef({ cssW: 720, cssH: 300, dpr: 1 });
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    lx: number;
    ly: number;
    samples: VelocitySample[];
  }>({
    active: false,
    pointerId: null,
    lx: 0,
    ly: 0,
    samples: [],
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

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cssW, cssH, dpr } = sizeRef.current;
    const targetW = Math.max(240, Math.round(cssW * dpr));
    const targetH = Math.max(200, Math.round(cssH * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const { rx, ry } = rotRef.current;
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const scale = Math.min(cssW, cssH) * 0.42 * zoomCurrentRef.current;

    const plddtColor = (b: number) => {
      if (b >= 90) return '#3b82f6';
      if (b >= 70) return '#65CBF3';
      if (b >= 50) return '#FFDB13';
      return '#FF7D45';
    };

    const projected = caAtoms.map((p) => {
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      const persp = 2.6 / (2.6 - z2 * 0.85);
      return {
        sx: cssW / 2 + x1 * scale * persp,
        sy: cssH / 2 + y2 * scale * persp,
        z: z2,
        b: p.b,
      };
    });

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < projected.length - 1; i++) {
      const a = projected[i];
      const b = projected[i + 1];
      if (Math.hypot(a.sx - b.sx, a.sy - b.sy) > scale * 0.38) continue;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.strokeStyle = plddtColor((a.b + b.b) / 2);
      ctx.lineWidth = Math.max(2.0, (a.z + 1.45) * 2.15);
      ctx.stroke();
    }
    ctx.restore();
  }, [caAtoms]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = (now: number) => {
      const dt = lastFrameRef.current ? Math.min(34, now - lastFrameRef.current) : 16.67;
      lastFrameRef.current = now;
      const dtScale = dt / 16.67;

      let keepAlive = false;

      // Smooth zoom spring interpolation
      const zoomDiff = zoomTarget - zoomCurrentRef.current;
      if (Math.abs(zoomDiff) > 0.002) {
        zoomCurrentRef.current += prefersReducedMotion ? zoomDiff : zoomDiff * Math.min(1, 0.24 * dtScale);
        keepAlive = !prefersReducedMotion;
      } else {
        zoomCurrentRef.current = zoomTarget;
      }

      if (dragRef.current.active) {
        keepAlive = true;
      } else if (autoSpin && !prefersReducedMotion) {
        rotRef.current.ry += 0.0075 * dtScale;
        keepAlive = true;
      } else if (!prefersReducedMotion) {
        const { vx, vy } = velRef.current;
        if (Math.hypot(vx, vy) > 0.00018) {
          rotRef.current.ry += vx * dtScale;
          rotRef.current.rx = Math.max(-1.45, Math.min(1.45, rotRef.current.rx + vy * dtScale));
          const decay = Math.pow(0.93, dtScale);
          velRef.current.vx *= decay;
          velRef.current.vy *= decay;
          keepAlive = true;
        } else {
          velRef.current.vx = 0;
          velRef.current.vy = 0;
        }
      }

      drawFrame();

      if (keepAlive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        lastFrameRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [autoSpin, drawFrame, prefersReducedMotion, zoomTarget]);

  // Measure container & DPR cleanly via ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
      const cssW = Math.max(240, Math.floor(rect.width));
      const cssH = cssW < 460 ? 236 : 292;
      sizeRef.current = { cssW, cssH, dpr };
      drawFrame();
    };

    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateSize());
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [drawFrame]);

  // Wake animation loop only when state requires motion or redraw
  useEffect(() => {
    drawFrame();
    if (autoSpin || Math.abs(zoomTarget - zoomCurrentRef.current) > 0.002) {
      ensureLoop();
    }
  }, [autoSpin, zoomTarget, caAtoms, drawFrame, ensureLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const finishPointerDrag = (pointerId: number) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== pointerId) return;
    const samples = dragRef.current.samples;
    if (!prefersReducedMotion && samples.length >= 2) {
      const last = samples[samples.length - 1];
      let first = samples[0];
      for (let i = samples.length - 2; i >= 0; i--) {
        if (last.t - samples[i].t <= 85) {
          first = samples[i];
        }
      }
      const elapsed = Math.max(8, last.t - first.t);
      if (performance.now() - last.t < 75) {
        const pxPerFrameX = ((last.x - first.x) / elapsed) * 16.67;
        const pxPerFrameY = ((last.y - first.y) / elapsed) * 16.67;
        velRef.current = {
          vx: Math.max(-0.14, Math.min(0.14, pxPerFrameX * 0.0085)),
          vy: Math.max(-0.14, Math.min(0.14, pxPerFrameY * 0.0085)),
        };
      }
    }
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    dragRef.current.samples = [];
    setIsDragging(false);
    ensureLoop();
  };

  const resetView = () => {
    rotRef.current = { rx: 0.35, ry: 0.62 };
    velRef.current = { vx: 0, vy: 0 };
    setZoomTarget(1.0);
    setAutoSpin(false);
    drawFrame();
  };

  const b = structure.confidenceBuckets;

  return (
    <div className="bio-mol-viewer">
      <div className="bio-mol-header">
        <div>
          <div className="bio-mol-meta">
            AlphaFold DB 3D · {structure.organism}
          </div>
          <h4 className="bio-mol-title">
            {structure.title} <span className="bio-mol-acc">({structure.accession})</span>
          </h4>
        </div>
        <div className="bio-mol-actions">
          {!prefersReducedMotion && (
            <button
              type="button"
              className="mas-get-pill white-on-dark"
              aria-pressed={autoSpin}
              onClick={() => setAutoSpin((v) => !v)}
            >
              {autoSpin ? tr('Pause Spin', '회전 일시정지') : tr('Auto-Spin', '자동 회전')}
            </button>
          )}
          <button
            type="button"
            className="mas-get-pill white-on-dark"
            onClick={() =>
              setZoomTarget((z) => (z >= 1.6 ? 1.0 : Number((z + 0.25).toFixed(2))))
            }
          >
            {tr('Zoom', '배율')} {zoomTarget.toFixed(2)}×
          </button>
          <button
            type="button"
            className="mas-get-pill white-on-dark"
            onClick={resetView}
            aria-label={tr('Reset 3D orientation', '3D 방향 초기화')}
          >
            <RotateCcw size={13} />
            <span>{tr('Reset', '초기화')}</span>
          </button>
          <a
            href={structure.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mas-get-pill solid-blue"
          >
            {tr('Download .PDB', '.PDB 다운로드')}
          </a>
        </div>
      </div>

      <div ref={wrapRef} className="bio-mol-canvas-wrap">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label={tr(
            `${structure.title} (${structure.accession}) interactive 3D C-alpha structure. Drag or use arrow keys to rotate.`,
            `${structure.title} (${structure.accession}) 인터랙티브 3D 단백질 골격. 드래그하거나 방향키로 회전하세요.`
          )}
          className={`bio-mol-canvas ${isDragging ? 'dragging' : ''}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            velRef.current = { vx: 0, vy: 0 };
            dragRef.current = {
              active: true,
              pointerId: e.pointerId,
              lx: e.clientX,
              ly: e.clientY,
              samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
            };
            setIsDragging(true);
            ensureLoop();
          }}
          onPointerMove={(e) => {
            if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
            const dx = e.clientX - dragRef.current.lx;
            const dy = e.clientY - dragRef.current.ly;
            rotRef.current.ry += dx * 0.0095;
            rotRef.current.rx = Math.max(-1.45, Math.min(1.45, rotRef.current.rx + dy * 0.0095));
            dragRef.current.lx = e.clientX;
            dragRef.current.ly = e.clientY;
            const nextSamples = [
              ...dragRef.current.samples.slice(-3),
              { x: e.clientX, y: e.clientY, t: performance.now() },
            ];
            dragRef.current.samples = nextSamples;
            drawFrame();
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
            finishPointerDrag(e.pointerId);
          }}
          onPointerCancel={(e) => finishPointerDrag(e.pointerId)}
          onLostPointerCapture={(e) => finishPointerDrag(e.pointerId)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              rotRef.current.ry -= 0.14;
              drawFrame();
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              rotRef.current.ry += 0.14;
              drawFrame();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              rotRef.current.rx = Math.max(-1.45, rotRef.current.rx - 0.14);
              drawFrame();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              rotRef.current.rx = Math.min(1.45, rotRef.current.rx + 0.14);
              drawFrame();
            } else if (e.key === '+' || e.key === '=') {
              e.preventDefault();
              setZoomTarget((z) => Math.min(1.85, Number((z + 0.2).toFixed(2))));
            } else if (e.key === '-') {
              e.preventDefault();
              setZoomTarget((z) => Math.max(0.75, Number((z - 0.2).toFixed(2))));
            } else if (e.key === '0') {
              e.preventDefault();
              resetView();
            }
          }}
        />
      </div>

      <div className="bio-mol-legend">
        <span>
          <strong className="plddt-dot very-high">■</strong>{' '}
          {tr('Very high (>90)', '매우 높음 (>90)')}: {b.veryHigh} aa
        </span>
        <span>
          <strong className="plddt-dot confident">■</strong>{' '}
          {tr('Confident (70–90)', '신뢰 (70–90)')}: {b.confident} aa
        </span>
        <span>
          <strong className="plddt-dot low">■</strong>{' '}
          {tr('Low (50–70)', '낮음 (50–70)')}: {b.low} aa
        </span>
        <span>
          <strong className="plddt-dot very-low">■</strong>{' '}
          {tr('Disordered (<50)', '비정형 (<50)')}: {b.veryLow} aa
        </span>
        <span className="bio-mol-hint">
          {tr('Touch/drag or arrow keys to rotate', '터치·드래그 또는 방향키로 3D 회전')}
        </span>
      </div>
    </div>
  );
};
