import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  BioApp,
  BioCategory,
  BioCategoryId,
  SidebarTabId,
} from '../types/store';
import {
  CREATE_SHOWCASES,
  DEVELOP_SHOWCASES,
  DISCOVER_MEDIA_CARDS,
  DISCOVER_PROMO_CARDS,
  EDITORIAL_STORIES,
  WORK_SHOWCASES,
} from '../data/bioStoreData';
import { BioAppIcon } from '../components/BioArtwork';
import {
  CircularPromoRow,
  EditorialMediaRow,
  InstallStateMap,
  MediumLockupSection,
  SmallLockupSection,
  SplitSimulationHero,
  StoreQuickLinksFooter,
  TopShowcaseRow,
  WideHeroCarousel,
} from '../components/StorePrimitives';

interface StorefrontTabsViewProps {
  tab: Exclude<SidebarTabId, 'categories' | 'updates' | 'design-template' | 'workspace'>;
  apps: BioApp[];
  categories: BioCategory[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onOpenStory: (storyId: string) => void;
  onOpenCategory: (catId: BioCategoryId) => void;
  onSeeAll: (title: string, appIds: string[], ranked?: boolean) => void;
  onOpenDesignTemplate: () => void;
  onToast: (msg: string) => void;
}

const dedupeApps = (list: BioApp[]): BioApp[] =>
  list.filter((item, index, arr) => item && arr.findIndex((x) => x.id === item.id) === index);

export const StorefrontTabsView: React.FC<StorefrontTabsViewProps> = ({
  tab,
  apps,
  categories,
  installStates,
  onInstall,
  onOpenApp,
  onOpenStory,
  onOpenCategory,
  onSeeAll,
  onOpenDesignTemplate,
  onToast,
}) => {
  const [arcadeFilter, setArcadeFilter] = useState<string>('all');

  if (tab === 'discover') {
    const bestNew = apps.slice(0, 9);
    const siliconNative = apps.filter((a) => a.isMacNative).slice(3, 12);
    const arcadePicks = apps.filter((a) => a.isArcade);

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Discover</h1>
        </div>

        <WideHeroCarousel stories={EDITORIAL_STORIES} onOpenStory={onOpenStory} />

        <CircularPromoRow items={DISCOVER_PROMO_CARDS} onOpenStory={onOpenStory} />

        <SmallLockupSection
          title="Best New Bio Apps and Updates"
          apps={bestNew}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Best New Bio Apps and Updates',
              apps.map((a) => a.id)
            )
          }
        />

        <EditorialMediaRow
          title="Get to Know Biomolecular AI"
          items={DISCOVER_MEDIA_CARDS}
          onOpenApp={onOpenApp}
        />

