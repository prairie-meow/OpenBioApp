import React, { useId } from 'react';
import { IconGlyphType } from '../types/store';

interface BioAppIconProps {
  glyph: IconGlyphType;
  gradient: [string, string, string?];
  accent: string;
  size?: number;
}

export const BioAppIcon: React.FC<BioAppIconProps> = ({
  glyph,
  gradient,
  accent,
  size = 54,
}) => {
  const rawId = useId();
  const uid = `ico-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [g0, g1, g2] = gradient;

  const renderGlyph = () => {
    switch (glyph) {
      case 'helix':
        return (
          <g stroke="#fff" strokeWidth="5.5" strokeLinecap="round" fill="none">
            <path d="M28 22 C44 22, 56 38, 72 38 C56 38, 44 62, 28 62 C44 62, 56 78, 72 78" opacity="0.95" />
            <path d="M72 22 C56 22, 44 38, 28 38 C44 38, 56 62, 72 62 C56 62, 44 78, 28 78" stroke={accent} />
            <line x1="36" y1="27" x2="64" y2="27" strokeWidth="3.5" opacity="0.55" />
            <line x1="34" y1="50" x2="66" y2="50" strokeWidth="3.5" opacity="0.7" />
            <line x1="36" y1="73" x2="64" y2="73" strokeWidth="3.5" opacity="0.55" />
          </g>
        );
      case 'protein-fold':
        return (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M22 66 C20 40, 38 22, 52 34 C66 46, 36 68, 54 74 C70 79, 82 54, 74 30"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="12"
            />
            <path
              d="M22 66 C20 40, 38 22, 52 34 C66 46, 36 68, 54 74 C70 79, 82 54, 74 30"
              stroke="#fff"
              strokeWidth="6.5"
            />
            <circle cx="52" cy="34" r="6.5" fill={accent} />
            <circle cx="74" cy="30" r="5.5" fill="#fff" />
            <circle cx="22" cy="66" r="5.5" fill={accent} />
          </g>
        );
      case 'umap-cells':
        return (
          <g>
            <circle cx="34" cy="36" r="9" fill="#fff" opacity="0.92" />
            <circle cx="46" cy="29" r="5.5" fill="#fff" opacity="0.75" />
            <circle cx="29" cy="49" r="5" fill="#fff" opacity="0.65" />
            <circle cx="65" cy="58" r="10" fill={accent} />
            <circle cx="53" cy="68" r="6" fill={accent} opacity="0.82" />
            <circle cx="72" cy="44" r="5.5" fill="#ffd60a" opacity="0.95" />
            <circle cx="60" cy="38" r="4" fill="#ffd60a" opacity="0.8" />
            <path d="M22 76 L22 22 M22 76 L78 76" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'crispr-scissors':
        return (
          <g fill="none" strokeLinecap="round">
            <rect x="18" y="45" width="64" height="10" rx="5" fill="rgba(255,255,255,0.22)" />
            <line x1="26" y1="50" x2="74" y2="50" stroke="#fff" strokeWidth="4" strokeDasharray="5 6" />
            <path d="M38 24 L58 66 M62 24 L42 66" stroke={accent} strokeWidth="5.5" />
            <circle cx="36" cy="23" r="6.5" stroke="#fff" strokeWidth="4" />
            <circle cx="64" cy="23" r="6.5" stroke="#fff" strokeWidth="4" />
            <circle cx="50" cy="47" r="4.5" fill="#fff" />
          </g>
        );
      case 'cryo-grid':
        return (
          <g>
            <circle cx="50" cy="50" r="29" fill="none" stroke="#fff" strokeWidth="4.5" opacity="0.92" />
            <circle cx="50" cy="50" r="18" fill="none" stroke={accent} strokeWidth="3.5" strokeDasharray="6 4" />
            <line x1="21" y1="50" x2="79" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            <line x1="50" y1="21" x2="50" y2="79" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="7" fill="#fff" />
          </g>
        );
      case 'pipeline-dag':
        return (
          <g fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round">
            <path d="M30 32 L50 50 L30 68 M50 50 L72 36 M50 50 L72 64" opacity="0.85" />
            <circle cx="28" cy="32" r="7" fill="#fff" stroke="none" />
            <circle cx="28" cy="68" r="7" fill="#fff" stroke="none" />
            <circle cx="50" cy="50" r="8.5" fill={accent} stroke="#fff" strokeWidth="3" />
            <circle cx="72" cy="36" r="7" fill={accent} stroke="none" />
            <circle cx="72" cy="64" r="7" fill="#fff" stroke="none" />
          </g>
        );
      case 'plasmid-ring':
        return (
          <g fill="none">
            <circle cx="50" cy="50" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="9" />
            <path d="M50 24 A26 26 0 0 1 76 50" stroke={accent} strokeWidth="9" strokeLinecap="round" />
            <path d="M72 63 A26 26 0 0 1 31 68" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
            <path d="M25 43 A26 26 0 0 1 38 27" stroke="#ffd60a" strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.9)" />
          </g>
        );
      case 'docking-pocket':
        return (
          <g>
            <path
              d="M22 36 C22 24, 78 24, 78 38 C78 54, 62 50, 60 62 C58 74, 42 74, 40 62 C38 50, 22 54, 22 36 Z"
              fill="rgba(255,255,255,0.22)"
              stroke="#fff"
              strokeWidth="4"
            />
            <polygon points="50,38 61,45 57,58 43,58 39,45" fill={accent} stroke="#fff" strokeWidth="3" />
            <circle cx="50" cy="49" r="4" fill="#fff" />
          </g>
        );
      case 'agent-brain':
        return (
          <g>
            <rect x="25" y="25" width="50" height="50" rx="14" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="3.5" />
            <circle cx="50" cy="50" r="10" fill={accent} />
            <circle cx="35" cy="35" r="4.5" fill="#fff" />
            <circle cx="65" cy="35" r="4.5" fill="#fff" />
            <circle cx="35" cy="65" r="4.5" fill="#fff" />
            <circle cx="65" cy="65" r="4.5" fill="#fff" />
            <path d="M38 38 L45 45 M62 38 L55 45 M38 62 L45 55 M62 62 L55 55" stroke="#fff" strokeWidth="3" />
          </g>
        );
      case 'nanopore-wave':
        return (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="74" x2="80" y2="74" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
            <line x1="30" y1="74" x2="30" y2="54" stroke="#fff" strokeWidth="4.2" />
            <line x1="40" y1="74" x2="40" y2="34" stroke="#fff" strokeWidth="4.5" />
            <line x1="50" y1="74" x2="50" y2="20" stroke={accent} strokeWidth="5.2" />
            <line x1="60" y1="74" x2="60" y2="36" stroke="#fff" strokeWidth="4.5" />
            <line x1="70" y1="74" x2="70" y2="56" stroke="#fff" strokeWidth="4.2" />
            <path d="M22 72 C32 68, 40 20, 50 20 C60 20, 68 68, 78 72" stroke={accent} strokeWidth="3.2" />
          </g>
        );
      case 'microscope-lens':
        return (
          <g>
            <circle cx="50" cy="46" r="23" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="5" />
            <circle cx="50" cy="46" r="12" fill={accent} opacity="0.9" />
            <circle cx="45" cy="41" r="4" fill="#fff" opacity="0.85" />
            <rect x="34" y="73" width="32" height="6" rx="3" fill="#fff" />
          </g>
        );
      case 'genome-tracks':
        return (
          <g>
            <rect x="20" y="26" width="36" height="8" rx="4" fill="#fff" />
            <rect x="60" y="26" width="20" height="8" rx="4" fill={accent} />
            <rect x="20" y="42" width="18" height="8" rx="4" fill={accent} />
            <rect x="42" y="42" width="38" height="8" rx="4" fill="#fff" opacity="0.88" />
            <rect x="20" y="58" width="46" height="8" rx="4" fill="#ffd60a" />
            <rect x="70" y="58" width="10" height="8" rx="4" fill="#fff" />
            <line x1="50" y1="18" x2="50" y2="82" stroke="#ff375f" strokeWidth="3" />
          </g>
        );
      case 'md-orbitals':
        return (
          <g fill="none">
            <ellipse cx="50" cy="50" rx="30" ry="13" transform="rotate(30 50 50)" stroke="#fff" strokeWidth="3.8" />
            <ellipse cx="50" cy="50" rx="30" ry="13" transform="rotate(-30 50 50)" stroke={accent} strokeWidth="3.8" />
            <ellipse cx="50" cy="50" rx="30" ry="13" transform="rotate(90 50 50)" stroke="rgba(255,255,255,0.65)" strokeWidth="3.2" />
            <circle cx="50" cy="50" r="7.5" fill="#fff" />
          </g>
        );
      case 'rna-loop':
        return (
          <g fill="none" strokeLinecap="round">
            <path d="M38 78 L38 52 C24 46, 26 22, 50 22 C74 22, 76 46, 62 52 L62 78" stroke="#fff" strokeWidth="6" />
            <line x1="42" y1="58" x2="58" y2="58" stroke={accent} strokeWidth="4" />
            <line x1="42" y1="67" x2="58" y2="67" stroke={accent} strokeWidth="4" />
            <line x1="42" y1="76" x2="58" y2="76" stroke={accent} strokeWidth="4" />
            <circle cx="50" cy="34" r="6" fill={accent} />
          </g>
        );
      case 'eln-notebook':
        return (
          <g>
            <rect x="26" y="20" width="48" height="60" rx="9" fill="#fff" />
            <rect x="26" y="20" width="12" height="60" rx="4" fill={accent} />
            <line x1="45" y1="36" x2="66" y2="36" stroke="#1d1d1f" strokeWidth="4" strokeLinecap="round" />
            <line x1="45" y1="48" x2="66" y2="48" stroke="#59595e" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="45" y1="60" x2="59" y2="60" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'phylo-tree':
      default:
        return (
          <g fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 50 L38 50 M38 30 L38 70 M38 30 L58 30 M38 70 L66 70 M58 20 L58 40 M58 20 L76 20 M58 40 L76 40" />
            <circle cx="76" cy="20" r="5" fill={accent} stroke="none" />
            <circle cx="76" cy="40" r="5" fill="#fff" stroke="none" />
            <circle cx="66" cy="70" r="5" fill={accent} stroke="none" />
          </g>
        );
    }
  };

  return (
    <div className="mas-squircle" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={g0} />
            <stop offset="55%" stopColor={g1} />
            <stop offset="100%" stopColor={g2 || g1} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${uid})`} />
        <circle cx="82" cy="18" r="38" fill="rgba(255,255,255,0.10)" />
        {renderGlyph()}
      </svg>
    </div>
  );
};

