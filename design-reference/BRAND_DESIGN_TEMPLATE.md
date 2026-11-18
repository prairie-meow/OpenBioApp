# Mac App Store → Bio App Store: Brand Design Template

> **Source Ground Truth**: Captured directly from the local macOS App Store (`com.apple.AppStore`, window geometry `1512 × 949` logical pt, `ScreenCaptureKit`) using **Orca Computer Use (`orca computer`)** across 25 high-resolution reference screenshots stored in [`./screenshots/`](./screenshots/).

---

## 1. Captured Reference Atlas (25 Local CUA Captures)

| Page / Surface | Screenshot File | Canonical UI Patterns Observed |
| :--- | :--- | :--- |
| **Discover — Top** | [`01-discover-top.png`](./screenshots/01-discover-top.png) | `220px` `#F5F5F7` sidebar, `34px` bold `Discover`, 1-up Wide Hero Banner (`3.1:1`), 2-up `#F5F5F7` Circular-Badge Promo Cards, 3-row × 3-col Small App Lockup |
| **Discover — Sticky Blur** | [`02-discover-scrolled-1.png`](./screenshots/02-discover-scrolled-1.png), [`02b-discover-scrolled-2.png`](./screenshots/02b-discover-scrolled-2.png) | Progressive frosted Liquid Glass sticky header (`52px`, centered `13px` `Discover` title), full 3-row lockup alignment |
| **Discover — Editorial & Mid** | [`02-discover-mid.png`](./screenshots/02-discover-mid.png), [`02c-discover-lower.png`](./screenshots/02c-discover-lower.png) | 3-up `16:10` Editorial Media Cards (eyebrow + title + 2-line subtitle below image), 3-line Arcade eyebrow lockups |
| **Discover — Footer** | [`03-discover-footer.png`](./screenshots/03-discover-footer.png) | `Designed for iPad` 3rd-line metadata, iCloud Redownload icon, 2-col `Quick Links` table, `Redeem` / `Add Money` action pills, `Terms & Conditions >` |
| **Arcade — Top** | [`04-arcade-top.png`](./screenshots/04-arcade-top.png) | Full-bleed dark neon Hero Banner (`margin-top: 0`), solid `#007AFF` CTA pill, horizontal Icon Filter Pills, Column-Major (`1,4,7` / `2,5,8` / `3,6,9`) Top Chart |
| **Arcade — Scrolled** | [`05-arcade-scrolled.png`](./screenshots/05-arcade-scrolled.png) | Sticky Promo Toolbar (`Arcade` left, `Accept` blue pill right), Green Spotlight Banner with inset dark glass card, 4-up Perk Cards, Gradient Category Tiles |
| **Create — Top & Scrolled** | [`06-create-top.png`](./screenshots/06-create-top.png), [`07-create-scrolled.png`](./screenshots/07-create-scrolled.png) | **2-up Top Showcase** (`#007AFF` blue eyebrow + title + subtitle *above* `16:10` artwork), **Medium 2-Row Lockup** (`86px` squircle icon + bottom-left `Get` pill) |
| **Work — Top & Scrolled** | [`08-work-top.png`](./screenshots/08-work-top.png), [`09-work-scrolled.png`](./screenshots/09-work-scrolled.png) | 2-up Productivity Showcase, 3-row Small Lockup, 3-up Creator Spotlight row, 2-row Medium Lockup |
| **Play — Top & Scrolled** | [`10-play-top.png`](./screenshots/10-play-top.png), [`11-play-scrolled.png`](./screenshots/11-play-scrolled.png) | **Split Trailer Hero** (`28%` dark tinted info panel + `72%` video stage with `52px` frosted circular Play button), 3-up Story Cards |
| **Develop — Top & Scrolled** | [`12-develop-top.png`](./screenshots/12-develop-top.png), [`13-develop-scrolled.png`](./screenshots/13-develop-scrolled.png) | Developer Tools 2-up Showcase, `Essential Apps for Developers` (`86px` Medium Lockup), `Top Free Apps` (`1..12` Column-Major Chart) |
| **Categories — Directory** | [`14-categories.png`](./screenshots/14-categories.png) | **4-Column Duotone-Icon Directory Grid** (`26px` colorful icon + `15px` label + text-inset `1px` divider), `Editors' Choice` below |
| **Category Subpage (`Medical`)** | [`15-category-medical.png`](./screenshots/15-category-medical.png) | Top subpage bar with `32px` circular `<` Back button + centered `Medical` label + bottom hairline, 2-up Showcase + `Top Free` / `Top Paid` charts |
| **Updates** | [`16-updates.png`](./screenshots/16-updates.png) | `Updates` + right-aligned `#007AFF` `Update All`, **2-Column Update Card Grid** (`56px` icon, title, date, `Update` pill, full-width 2-line changelog + inline `more`) |
| **Search — Input & Results** | [`17-search-typing.png`](./screenshots/17-search-typing.png), [`18-search-results.png`](./screenshots/18-search-results.png) | Sidebar Search clear `×` button, `Results for “DNA”`, Pill Segmented Control (`Mac Apps` / `iPhone & iPad Apps`), `Filters ⌄`, **2-Column Search Lockup + `16:10` Screenshot** + monochrome `#6E6E73` `★★★★★` |
| **App Detail — Top** | [`19-app-detail-top.png`](./screenshots/19-app-detail-top.png) | `<` Back + `Share` circle buttons, `118px` Squircle Icon, solid `#007AFF` `Get` pill, **6-Column Spec Ribbon**, 2-up Screenshot Carousel, Description + Developer Links |
| **App Detail — Mid** | [`20-app-detail-mid.png`](./screenshots/20-app-detail-mid.png) | Sticky Mini-Icon Header, `5.0 out of 5` Giant Rating + 5-bar Histogram, `What's New` + `Version History`, **App Privacy Nutrition Label Card** (`#F5F5F7`) |
| **App Detail — Bottom** | [`21-app-detail-bottom.png`](./screenshots/21-app-detail-bottom.png) | `Accessibility`, **3-Column `Information` Key-Value Grid**, `✋ Privacy Policy`, **`#F5F5F7` Full-Bleed Footer** (`More by Developer` + `You Might Also Like`) |
| **Editorial Story Reader** | [`22-editorial-story.png`](./screenshots/22-editorial-story.png) | Full-window `#FFFFFF` overlay (sidebar hidden), **Left Sticky `42%` Poster** with frosted App Lockup Dock, **Right `58%` Article** with bold run-in lead & captioned figures |
| **Profile — `Apple Account` Sheet** | [`23-profile-account-sheet.png`](./screenshots/23-profile-account-sheet.png) | `468px` centered `#FFFFFF` modal sheet (`18px` radius) over `rgba(0,0,0,0.24)` scrim, `#F5F5F7` `12px` grouped inset cards, `60px` avatar, 2-col `$ Add Money` / `Redeem Code` tiles, `Set Up Family`, bottom `7px`-radius `#E5E5EA` `Done` button |
| **Profile — `Notifications` Sub-Sheet** | [`24-profile-notifications.png`](./screenshots/24-profile-notifications.png) | `#007AFF` `Allow Notifications on this Mac` action card, `#F5F5F7` grouped toggle card with `36×20px` macOS pill switches, footer `Back` + `Done` buttons |
| **Profile — `Recommendations` Sub-Sheet** | [`25-profile-recommendations.png`](./screenshots/25-profile-recommendations.png) | Privacy explanation card, `Your Interactions With The App Store` 4-row drill-down card, `Additional Info Used` bullet card |
| **Profile — `Apps & Purchases` & `Your Apps`** | [`26-profile-apps-purchases.png`](./screenshots/26-profile-apps-purchases.png), [`27-profile-your-apps.png`](./screenshots/27-profile-your-apps.png) | `Your Apps` / `Purchase History` selector; `Apps` sub-sheet with `Mac Apps` \| `iPhone & iPad Apps` segmented pill, search field, and installed/redownloadable app list |
| **Settings — `App Store Settings` (`⌘,`)** | [`28-app-store-settings.png`](./screenshots/28-app-store-settings.png) | `454 × 540 px` floating utility window, left-aligned `App Store Settings` titlebar, `16×16px` (`4.5px` radius) checkboxes + indented helper text, `224×28px` `Choose Disk… ⌄⌃` pop-up button, `Reset Usage Statistics Identifier` row |

