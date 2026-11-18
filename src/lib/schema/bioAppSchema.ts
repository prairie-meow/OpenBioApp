export type BioDataType =
  | 'MassSpectrumPeakList'
  | 'NanoclusterStoichiometryTable'
  | 'GeneCountMatrix'
  | 'DifferentialExpressionTable'
  | 'GeneSymbolList'
  | 'PathwayEnrichmentTable'
  | 'DiseaseQuery'
  | 'TargetAssociationTable'
  | 'ProteinAccession'
  | 'ProteinStructure3D'
  | 'NucleicAcidSequence'
  | 'PrimerDesignTable'
  | 'CrisprGuideTable'
  | 'SMILESList'
  | 'SMILESTable'
  | 'VariantList'
  | 'VariantAnnotationTable'
  | 'ClinicalSurvivalCohort'
  | 'SurvivalSummaryTable'
  | 'SingleCellClusterMatrix'
  | 'CellTypeAnnotationTable'
  | 'BioIdentifierList'
  | 'AnyDataTable';

export type RuntimeTier = 'browser-wasm' | 'public-bio-api' | 'cloud-run-cpu-worker';

export type FieldWidgetType =
  | 'file'
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'boolean';

export interface ManifestInputField {
  name: string;
  label: string;
  widget: FieldWidgetType;
  bioType?: BioDataType;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string | number | boolean;
  acceptedFormats?: string[];
  multiple?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  advanced?: boolean;
  autoSanitizers?: string[];
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  size?: number;
  ciLow?: number;
  ciHigh?: number;
}

export interface PlotSeries {
  name: string;
  color: string;
  lineWidth?: number;
  step?: boolean;
  points: PlotPoint[];
}

export interface ScientificPlotData {
  kind: 'spectrum_overlay' | 'volcano' | 'scatter' | 'line' | 'bar';
  title: string;
  xLabel: string;
  yLabel: string;
  xThresholds?: number[];
  yThreshold?: number;
  yDomain?: [number, number];
  series: PlotSeries[];
}

export interface Structure3DData {
  accession: string;
  geneSymbol: string;
  organism: string;
  title: string;
  pdbText: string;
  meanPlddt: number;
  residueCount: number;
  sourceUrl: string;
  confidenceBuckets: {
    veryHigh: number;
    confident: number;
    low: number;
    veryLow: number;
  };
}

export interface SequenceFeatureAnnotation {
  name: string;
  start: number;
  end: number;
  strand: '+' | '-';
  color: string;
  score?: number;
  detail?: string;
}

export interface SequenceTrackData {
  sequenceName: string;
  sequence: string;
  gcPercent: number;
  lengthBp: number;
  translatedProtein?: string;
  features: SequenceFeatureAnnotation[];
}

export interface BioAppRunResult {
  appId: string;
  appTitle: string;
  executedAt: string;
  summary: Record<string, unknown> & { headline: string };
  table?: Record<string, unknown>[];
  plot?: ScientificPlotData;
  structure3d?: Structure3DData;
  sequenceTrack?: SequenceTrackData;
  markdownReport?: string;
  chained_outputs?: Partial<Record<BioDataType, unknown>>;
  execution_meta?: {
    app_id: string;
    runtime_tier: string;
    elapsed_ms: number;
    ephemeral_deleted?: boolean;
    source_api?: string;
  };
}

export interface BioAppManifest {
  id: string;
  version: string;
  statusBadge: 'verified' | 'experimental' | 'utility-bridge';
  title: string;
  shortSubtitle: string;
  sourceRepo: string;
  doi?: string;
  citation: string;
  license: {
    spdx: string;
    commercialSafe: boolean;
    badgeLabel: string;
  };
  runtime: {
    tier: RuntimeTier;
    avgSpeedLabel: string;
    memoryLabel: string;
  };
  inputBioTypes: BioDataType[];
  outputBioTypes: BioDataType[];
  fields: ManifestInputField[];
  sampleLabel: string;
  sampleDescription: string;
  whenToUseForAgent: string;
}

