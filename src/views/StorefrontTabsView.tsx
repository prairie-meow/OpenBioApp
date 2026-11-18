import React from 'react';
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
  tab: Exclude<SidebarTabId, 'categories' | 'updates' | 'design-template' | 'workspace' | 'arcade'>;
  apps: BioApp[];
  categories: BioCategory[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onOpenStory: (storyId: string) => void;
  onOpenCategory: (catId: BioCategoryId) => void;
  onSeeAll: (title: string, appIds: string[], ranked?: boolean) => void;
  onNavigateAutoResearch: () => void;
  onNavigateWorkspace: () => void;
}

export const StorefrontTabsView: React.FC<StorefrontTabsViewProps> = ({
  tab,
  apps,
  installStates,
  onInstall,
  onOpenApp,
  onOpenStory,
  onSeeAll,
  onNavigateAutoResearch,
  onNavigateWorkspace,
}) => {
  if (tab === 'discover') {
    const cloudPythonApps = apps.filter((a) => a.isCloudContainer);
    const instantBrowserApiApps = apps.filter((a) => !a.isCloudContainer);

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Discover</h1>
        </div>

        <WideHeroCarousel stories={EDITORIAL_STORIES} onOpenStory={onOpenStory} />

        <CircularPromoRow items={DISCOVER_PROMO_CARDS} onOpenStory={onOpenStory} />

        <SmallLockupSection
          title={`Verified Live Biomedical Studios (${apps.length} Active)`}
          apps={apps}
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              `All Verified Live Biomedical Studios (${apps.length})`,
              apps.map((a) => a.id)
            )
          }
        />

        <EditorialMediaRow
          title="Live Scientific Workflows"
          items={DISCOVER_MEDIA_CARDS}
          onOpenApp={onOpenApp}
        />

        <SmallLockupSection
          title={`Cloud Run Python 3.12 Scientific Engines (${cloudPythonApps.length})`}
          apps={cloudPythonApps}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              `Cloud Run Python 3.12 Scientific Engines (${cloudPythonApps.length})`,
              cloudPythonApps.map((a) => a.id)
            )
          }
        />

        <SmallLockupSection
          title={`Zero-Server Public Bio-API & In-Browser Studios (${instantBrowserApiApps.length})`}
          apps={instantBrowserApiApps}
          showEyebrow
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
          onSeeAll={() =>
            onSeeAll(
              `Zero-Server Public Bio-API & In-Browser Studios (${instantBrowserApiApps.length})`,
              instantBrowserApiApps.map((a) => a.id)
            )
          }
        />

        <StoreQuickLinksFooter
          onNavigateAutoResearch={onNavigateAutoResearch}
          onNavigateWorkspace={onNavigateWorkspace}
        />
      </div>
    );
  }

  if (tab === 'create') {
    const designApps = apps.filter((a) =>
      [
        'primer3-biopython',
        'crispr-guide-scorer',
        'rdkit-molecular-profiler',
        'nucleospec-dna-agnc',
        'alphafold-pdb-studio',
      ].includes(a.id)
    );

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Create</h1>
        </div>

        <TopShowcaseRow items={CREATE_SHOWCASES} onOpenApp={onOpenApp} />

        <SmallLockupSection
          title={`Sequence, Guide RNA & Molecular Design Studios (${designApps.length})`}
          apps={designApps}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />

        <EditorialMediaRow items={DISCOVER_MEDIA_CARDS} onOpenApp={onOpenApp} />
      </div>
    );
  }

  if (tab === 'work') {
    const workApps = apps.filter((a) =>
      [
        'pydeseq2-deg',
        'gseapy-enrichr',
        'opentargets-explorer',
        'clinvar-variant-annotator',
        'lifelines-survival',
        'celltypist-annotator',
        'chembl-drug-finder',
      ].includes(a.id)
    );

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Work</h1>
        </div>

        <TopShowcaseRow items={WORK_SHOWCASES} onOpenApp={onOpenApp} />

        <SmallLockupSection
          title={`Transcriptomics, Clinical Targets & Survival Analysis (${workApps.length})`}
          apps={workApps}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      </div>
    );
  }

  if (tab === 'play') {
    const interactiveVisualApps = apps.filter((a) =>
      [
        'alphafold-pdb-studio',
        'nucleospec-dna-agnc',
        'celltypist-annotator',
        'pydeseq2-deg',
        'rdkit-molecular-profiler',
        'lifelines-survival',
      ].includes(a.id)
    );

    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Play</h1>
        </div>

        <SplitSimulationHero onOpenApp={onOpenApp} />

        <EditorialMediaRow
          title="Interactive 3D Structures, Isotope Overlays & Manifolds"
          items={DISCOVER_MEDIA_CARDS}
          onOpenApp={onOpenApp}
        />

        <SmallLockupSection
          title={`Interactive Visual Scientific Studios (${interactiveVisualApps.length})`}
          apps={interactiveVisualApps}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      </div>
    );
  }

  // DEVELOP TAB: Real Data-Bridge Blocks & Live API Runners Only
  const devApps = apps.filter((a) =>
    [
      'smart-table-filter',
      'bio-id-harmonizer',
      'batch-result-aggregator',
      'opentargets-explorer',
      'chembl-drug-finder',
      'clinvar-variant-annotator',
      'gseapy-enrichr',
    ].includes(a.id)
  );

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">Develop</h1>
      </div>

      <TopShowcaseRow items={DEVELOP_SHOWCASES} onOpenApp={onOpenApp} />

      <MediumLockupSection
        title={`Deterministic Data-Bridge Blocks & Live Bio-API Studios (${devApps.length})`}
        apps={devApps}
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
      />
    </div>
  );
};