        <SmallLockupSection
          title="Apps Optimized for Apple Silicon Metal & MLX"
          apps={siliconNative}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Apps Optimized for Apple Silicon Metal & MLX',
              siliconNative.map((a) => a.id)
            )
          }
        />

        <SmallLockupSection
          title="Popular Bio Arcade Foundation Models"
          apps={dedupeApps([...arcadePicks, ...apps]).slice(0, 9)}
          showEyebrow
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Popular Bio Arcade Foundation Models',
              arcadePicks.map((a) => a.id)
            )
          }
        />

        <StoreQuickLinksFooter
          onOpenDesignTemplate={onOpenDesignTemplate}
          onQuickAction={onToast}
        />
      </div>
    );
  }

  if (tab === 'arcade') {
    const pillFilters = [
      { id: 'all', icon: '🧬', label: 'All Models' },
      { id: 'structural-bio', icon: '🧊', label: 'Protein Folding' },
      { id: 'genomics', icon: '🧪', label: 'Genomics' },
      { id: 'protein-design', icon: '⚛️', label: 'De Novo Design' },
      { id: 'drug-discovery', icon: '💊', label: 'Docking' },
      { id: 'bioimaging', icon: '🔬', label: 'Microscopy' },
      { id: 'bio-agents', icon: '🤖', label: 'Co-Scientists' },
      { id: 'single-cell', icon: '🫧', label: 'Single-Cell' },
    ];

    const arcadeApps =
      arcadeFilter === 'all'
        ? apps
        : [
            ...apps.filter((a) => a.categoryId === arcadeFilter),
            ...apps.filter((a) => a.categoryId !== arcadeFilter),
          ];

    return (
      <div className="mas-page-content no-top-pad">
        {/* Full-bleed dark neon Arcade Hero (04-arcade-top.png) */}
        <div className="t5-arcade-hero">
          {/* Glowing Neon Wordmark + FloatingSquircle Constellation */}
          <div
            style={{
              display: 'flex',
              gap: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
            }}
          >
            {apps.slice(0, 5).map((a, i) => (
              <div
                key={a.id}
                onClick={() => onOpenApp(a.id)}
                style={{
                  transform: `translateY(${i % 2 === 0 ? 0 : -12}px)`,
                  cursor: 'pointer',
                }}
              >
                <BioAppIcon
                  glyph={a.iconGlyph}
                  gradient={a.iconGradient}
                  accent={a.iconAccent}
                  size={i === 2 ? 78 : 62}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow:
                '0 0 24px rgba(94, 242, 214, 0.75), 0 0 54px rgba(56, 189, 248, 0.55)',
              marginBottom: 14,
            }}
          >
             Bio Arcade
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.02em',
              opacity: 0.9,
              marginBottom: 6,
            }}
          >
            OPEN FOUNDATION WEIGHTS &amp; UNLIMITED LAB GPU
          </div>
          <h1
            style={{
              margin: '0 0 18px',
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              maxWidth: 680,
            }}
          >
            Your lab Mac includes 3 months of Bio Arcade Compute free.
          </h1>
          <button
            type="button"
            className="mas-get-pill solid-blue"
            style={{ height: 38, padding: '0 26px', fontSize: 14 }}
            onClick={() =>
              onToast(
                'Bio Arcade Activated: Unlimited AlphaFold 3, Evo 2 & ESM-3 weights unlocked.'
              )
            }
          >
            Accept 3 Months Free
          </button>
          <div style={{ fontSize: 11, opacity: 0.68, marginTop: 10 }}>
            Free for .edu academic labs · Zero sequence telemetry · No paywalls.
          </div>
        </div>

        {/* Horizontal Filter Pill Ribbon (04-arcade-top.png) */}
        <div className="t5-pill-ribbon">
          {pillFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`t5-filter-chip ${arcadeFilter === f.id ? 'active' : ''}`}
              onClick={() => setArcadeFilter(f.id)}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Column-Major Numbered Top Chart */}
        <SmallLockupSection
          title="Top Bio Arcade Foundation Models"
          apps={arcadeApps}
          ranked
          showEyebrow
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Top Bio Arcade Foundation Models',
              arcadeApps.map((a) => a.id),
              true
            )
          }
        />

        {/* Green Spotlight Banner with Inset Dark Glass Box (05-arcade-scrolled.png) */}
        <section className="mas-section">
          <div
            style={{
              borderRadius: 14,
              padding: 30,
              minHeight: 230,
              background: 'linear-gradient(125deg, #14532d 0%, #065f46 55%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: 'rgba(8, 28, 18, 0.58)',
                backdropFilter: 'blur(16px)',
                borderRadius: 14,
                padding: '22px 24px',
                maxWidth: 370,
                color: '#ffffff',
              }}
            >
              <div className="t1-eyebrow">ONLY ON BIO ARCADE</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 23, fontWeight: 700 }}>
                AlphaFold 3 Studio
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: 13.5, opacity: 0.88, lineHeight: 1.4 }}>
                Fold multimer protein-DNA-ligand complexes locally with zero data egress.
              </p>
              <button
                type="button"
                onClick={() => onOpenApp('alphafold-studio')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View Model <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Discover the Perks of Bio Arcade (05-arcade-scrolled.png) */}
        <section className="mas-section">
          <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
            Discover the Perks of Bio Arcade
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            {[
              { title: 'Zero Sequence Egress & HIPAA Safe', emoji: '🛡️' },
              { title: 'Share Weights Across Lab Members', emoji: '🧪' },
              { title: 'No Proprietary Lock-In or Paywalls', emoji: '🔓' },
              { title: 'Pre-Benchmarked CASP & scIB Suites', emoji: '📊' },
            ].map((perk) => (
              <div key={perk.title}>
                <div
                  style={{
                    height: 136,
                    borderRadius: 12,
                    background: '#f5f5f7',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 38,
                    marginBottom: 8,
                  }}
                >
                  {perk.emoji}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{perk.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Colorful Gradient Category Tiles (05-arcade-scrolled.png) */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
            Categories
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {[
              { id: 'structural-bio' as BioCategoryId, label: 'Folding', bg: 'linear-gradient(135deg, #4ade80, #16a34a)' },
              { id: 'genomics' as BioCategoryId, label: 'Genomics', bg: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
              { id: 'crispr' as BioCategoryId, label: 'CRISPR', bg: 'linear-gradient(135deg, #fb923c, #ea580c)' },
              { id: 'drug-discovery' as BioCategoryId, label: 'Docking', bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
              { id: 'single-cell' as BioCategoryId, label: 'Single-Cell', bg: 'linear-gradient(135deg, #34d399, #059669)' },
            ].map((tile) => (
              <div
                key={tile.id}
                onClick={() => onOpenCategory(tile.id)}
                style={{
                  height: 112,
                  borderRadius: 12,
                  background: tile.bg,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'flex-end',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                {tile.label}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (tab === 'create') {
    const designApps = apps.filter(
      (a) =>
        a.categoryId === 'protein-design' ||
        a.categoryId === 'synbio' ||
        a.categoryId === 'crispr' ||
        a.categoryId === 'metabolomics'
    );
    const padded = dedupeApps([...designApps, ...apps]).slice(0, 9);

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Create</h1>
        </div>

        <TopShowcaseRow items={CREATE_SHOWCASES} onOpenApp={onOpenApp} />

        <SmallLockupSection
          title="Best New Protein & Sequence Design Apps"
          apps={padded}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Best New Protein & Sequence Design Apps',
              padded.map((a) => a.id)
            )
          }
        />

        <EditorialMediaRow items={DISCOVER_MEDIA_CARDS} onOpenApp={onOpenApp} />

        <MediumLockupSection
          title="Engineer De Novo Biomolecules"
          apps={padded.slice(0, 6)}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      </div>
    );
  }

  if (tab === 'work') {
    const workApps = dedupeApps([
      ...apps.filter(
        (a) =>
          a.categoryId === 'pipelines' ||
          a.categoryId === 'lab-eln' ||
          a.categoryId === 'single-cell' ||
          a.categoryId === 'clinical'
      ),
      ...apps,
    ]).slice(0, 9);

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Work</h1>
        </div>

        <TopShowcaseRow items={WORK_SHOWCASES} onOpenApp={onOpenApp} />

        <SmallLockupSection
          title="Best New Lab Pipeline & ELN Apps"
          apps={workApps}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Best New Lab Pipeline & ELN Apps',
              workApps.map((a) => a.id)
            )
          }
        />

        <MediumLockupSection
          title="Reproducible Multi-Omics & Cohort Management"
          apps={workApps.slice(0, 6)}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      </div>
    );
  }

  if (tab === 'play') {
    const simApps = dedupeApps([
      ...apps.filter(
        (a) =>
          a.categoryId === 'molecular-dynamics' ||
          a.categoryId === 'structural-bio' ||
          a.categoryId === 'drug-discovery'
      ),
      ...apps,
    ]).slice(0, 9);

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Play</h1>
        </div>

        <SplitSimulationHero onOpenApp={onOpenApp} />

        <EditorialMediaRow
          title="Interactive 3D Folding & Molecular Sandboxes"
          items={DISCOVER_MEDIA_CARDS}
          onOpenApp={onOpenApp}
        />

        <SmallLockupSection
          title="Best 3D Structure Viewers & MD Engines"
          apps={simApps}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              'Best 3D Structure Viewers & MD Engines',
              simApps.map((a) => a.id)
            )
          }
        />
      </div>
    );
  }

  // DEVELOP TAB (12-develop-top.png & 13-develop-scrolled.png)
  const devApps = [
    apps.find((a) => a.id === 'auto-research-bio')!,
    apps.find((a) => a.id === 'bionemo-toolkit')!,
    apps.find((a) => a.id === 'biopython-bench')!,
    apps.find((a) => a.id === 'nextflow-tower')!,
    apps.find((a) => a.id === 'igv-genome')!,
    apps.find((a) => a.id === 'scanpy-workbench')!,
    ...apps,
  ]
    .filter((v, idx, arr) => v && arr.findIndex((x) => x.id === v.id) === idx)
    .slice(0, 9);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">Develop</h1>
      </div>

      <TopShowcaseRow items={DEVELOP_SHOWCASES} onOpenApp={onOpenApp} />

      <MediumLockupSection
        title="Essential Apps for Bio Developers"
        apps={devApps.slice(0, 6)}
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            'Essential Apps for Bio Developers',
            devApps.map((a) => a.id)
          )
        }
      />

      <MediumLockupSection
        title="More to Explore"
        apps={[...apps].reverse().slice(0, 6)}
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
      />

      <SmallLockupSection
        title="Top Free Bio SDKs & CLI Suites"
        apps={devApps}
        ranked
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            'Top Free Bio SDKs & CLI Suites',
            devApps.map((a) => a.id),
            true
          )
        }
      />
    </div>
  );
};