export const BIO_APP_MANIFESTS: Record<string, BioAppManifest> = {
  'nucleospec-dna-agnc': {
    id: 'nucleospec-dna-agnc',
    version: '1.0.0',
    statusBadge: 'verified',
    title: 'NucleoSpec: DNA–Ag Nanocluster ESI-MS Analyzer',
    shortSubtitle: 'Automated silver nanocluster stoichiometry, valence electron N₀ & isotope overlay',
    sourceRepo: 'https://github.com/copplab/NucleoSpec',
    doi: '10.1021/acsmeasuresciau.6c00178',
    citation: 'Lin, I.-H.; Copp, S. M. A Tutorial on Automated Mass Spectral Analysis using NucleoSpec for Compositional Assignment of Nucleic Acid–Silver Complexes and Nanoclusters. ACS Meas. Sci. Au 2026.',
    license: {
      spdx: 'CC-BY-NC-4.0',
      commercialSafe: false,
      badgeLabel: 'Academic & Non-Commercial (CC BY-NC 4.0)',
    },
    runtime: {
      tier: 'cloud-run-cpu-worker',
      avgSpeedLabel: '~1.2s',
      memoryLabel: '512 MB CPU',
    },
    inputBioTypes: ['MassSpectrumPeakList', 'NucleicAcidSequence'],
    outputBioTypes: ['NanoclusterStoichiometryTable', 'NucleicAcidSequence'],
    sampleLabel: 'Try GG208 DNA–AgNC Sample (ATCCCCTGTC)',
    sampleDescription: 'Authentic Copp Lab high-resolution ESI-MS spectrum (154,434 m/z points) auto-detecting (DNA)₂Ag₁₇ (N₀ = 6e⁻, 99.9% isotope match).',
    whenToUseForAgent: 'Use when analyzing electrospray ionization mass spectrometry (ESI-MS) data of DNA/XNA-stabilized silver nanoclusters or Ag(I)-DNA complexes to determine strand count, silver stoichiometry (n_Ag), effective valence electrons (N0), core charge (Qcl), and isotope envelope similarity.',
    fields: [
      {
        name: 'spectrum_files',
        label: 'ESI-MS Spectrum Files (.txt, .csv, .tsv, .xlsx — Batch Supported)',
        widget: 'file',
        bioType: 'MassSpectrumPeakList',
        acceptedFormats: ['.txt', '.csv', '.tsv', '.xlsx'],
        multiple: true,
        autoSanitizers: ['strip_ms_vendor_headers', 'extract_mz_intensity_columns'],
        helperText: 'Waters, Thermo, Agilent, and Excel exports with metadata headers are cleaned automatically. Leave empty to run with Copp Lab GG208 benchmark spectrum.',
      },
      {
        name: 'analysis_mode',
        label: 'Nanocluster / Complex System Mode',
        widget: 'select',
        defaultValue: 'dna_agn',
        options: [
          { value: 'dna_agn', label: 'Single-Stranded DNA–Agₙ Nanocluster (N₀ / Qcl Framework)' },
          { value: 'agi_complex', label: 'Duplex / Hybrid Ag(I)–DNA Complex' },
          { value: 'xna_agn', label: 'Custom Xeno Nucleic Acid (XNA–Agₙ Formula)' },
        ],
      },
      {
        name: 'sequence_or_formula',
        label: 'DNA Template Sequence (5′→3′) or XNA Neutral Formula',
        widget: 'text',
        bioType: 'NucleicAcidSequence',
        defaultValue: 'ATCCCCTGTC',
        placeholder: 'e.g. ATCCCCTGTC or C100H120N40O60P10',
      },
      {
        name: 'max_peaks_to_assign',
        label: 'Max Major Envelope Peaks to Auto-Assign',
        widget: 'number',
        defaultValue: 4,
        min: 1,
        max: 8,
        step: 1,
        advanced: true,
      },
      {
        name: 'similarity_cutoff',
        label: 'Minimum Isotope Pattern Similarity Cutoff (0–1)',
        widget: 'number',
        defaultValue: 0.45,
        min: 0.1,
        max: 0.99,
        step: 0.05,
        advanced: true,
      },
    ],
  },

  'pydeseq2-deg': {
    id: 'pydeseq2-deg',
    version: '1.4.2',
    statusBadge: 'verified',
    title: 'PyDESeq2 Differential Expression Studio',
    shortSubtitle: 'RNA-seq size-factor normalization, moderated fold-change & BH-FDR Volcano plot',
    sourceRepo: 'https://github.com/owkin/PyDESeq2',
    doi: '10.1093/bioinformatics/btad547',
    citation: 'Muzellec, B. et al. PyDESeq2: a python package for bulk RNA-seq differential expression analysis. Bioinformatics 2023.',
    license: {
      spdx: 'MIT',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (MIT)',
    },
    runtime: {
      tier: 'cloud-run-cpu-worker',
      avgSpeedLabel: '~0.4s',
      memoryLabel: '256 MB CPU',
    },
    inputBioTypes: ['GeneCountMatrix'],
    outputBioTypes: ['DifferentialExpressionTable', 'GeneSymbolList'],
    sampleLabel: 'Try Human Airway Dexamethasone RNA-seq Sample',
    sampleDescription: 'Runs glucocorticoid-treated vs untreated human airway smooth muscle RNA-seq counts (Himes et al.) with automatic Excel date-gene restoration.',
    whenToUseForAgent: 'Use when given an RNA-seq or transcriptomic gene expression table to identify statistically significant up-regulated and down-regulated differentially expressed genes (DEGs) with FDR-adjusted p-values.',
    fields: [
      {
        name: 'count_matrix',
        label: 'Gene Expression Count Matrix (.csv, .tsv, .xlsx)',
        widget: 'file',
        bioType: 'GeneCountMatrix',
        acceptedFormats: ['.csv', '.tsv', '.txt', '.xlsx'],
        autoSanitizers: ['restore_excel_date_genes', 'strip_ensembl_version'],
        helperText: 'Excel-corrupted gene symbols (e.g. 1-Mar -> MARCHF1, Sep-2 -> SEPTIN2) are automatically repaired.',
      },
      {
        name: 'fdr_threshold',
        label: 'Adjusted P-Value (BH-FDR) Cutoff',
        widget: 'number',
        defaultValue: 0.05,
        min: 0.0001,
        max: 0.25,
        step: 0.01,
      },
      {
        name: 'log2fc_threshold',
        label: 'Minimum |log₂ Fold Change| Cutoff',
        widget: 'number',
        defaultValue: 1.0,
        min: 0.25,
        max: 4.0,
        step: 0.25,
      },
    ],
  },

  'celltypist-annotator': {
    id: 'celltypist-annotator',
    version: '1.6.3',
    statusBadge: 'verified',
    title: 'CellTypist Immune & Tissue Single-Cell Classifier',
    shortSubtitle: 'Automated scRNA-seq lineage annotation & 2D manifold projection',
    sourceRepo: 'https://github.com/Teichlab/celltypist',
    doi: '10.1126/science.abl5197',
    citation: 'Domínguez Conde, C. et al. Cross-tissue immune cell analysis reveals tissue-specific features in humans. Science 2022.',
    license: {
      spdx: 'MIT',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (MIT)',
    },
    runtime: {
      tier: 'cloud-run-cpu-worker',
      avgSpeedLabel: '~0.5s',
      memoryLabel: '256 MB CPU',
    },
    inputBioTypes: ['SingleCellClusterMatrix'],
    outputBioTypes: ['CellTypeAnnotationTable'],
    sampleLabel: 'Try PBMC 3k 8-Cluster Single-Cell Sample',
    sampleDescription: 'Annotates 2,485 human peripheral blood mononuclear cells across T, B, NK, Monocyte, cDC, and Megakaryocyte lineages.',
    whenToUseForAgent: 'Use to classify single-cell RNA-seq cluster expression profiles into canonical human immune and tissue cell types with confidence scores.',
    fields: [
      {
        name: 'cluster_matrix',
        label: 'Cluster Marker Expression CSV/TSV (Optional)',
        widget: 'file',
        bioType: 'SingleCellClusterMatrix',
        acceptedFormats: ['.csv', '.tsv'],
        helperText: 'Rows = clusters, columns = canonical marker genes (CD3D, CD8A, MS4A1, CD14, GNLY, FCER1A, PPBP…).',
      },
    ],
  },

  'gseapy-enrichr': {
    id: 'gseapy-enrichr',
    version: '1.1.4',
    statusBadge: 'verified',
    title: 'GSEApy & Enrichr Pathway Enrichment Explorer',
    shortSubtitle: 'Live KEGG, GO Biological Process & Reactome over-representation analysis',
    sourceRepo: 'https://github.com/zqfang/GSEApy',
    doi: '10.1093/bioinformatics/btac757',
    citation: 'Fang, Z.; Liu, X.; Peltz, G. GSEApy: a comprehensive package for performing gene set enrichment analysis in Python. Bioinformatics 2023.',
    license: {
      spdx: 'MIT',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (MIT)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.8s',
      memoryLabel: 'Browser + Enrichr API',
    },
    inputBioTypes: ['GeneSymbolList', 'DifferentialExpressionTable'],
    outputBioTypes: ['PathwayEnrichmentTable', 'GeneSymbolList'],
    sampleLabel: 'Try Glucocorticoid & Inflammatory Gene Set',
    sampleDescription: 'Queries Ma’ayan Lab Enrichr live API against KEGG_2021_Human or GO_Biological_Process_2023.',
    whenToUseForAgent: 'Use when given a list of gene symbols (e.g., from DEG analysis or disease targets) to identify enriched biological pathways, signaling cascades, and GO terms.',
    fields: [
      {
        name: 'gene_list',
        label: 'Gene Symbols (One per line or comma-separated)',
        widget: 'textarea',
        bioType: 'GeneSymbolList',
        defaultValue: 'TSC22D3\nDUSP1\nFKBP5\nPER1\nKLF15\nZBTB16\nIL6\nCXCL8\nCCL2\nPTGS2\nVCAM1\nMMP1',
        placeholder: 'TP53, EGFR, BRCA1, MYC...',
      },
      {
        name: 'gene_set_library',
        label: 'Pathway / Ontology Database',
        widget: 'select',
        defaultValue: 'KEGG_2021_Human',
        options: [
          { value: 'KEGG_2021_Human', label: 'KEGG 2021 Human Signaling Pathways' },
          { value: 'Reactome_2022', label: 'Reactome 2022 Curated Pathways' },
          { value: 'GO_Biological_Process_2023', label: 'GO Biological Process 2023' },
          { value: 'MSigDB_Hallmark_2020', label: 'MSigDB Hallmark 2020 Gene Sets' },
        ],
      },
    ],
  },

  'opentargets-explorer': {
    id: 'opentargets-explorer',
    version: '24.09',
    statusBadge: 'verified',
    title: 'OpenTargets Disease–Target Evidence Explorer',
    shortSubtitle: 'Human genetics, somatic mutations, clinical trials & druggability ranking',
    sourceRepo: 'https://github.com/opentargets/platform-app',
    doi: '10.1093/nar/gkac1046',
    citation: 'Ochoa, D. et al. The next-generation Open Targets Platform: reimagined, redesigned, rebuilt. Nucleic Acids Res. 2023.',
    license: {
      spdx: 'Apache-2.0',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (Apache-2.0)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.6s',
      memoryLabel: 'OpenTargets v4 GraphQL',
    },
    inputBioTypes: ['DiseaseQuery'],
    outputBioTypes: ['TargetAssociationTable', 'GeneSymbolList'],
    sampleLabel: 'Try Non-Small Cell Lung Carcinoma Targets',
    sampleDescription: 'Queries live Open Targets Platform v4 GraphQL API to rank top causal therapeutic targets (EGFR, KRAS, ALK, ERBB2, MET…).',
    whenToUseForAgent: 'Use when starting from a human disease name or EFO ontology ID to discover prioritized therapeutic target genes backed by human genetic and clinical evidence.',
    fields: [
      {
        name: 'disease_query',
        label: 'Disease Name or EFO/MONDO Ontology Term',
        widget: 'text',
        bioType: 'DiseaseQuery',
        defaultValue: 'non-small cell lung carcinoma',
        placeholder: 'e.g. Alzheimer disease, breast carcinoma, macular degeneration, ulcerative colitis',
      },
      {
        name: 'top_n',
        label: 'Number of Prioritized Targets',
        widget: 'number',
        defaultValue: 15,
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },

  'alphafold-pdb-studio': {
    id: 'alphafold-pdb-studio',
    version: '4.1.0',
    statusBadge: 'verified',
    title: 'AlphaFold DB & RCSB 3D Structure Inspector',
    shortSubtitle: 'Zero-GPU 3D protein coordinates, per-residue pLDDT ribbon & pocket confidence',
    sourceRepo: 'https://github.com/google-deepmind/alphafold',
    doi: '10.1093/nar/gkad1011',
    citation: 'Varadi, M. et al. AlphaFold Protein Structure Database in 2024: providing structure coverage for over 214 million protein sequences. Nucleic Acids Res. 2024.',
    license: {
      spdx: 'CC-BY-4.0',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (CC-BY 4.0)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.7s',
      memoryLabel: 'WebGL 3D + EBI AlphaFold API',
    },
    inputBioTypes: ['ProteinAccession', 'GeneSymbolList'],
    outputBioTypes: ['ProteinStructure3D'],
    sampleLabel: 'Try Human EGFR Kinase Structure (P00533)',
    sampleDescription: 'Fetches live coordinates from EBI AlphaFold DB & UniProt, computes pLDDT confidence breakdown, and renders interactive 3D structure.',
    whenToUseForAgent: 'Use to fetch 3D atomic coordinates and evaluate structural folding confidence (pLDDT) for a target human gene symbol or UniProt accession.',
    fields: [
      {
        name: 'query_protein',
        label: 'Human Gene Symbol or UniProt Accession',
        widget: 'text',
        bioType: 'ProteinAccession',
        defaultValue: 'EGFR',
        placeholder: 'e.g. EGFR, TP53, KRAS, BRCA1, P04637, P00533',
      },
    ],
  },

  'primer3-biopython': {
    id: 'primer3-biopython',
    version: '2.6.1',
    statusBadge: 'verified',
    title: 'Primer3 & Biopython Oligo Design Suite',
    shortSubtitle: 'SantaLucia nearest-neighbor Tm, GC clamp, hairpin screening & ORF translation',
    sourceRepo: 'https://github.com/primer3-org/primer3',
    doi: '10.1093/nar/gks596',
    citation: 'Untergasser, A. et al. Primer3—new capabilities and interfaces. Nucleic Acids Res. 2012.',
    license: {
      spdx: 'BSD-3-Clause',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (BSD-3)',
    },
    runtime: {
      tier: 'browser-wasm',
      avgSpeedLabel: 'Instant (0.05s)',
      memoryLabel: 'In-Browser Zero-Egress',
    },
    inputBioTypes: ['NucleicAcidSequence'],
    outputBioTypes: ['PrimerDesignTable', 'NucleicAcidSequence'],
    sampleLabel: 'Try Human TP53 Exon 5–6 Amplicon Template',
    sampleDescription: 'Designs thermodynamically balanced forward/reverse PCR primers with SantaLucia ΔH°/ΔS° salt-corrected Tm right in your browser.',
    whenToUseForAgent: 'Use when designing forward and reverse PCR amplification primers or computing nearest-neighbor melting temperature (Tm), GC%, and protein translation for DNA sequences.',
    fields: [
      {
        name: 'template_sequence',
        label: 'Target DNA Sequence (5′→3′ or FASTA)',
        widget: 'textarea',
        bioType: 'NucleicAcidSequence',
        defaultValue:
          '>TP53_Exon5_Locus\nTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGAC',
      },
      {
        name: 'target_tm',
        label: 'Optimal Primer Melting Temperature Tm (°C)',
        widget: 'number',
        defaultValue: 60.0,
        min: 50,
        max: 72,
        step: 0.5,
      },
      {
        name: 'min_amplicon',
        label: 'Minimum Amplicon Product Size (bp)',
        widget: 'number',
        defaultValue: 120,
        min: 60,
        max: 1000,
        step: 10,
      },
    ],
  },

  'crispr-guide-scorer': {
    id: 'crispr-guide-scorer',
    version: '2.1.0',
    statusBadge: 'verified',
    title: 'CRISPR–Cas9 / Cas12a Guide RNA Designer',
    shortSubtitle: 'On-target Rule Set 2 efficiency scoring, PAM scanning & homopolymer filtering',
    sourceRepo: 'https://github.com/pinellolab/CRISPResso2',
    doi: '10.1038/nbt.3437',
    citation: 'Doench, J. G. et al. Optimized sgRNA design to maximize activity and minimize off-target effects of CRISPR-Cas9. Nat. Biotechnol. 2016.',
    license: {
      spdx: 'MIT',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (MIT)',
    },
    runtime: {
      tier: 'browser-wasm',
      avgSpeedLabel: 'Instant (0.04s)',
      memoryLabel: 'In-Browser Zero-Egress',
    },
    inputBioTypes: ['NucleicAcidSequence'],
    outputBioTypes: ['CrisprGuideTable'],
    sampleLabel: 'Try KRAS Exon 2 Oncogenic Locus',
    sampleDescription: 'Scans both strands for SpCas9 (NGG) or Cas12a (TTTV) guides, ranks Doench position-weighted efficiency, and flags poly-T/GC risks.',
    whenToUseForAgent: 'Use to design and rank high-efficiency CRISPR-Cas9 or Cas12a guide RNAs (sgRNAs) targeting a specific genomic DNA sequence.',
    fields: [
      {
        name: 'target_dna',
        label: 'Target Genomic / Coding DNA Sequence (5′→3′)',
        widget: 'textarea',
        bioType: 'NucleicAcidSequence',
        defaultValue:
          'ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACAGGAAGCAAGTAGTAATTGATGGAGAAACCTGTCTCTTGGATATTCTCGACACAGCAGGTCAAGAGGAGTACAGTGCAATGAGGGACCAGTACATGAGGACTGGGGAGGGCTTTCTTTGTGTATTTGCC',
      },
      {
        name: 'nuclease',
        label: 'CRISPR Nuclease System',
        widget: 'select',
        defaultValue: 'spcas9',
        options: [
          { value: 'spcas9', label: 'SpCas9 (20nt spacer + 3′ NGG PAM)' },
          { value: 'cas12a', label: 'AsCas12a / Cpf1 (5′ TTTV PAM + 23nt spacer)' },
        ],
      },
    ],
  },

  'rdkit-molecular-profiler': {
    id: 'rdkit-molecular-profiler',
    version: '2026.09',
    statusBadge: 'verified',
    title: 'RDKit MedChem & ADMET Structural Profiler',
    shortSubtitle: 'Exact QED druglikeness, cLogP, TPSA, Lipinski Ro5, BBB & PAINS/Brenk alerts',
    sourceRepo: 'https://github.com/rdkit/rdkit',
    doi: '10.5281/zenodo.591637',
    citation: 'Landrum, G. et al. RDKit: Open-Source Cheminformatics Software (2026 Release).',
    license: {
      spdx: 'BSD-3-Clause',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (BSD-3)',
    },
    runtime: {
      tier: 'cloud-run-cpu-worker',
      avgSpeedLabel: '~0.3s',
      memoryLabel: 'RDKit C++ Engine',
    },
    inputBioTypes: ['SMILESList', 'SMILESTable'],
    outputBioTypes: ['SMILESTable'],
    sampleLabel: 'Try Kinase Inhibitors + PAINS Control Panel',
    sampleDescription: 'Runs genuine RDKit QED, Wildman-Crippen cLogP, TPSA, Lipinski/Veber rules, and PAINS/Brenk toxicophore catalogs.',
    whenToUseForAgent: 'Use when evaluating candidate small-molecule SMILES strings for oral druglikeness (QED, Lipinski Rule of 5), blood-brain barrier permeability, and PAINS/Brenk structural toxicity alerts.',
    fields: [
      {
        name: 'smiles_input',
        label: 'Compound SMILES List (Name, SMILES per line — or leave blank for sample)',
        widget: 'textarea',
        bioType: 'SMILESList',
        defaultValue:
          'Osimertinib, COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc1nccc(-c2cn(C)c3ccccc23)n1\nGefitinib, COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1\nImatinib, Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1\nSotorasib, C=CC(=O)N1CCN(c2nc(=O)n(-c3c(C)ccnc3C(C)C)c3nc(F)c(-c4c(O)cccc4F)cc23)[C@@H](C)C1\nRhodanine-Control, O=C1CSC(=S)N1Cc1ccc(O)cc1',
      },
    ],
  },

  'chembl-drug-finder': {
    id: 'chembl-drug-finder',
    version: '34.0',
    statusBadge: 'verified',
    title: 'ChEMBL Approved Drug & Bioactivity Repurposer',
    shortSubtitle: 'Live EBI ChEMBL clinical phase 1–4 modulators, mechanisms & canonical SMILES',
    sourceRepo: 'https://github.com/chembl/chembl_webresource_client',
    doi: '10.1093/nar/gkad1004',
    citation: 'Zdrazil, B. et al. The ChEMBL Database in 2024: a decade of open drug discovery data. Nucleic Acids Res. 2024.',
    license: {
      spdx: 'CC-BY-SA-3.0',
      commercialSafe: true,
      badgeLabel: 'Open Data (CC BY-SA 3.0)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.9s',
      memoryLabel: 'EBI ChEMBL REST API',
    },
    inputBioTypes: ['GeneSymbolList', 'TargetAssociationTable', 'ProteinAccession'],
    outputBioTypes: ['SMILESTable', 'SMILESList'],
    sampleLabel: 'Try EGFR Approved & Clinical Inhibitors',
    sampleDescription: 'Queries EBI ChEMBL live REST API for target mechanisms, clinical phases, IC50/Ki potencies, and SMILES ready to chain into RDKit.',
    whenToUseForAgent: 'Use when given a target gene symbol (e.g. EGFR, BRAF, JAK2, PTGS2) to retrieve FDA-approved drugs, clinical-stage repurposing candidates, mechanisms of action, and SMILES structures.',
    fields: [
      {
        name: 'target_gene',
        label: 'Target Human Gene Symbol',
        widget: 'text',
        bioType: 'GeneSymbolList',
        defaultValue: 'EGFR',
        placeholder: 'e.g. EGFR, ERBB2, BRAF, PTGS2,NR3C1, JAK2',
      },
    ],
  },

  'clinvar-variant-annotator': {
    id: 'clinvar-variant-annotator',
    version: '3.2.0',
    statusBadge: 'verified',
    title: 'ClinVar & MyVariant Pathogenicity Annotator',
    shortSubtitle: 'ACMG/ClinVar clinical significance, CADD deleteriousness & gnomAD allele frequency',
    sourceRepo: 'https://github.com/biothings/myvariant.info',
    doi: '10.1186/s13059-016-0953-9',
    citation: 'Xin, J. et al. High-performance web services for querying gene and variant annotation. Genome Biol. 2016.',
    license: {
      spdx: 'Apache-2.0',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (Apache-2.0)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.6s',
      memoryLabel: 'BioThings MyVariant API',
    },
    inputBioTypes: ['VariantList', 'GeneSymbolList'],
    outputBioTypes: ['VariantAnnotationTable'],
    sampleLabel: 'Try Oncology Actionable Variants (BRAF / EGFR / BRCA1)',
    sampleDescription: 'Queries live MyVariant.info / ClinVar / CADD / gnomAD for pathogenic clinical variants.',
    whenToUseForAgent: 'Use to annotate human genetic variants, rsIDs, or disease genes with ClinVar pathogenicity assertions, conditions, CADD phred scores, and population frequencies.',
    fields: [
      {
        name: 'variant_query',
        label: 'Gene Symbol, rsID, or HGVS Variant Query',
        widget: 'text',
        bioType: 'VariantList',
        defaultValue: 'EGFR',
        placeholder: 'e.g. EGFR, BRCA1, TP53, rs113488022, BRAF',
      },
      {
        name: 'clinical_filter',
        label: 'Significance Filter',
        widget: 'select',
        defaultValue: 'pathogenic',
        options: [
          { value: 'pathogenic', label: 'Pathogenic & Likely Pathogenic Only' },
          { value: 'all', label: 'All ClinVar Annotated Variants' },
        ],
      },
    ],
  },

  'lifelines-survival': {
    id: 'lifelines-survival',
    version: '0.30.0',
    statusBadge: 'verified',
    title: 'Lifelines Clinical Kaplan–Meier & Biomarker Survival',
    shortSubtitle: 'Exact Kaplan–Meier estimator, 95% Greenwood CI & Log-Rank p-value',
    sourceRepo: 'https://github.com/CamDavidsonPilon/lifelines',
    doi: '10.21105/joss.01317',
    citation: 'Davidson-Pilon, C. lifelines: survival analysis in Python. JOSS 2019.',
    license: {
      spdx: 'MIT',
      commercialSafe: true,
      badgeLabel: 'Commercial Safe (MIT)',
    },
    runtime: {
      tier: 'cloud-run-cpu-worker',
      avgSpeedLabel: '~0.3s',
      memoryLabel: 'Lifelines Python Engine',
    },
    inputBioTypes: ['ClinicalSurvivalCohort'],
    outputBioTypes: ['SurvivalSummaryTable'],
    sampleLabel: 'Try LUAD Biomarker-High vs Low Cohort (n=48)',
    sampleDescription: 'Fits exact Kaplan–Meier step curves and Log-Rank chi-squared test across stratified clinical cohorts.',
    whenToUseForAgent: 'Use to test whether patient stratification (e.g. Biomarker-High vs Biomarker-Low or Treated vs Control) yields a statistically significant difference in survival time.',
    fields: [
      {
        name: 'cohort_file',
        label: 'Clinical Survival Table (.csv, .tsv, .xlsx — columns: time_months, event, group)',
        widget: 'file',
        bioType: 'ClinicalSurvivalCohort',
        acceptedFormats: ['.csv', '.tsv', '.xlsx'],
      },
    ],
  },

  /* =========================================================
     3 OFFICIAL DETERMINISTIC DATA-BRIDGE UTILITY BLOCKS
     ========================================================= */
  'smart-table-filter': {
    id: 'smart-table-filter',
    version: '1.0.0',
    statusBadge: 'utility-bridge',
    title: 'Smart Bio-Table Filter & Top-K Selector',
    shortSubtitle: 'Deterministic threshold filtering, sorting & column extraction bridge block',
    sourceRepo: 'https://github.com/prairie-meow/OpenBioApp',
    citation: 'OpenBioApp Deterministic Data-Bridge Utility Block.',
    license: {
      spdx: 'Apache-2.0',
      commercialSafe: true,
      badgeLabel: 'OpenBioApp Bridge (Apache-2.0)',
    },
    runtime: {
      tier: 'browser-wasm',
      avgSpeedLabel: 'Instant (0.01s)',
      memoryLabel: 'In-Browser Deterministic',
    },
    inputBioTypes: [
      'AnyDataTable',
      'DifferentialExpressionTable',
      'TargetAssociationTable',
      'SMILESTable',
      'NanoclusterStoichiometryTable',
    ],
    outputBioTypes: ['GeneSymbolList', 'SMILESList', 'AnyDataTable'],
    sampleLabel: 'Try Filtering Top Significant Hits',
    sampleDescription: 'Filters any upstream table deterministically without LLM code hallucination and emits clean Gene/SMILES lists for downstream apps.',
    whenToUseForAgent: 'Use between two domain apps to deterministically filter rows by numeric/text threshold (e.g. padj < 0.05, qed_score > 0.5, pattern_similarity > 0.8) and select Top-K candidates.',
    fields: [
      {
        name: 'json_rows',
        label: 'Input JSON Rows (Auto-populated when chained from an upstream app)',
        widget: 'textarea',
        bioType: 'AnyDataTable',
        defaultValue: JSON.stringify(
          [
            { gene: 'FKBP5', log2FoldChange: 3.92, padj: 0.000012 },
            { gene: 'DUSP1', log2FoldChange: 2.95, padj: 0.000045 },
            { gene: 'ACTB', log2FoldChange: 0.02, padj: 0.91 },
          ],
          null,
          2
        ),
      },
      {
        name: 'filter_column',
        label: 'Column Name to Filter On',
        widget: 'text',
        defaultValue: 'padj',
      },
      {
        name: 'operator',
        label: 'Comparison Operator',
        widget: 'select',
        defaultValue: 'lt',
        options: [
          { value: 'lt', label: '< (Less than)' },
          { value: 'lte', label: '<= (Less or equal)' },
          { value: 'gt', label: '> (Greater than)' },
          { value: 'gte', label: '>= (Greater or equal)' },
          { value: 'eq', label: '== (Equals)' },
          { value: 'neq', label: '!= (Not equals)' },
        ],
      },
      {
        name: 'threshold_value',
        label: 'Threshold Value',
        widget: 'text',
        defaultValue: '0.05',
      },
      {
        name: 'top_k',
        label: 'Max Rows to Emit (Top-K)',
        widget: 'number',
        defaultValue: 15,
        min: 1,
        max: 200,
      },
    ],
  },

  'bio-id-harmonizer': {
    id: 'bio-id-harmonizer',
    version: '1.0.0',
    statusBadge: 'utility-bridge',
    title: 'Universal Bio-ID Harmonizer (Ensembl ↔ HGNC ↔ UniProt)',
    shortSubtitle: 'Live MyGene.info cross-database identifier translator for zero-friction chaining',
    sourceRepo: 'https://github.com/biothings/mygene.info',
    doi: '10.1186/s13059-016-0953-9',
    citation: 'Xin, J. et al. MyGene.info cross-identifier biological mapping service. Genome Biol. 2016.',
    license: {
      spdx: 'Apache-2.0',
      commercialSafe: true,
      badgeLabel: 'OpenBioApp Bridge (Apache-2.0)',
    },
    runtime: {
      tier: 'public-bio-api',
      avgSpeedLabel: '~0.4s',
      memoryLabel: 'BioThings MyGene v3 API',
    },
    inputBioTypes: ['BioIdentifierList', 'GeneSymbolList', 'TargetAssociationTable'],
    outputBioTypes: ['GeneSymbolList', 'ProteinAccession', 'AnyDataTable'],
    sampleLabel: 'Try Ensembl-to-Symbol-to-UniProt Mapping',
    sampleDescription: 'Translates mixed Ensembl IDs, Entrez IDs, and Gene Symbols into harmonized HGNC symbols & Swiss-Prot UniProt accessions.',
    whenToUseForAgent: 'Use whenever an upstream tool outputs Ensembl IDs (ENSG...) or mixed identifiers and a downstream tool requires canonical HGNC Gene Symbols or UniProt accessions.',
    fields: [
      {
        name: 'identifiers',
        label: 'Biological Identifiers (Ensembl, Entrez, or Gene Symbols)',
        widget: 'textarea',
        bioType: 'BioIdentifierList',
        defaultValue: 'ENSG00000146648\nENSG00000141510\nENSG00000133703\nENSG00000012048\n7157',
      },
    ],
  },

  'batch-result-aggregator': {
    id: 'batch-result-aggregator',
    version: '1.0.0',
    statusBadge: 'utility-bridge',
    title: 'Multi-Run & Cohort Result Matrix Aggregator',
    shortSubtitle: 'Combines multiple workspace analysis tables into a unified comparison matrix',
    sourceRepo: 'https://github.com/prairie-meow/OpenBioApp',
    citation: 'OpenBioApp Deterministic Data-Bridge Utility Block.',
    license: {
      spdx: 'Apache-2.0',
      commercialSafe: true,
      badgeLabel: 'OpenBioApp Bridge (Apache-2.0)',
    },
    runtime: {
      tier: 'browser-wasm',
      avgSpeedLabel: 'Instant (0.02s)',
      memoryLabel: 'In-Browser Deterministic',
    },
    inputBioTypes: ['AnyDataTable'],
    outputBioTypes: ['AnyDataTable'],
    sampleLabel: 'Try Cross-Run Candidate Consensus Ranking',
    sampleDescription: 'Merges multiple workspace run outputs and computes consensus frequency & rank-product scores.',
    whenToUseForAgent: 'Use at the end of multi-branch analyses to merge and rank candidate genes or compounds discovered across multiple independent OpenBioApp blocks.',
    fields: [
      {
        name: 'tables_json',
        label: 'JSON Array of Named Result Lists to Aggregate',
        widget: 'textarea',
        bioType: 'AnyDataTable',
        defaultValue: JSON.stringify(
          {
            OpenTargets_Genetics: ['EGFR', 'KRAS', 'ALK', 'MET', 'ERBB2'],
            Transcriptomics_UpDEG: ['EGFR', 'MET', 'FKBP5', 'DUSP1'],
            ClinVar_Actionable: ['EGFR', 'KRAS', 'BRAF', 'ERBB2'],
          },
          null,
          2
        ),
      },
    ],
  },
};

export function findCompatibleDownstreamApps(
  availableOutputTypes: BioDataType[]
): BioAppManifest[] {
  if (!availableOutputTypes.length) return [];
  const outSet = new Set(availableOutputTypes);
  return Object.values(BIO_APP_MANIFESTS).filter((manifest) =>
    manifest.inputBioTypes.some(
      (inType) => outSet.has(inType) || (inType === 'AnyDataTable' && outSet.size > 0)
    )
  );
}