---

## 2. Core Brand Foundations

### 2.1 Color Architecture & Surface Hierarchy
Apple's macOS App Store relies on **extreme tonal restraint** so app icons and editorial illustrations carry 90% of chromatic energy:

- **Canvas & Surfaces**
  - `--bg-canvas`: `#FFFFFF` — Primary scrollable content stage.
  - `--bg-sidebar`: `#F5F5F7` — Fixed left navigation column (separated from canvas purely by tonal shift, **no vertical border line**).
  - `--bg-card-subtle`: `#F5F5F7` — Used on 2-Up Circular-Badge Promo Cards, App Privacy Nutrition Label cards, and the App Detail bottom recommendation zone.
  - `--bg-pill-neutral`: `#F2F2F7` (hover `#E5E5EA`) — Standard `Get` / `Update` / `$19.99` pill background inside lists and grids.
  - `--bg-sidebar-active`: `rgba(0, 0, 0, 0.055)` (`#E8E8EA`) — Subtle neutral rounded pill for the selected sidebar tab (never saturated blue in light mode).
  - `--bg-sticky-glass`: `rgba(255, 255, 255, 0.78)` with `backdrop-filter: blur(28px) saturate(180%)` — Progressive frosted top toolbar on scroll.
- **Typography Ink**
  - `--text-primary`: `#1D1D1F` — Titles, app names, section headers, body copy, active sidebar label.
  - `--text-secondary`: `#6E6E73` — Editorial descriptions, monochrome rating stars (`★★★★★`), spec values, sidebar icons.
  - `--text-tertiary`: `#86868B` — App subtitles, dates, spec captions, sticky header title.
  - `--text-quaternary`: `#AEAEB2` — Platform compatibility notes (`Apple Silicon MLX`, `Docker Container`).