/* =========================================================
   4-COLUMN CATEGORY DUOTONE ICON
   ========================================================= */
export const CategoryDuotoneIcon: React.FC<{
  glyph: IconGlyphType;
  primary: string;
  secondary: string;
}> = ({ glyph, primary, secondary }) => {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" style={{ flexShrink: 0 }} aria-hidden="true">
      {glyph === 'helix' && (
        <g fill="none" strokeWidth="2.6" strokeLinecap="round">
          <path d="M8 6 C16 6, 16 16, 24 16 C16 16, 16 26, 8 26" stroke={primary} />
          <path d="M24 6 C16 6, 16 16, 8 16 C16 16, 16 26, 24 26" stroke={secondary} />
        </g>
      )}
      {glyph === 'protein-fold' && (
        <g fill="none" strokeWidth="2.8" strokeLinecap="round">
          <path d="M6 22 C8 8, 16 8, 18 16 C20 24, 25 22, 26 10" stroke={primary} />
          <circle cx="18" cy="16" r="3.5" fill={secondary} />
        </g>
      )}
      {glyph === 'cryo-grid' && (
        <g>
          <circle cx="16" cy="16" r="11" fill={secondary} opacity="0.22" stroke={primary} strokeWidth="2.4" />
          <circle cx="16" cy="16" r="4.5" fill={primary} />
        </g>
      )}
      {glyph === 'umap-cells' && (
        <g>
          <circle cx="11" cy="12" r="4.5" fill={primary} />
          <circle cx="21" cy="19" r="5" fill={secondary} />
          <circle cx="21" cy="10" r="3" fill={primary} opacity="0.55" />
          <circle cx="11" cy="22" r="3" fill={secondary} opacity="0.65" />
        </g>
      )}
      {glyph === 'docking-pocket' && (
        <g>
          <rect x="5" y="7" width="22" height="18" rx="6" fill={secondary} opacity="0.25" />
          <polygon points="16,9 23,14 20,23 12,23 9,14" fill={primary} />
        </g>
      )}
      {glyph === 'crispr-scissors' && (
        <g fill="none" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="18" x2="26" y2="18" stroke={secondary} strokeDasharray="3 3" />
          <path d="M11 7 L21 25 M21 7 L11 25" stroke={primary} />
        </g>
      )}
      {glyph === 'microscope-lens' && (
        <g>
          <circle cx="16" cy="14" r="9" fill={secondary} opacity="0.28" stroke={primary} strokeWidth="2.4" />
          <circle cx="16" cy="14" r="4" fill={primary} />
          <rect x="10" y="25" width="12" height="2.6" rx="1.3" fill={primary} />
        </g>
      )}
      {glyph === 'pipeline-dag' && (
        <g stroke={primary} strokeWidth="2.2">
          <line x1="9" y1="10" x2="16" y2="16" />
          <line x1="9" y1="22" x2="16" y2="16" />
          <line x1="16" y1="16" x2="24" y2="16" />
          <circle cx="9" cy="10" r="3" fill={secondary} stroke="none" />
          <circle cx="9" cy="22" r="3" fill={secondary} stroke="none" />
          <circle cx="16" cy="16" r="3.5" fill={primary} stroke="none" />
          <circle cx="24" cy="16" r="3" fill={secondary} stroke="none" />
        </g>
      )}
      {glyph === 'agent-brain' && (
        <g>
          <rect x="6" y="6" width="20" height="20" rx="6" fill={secondary} opacity="0.25" stroke={primary} strokeWidth="2.2" />
          <circle cx="16" cy="16" r="4.2" fill={primary} />
        </g>
      )}
      {glyph === 'md-orbitals' && (
        <g fill="none">
          <ellipse cx="16" cy="16" rx="11" ry="5" transform="rotate(32 16 16)" stroke={primary} strokeWidth="2.2" />
          <ellipse cx="16" cy="16" rx="11" ry="5" transform="rotate(-32 16 16)" stroke={secondary} strokeWidth="2.2" />
          <circle cx="16" cy="16" r="2.8" fill={primary} />
        </g>
      )}
      {glyph === 'plasmid-ring' && (
        <g fill="none">
          <circle cx="16" cy="16" r="9.5" stroke={secondary} strokeWidth="3.5" opacity="0.4" />
          <path d="M16 6.5 A9.5 9.5 0 0 1 25.5 16" stroke={primary} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M23 22.5 A9.5 9.5 0 0 1 8.5 21.5" stroke={secondary} strokeWidth="3.8" strokeLinecap="round" />
        </g>
      )}
      {glyph === 'genome-tracks' && (
        <g>
          <rect x="5" y="8" width="14" height="3.5" rx="1.7" fill={primary} />
          <rect x="11" y="14.5" width="16" height="3.5" rx="1.7" fill={secondary} />
          <rect x="5" y="21" width="18" height="3.5" rx="1.7" fill={primary} opacity="0.75" />
        </g>
      )}
      {glyph === 'rna-loop' && (
        <g fill="none" stroke={primary} strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 26 L12 17 C7 14, 8 6, 16 6 C24 6, 25 14, 20 17 L20 26" />
          <circle cx="16" cy="11" r="2.6" fill={secondary} stroke="none" />
        </g>
      )}
      {glyph === 'eln-notebook' && (
        <g>
          <rect x="7" y="5" width="18" height="22" rx="3.5" fill={secondary} opacity="0.25" stroke={primary} strokeWidth="2.2" />
          <line x1="12" y1="12" x2="21" y2="12" stroke={primary} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="17" x2="19" y2="17" stroke={secondary} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {glyph === 'nanopore-wave' && (
        <g fill="none" strokeLinecap="round">
          <line x1="5" y1="24" x2="27" y2="24" stroke={secondary} strokeWidth="2" />
          <line x1="10" y1="24" x2="10" y2="15" stroke={primary} strokeWidth="2.4" />
          <line x1="16" y1="24" x2="16" y2="7" stroke={primary} strokeWidth="2.8" />
          <line x1="22" y1="24" x2="22" y2="13" stroke={secondary} strokeWidth="2.4" />
        </g>
      )}
      {glyph === 'phylo-tree' && (
        <g fill="none" stroke={primary} strokeWidth="2.3" strokeLinecap="round">
          <path d="M6 16 L13 16 M13 9 L13 23 M13 9 L24 9 M13 23 L24 23" />
          <circle cx="24" cy="9" r="2.8" fill={secondary} stroke="none" />
          <circle cx="24" cy="23" r="2.8" fill={primary} stroke="none" />
        </g>
      )}
    </svg>
  );
};

/* =========================================================
   EDITORIAL WIDE HERO ARTWORK
   ========================================================= */
export const EditorialHeroArt: React.FC<{
  styleType:
    | 'kit-sprue'
    | 'genome-cosmos'
    | 'protein-cathedral'
    | 'single-cell-bloom'
    | 'crispr-precision'
    | 'agent-lab';
  bg: [string, string, string];
}> = ({ styleType, bg }) => {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradId = `hero-bg-${rawId}`;
  const gridId = `hero-grid-${rawId}`;
  const readId = `hero-read-${rawId}`;

  return (
    <svg
      viewBox="0 0 1160 380"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bg[0]} />
          <stop offset="55%" stopColor={bg[1]} />
          <stop offset="100%" stopColor={bg[2]} />
        </linearGradient>
        <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.14)" />
        </pattern>
        <linearGradient id={readId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      <rect width="1160" height="380" fill={`url(#${gradId})`} />
      <rect width="1160" height="380" fill={`url(#${gridId})`} />

      {styleType === 'kit-sprue' && (
        /* ESI-MS Isotope Spectrum + DNA–Ag17 Nanocluster Studio Illustration */
        <g transform="translate(530, 44)">
          <rect x="0" y="0" width="576" height="292" rx="18" fill="rgba(7, 22, 42, 0.72)" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" />
          <line x1="42" y1="242" x2="366" y2="242" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          {[
            [72, 198, '#94a3b8'],
            [98, 152, '#38bdf8'],
            [124, 96, '#5ef2d6'],
            [150, 58, '#fde047'],
            [176, 86, '#5ef2d6'],
            [202, 140, '#38bdf8'],
            [228, 192, '#94a3b8'],
            [292, 174, '#38bdf8'],
            [316, 118, '#5ef2d6'],
            [340, 166, '#38bdf8'],
          ].map(([x, yTop, col], idx) => (
            <g key={idx}>
              <line x1={x as number} y1={242} x2={x as number} y2={yTop as number} stroke={col as string} strokeWidth="5.5" strokeLinecap="round" />
              <circle cx={x as number} cy={yTop as number} r="4.5" fill="#ffffff" />
            </g>
          ))}
          <path
            d="M54 238 C86 226, 114 56, 150 56 C186 56, 214 226, 246 238"
            fill="none"
            stroke="#5ef2d6"
            strokeWidth="3.5"
            strokeDasharray="6 5"
          />
          {/* Right Ag17 cluster lattice */}
          <g transform="translate(458, 148)">
            <circle cx="0" cy="0" r="76" fill="rgba(94, 242, 214, 0.12)" stroke="rgba(94, 242, 214, 0.45)" strokeWidth="2" strokeDasharray="6 6" />
            <polygon points="0,-48 44,-16 28,38 -28,38 -44,-16" fill="rgba(56, 189, 248, 0.24)" stroke="#e0f2fe" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="14" fill="#fde047" />
            {[
              [0, -48],
              [44, -16],
              [28, 38],
              [-28, 38],
              [-44, -16],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="9" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
            ))}
          </g>
        </g>
      )}

      {styleType === 'agent-lab' && (
        /* 4-Node Verified Auto-Research Block DAG */
        <g transform="translate(540, 56)">
          <path
            d="M116 74 L236 74 M116 196 L236 196 M236 74 L372 135 M236 196 L372 135 M372 135 L496 135"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [36, 38, '#38bdf8', '#0f172a'],
            [36, 160, '#a78bfa', '#0f172a'],
            [200, 38, '#34d399', '#0f172a'],
            [200, 160, '#fbbf24', '#0f172a'],
            [340, 99, '#5ef2d6', '#0f172a'],
            [468, 99, '#ffffff', '#0f766e'],
          ].map(([x, y, border, fill], idx) => (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              <rect width="92" height="72" rx="16" fill={fill as string} fillOpacity="0.82" stroke={border as string} strokeWidth="3.5" />
              <circle cx="26" cy="36" r="9" fill={border as string} />
              <line x1="44" y1="30" x2="74" y2="30" stroke="rgba(255,255,255,0.85)" strokeWidth="4" strokeLinecap="round" />
              <line x1="44" y1="44" x2="66" y2="44" stroke="rgba(255,255,255,0.48)" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {styleType !== 'kit-sprue' && styleType !== 'agent-lab' && (
        /* Volcano / Differential Expression Scatter Artwork */
        <g transform="translate(560, 44)">
          <rect x="0" y="0" width="540" height="292" rx="18" fill="rgba(15, 10, 28, 0.56)" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
          <line x1="270" y1="28" x2="270" y2="264" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="40" y1="196" x2="500" y2="196" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeDasharray="6 6" />
          {[
            [96, 78, 11, '#38bdf8'],
            [128, 112, 9, '#38bdf8'],
            [152, 146, 7, '#60a5fa'],
            [236, 226, 6, 'rgba(255,255,255,0.45)'],
            [274, 236, 6, 'rgba(255,255,255,0.45)'],
            [308, 220, 6, 'rgba(255,255,255,0.45)'],
            [386, 134, 9, '#fb7185'],
            [422, 86, 13, '#fde047'],
            [456, 62, 11, '#5ef2d6'],
            [474, 108, 8, '#fb7185'],
          ].map(([cx, cy, r, col], idx) => (
            <circle key={idx} cx={cx as number} cy={cy as number} r={r as number} fill={col as string} />
          ))}
        </g>
      )}

      <rect x="0" y="0" width="560" height="380" fill={`url(#${readId})`} opacity="0.28" />
    </svg>
  );
};

/* =========================================================
   CIRCULAR MEDALLION ARTWORK FOR PROMO CARDS (DISTINCT PER GLYPH)
   ========================================================= */
export const CircularMedallionArt: React.FC<{
  gradient: [string, string];
  glyph: IconGlyphType;
}> = ({ gradient, glyph }) => {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `med-${rawId}`;
  return (
    <div className="t2-circle-medallion" aria-hidden="true">
      <svg viewBox="0 0 160 160" width="162" height="162">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill={`url(#${id})`} />
        <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.28)" />

        {glyph === 'nanopore-wave' && (
          /* Distinct ESI-MS Isotope Envelope + Stick Peaks */
          <g fill="none" strokeLinecap="round">
            <line x1="34" y1="114" x2="126" y2="114" stroke="#0f172a" strokeOpacity="0.35" strokeWidth="3.5" />
            <line x1="48" y1="114" x2="48" y2="90" stroke="#0369a1" strokeWidth="5.5" />
            <line x1="64" y1="114" x2="64" y2="62" stroke="#0284c7" strokeWidth="6" />
            <line x1="80" y1="114" x2="80" y2="40" stroke="#0f766e" strokeWidth="7" />
            <line x1="96" y1="114" x2="96" y2="64" stroke="#0284c7" strokeWidth="6" />
            <line x1="112" y1="114" x2="112" y2="92" stroke="#0369a1" strokeWidth="5.5" />
            <path
              d="M36 112 C52 106, 66 38, 80 38 C94 38, 108 106, 124 112"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeDasharray="5 4"
            />
            <circle cx="80" cy="40" r="6.5" fill="#f59e0b" />
          </g>
        )}

        {glyph === 'agent-brain' && (
          /* Distinct 4-Node Verified Block DAG */
          <g>
            <path
              d="M52 54 L80 80 M52 106 L80 80 M80 80 L110 56 M80 80 L110 104"
              stroke="#1e1b4b"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="34" y="38" width="28" height="28" rx="8" fill="#4f46e5" />
            <rect x="34" y="94" width="28" height="28" rx="8" fill="#0284c7" />
            <circle cx="80" cy="80" r="16" fill="#0f172a" />
            <path d="M74 80 L78 85 L87 75" stroke="#5ef2d6" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="98" y="42" width="28" height="28" rx="8" fill="#0d9488" />
            <rect x="98" y="90" width="28" height="28" rx="8" fill="#7c3aed" />
          </g>
        )}

        {glyph === 'umap-cells' && (
          <g>
            <circle cx="58" cy="64" r="16" fill="#0f766e" opacity="0.88" />
            <circle cx="82" cy="52" r="10" fill="#14b8a6" />
            <circle cx="102" cy="88" r="18" fill="#6366f1" />
            <circle cx="72" cy="102" r="12" fill="#f43f5e" />
            <circle cx="106" cy="58" r="8" fill="#eab308" />
          </g>
        )}

        {glyph === 'crispr-scissors' && (
          <g stroke="#1e293b" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M32 82 L128 82" strokeDasharray="8 8" />
            <path d="M58 42 L98 118 M102 42 L62 118" stroke="#0284c7" strokeWidth="6.5" />
            <circle cx="80" cy="80" r="10" fill="#f97316" stroke="none" />
          </g>
        )}

        {glyph !== 'nanopore-wave' &&
          glyph !== 'agent-brain' &&
          glyph !== 'umap-cells' &&
          glyph !== 'crispr-scissors' && (
            <g fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round">
              <path d="M38 96 C46 48, 78 44, 86 80 C94 116, 114 96, 124 58" />
              <circle cx="86" cy="80" r="11" fill="#2563eb" stroke="none" />
            </g>
          )}
      </svg>
    </div>
  );
};
