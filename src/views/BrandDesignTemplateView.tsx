import React from 'react';
import { BioApp } from '../types/store';
import { BioAppIcon } from '../components/BioArtwork';
import {
  BioAccountSheetCard,
  BioSettingsWindowCard,
} from '../components/ProfileAndSettingsModals';

interface BrandDesignTemplateViewProps {
  apps: BioApp[];
  framedMode: boolean;
  onToggleFramedMode: () => void;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenApp: (appId: string) => void;
  onToast: (msg: string) => void;
}

export const BrandDesignTemplateView: React.FC<BrandDesignTemplateViewProps> = ({
  apps,
  framedMode,
  onToggleFramedMode,
  onOpenProfileModal,
  onOpenSettingsModal,
  onOpenApp,
  onToast,
}) => {
  const swatches = [
    { name: 'Canvas & Sheet Surface', token: '--bg-canvas', hex: '#FFFFFF', border: true },
    { name: 'Sidebar & Inset Group', token: '--bg-sidebar', hex: '#F5F5F7', border: true },
    { name: 'Action Pill Neutral', token: '--bg-pill-neutral', hex: '#F2F2F7', border: true },
    { name: 'Sheet Button & Checkbox', token: '--bg-sheet-btn', hex: '#E5E5EA', border: false },
    { name: 'Modal Scrim Overlay', token: '--bg-modal-scrim', hex: 'rgba(0,0,0,0.24)', border: false },
    { name: 'Ink Primary', token: '--text-primary', hex: '#1D1D1F', dark: true },
    { name: 'Ink Secondary / Stars', token: '--text-secondary', hex: '#6E6E73', dark: true },
    { name: 'Ink Tertiary', token: '--text-tertiary', hex: '#86868B', dark: true },
    { name: 'App Store Blue', token: '--accent-blue', hex: '#007AFF', dark: true },
  ];

  const templates = [
    { id: 'T1', page: 'Discover (01)', name: 'Wide Hero Banner', spec: '3.05:1 ratio, 14px radius, 43% left copy overlay, 24px right-edge card peek' },
    { id: 'T2', page: 'Discover (01)', name: '2-Up Circular-Badge Promo', spec: '#F5F5F7 fill, 214px height, 58% copy left + 162px circular medallion right' },
    { id: 'T3', page: 'Create / Work / Develop (06-12)', name: '2-Up Top Showcase', spec: '#007AFF 11px uppercase eyebrow + title + subtitle ABOVE 16:10 artwork' },
    { id: 'T4', page: 'Play (10)', name: 'Split Simulation / Trailer Hero', spec: '28% dark tinted left rail + 72% live interactive canvas + 54px frosted Play button' },
    { id: 'T5', page: 'Arcade (04-05)', name: 'Full-Bleed Suite Hero + Pills', spec: 'Dark neon radial hero + solid #007AFF CTA + 36px #F2F2F7 filter chip ribbon' },
    { id: 'T6', page: 'Discover / Play (02, 11)', name: '3-Up Editorial Media Card', spec: '16:10 rounded 12px artwork on top + gray eyebrow, 16.5px title & subtitle below' },
    { id: 'T7', page: 'All Storefronts (01, 04, 13)', name: 'Small App Lockup (3×3)', spec: '54px squircle, column-major 1..12 chart rank, text-inset 1px divider, #F2F2F7 Get pill' },
    { id: 'T8', page: 'Create / Develop (07, 12)', name: 'Medium App Lockup (2×3)', spec: '86px squircle left, title+sub top-right, Get pill + 2-line micro-note bottom-left' },
    { id: 'T9', page: 'Categories (14)', name: '4-Column Duotone Directory', spec: '4 columns, 26px two-tone bio glyph + 15px label + 40px-inset bottom hairline' },
    { id: 'T10', page: 'Updates (16)', name: '2-Column Updates Card Grid', spec: '2 columns, 56px squircle, date, Update pill + full-width 2-line notes & inline more' },
    { id: 'T11', page: 'Search (18)', name: '2-Column Search + Preview', spec: 'Segmented Mac/Cloud pill + Filters ⌄ + monochrome #6E6E73 ★★★★★ + 16:10 screenshot' },
    { id: 'T12', page: 'Detail & Story (19-22)', name: 'Product Page & Story Reader', spec: '118px icon, solid #007AFF Get, 6-col Spec Ribbon, Privacy Nutrition Card, 42%/58% Story split' },
    { id: 'T13', page: 'Profile Sheet (23-27)', name: 'Apple Account Modal Sheet', spec: '468px width, 18px radius, #F5F5F7 12px grouped cards, 60px avatar, 36×20px switches, 7px Back/Done' },
    { id: 'T14', page: 'Settings Window (28)', name: 'App Store Settings (Cmd+,)', spec: '454×540px window, 14px radius, 16×16px 4.5px-radius checkboxes, 224×28px disk pop-up, Reset ID' },
  ];

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <div>
          <div className="t3-eyebrow" style={{ marginBottom: 4 }}>
            EXTRACTED FROM 28 LOCAL MAC APP STORE CUA CAPTURES (INCLUDING PROFILE &amp; SETTINGS)
          </div>
          <h1 className="mas-page-title">Brand Design Template</h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="mas-get-pill"
            style={{ height: 32, padding: '0 14px' }}
            onClick={onOpenProfileModal}
          >
            Open Profile Sheet (T13)
          </button>
          <button
            type="button"
            className="mas-get-pill"
            style={{ height: 32, padding: '0 14px' }}
            onClick={onOpenSettingsModal}
          >
            Open Settings Window (⌘,)
          </button>
          <button
            type="button"
            className="mas-get-pill solid-blue"
            style={{ padding: '0 16px', height: 32 }}
            onClick={onToggleFramedMode}
          >
            {framedMode ? 'Full-Bleed Web View' : '1512×949 Window Frame'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', maxWidth: 880, lineHeight: 1.5 }}>
        Every token, grid proportion, squircle curve, divider inset, <strong>Profile (OpenBioApp Account Sheet)</strong>,
        and <strong>OpenBioApp Settings (⌘,)</strong> pattern in <strong>OpenBioApp</strong> was
        captured directly from your local macOS App Store via Orca Computer Use (
        <code>design-reference/screenshots/01..28.png</code>).
      </p>

      {/* 1. INTERACTIVE PROFILE & SETTINGS SPECIMENS (T13 & T14) */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <div className="mas-section-header">
          <h2 className="mas-section-title">
            1. Profile (Apple Account Sheet — T13) &amp; Settings (⌘, Window — T14) Live Templates
          </h2>
          <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Interactive — click rows, sub-sheets, switches &amp; checkboxes below
          </span>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #ebebf0 0%, #dfdfe7 100%)',
            borderRadius: 16,
            padding: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* Left Specimen: T13 Profile / Bio Account Modal Sheet (23..27) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: '100%', maxWidth: 468 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}
              >
                T13 · PROFILE &amp; SUB-SHEETS (468px · 18px Radius · #F5F5F7 Inset Groups)
              </div>
              <BioAccountSheetCard
                apps={apps}
                embedded
                onOpenApp={onOpenApp}
                onToast={onToast}
              />
            </div>
          </div>

          {/* Right Specimen: T14 App Store Settings Window (28-app-store-settings.png) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: '100%', maxWidth: 454 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}
              >
                T14 · SETTINGS WINDOW (454×540px · 16px Rounded-4.5px Checkboxes · Disk Pop-Up)
              </div>
              <BioSettingsWindowCard embedded onToast={onToast} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. COLOR ARCHITECTURE */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          2. Color &amp; Surface Tokens
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 14,
          }}
        >
          {swatches.map((s) => (
            <div
              key={s.token}
              style={{
                borderRadius: 12,
                padding: 14,
                background: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: s.hex,
                  border: s.border ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s.hex}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-quaternary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s.token}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CONTINUOUS SQUIRCLE ICON & CONTROL SCALE */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          3. Continuous Squircle App Icon &amp; Profile Avatar Scale
        </h2>
        <div
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 32,
          }}
        >
          {[
            { px: 20, role: 'Sticky Header Mini' },
            { px: 42, role: 'T13 Your Apps Row' },
            { px: 54, role: 'T7 Small Lockup' },
            { px: 56, role: 'T10 Updates Row' },
            { px: 86, role: 'T8 Medium Lockup' },
            { px: 118, role: 'T12 Detail Hero' },
          ].map((spec) => (
            <div
              key={spec.px}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            >
              <BioAppIcon
                glyph="protein-fold"
                gradient={['#062c49', '#0a6cbd', '#22d3ee']}
                accent="#38bdf8"
                size={spec.px}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                  {spec.px} × {spec.px}px
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{spec.role}</div>
              </div>
            </div>
          ))}

          {/* Circular Avatar Scale (Sidebar 32px vs Sheet 60px) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="mas-profile-avatar">SH</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>32px Circle</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Sidebar Footer</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="mas-sheet-avatar-lg">SH</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>60px Circle</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>T13 Account Sheet</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TYPOGRAPHY HIERARCHY */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          4. SF Pro Typography Specimen
        </h2>
        <div
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.022em' }}>
              Page Title — Discover Bio
            </span>
            <code style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>34px / 700 / -0.022em</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.018em' }}>
              App Detail Product Title — AlphaFold 3 Studio
            </span>
            <code style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>24px / 700 / -0.018em</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.012em' }}>
              Modal Sheet Header — Bio Account / Notifications
            </span>
            <code style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>16.5px / 700 / -0.012em</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>
              Settings Checkbox &amp; Sheet Row — Automatic Updates
            </span>
            <code style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>13.5px / 500 / 0</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#007aff' }}>
              EYEBROW TAG — BIO AI WE LOVE
            </span>
            <code style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              11px / 700 / +0.04em UPPERCASE
            </code>
          </div>
        </div>
      </section>

      {/* 5. CANONICAL COMPONENT MATRIX (T1 - T14) */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          5. All 14 Canonical Mac App Store Component Templates (T1 – T14)
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 14,
          }}
        >
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                borderRadius: 12,
                padding: '16px 18px',
                border: '1px solid var(--divider-hairline)',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#007aff' }}>{tpl.id}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{tpl.page}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{tpl.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {tpl.spec}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