- **Interactive Accent**
  - `--accent-blue`: `#007AFF` (hover `#0066D6`) — Reserved strictly for interactive text (`See All`, `Update All`, `more`, `Filters ⌄`, `Version History`, `See Details`), top-showcase eyebrows (`GET STARTED`, `OUR FAVORITES`), `Get` pill labels on `#F2F2F7`, and the **solid `#007AFF` primary `Get` CTA** on App Detail & Suite Hero banners.
- **Dividers & Icon Framing**
  - `--divider-hairline`: `#E5E5EA` (`1px`, or `0.5px` Retina). Crucially, horizontal dividers between stacked app rows are **inset to start at the text column**, never extending underneath the squircle app icon.
  - `--icon-rim`: `0.5px solid rgba(0, 0, 0, 0.08)` + `0 2px 6px rgba(0, 0, 0, 0.05)` — Gives light-colored app icons crisp separation against `#FFFFFF`.

### 2.2 Typography Scale (SF Pro System Stack)
Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`.

| Token | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page-title` | `34px` | `700` | `-0.022em` | `1.12` | Top-level tab headers (`Discover`, `Create`, `Updates`, `Results for “…”`) |
| `hero-headline` | `28px` | `600` | `-0.018em` | `1.16` | Wide Hero Banner & Suite Hero headlines |
| `detail-title` | `24px` | `700` | `-0.018em` | `1.18` | App Detail Page main product title |
| `promo-title` | `21px` | `600` | `-0.015em` | `1.20` | 2-Up `#F5F5F7` Circular-Badge card headline |
| `section-header` | `20px` | `700` | `-0.015em` | `1.22` | Section titles (`Best New Bio Apps`, `Ratings & Reviews`, `Information`) |
| `showcase-title` | `18px` | `500` | `-0.010em` | `1.25` | 2-Up Top Showcase card title (above `16:10` banner) |
| `editorial-lead` | `17px` | `400` (`700` run-in) | `-0.005em` | `1.52` | Editorial Story Reader prose (first phrase bold `#1D1D1F`, remainder `#6E6E73`) |
| `lockup-title` | `14.5px` | `500` | `-0.008em` | `1.26` | App name in Small/Medium lockups, Updates, and Search |
| `body` | `13.5px` | `400` | `-0.004em` | `1.46` | App descriptions, release notes, review cards |
| `action-pill` | `13px` | `700` | `-0.005em` | `1.00` | `Get`, `Open`, `Update`, `$19.99` pill buttons |
| `lockup-subtitle` | `12.5px` | `400` | `0` | `1.30` | Short tagline / category below app name |
| `eyebrow` | `11px` | `700` | `+0.040em` | `1.20` | Uppercase tags (`BIO AI WE LOVE`, `GET STARTED`, `WORKFLOW SPOTLIGHT`) |
| `spec-label` | `10.5px` | `600` | `+0.030em` | `1.20` | 6-col metadata ribbon headers (`RATINGS`, `BENCHMARK`, `CATEGORY`, `LAB`, `RUNTIME`, `SIZE`) |
| `micro-caption` | `8.5px` | `500` | `0` | `1.15` | `Open-Source` / `Academic License` / `Cloud GPU` micro-note next to or under `Get` |

