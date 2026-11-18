export type SidebarTabId =
  | 'discover'
  | 'arcade'
  | 'create'
  | 'work'
  | 'play'
  | 'develop'
  | 'categories'
  | 'updates'
  | 'workspace'
  | 'design-template';

export type BioCategoryId =
  | 'genomics'
  | 'protein-design'
  | 'structural-bio'
  | 'single-cell'
  | 'drug-discovery'
  | 'crispr'
  | 'bioimaging'
  | 'pipelines'
  | 'bio-agents'
  | 'molecular-dynamics'
  | 'clinical'
  | 'metabolomics'
  | 'phylogenetics'
  | 'lab-eln'
  | 'biostats'
  | 'synbio';

export type IconGlyphType =
  | 'helix'
  | 'protein-fold'
  | 'umap-cells'
  | 'crispr-scissors'
  | 'cryo-grid'
  | 'pipeline-dag'
  | 'plasmid-ring'
  | 'docking-pocket'
  | 'agent-brain'
  | 'nanopore-wave'
  | 'microscope-lens'
  | 'genome-tracks'
  | 'md-orbitals'
  | 'rna-loop'
  | 'eln-notebook'
  | 'phylo-tree';

export type ScreenshotTheme =
  | 'structure-3d'
  | 'umap-atlas'
  | 'plasmid-editor'
  | 'sequence-tracks'
  | 'pipeline-graph'
  | 'docking-sim'
  | 'cryo-density'
  | 'agent-console';

export interface AppReview {
  id: string;
  title: string;
  rating: number;
  author: string;
  affiliation: string;
  date: string;
  body: string;
}

export interface VersionRelease {
  version: string;
  date: string;
  relativeDate: string;
  notes: string;
}

export interface PrivacyLabelCard {
  type: 'not-collected' | 'not-linked' | 'local-compute';
  title: string;
  subtitle: string;
  items: string[];
}

export interface BioApp {
  id: string;
  name: string;
  subtitle: string;
  eyebrow?: string; // e.g. "Bio Arcade"
  platformNote?: string; // e.g. "Apple Silicon MLX" | "Docker & Native Mac"
  categoryId: BioCategoryId;
  categoryLabel: string;
  developer: string;
  price: 'Get' | 'Redownload' | string; // e.g. "$29.00"
  inAppNote?: string; // e.g. "Open-Source" | "Academic Tier" | "Cloud GPU"
  isArcade?: boolean;
  isMacNative?: boolean;
  isCloudContainer?: boolean;
  rating: number;
  ratingCount: string;
  ratingHistogram: [number, number, number, number, number]; // 5★ down to 1★ percentages
  ageOrTier: string; // e.g. "IRB / 4+" or "MIT"
  ageSubtitle: string; // e.g. "Academic" or "Open License"
  chartRank?: string; // e.g. "#1"
  languageCode: string; // e.g. "PY" | "RS" | "EN"
  languageLabel: string; // e.g. "Python + MLX"
  sizeNumber: string; // e.g. "1.8" | "642.4"
  sizeUnit: 'MB' | 'GB';
  compatibility: string;
  copyright: string;
  doi?: string;
  websiteUrl?: string;
  iconGradient: [string, string, string?];
  iconAccent: string;
  iconGlyph: IconGlyphType;
  screenshotThemes: [ScreenshotTheme, ScreenshotTheme, ScreenshotTheme];
  screenshotCaptions: [string, string, string];
  description: string;
  releases: VersionRelease[];
  privacyCards: PrivacyLabelCard[];
  reviews: AppReview[];
}

export interface EditorialStory {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  heroBg: [string, string, string];
  illustrationStyle: 'kit-sprue' | 'genome-cosmos' | 'protein-cathedral' | 'single-cell-bloom' | 'crispr-precision' | 'agent-lab';
  featuredAppId: string;
  leadBold: string;
  leadRest: string;
  whatWeLove: string;
  figureTheme: ScreenshotTheme;
  figureCaption: string;
  quickTip: string;
}

export interface CircularPromoItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  badgeGradient: [string, string];
  badgeGlyph: IconGlyphType;
  storyId: string;
}

export interface ShowcaseBannerItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bgGradient: [string, string, string];
  glyph: IconGlyphType;
  screenshotTheme: ScreenshotTheme;
  targetAppId?: string;
  targetStoryId?: string;
}

export interface EditorialMediaItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bgGradient: [string, string];
  glyph: IconGlyphType;
  targetAppId: string;
}

export interface BioCategory {
  id: BioCategoryId;
  name: string;
  shortDesc: string;
  colorPrimary: string;
  colorSecondary: string;
  glyph: IconGlyphType;
}

export type RouteView =
  | { kind: 'tab'; tab: SidebarTabId }
  | { kind: 'search'; query: string }
  | { kind: 'category'; categoryId: BioCategoryId }
  | { kind: 'app-detail'; appId: string }
  | { kind: 'story'; storyId: string }
  | { kind: 'see-all'; title: string; subtitle?: string; appIds: string[]; ranked?: boolean };
