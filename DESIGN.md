# OpenBioApp Design System (`DESIGN.md`)

`OpenBioApp` pairs a calm, high-legibility clinical laboratory surface with interactive scientific visualization (`ESI-MS` isotope envelopes, `Volcano` plots, `Kaplan–Meier` curves, and touch-enabled `AlphaFold v6` 3D C-alpha backbones).

## 1. Design Principles

1. **Zero Mockups, Zero OS Chrome**: Every listed card corresponds to a live executable `bioapp.yaml` manifest. Native web navigation (`History API` URLs, keyboard shortcuts, and mobile tab bar) replaces fake desktop window controls.
2. **Input-First Scientific Clarity**: Each studio leads directly with its declarative parameter/file form and live pre-flight format validator, keeping sample previews, format checklists, and metric cutoffs one click away in a bilingual (`EN | KO`) reference drawer.
3. **Physical, Interruptible Motion**: Interactive controls respond with subtle spring scale (`scale(0.975)`), `Molecule3DViewer` supports Pointer-captured drag with exponential momentum decay (`0` idle `requestAnimationFrame` CPU at rest), and `@media (prefers-reduced-motion: reduce)` disables non-essential motion.

## 2. Semantic Color & Contrast Tokens (`tokens-and-shell.css`)

All foreground/background pairs meet or exceed **WCAG 2.1 AA (`4.5:1`)**:

| Token | Light Value | Dark Value (`[data-theme='dark']`) | Role |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#ffffff` | `#0f1117` | Primary page & scroll canvas |
| `--bg-sidebar` / `--bg-card-subtle` | `#f5f5f7` | `#161922` / `#1a1e29` | Navigation rail & grouped studio containers |
| `--text-primary` | `#1d1d1f` | `#f3f4f6` | Headings, primary body copy, table values |
| `--text-secondary` | `#48484e` | `#cbd5e1` | Subtitles, descriptions, axis titles |
| `--text-tertiary` | `#59595e` (`≥6.1:1`) | `#94a3b8` | Metadata, counts, secondary labels |
| `--accent-blue` | `#0066d6` (`5.56:1`) | `#60a5fa` | Primary actions, active states, links, focus ring |
| `--status-ok-fg` / `--status-warn-fg` / `--status-err-fg` | `#166534` / `#9a3412` / `#b91c1c` | Adaptive | Pre-flight format validation & clinical/ADMET badges |

## 3. Typography & Numeric Discipline

- **Font Stack**: `--font-sans` (`SF Pro Display` / `SF Pro Text` / `Apple SD Gothic Neo` / `Pretendard` / `system-ui`) with `font-optical-sizing: auto`; `--font-mono` (`SF Mono` / `ui-monospace`) for sequences, SMILES, m/z peaks, and `bioapp.yaml` ports.
- **Type Floor**: `0.75rem` (`12px`) minimum across all UI labels, badges, and SVG plot axes (`--text-xs: 0.75rem` through `--text-3xl: 2rem`).
- **Tabular Numerals**: `font-variant-numeric: tabular-nums` is enforced on all data tables, badge counters, version metadata, and plot tick labels.

## 4. Responsive & Accessibility Architecture

- **Desktop (`> 768px`)**: `232px` left sidebar with global search (`⌘K`), 5 primary destinations, `EN | KO` language toggle, and researcher account sync.
- **Mobile (`≤ 768px`)**: Compact top header + 5-item safe-area bottom navigation bar (`.mas-mobile-tabbar`), responsive single-column studio forms and bar charts, and `≥44px` coarse-pointer tap targets.
- **User Preference Queries**: Full support for `prefers-reduced-motion: reduce`, `prefers-reduced-transparency: reduce`, and `prefers-contrast: more`.