### 2.3 Continuous Squircle Icon Geometry
Every app icon uses Apple's continuous superellipse proportion (`border-radius: 22.5%` with `inset 0 0 0 0.5px rgba(0,0,0,0.09)`):
- **Sticky Toolbar Mini**: `20 × 20 px` (`radius: 5px`)
- **Small Lockup (3-Row Grid & Search)**: `54 × 54 px` (`radius: 12.5px`)
- **Updates Grid**: `56 × 56 px` (`radius: 13px`)
- **Editorial Story Dock**: `62 × 62 px` (`radius: 14px`)
- **Medium Lockup (2-Row Developer/Create Grid)**: `86 × 86 px` (`radius: 19.5px`)
- **App Detail Hero**: `118 × 118 px` (`radius: 26.5px`, shadow `0 6px 18px rgba(0,0,0,0.08)`)

---

## 3. Canonical Component Templates (`T1` – `T12`) & Bio App Store Mapping

| ID | Mac App Store Pattern | Exact Structural Rules | Bio App Store Domain Mapping |
| :--- | :--- | :--- | :--- |
| **`T1`** | **Wide Hero Banner (`Discover`)** | `3.1 : 1` rounded `14px` card, left `42%` text overlay (`11px` white eyebrow, `28px` title, `14px` subtitle), full-bleed vector/kit artwork on right, `24px` next-card peek on right edge. | Featured flagship breakthroughs (*AlphaFold 3 Studio*, *Evo 2 Whole-Genome Atlas*). |
| **`T2`** | **2-Up Circular-Badge Promo Card** | `2 columns`, `#F5F5F7` fill, `border-radius: 14px`, `height: 216px`; left `58%` text stack, right `164px` circular artwork medallion. | Curated wet-lab/dry-lab workflow spotlights (*Single-Cell Multi-Omics*, *Automated CRISPR Guides*). |
| **`T3`** | **2-Up Top Showcase (`Create`/`Work`/`Develop`)** | `2 columns`; `#007AFF` `11px` bold uppercase eyebrow + `18px` `#1D1D1F` title + `15px` `#86868B` subtitle placed **above** a `16:10` `12px`-rounded graphic card. | Domain showcases on *Create*, *Work*, *Develop*, and *Category* subpages. |
| **`T4`** | **Split Simulation/Trailer Hero (`Play`)** | `3.1 : 1` `14px`-rounded card split into `28%` dark tinted left column (eyebrow + title top, caption bottom) and `72%` live simulation stage with centered `52px` frosted Play/Pause button. | Interactive 3D molecular dynamics & protein folding trajectory preview. |
| **`T5`** | **Suite Hero + Filter Pill Ribbon (`Arcade`)** | Full-bleed top dark glowing banner (`border-radius: 0 0 16px 16px`) + centered wordmark + `#007AFF` CTA pill; followed by `36px`-tall `#F2F2F7` icon+label filter pills. | **Bio Arcade** — Unified open-weights Bio Foundation Model suite + modality filter pills. |
| **`T6`** | **3-Up Editorial Media Card** | `3 columns`; `16:10` `12px`-rounded graphic on top, `#6E6E73` `11px` uppercase eyebrow + `17px` medium title + `13.5px` `#6E6E73` description underneath. | Protocol deep dives, benchmark comparisons, and lab tutorials. |
| **`T7`** | **Small App Lockup (`3 × 3` & Ranked Charts)** | `3 columns × 3 rows`; `54px` squircle icon, optional bold rank number (`1..12` ordered **column-major**: `1,2,3` down Col 1, `4,5,6` down Col 2, `7,8,9` down Col 3), title + subtitle, right `#F2F2F7` `Get` pill (`#007AFF` text), text-inset `1px` divider. | `Best New Bio Apps`, `Top Free Bio Tools`, `Top Academic Charts`. |
| **`T8`** | **Medium App Lockup (`2 × 3` Large Icon)** | `3 columns × 2 rows`; `86px` squircle icon on left; right column has title + subtitle at top and `#F2F2F7` `Get` pill + 2-line micro-caption at bottom-left. | `Essential Apps for Bio Developers`, `Engineer De Novo Proteins`. |
| **`T9`** | **4-Column Category Directory** | `4 columns`; each row has `26px` duotone SF-style bio icon + `15px` `#1D1D1F` category name + `1px` hairline divider inset to start beneath the label. | 16 Bioinformatics & Wet-Lab Categories (`Genomics`, `Proteomics`, `CRISPR`, `Cryo-EM`, etc.). |
| **`T10`** | **2-Column Updates Card Grid** | `2 columns`; `56px` icon + title + date + `Update` pill on top row; full-column 2-line changelog below with inline `#007AFF` `more` toggle. | Containerized pipeline, weight checkpoint, and desktop bio-tool updates. |
| **`T11`** | **2-Column Search Result Card** | Header `Results for “…”` + Pill Segmented Control + `Filters ⌄`; 2-col grid where each item shows `52px` icon, title, subtitle, monochrome `#6E6E73` `★★★★★` + count, `Get` pill, and a `16:10` UI preview screenshot below. | Instant search across tools, foundation models, organisms, and file formats (`FASTA`, `PDB`, `h5ad`, `BAM`). |
| **`T12`** | **Product Detail + Editorial Story Reader** | Detail: `118px` icon, solid `#007AFF` `Get` pill, 6-col Spec Ribbon, Screenshot Carousel, Description + Lab Links, `5.0` Star Histogram, `What's New`, `App Privacy` Nutrition Labels, 3-col `Information` grid, `#F5F5F7` footer. Story: Full-window `42% / 58%` split with sticky poster + frosted App Dock. | Full scientific tool datasheet (ratings, benchmark rank, license, lab, runtime, container size, reproducibility & HIPAA privacy nutrition labels, DOI citation). |
| **`T13`** | **Profile / `Apple Account` Modal Sheet & Sub-Sheets** | Centered `468px` `#FFFFFF` modal sheet (`18px` radius) over `rgba(0,0,0,0.24)` full-window dim scrim. Header `16.5px` bold; `#F5F5F7` `12px`-radius inset grouped cards (`60px` circular avatar + identity row + ORCID/Game Center row; 5 drill-down rows `40px` tall with `16px`-inset dividers; 2-col `58px`-tall `#007AFF` icon+label tiles; single action row). Sticky footer with `7px`-radius `#E5E5EA` `Back` & `Done` buttons (`28px` height). Sub-sheets include `Notifications` (`36×20px` pill switches), `Recommendations`, and `Apps & Purchases -> Your Apps` (segmented pill + search + cloud redownload rows). | **Bio Account Sheet** — Researcher identity (`.edu` / ORCID), Compute Grants & Subscriptions, Installed Tools & Download History, Pipeline Notifications, Peer Reviews, Modality Recommendations, Add Compute Credits, Redeem Grant Code, and Shared Lab Group. |
| **`T14`** | **`App Store Settings` Window (`Cmd+,`)** | Standalone `454 × 540 px` `#FFFFFF` utility window (`14px` radius). `40px` titlebar (`#FBFBFD`, `1px` bottom border) with traffic lights + left-aligned `13.5px` bold `App Store Settings`. Body (`22px 26px` padding) stacks `16×16px` rounded-square (`4.5px` radius, `#E5E5EA`) checkboxes with `13.5px` medium labels and `26px`-indented `12px` `#86868B` helper text, an indented `224×28px` `7px`-radius `#F2F2F7` `Choose Disk… ⌄⌃` pop-up button for >1 GB installs, `1px` section dividers, and a bottom `Reset Usage Statistics Identifier` + `Reset Identifier` (`7px`-radius `#E5E5EA`) action row. | **Bio App Store Settings (`⌘,`)** — Automatic verified container updates, multi-Mac lab sync, background MLX/PyTorch model weight pre-fetching, >1 GB external NVMe scratch disk selector (`/Volumes/BioScratch_8TB`), 3D simulation autoplay, in-app reproducibility review prompts, and anonymous telemetry ID reset. |
