import React, { useEffect, useRef } from 'react';
import { IconGlyphType, ScreenshotTheme } from '../types/store';

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
  const uid = `ico-${glyph}-${gradient[0].replace('#', '')}-${size}`;
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
            <rect x="20" y="58" width="24" height="14" rx="5" fill="rgba(255,255,255,0.28)" />
            <rect x="56" y="58" width="24" height="14" rx="5" fill="rgba(255,255,255,0.28)" />
            <path
              d="M18 38 L28 38 L33 24 L39 50 L45 20 L51 54 L57 28 L63 44 L69 34 L82 34"
              stroke={accent}
              strokeWidth="4.8"
            />
            <line x1="50" y1="48" x2="50" y2="80" stroke="#fff" strokeWidth="4" strokeDasharray="4 4" />
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
            <line x1="45" y1="48" x2="66" y2="48" stroke="#86868b" strokeWidth="3.5" strokeLinecap="round" />
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
    <div className="mas-squircle" style={{ width: size, height: size }}>
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
   4-COLUMN CATEGORY DUOTONE ICON (14-categories.png style)
   ========================================================= */
export const CategoryDuotoneIcon: React.FC<{
  glyph: IconGlyphType;
  primary: string;
  secondary: string;
}> = ({ glyph, primary, secondary }) => {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
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
        <path
          d="M4 17 L9 17 L12 8 L16 24 L20 9 L23 19 L28 19"
          fill="none"
          stroke={primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
   EDITORIAL WIDE HERO ARTWORK (01-discover-top.png kit-sprue!)
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
  const gradId = `hero-bg-${styleType}`;
  return (
    <svg
      viewBox="0 0 1160 380"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bg[0]} />
          <stop offset="55%" stopColor={bg[1]} />
          <stop offset="100%" stopColor={bg[2]} />
        </linearGradient>
      </defs>
      <rect width="1160" height="380" fill={`url(#${gradId})`} />

      {styleType === 'kit-sprue' && (
        /* Inspired directly by 01-discover-top.png model-kit sprue illustration, adapted to Bio Lab & Protein Folding */
        <g>
          {/* Subtle grid texture */}
          <pattern id="bioGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.16)" />
          </pattern>
          <rect width="1160" height="380" fill="url(#bioGrid)" />

          {/* Far-right auxiliary sprue frame (Micropipette + Gel lane ruler) */}
          <g transform="translate(936, 224) scale(0.84)">
            <rect x="0" y="0" width="142" height="140" rx="12" fill="none" stroke="#e9fbfb" strokeWidth="10" />
            <rect x="0" y="0" width="142" height="140" rx="12" fill="none" stroke="#0c2d3a" strokeWidth="2.5" />
            <rect x="26" y="24" width="32" height="94" rx="8" fill="#ff7b54" stroke="#0c2d3a" strokeWidth="3" />
            <rect x="34" y="12" width="16" height="18" rx="4" fill="#ffd60a" stroke="#0c2d3a" strokeWidth="2.5" />
            <rect x="76" y="22" width="42" height="96" rx="6" fill="#ffe600" stroke="#0c2d3a" strokeWidth="3" />
            <line x1="84" y1="38" x2="108" y2="38" stroke="#0c2d3a" strokeWidth="3" />
            <line x1="84" y1="56" x2="104" y2="56" stroke="#0c2d3a" strokeWidth="3" />
            <line x1="84" y1="74" x2="110" y2="74" stroke="#0c2d3a" strokeWidth="3" />
            <line x1="84" y1="92" x2="102" y2="92" stroke="#0c2d3a" strokeWidth="3" />
          </g>

          {/* Main Right-Center Sprue Frame (Protein Studio + Plasmid + Sequence Palette) */}
          <g transform="translate(520, 48)">
            <rect x="0" y="0" width="380" height="296" rx="16" fill="none" stroke="#effcfc" strokeWidth="12" />
            <rect x="0" y="0" width="380" height="296" rx="16" fill="none" stroke="#0c2d3a" strokeWidth="3" />
            {/* Connectors */}
            <line x1="0" y1="95" x2="380" y2="95" stroke="#effcfc" strokeWidth="9" />
            <line x1="150" y1="0" x2="150" y2="296" stroke="#effcfc" strokeWidth="9" />

            {/* Reagent tubes */}
            <rect x="24" y="22" width="52" height="20" rx="8" fill="#ffd60a" stroke="#0c2d3a" strokeWidth="3" />
            <rect x="24" y="50" width="52" height="20" rx="8" fill="#30d158" stroke="#0c2d3a" strokeWidth="3" />
            <rect x="24" y="118" width="104" height="72" rx="12" fill="#6e56cf" stroke="#0c2d3a" strokeWidth="3" />
            <circle cx="76" cy="154" r="22" fill="none" stroke="#5ef2d6" strokeWidth="6" strokeDasharray="18 8" />

            {/* Center Protein Structure Tablet */}
            <rect x="172" y="28" width="144" height="196" rx="14" fill="#ffffff" stroke="#0c2d3a" strokeWidth="3.5" />
            <rect x="184" y="118" width="120" height="90" rx="8" fill="#112236" />
            <path
              d="M196 184 C202 138, 232 130, 244 158 C256 186, 274 134, 294 154"
              fill="none"
              stroke="#30d158"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="222" cy="72" r="26" fill="#7c3aed" stroke="#0c2d3a" strokeWidth="3" />
            <circle cx="222" cy="72" r="10" fill="#38bdf8" />
            <rect x="258" y="48" width="44" height="48" rx="6" fill="#ffedd5" stroke="#f97316" strokeWidth="3" />

            {/* Nucleotide Color Strip */}
            <g transform="translate(332, 26)">
              {['#ff453a', '#30d158', '#0a84ff', '#ffd60a', '#bf5af2', '#64d2ff', '#ff9f0a'].map((c, idx) => (
                <rect
                  key={c}
                  x="0"
                  y={idx * 32}
                  width="24"
                  height="24"
                  rx="4"
                  fill={c}
                  stroke="#0c2d3a"
                  strokeWidth="2.5"
                />
              ))}
            </g>

            {/* Bottom Gel Matrix */}
            <rect x="30" y="216" width="100" height="56" rx="8" fill="#0f172a" stroke="#0c2d3a" strokeWidth="3" />
            <line x1="44" y1="232" x2="66" y2="232" stroke="#38bdf8" strokeWidth="4" />
            <line x1="78" y1="244" x2="112" y2="244" stroke="#30d158" strokeWidth="4" />
            <line x1="44" y1="256" x2="90" y2="256" stroke="#f472b6" strokeWidth="4" />
          </g>

          {/* Rightmost Sprue Frame (DNA Helix & Sliders) */}
          <g transform="translate(932, 48)">
            <rect x="0" y="0" width="192" height="296" rx="16" fill="none" stroke="#effcfc" strokeWidth="12" />
            <rect x="0" y="0" width="192" height="296" rx="16" fill="none" stroke="#0c2d3a" strokeWidth="3" />
            <rect x="22" y="22" width="148" height="156" rx="12" fill="#0d2235" stroke="#0c2d3a" strokeWidth="3" />
            <path
              d="M44 54 C84 54, 108 100, 148 100 C108 100, 84 146, 44 146"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M148 54 C108 54, 84 100, 44 100 C84 100, 108 146, 148 146"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="62" cy="236" r="28" fill="#fb923c" stroke="#0c2d3a" strokeWidth="3" />
            <circle cx="132" cy="236" r="28" fill="#a855f7" stroke="#0c2d3a" strokeWidth="3" />
          </g>
        </g>
      )}

      {styleType !== 'kit-sprue' && (
        <g>
          {/* Ambient luminous bio geometry on the right 65% */}
          <circle cx="860" cy="190" r="220" fill="rgba(255,255,255,0.07)" />
          <circle cx="860" cy="190" r="148" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeDasharray="8 8" />
          <path
            d="M520 290 C610 90, 720 90, 800 200 C880 310, 980 80, 1090 150"
            fill="none"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M520 120 C620 280, 730 280, 820 165 C910 50, 995 275, 1095 215"
            fill="none"
            stroke="#5ef2d6"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {[580, 660, 740, 820, 900, 980].map((x, idx) => (
            <circle
              key={x}
              cx={x}
              cy={idx % 2 === 0 ? 155 : 225}
              r={idx % 2 === 0 ? 14 : 10}
              fill={idx % 3 === 0 ? '#ffd60a' : '#ffffff'}
              opacity="0.9"
            />
          ))}
        </g>
      )}

      {/* Subtle left readability gradient */}
      <rect
        x="0"
        y="0"
        width="540"
        height="380"
        fill="url(#leftReadability)"
        opacity="0.22"
      />
      <defs>
        <linearGradient id="leftReadability" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* =========================================================
   CIRCULAR MEDALLION ARTWORK FOR T2 PROMO CARDS
   ========================================================= */
export const CircularMedallionArt: React.FC<{
  gradient: [string, string];
  glyph: IconGlyphType;
}> = ({ gradient, glyph }) => {
  const id = `med-${glyph}-${gradient[0].replace('#', '')}`;
  return (
    <div className="t2-circle-medallion">
      <svg viewBox="0 0 160 160" width="162" height="162">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill={`url(#${id})`} />
        <circle cx="80" cy="80" r="58" fill="rgba(255,255,255,0.22)" />
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
        {glyph !== 'umap-cells' && glyph !== 'crispr-scissors' && (
          <g fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round">
            <path d="M38 96 C46 48, 78 44, 86 80 C94 116, 114 96, 124 58" />
            <circle cx="86" cy="80" r="11" fill="#2563eb" stroke="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

/* =========================================================
   REALISTIC 16:10 BIO APP SCREENSHOT PREVIEW ARTWORK
   ========================================================= */
export const AppScreenshotArt: React.FC<{
  theme: ScreenshotTheme;
  appName: string;
  accent?: string;
}> = ({ theme, appName, accent = '#007aff' }) => {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Ambient studio backdrop */}
      <rect width="800" height="500" fill="#0c1220" />
      <circle cx="660" cy="90" r="220" fill={accent} opacity="0.22" />
      <circle cx="120" cy="430" r="180" fill="#14b8a6" opacity="0.16" />

      {/* Inner macOS App Window Frame */}
      <rect x="42" y="36" width="716" height="428" rx="14" fill="#131b2e" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      {/* Window Titlebar */}
      <rect x="42" y="36" width="716" height="34" rx="14" fill="#1b253d" />
      <circle cx="62" cy="53" r="5" fill="#ff5f57" />
      <circle cx="78" cy="53" r="5" fill="#febc2e" />
      <circle cx="94" cy="53" r="5" fill="#28c840" />
      <text x="400" y="57" fill="rgba(255,255,255,0.72)" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="-apple-system, sans-serif">
        {appName} — Workspace
      </text>

      {/* Left Inspector Rail */}
      <rect x="42" y="70" width="148" height="394" fill="rgba(255,255,255,0.03)" />
      {[96, 124, 152, 180, 208].map((y, idx) => (
        <rect
          key={y}
          x="58"
          y={y}
          width={idx === 1 ? 112 : 92}
          height="14"
          rx="4"
          fill={idx === 1 ? accent : 'rgba(255,255,255,0.12)'}
          opacity={idx === 1 ? 0.85 : 1}
        />
      ))}

      {/* Main Viewport by Theme */}
      {theme === 'structure-3d' && (
        <g>
          <path
            d="M250 320 C260 170, 355 135, 405 235 C455 335, 515 140, 585 205 C635 250, 650 335, 695 190"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M250 320 C260 170, 355 135, 405 235 C455 335, 515 140, 585 205"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="405" cy="235" r="18" fill="#f97316" />
          <circle cx="585" cy="205" r="14" fill="#22c55e" />
          {/* pLDDT Confidence Legend */}
          <rect x="218" y="408" width="508" height="32" rx="8" fill="rgba(255,255,255,0.06)" />
          <rect x="232" y="419" width="90" height="10" rx="5" fill="#1d4ed8" />
          <rect x="330" y="419" width="90" height="10" rx="5" fill="#38bdf8" />
          <rect x="428" y="419" width="70" height="10" rx="5" fill="#facc15" />
          <text x="698" y="428" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">
            pLDDT 94.8 · ipTM 0.91
          </text>
        </g>
      )}

      {theme === 'umap-atlas' && (
        <g>
          {[
            [290, 180, '#38bdf8'], [312, 195, '#38bdf8'], [278, 208, '#38bdf8'], [330, 172, '#38bdf8'],
            [470, 165, '#a855f7'], [492, 184, '#a855f7'], [458, 194, '#a855f7'], [508, 162, '#a855f7'],
            [390, 300, '#22c55e'], [415, 318, '#22c55e'], [372, 326, '#22c55e'], [432, 294, '#22c55e'],
            [565, 290, '#f43f5e'], [588, 308, '#f43f5e'], [548, 315, '#f43f5e'], [604, 278, '#f43f5e'],
          ].map(([cx, cy, col], i) => (
            <circle key={i} cx={cx as number} cy={cy as number} r={i % 2 === 0 ? 11 : 7} fill={col as string} opacity="0.88" />
          ))}
          <text x="224" y="108" fill="#e2e8f0" fontSize="13" fontWeight="600" fontFamily="-apple-system, sans-serif">
            1.42M Cells · 28 Annotated Cell States (UMAP-1 / UMAP-2)
          </text>
        </g>
      )}

      {theme === 'plasmid-editor' && (
        <g>
          <circle cx="450" cy="255" r="122" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="22" />
          <path d="M450 133 A122 122 0 0 1 572 255" fill="none" stroke="#22c55e" strokeWidth="22" />
          <path d="M558 312 A122 122 0 0 1 362 340" fill="none" stroke="#38bdf8" strokeWidth="22" />
          <path d="M332 222 A122 122 0 0 1 402 142" fill="none" stroke="#f59e0b" strokeWidth="22" />
          <text x="450" y="252" fill="#ffffff" fontSize="16" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            pAAV-Cas9
          </text>
          <text x="450" y="274" fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="monospace">
            7,842 bp
          </text>
        </g>
      )}

      {theme === 'sequence-tracks' && (
        <g>
          {[120, 175, 230, 285, 340].map((y, row) => (
            <g key={y}>
              <rect x="218" y={y} width="505" height="32" rx="6" fill="rgba(255,255,255,0.05)" />
              <rect x={235 + row * 28} y={y + 8} width="140" height="16" rx="4" fill={row % 2 === 0 ? '#38bdf8' : '#34d399'} />
              <rect x={410 + row * 14} y={y + 8} width="190" height="16" rx="4" fill={row === 2 ? '#f43f5e' : '#818cf8'} />
            </g>
          ))}
          <line x1="468" y1="98" x2="468" y2="410" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 4" />
        </g>
      )}

      {(theme === 'pipeline-graph' ||
        theme === 'docking-sim' ||
        theme === 'cryo-density' ||
        theme === 'agent-console') && (
        <g>
          <rect x="222" y="112" width="136" height="64" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <rect x="412" y="112" width="136" height="64" rx="10" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
          <rect x="412" y="218" width="136" height="64" rx="10" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
          <rect x="592" y="165" width="132" height="64" rx="10" fill="#0f766e" stroke="#5ef2d6" strokeWidth="2" />
          <path d="M358 144 L412 144 M358 144 L412 250 M548 144 L592 197 M548 250 L592 197" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <rect x="222" y="324" width="502" height="104" rx="10" fill="#090e1a" stroke="rgba(255,255,255,0.1)" />
          <text x="240" y="354" fill="#34d399" fontSize="12" fontFamily="monospace">
            $ bio-agent run --workflow denovo-binder --gpu mlx-m4-max
          </text>
          <text x="240" y="378" fill="#94a3b8" fontSize="12" fontFamily="monospace">
            [✓] MSA Search 14,820 homologs (1.8s)  →  [✓] Folding ΔG = -12.4 kcal/mol
          </text>
          <text x="240" y="402" fill="#38bdf8" fontSize="12" fontFamily="monospace">
            [✓] Wet-lab protocol exported to Opentrons OT-2 &amp; Benchling ELN
          </text>
        </g>
      )}
    </svg>
  );
};

/* =========================================================
   LIVE 60FPS MOLECULAR DYNAMICS CANVAS FOR T4 (10-play-top.png)
   ========================================================= */
export const LiveMolecularCanvas: React.FC<{ playing: boolean }> = ({ playing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 1.4;

    const render = () => {
      if (playing) t += 0.022;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#181038');
      grad.addColorStop(0.55, '#0f2547');
      grad.addColorStop(1, '#09383e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Diamond frame motifs inspired by 10-play-top.png
      const nNodes = 36;
      for (let i = 0; i < nNodes; i++) {
        const u = i / (nNodes - 1);
        const x = 70 + u * (w - 140);
        const phase = u * Math.PI * 3.5 + t;
        const y1 = h * 0.5 + Math.sin(phase) * (h * 0.25);
        const y2 = h * 0.5 - Math.sin(phase) * (h * 0.25);
        const z = Math.cos(phase);

        // Base-pair rung
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Strand A atom
        ctx.beginPath();
        ctx.fillStyle = z > 0 ? '#38bdf8' : '#0284c7';
        ctx.arc(x, y1, z > 0 ? 7.5 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Strand B atom
        ctx.beginPath();
        ctx.fillStyle = z < 0 ? '#f472b6' : '#db2777';
        ctx.arc(x, y2, z < 0 ? 7.5 : 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD telemetry overlay
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, monospace';
      ctx.fillText('LIVE AMBER99SB-ILDN · 310 K · Explicit Water · 428 ns/day (Apple M4 Max)', 24, h - 20);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      width={880}
      height={360}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
