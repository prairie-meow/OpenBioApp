import React, { useMemo, useState } from 'react';
import { useLocale } from '../lib/i18n/locale';
import { BioApp } from '../types/store';
import {
  DISCOVER_MEDIA_CARDS,
  DISCOVER_PROMO_CARDS,
  EDITORIAL_STORIES,
} from '../data/bioStoreData';
import {
  AppLockupRow,
  CircularPromoRow,
  EditorialMediaRow,
  InstallStateMap,
  StoreQuickLinksFooter,
  WideHeroCarousel,
} from '../components/StorePrimitives';

type AssayFilterId =
  | 'all'
  | 'mass-spec'
  | 'transcriptomics'
  | 'targets-variants'
  | 'molecules'
  | 'sequence-crispr'
  | 'bridges';

const ASSAY_GROUPS: Record<Exclude<AssayFilterId, 'all'>, string[]> = {
  'mass-spec': ['nucleospec-dna-agnc', 'alphafold-pdb-studio'],
  transcriptomics: ['pydeseq2-deg', 'gseapy-enrichr', 'celltypist-annotator', 'lifelines-survival'],
  'targets-variants': ['opentargets-explorer', 'clinvar-variant-annotator'],
  molecules: ['chembl-drug-finder', 'rdkit-molecular-profiler'],
  'sequence-crispr': ['primer3-biopython', 'crispr-guide-scorer', 'biopython-seq-toolkit'],
  bridges: ['smart-table-filter', 'bio-id-harmonizer', 'batch-result-aggregator'],
};

interface StorefrontTabsViewProps {
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onOpenStory: (storyId: string) => void;
  onSeeAll: (title: string, appIds: string[], ranked?: boolean) => void;
  onNavigateAutoResearch: () => void;
  onNavigateWorkspace: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export const StorefrontTabsView: React.FC<StorefrontTabsViewProps> = ({
  apps,
  installStates,
  onInstall,
  onOpenApp,
  onOpenStory,
  onSeeAll,
  onNavigateAutoResearch,
  onNavigateWorkspace,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const { tr } = useLocale();
  const [assayFilter, setAssayFilter] = useState<AssayFilterId>('all');

  const filterTabs: { id: AssayFilterId; label: string }[] = [
    { id: 'all', label: tr(`All Verified (${apps.length})`, `전체 검증 앱 (${apps.length})`) },
    { id: 'mass-spec', label: tr('Mass Spec & 3D Structure', '질량분석 · 3D 구조') },
    { id: 'transcriptomics', label: tr('RNA-seq, Single-Cell & Survival', '전사체 · 단일세포 · 생존') },
    { id: 'targets-variants', label: tr('Disease Targets & Variants', '질병 타겟 · 변이') },
    { id: 'molecules', label: tr('Small Molecules & ADMET', '저분자 약물 · ADMET') },
    { id: 'sequence-crispr', label: tr('Primers, CRISPR & Sequences', '프라이머 · 유전자가위 · 서열') },
    { id: 'bridges', label: tr('Bio-ID & Table Bridges', '유전자 ID · 테이블 브리지') },
  ];

  const filteredApps = useMemo(() => {
    if (assayFilter === 'all') return apps;
    const ids = new Set(ASSAY_GROUPS[assayFilter]);
    return apps.filter((a) => ids.has(a.id));
  }, [apps, assayFilter]);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">{tr('Discover', '탐색')}</h1>
      </div>

      <WideHeroCarousel stories={EDITORIAL_STORIES} onOpenStory={onOpenStory} />

      <CircularPromoRow items={DISCOVER_PROMO_CARDS} onOpenStory={onOpenStory} />

      {/* Unified Verified Catalog Shelf with Interactive Assay Filter (Zero Shelf Duplication) */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <div className="mas-section-header">
          <h2 className="mas-section-title">
            {tr(
              `Verified Biomedical Studios (${filteredApps.length})`,
              `검증된 실행형 바이오 스튜디오 (${filteredApps.length})`
            )}
          </h2>
          <button
            type="button"
            className="mas-link-btn"
            onClick={() =>
              onSeeAll(
                tr(
                  `All Verified Biomedical Studios (${apps.length})`,
                  `전체 검증 바이오 스튜디오 (${apps.length})`
                ),
                apps.map((a) => a.id)
              )
            }
          >
            {tr(`View Full Directory (${apps.length})`, `전체 목록 보기 (${apps.length})`)}
          </button>
        </div>

        <div
          className="discover-assay-filters"
          role="tablist"
          aria-label={tr('Filter studios by assay and data type', '분석법 및 데이터 형식별 필터')}
        >
          {filterTabs.map((ft) => {
            const active = assayFilter === ft.id;
            return (
              <button
                key={ft.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`discover-filter-chip ${active ? 'active' : ''}`}
                onClick={() => setAssayFilter(ft.id)}
              >
                {ft.label}
              </button>
            );
          })}
        </div>

        <div className="t7-grid">
          {filteredApps.map((app) => (
            <AppLockupRow
              key={app.id}
              app={app}
              showPlatform
              installState={installStates[app.id]}
              onTriggerInstall={onInstall}
              onOpenApp={onOpenApp}
            />
          ))}
        </div>
      </section>

      <EditorialMediaRow
        title={tr('Step-by-Step Scientific Workflows', '실전 과학 분석 워크플로우')}
        items={DISCOVER_MEDIA_CARDS}
        onOpenApp={onOpenApp}
      />

      <StoreQuickLinksFooter
        onNavigateAutoResearch={onNavigateAutoResearch}
        onNavigateWorkspace={onNavigateWorkspace}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />
    </div>
  );
};
