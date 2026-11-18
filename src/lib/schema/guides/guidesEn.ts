import { BioAppScientificGuide } from './guideTypes';

export const BIO_APP_GUIDES_EN: Record<string, BioAppScientificGuide> = {
  'nucleospec-dna-agnc': {
    appId: 'nucleospec-dna-agnc',
    sampleData: {
      title: 'Copp Lab GG208 High-Resolution Negative-Ion ESI-MS Spectrum (Template: ATCCCCTGTC)',
      filename: 'GG208_esi_ms_template.txt',
      rawPreview: `# Waters / Thermo / Agilent ESI-MS Negative-Ion Spectrum (headers auto-stripped)
# m/z (Da/e)    Intensity (counts)
1000.1745\t1.330e2
1000.1875\t1.500e2
1539.0624\t1.636e5
1843.9133\t3.402e4
1923.8351\t1.412e5
1924.0859\t2.167e5
1924.3364\t1.984e5
1924.5868\t1.325e5`,
      structureExplanation: [
        'Column 1 (`m/z`): Mass-to-charge ratio in Da/e (positive float, typically 500–4,000 m/z).',
        'Column 2 (`Intensity`): Ion signal intensity (standard decimals or scientific notation such as `2.167e5`).',
        '`sequence_or_formula`: 5′→3′ single-stranded DNA sequence stabilizing the Ag nanocluster (e.g. `ATCCCCTGTC`).',
      ],
    },
    formatSpec: {
      summary: 'Upload 2-column (`m/z`, `Intensity`) `.txt`, `.csv`, `.tsv`, or `.xlsx` profile spectra paired with an `A/C/G/T/U` template sequence.',
      checklist: [
        'Each data row must contain two numeric values in order: `m/z > 0` and `Intensity ≥ 0`.',
        'Use profile-mode high-resolution ESI-MS spectra rather than centroid summaries so `1/z` isotopologue spacing can be resolved.',
        'Enter pure `A, C, G, T, U` bases for DNA/RNA modes (no `5′-` prefix or spaces), or a neutral formula (e.g. `C100H120N40O60P10`) in `XNA` mode.',
        'Multiple spectrum files can be dropped together for batch multi-sample assignment.',
      ],
      autoSanitizerNote: 'Instrument metadata headers from MassLynx, Xcalibur, and MassHunter, blank lines, and `#` comments are stripped automatically by `ms_spectrum_sanitizer`.',
    },
    resultGuide: {
      overview: 'Check the summary banner for the dominant stoichiometry (e.g. `(DNA)2Ag17`) and magic-number valence electron count (`N₀`), then click any peak zoom chip or table row to overlay the theoretical `IsoSpecPy` isotope envelope onto the experimental trace.',
      visualGuide: 'X-axis shows `m/z` and Y-axis shows relative intensity (%). Clicking `Zoom (DNA)2Ag17` narrows to `±3.5 m/z` so you can verify `1/z` charge spacing and ¹⁰⁷Ag/¹⁰⁹Ag fine structure.',
      metrics: [
        {
          columnOrMetric: 'species / strands / n_Ag',
          meaning: 'Assigned complex composition: DNA strand count (`strands`), total silver atoms (`n_Ag`), and negative charge state (`z-`).',
          cutoffOrRule: 'Example: `(DNA)2Ag17 (z=4-)` denotes a dimer DNA scaffold coordinating 17 silver atoms at 4− net charge.',
        },
        {
          columnOrMetric: 'N0_electrons (N₀) & Qcl',
          meaning: 'Neutral cluster valence electrons (`N₀ = n_Ag − Qcl`) and positive cluster core charge (`Qcl`).',
          cutoffOrRule: 'Fluorescent rod-like DNA–Agₙ clusters follow even magic numbers (`N₀ = 4` green, `N₀ = 6` red, `N₀ = 10–12` NIR); `N₀ = 0` indicates dark Ag⁺ adducts.',
        },
        {
          columnOrMetric: 'pattern_similarity & confidence',
          meaning: 'Cosine/Pearson agreement (`0–1`) between experimental peak profile and `IsoSpecPy` theoretical envelope.',
          cutoffOrRule: '`≥ 0.90` (`▲ High`): unambiguous assignment · `0.75–0.89`: check overlapping charge states/salts · `< 0.75`: inspect zoomed baseline.',
        },
        {
          columnOrMetric: 'delta_X0_mz (ΔX₀)',
          meaning: 'Mass-to-charge offset between experimental centroid and theoretical apex peak.',
          cutoffOrRule: '`|ΔX₀| ≤ 0.02 m/z` on Q-TOF/Orbitrap instruments confirms tight mass calibration.',
        },
      ],
      nextSteps: 'Chain the template sequence into `Primer3 & Biopython Oligo Lab` below to evaluate oligonucleotide duplex melting temperature (`Tm`) and secondary structure.',
    },
  },

  'pydeseq2-deg': {
    appId: 'pydeseq2-deg',
    sampleData: {
      title: 'Human Airway Smooth Muscle Dexamethasone vs Control Bulk RNA-seq Count Matrix (4 vs 4 Replicates)',
      filename: 'airway_rnaseq_counts_template.csv',
      rawPreview: `gene,Ctrl_Rep1,Ctrl_Rep2,Ctrl_Rep3,Ctrl_Rep4,Dex_Rep1,Dex_Rep2,Dex_Rep3,Dex_Rep4
TSC22D3,210,195,224,205,3480,3690,3310,3590
DUSP1,890,920,860,905,6820,7140,6590,6980
FKBP5,185,204,178,196,2890,3120,2760,3010
IL6,1640,1720,1580,1690,210,185,225,195
CXCL8,2450,2590,2380,2510,290,265,315,280
ACTB,18400,18900,18100,18600,18250,18750,18050,18500
1-Mar,420,445,405,430,435,460,415,440`,
      structureExplanation: [
        'Column 1 (`gene`): HGNC gene symbol (`DUSP1`, `IL6`) or Ensembl gene ID (`ENSG00000120129`).',
        'Control columns (`Ctrl_Rep1..4`): Replicate columns containing `Ctrl`, `Control`, `Untreat`, `WT`, or `Norm` (non-negative counts).',
        'Treated columns (`Dex_Rep1..4`): Experimental perturbation replicate columns (non-negative counts).',
      ],
    },
    formatSpec: {
      summary: 'Upload a `.csv`, `.tsv`, `.txt`, or `.xlsx` matrix with gene IDs in column 1 and non-negative sample counts in remaining columns.',
      checklist: [
        'Column 1 must list gene identifiers and row 1 must list sample names.',
        'Include `Ctrl`, `Control`, `Untreat`, `WT`, or `Norm` in control sample headers for automatic group detection (otherwise columns split 50/50).',
        'Provide at least 2 (ideally ≥3) biological replicates per condition for reliable dispersion estimation.',
        'Supply raw or non-negative counts rather than Z-scored negative values so DESeq2 median-of-ratios normalization holds.',
      ],
      autoSanitizerNote: 'Automatically repairs Excel date-corrupted HUGO symbols (`1-Mar` → `MARCHF1`, `2-Sep` → `SEPTIN2`), strips Ensembl `.version` suffixes, and sums duplicate gene rows.',
    },
    resultGuide: {
      overview: 'Inspect the upper-right (`Up`) and upper-left (`Down`) quadrants of the Volcano plot, then sort the table by `padj` (BH-FDR) to prioritize statistically robust transcriptional targets.',
      visualGuide: 'Volcano X-axis is `log2FoldChange` and Y-axis is `−log10(FDR)`. Dashed reference lines mark your `|log2FC|` and `FDR` cutoffs.',
      metrics: [
        {
          columnOrMetric: 'log2FoldChange',
          meaning: 'Effect size (`log2(Treated / Control)`) after size-factor normalization.',
          cutoffOrRule: '`≥ +1.0` indicates ≥2× upregulation (`Up`); `≤ −1.0` indicates ≤0.5× downregulation (`Down`).',
        },
        {
          columnOrMetric: 'padj (BH-FDR)',
          meaning: 'Benjamini–Hochberg false discovery rate adjusted across all tested genes.',
          cutoffOrRule: 'Require **`padj < 0.05`** (`< 0.01` stringent) rather than unadjusted `pvalue`.',
        },
        {
          columnOrMetric: 'baseMean',
          meaning: 'Normalized mean count across all samples.',
          cutoffOrRule: 'Genes with `baseMean ≥ 20` show far more reproducible fold-changes than noisy low-count transcripts (`< 10`).',
        },
        {
          columnOrMetric: 'regulation',
          meaning: 'Threshold classification (`Up`, `Down`, or `NS`) exported for downstream block chaining.',
          cutoffOrRule: 'Regulated genes automatically populate `GeneSymbolList` when chaining to pathway or target blocks.',
        },
      ],
      nextSteps: 'Click `GSEApy & Enrichr Pathways` below the table to test regulated genes against KEGG, Reactome, and GO Biological Process libraries.',
    },
  },

  'opentargets-explorer': {
    appId: 'opentargets-explorer',
    sampleData: {
      title: 'Live Open Targets Platform v4 Prioritization for Non-Small Cell Lung Carcinoma (`MONDO_0005233`)',
      rawPreview: `# Disease name or MONDO / EFO ontology identifier
disease_query: non-small cell lung carcinoma
# Additional examples:
# - ulcerative colitis
# - Alzheimer disease
# - MONDO_0005233`,
      structureExplanation: [
        '`disease_query`: Plain-English disease name (`non-small cell lung carcinoma`) or ontology ID (`MONDO_0005233`, `EFO_0000311`).',
        '`top_n`: Number of top-ranked associated human target genes to return (5–50).',
      ],
    },
    formatSpec: {
      summary: 'Enter a standard English disease term or `MONDO_` / `EFO_` ontology accession—no file upload needed.',
      checklist: [
        'Prefer full clinical names (`non-small cell lung carcinoma`) or exact `MONDO_`/`EFO_` IDs over ambiguous abbreviations.',
      ],
      autoSanitizerNote: 'Resolves plain-text disease queries to canonical Open Targets v4 ontology IDs via live GraphQL search before ranking targets.',
    },
    resultGuide: {
      overview: 'Compare `overall_score` across top targets and inspect whether evidence is driven by human genetics (`genetic_association` / `somatic_mutation`) versus existing clinical drugs (`known_drug`).',
      visualGuide: 'Bar chart compares harmonic-sum association scores (`0.00–1.00`) across the highest-ranked targets.',
      metrics: [
        {
          columnOrMetric: 'overall_score',
          meaning: 'Weighted harmonic sum across genetics, somatic mutations, drugs, pathways, and literature (`0–1`).',
          cutoffOrRule: '`≥ 0.60`: high-confidence causal/clinical target · `0.30–0.59`: moderate evidence · `< 0.30`: exploratory.',
        },
        {
          columnOrMetric: 'genetic_association & somatic_mutation',
          meaning: 'Germline GWAS/Mendelian genetics and cancer somatic driver evidence.',
          cutoffOrRule: 'Targets backed by human genetic evidence (`≥ 0.50`) succeed in Phase II/III trials at roughly 2× higher rates.',
        },
        {
          columnOrMetric: 'known_drug',
          meaning: 'Clinical trial or approved drug precedence for the target–disease pair.',
          cutoffOrRule: 'High genetics + `known_drug = 0` highlights novel first-in-class opportunities; high both favors repurposing.',
        },
      ],
      nextSteps: 'Chain the top target directly into `ChEMBL Clinical Drug Repurposer` or `AlphaFold DB 3D Inspector` in one click.',
    },
  },

  'alphafold-pdb-studio': {
    appId: 'alphafold-pdb-studio',
    sampleData: {
      title: 'Human Epidermal Growth Factor Receptor (`EGFR` / UniProt `P00533`) AlphaFold DB v6 Coordinates',
      rawPreview: `# HGNC gene symbol or UniProt Swiss-Prot accession
query_protein: EGFR
# Additional examples:
# - P00533   (Human EGFR accession)
# - TP53     (Cellular tumor antigen p53)
# - KRAS     (GTPase KRas)`,
      structureExplanation: [
        '`query_protein`: Human HGNC gene symbol (`EGFR`, `KRAS`, `BRCA1`) or reviewed UniProt accession (`P00533`).',
      ],
    },
    formatSpec: {
      summary: 'Enter a single human gene symbol or UniProt accession.',
      checklist: [
        'Provide a single symbol or UniProt ID without spaces (if a multi-gene list is chained in, the top target is selected automatically).',
      ],
      autoSanitizerNote: 'Resolves HGNC symbols to reviewed human Swiss-Prot primary accessions via UniProt REST before fetching `model_v6.pdb`.',
    },
    resultGuide: {
      overview: 'Drag on the 3D canvas (mouse or touch) to inspect whether catalytic/binding domains fold with Very High confidence (`pLDDT > 90`, dark blue) and separate them from flexible disordered tails (`pLDDT < 50`, orange).',
      visualGuide: 'Backbone colors follow official AlphaFold pLDDT tiers: **Dark Blue (`>90`)** · **Cyan (`70–90`)** · **Yellow (`50–70`)** · **Orange (`<50`, disordered)**.',
      metrics: [
        {
          columnOrMetric: 'Mean pLDDT & Confidence Buckets',
          meaning: 'Per-residue local Distance Difference Test (`0–100`) summary across all Cα atoms.',
          cutoffOrRule: 'Use only **`pLDDT ≥ 70` (`≥ 90` for binding pockets)** regions for docking or structure-guided mutagenesis.',
        },
        {
          columnOrMetric: 'Very Low (<50) Regions',
          meaning: 'Extended orange segments with `pLDDT < 50`.',
          cutoffOrRule: 'Typically represent intrinsically disordered regions (IDRs) or flexible linkers rather than static 3D folds.',
        },
      ],
      nextSteps: 'Click `Download .PDB` to export atomic coordinates directly into PyMOL, ChimeraX, or docking pipelines.',
    },
  },

  'rdkit-molecular-profiler': {
    appId: 'rdkit-molecular-profiler',
    sampleData: {
      title: 'Clinical Kinase Inhibitors & PAINS Control SMILES Set (Gefitinib, Erlotinib, Osimertinib)',
      filename: 'smiles_library_template.txt',
      rawPreview: `# Format: "Name: SMILES", "Name\\tSMILES", or bare SMILES (one molecule per line)
Gefitinib: COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1
Erlotinib: COCCOc1cc2ncnc(Nc3cccc(C#C)c3)c2cc1OCCOC
Osimertinib: COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc2nccc(n2)c3cn(C)c4ccccc34
Rhodanine_PAINS_Control: O=C1CSC(=S)N1Cc2ccccc2`,
      structureExplanation: [
        'Each line accepts `Name: SMILES`, comma/tab-separated `Name,SMILES`, or a bare SMILES string.',
        'Chaining from `ChEMBL Clinical Drug Repurposer` populates approved drug SMILES automatically.',
      ],
    },
    formatSpec: {
      summary: 'Paste newline-separated valid SMILES strings (up to ~100 molecules per batch).',
      checklist: [
        'Verify ring-closure digits (`c1ccccc1`) and parentheses are balanced.',
        'Lines starting with `#` and blank lines are ignored automatically.',
      ],
      autoSanitizerNote: 'Extracts SMILES tokens and compound labels cleanly from `Name: SMILES`, CSV/TSV rows, or chained ChEMBL JSON tables.',
    },
    resultGuide: {
      overview: 'Locate orally bioavailable candidates inside the `cLogP vs TPSA` chemical space plot and prioritize compounds with high `qed_score`, `lipinski_violations = 0`, and `pains_alerts = None`.',
      visualGuide: 'Scatter X-axis is lipophilicity (`cLogP`) and Y-axis is topological polar surface area (`TPSA, Å²`). Oral drugs cluster around `cLogP 0–5` and `TPSA 20–130 Å²` (`< 90 Å²` for CNS/BBB penetration).',
      metrics: [
        {
          columnOrMetric: 'qed_score (0–1)',
          meaning: 'Bickerton Quantitative Estimate of Druglikeness integrating 8 physicochemical properties.',
          cutoffOrRule: '`≥ 0.67`: prime oral lead-like · `0.40–0.66`: acceptable clinical drug space · `< 0.35`: optimize physicochemical profile.',
        },
        {
          columnOrMetric: 'lipinski_violations & veber_compliant',
          meaning: 'Lipinski Rule-of-5 (`MW ≤ 500, cLogP ≤ 5, HBD ≤ 5, HBA ≤ 10`) and Veber (`RotBonds ≤ 10, TPSA ≤ 140`) checks.',
          cutoffOrRule: '`lipinski_violations ≤ 1` and `veber_compliant = true` predict favorable oral absorption.',
        },
        {
          columnOrMetric: 'pains_alerts & brenk_alerts',
          meaning: 'NIH Pan-Assay Interference Compounds (PAINS) and Brenk reactive/toxicophore catalog matches.',
          cutoffOrRule: 'Require **`pains_alerts = None`** when triaging HTS hits to avoid redox/aggregation false positives.',
        },
      ],
      nextSteps: 'Chain into `Smart Bio-Table Filter & Top-K` to isolate clean compounds passing `qed_score >= 0.5`.',
    },
  },

  'chembl-drug-finder': {
    appId: 'chembl-drug-finder',
    sampleData: {
      title: 'FDA-Approved & Clinical-Stage Modulators Targeting Human `EGFR` (`CHEMBL203`)',
      rawPreview: `# Human HGNC target symbol
target_gene: EGFR
# Additional examples: ERBB2, BRAF, JAK1, TNF`,
      structureExplanation: [
        '`target_gene`: Human HGNC gene symbol (`EGFR`, `BRAF`, `JAK1`) for curated mechanism-of-action lookup.',
      ],
    },
    formatSpec: {
      summary: 'Enter an official human HGNC gene symbol (e.g. `EGFR`).',
      checklist: [
        'Use standard HGNC symbols (`EGFR` rather than legacy alias `HER1`) for exact Swiss-Prot → ChEMBL `SINGLE PROTEIN` resolution.',
      ],
      autoSanitizerNote: 'Automatically selects canonical human `SINGLE PROTEIN` ChEMBL targets via UniProt accession bridging, avoiding mutant cell-line entries.',
    },
    resultGuide: {
      overview: 'Review `max_phase = 4` (approved drugs) and `action_type` (`INHIBITOR`, `ANTAGONIST`, `AGONIST`), then pass small-molecule `canonical_smiles` hits to RDKit ADMET profiling.',
      visualGuide: 'Bar chart summarizes maximum clinical development phase (`Phase 1–4`) across retrieved modulators.',
      metrics: [
        {
          columnOrMetric: 'max_phase',
          meaning: 'Highest clinical trial phase recorded in ChEMBL v34.',
          cutoffOrRule: '`4`: FDA/EMA approved drug · `2–3`: late-stage clinical candidate · `1`: Phase I safety stage.',
        },
        {
          columnOrMetric: 'action_type & mechanism_of_action',
          meaning: 'Pharmacological direction (`INHIBITOR`, `ANTAGONIST`, `AGONIST`, `DEGRADER`).',
          cutoffOrRule: 'Match `INHIBITOR`/`ANTAGONIST` to gain-of-function or overexpressed disease drivers.',
        },
        {
          columnOrMetric: 'canonical_smiles',
          meaning: 'Standardized small-molecule SMILES (biologics/mAbs naturally omit SMILES).',
          cutoffOrRule: 'Small molecules with valid SMILES are automatically packaged for `RDKit MedChem & PAINS Profiler` chaining.',
        },
      ],
      nextSteps: 'Chain directly into `RDKit MedChem & PAINS Profiler` to audit QED, TPSA, cLogP, and PAINS alerts.',
    },
  },

  'gseapy-enrichr': {
    appId: 'gseapy-enrichr',
    sampleData: {
      title: 'Glucocorticoid-Regulated Gene Set Enrichment Across KEGG, Reactome & GO Biological Process',
      filename: 'deg_genes_template.txt',
      rawPreview: `TSC22D3
DUSP1
FKBP5
PER1
KLF15
ZBTB16
ANGPTL4
IL6
CXCL8
CCL2
VCAM1
PTGS2
MMP1
ICAM1`,
      structureExplanation: [
        '`gene_list`: Newline-, comma-, or space-separated human HGNC symbols (ideally 10–500 regulated genes).',
        '`gene_set_library`: Target pathway database (`KEGG_2021_Human`, `Reactome_2022`, `GO_Biological_Process_2023`, `MSigDB_Hallmark_2020`).',
      ],
    },
    formatSpec: {
      summary: 'Paste 5–500 official human HGNC gene symbols (convert `ENSG...` IDs first via `Universal Bio-ID Harmonizer`).',
      checklist: [
        'Provide at least 5 (ideally 15–300) differentially expressed or prioritized genes rather than an unranked whole genome.',
        'Use official HGNC symbols (`IL6`, `DUSP1`) rather than Ensembl IDs.',
      ],
      autoSanitizerNote: 'Splits mixed comma/tab/newline lists, uppercases symbols, and deduplicates entries before live Enrichr submission.',
    },
    resultGuide: {
      overview: 'Prioritize pathways passing `adjusted_p_value < 0.05` with high `combined_score` and ≥3 `overlapping_genes`.',
      visualGuide: 'Bar chart ranks enriched terms by Ma’ayan Lab `Combined Score = −ln(p) × z-score`.',
      metrics: [
        {
          columnOrMetric: 'adjusted_p_value (BH q-value)',
          meaning: 'Benjamini–Hochberg FDR-adjusted Fisher exact test p-value.',
          cutoffOrRule: 'Require **`adjusted_p_value < 0.05`** for statistically significant pathway enrichment.',
        },
        {
          columnOrMetric: 'odds_ratio & combined_score',
          meaning: 'Enrichment fold-over-background (`odds_ratio`) combined with Fisher p-value.',
          cutoffOrRule: '`combined_score > 30` with `≥ 3` overlapping genes indicates robust pathway activation.',
        },
        {
          columnOrMetric: 'overlapping_genes',
          meaning: 'Input genes driving the pathway enrichment hit.',
          cutoffOrRule: 'Treat single-gene overlaps cautiously; verify ≥3 pathway members.',
        },
      ],
      nextSteps: 'Investigate hub genes from the top pathway in `OpenTargets` or `ChEMBL` to identify pathway-modulating drugs.',
    },
  },

  'clinvar-variant-annotator': {
    appId: 'clinvar-variant-annotator',
    sampleData: {
      title: 'Human `BRCA1` ClinVar Pathogenic Assertions, CADD Phred & gnomAD Allele Frequencies',
      rawPreview: `# Gene symbol, dbSNP rsID, or HGVS genomic coordinate
variant_query: BRCA1
# Additional examples: rs121913529, rs113488022, chr7:g.140453136A>T, TP53`,
      structureExplanation: [
        '`variant_query`: Human gene symbol (`BRCA1`), dbSNP `rsID` (`rs121913529`), or HGVS string (`chr7:g.140453136A>T`).',
        '`clinical_filter`: Filter to `Pathogenic / Likely Pathogenic` only or view all ClinVar assertions.',
      ],
    },
    formatSpec: {
      summary: 'Enter a human gene symbol, `rsID`, or HGVS genomic variant.',
      checklist: [
        'Format dbSNP IDs with lowercase `rs` followed by digits (`rs121913529`).',
        'Use standard HGVS notation (`chr7:g.140453136A>T`) for coordinate queries.',
      ],
      autoSanitizerNote: 'Trims whitespace/quotes and routes gene symbols automatically to `clinvar.gene.symbol` on live MyVariant.info v1.',
    },
    resultGuide: {
      overview: 'Triangulate ACMG `clinical_significance`, in-silico deleteriousness (`cadd_phred`), and population rarity (`gnomad_af`).',
      visualGuide: 'Plot compares `CADD Phred` deleteriousness scores across top annotated variants.',
      metrics: [
        {
          columnOrMetric: 'clinical_significance',
          meaning: 'NCBI ClinVar clinical assertion.',
          cutoffOrRule: '`Pathogenic` / `Likely pathogenic`: actionable disease variant · `VUS`: requires functional follow-up · `Benign`: polymorphism.',
        },
        {
          columnOrMetric: 'cadd_phred',
          meaning: 'Genome-wide scaled deleteriousness rank (`−10 × log10(rank)`).',
          cutoffOrRule: '`≥ 20`: top 1% predicted deleterious · `≥ 30`: top 0.1% high-impact substitutions.',
        },
        {
          columnOrMetric: 'gnomad_af',
          meaning: 'Population allele frequency in gnomAD exomes.',
          cutoffOrRule: 'True high-penetrance Mendelian pathogenic variants typically exhibit **`gnomad_af < 0.001`** or `0`.',
        },
      ],
      nextSteps: 'Open the affected gene in `AlphaFold DB 3D Inspector` to check whether mutated residues map to high-pLDDT catalytic cores.',
    },
  },

  'primer3-biopython': {
    appId: 'primer3-biopython',
    sampleData: {
      title: 'Human `TP53` Exon 5–6 Locus FASTA for SantaLucia Thermodynamic PCR Primer Design',
      filename: 'tp53_amplicon_template.fasta',
      rawPreview: `>TP53_exon5_6_locus Homo sapiens (217 bp)
TACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGAC`,
      structureExplanation: [
        '`template_sequence`: DNA sequence (`A/C/G/T`, plain or FASTA with `>` header, ≥120 bp recommended).',
        '`target_tm`: Desired melting temperature (`Tm`, default `60.0°C`, SantaLucia 1998 salt-corrected).',
        '`min_amplicon`: Minimum PCR product length in bp (default `90 bp`).',
      ],
    },
    formatSpec: {
      summary: 'Runs 100% locally in your browser; paste at least `min_amplicon + 30 bp` of `A/C/G/T` template DNA.',
      checklist: [
        'Provide ≥120 bp of clean `A, C, G, T` sequence so forward and reverse primers flank your target region.',
        'Avoid stretches of ambiguous `N` bases inside primer-binding flanks.',
      ],
      autoSanitizerNote: 'Strips FASTA `>` headers, line numbers, whitespace, and non-ACGT characters automatically.',
    },
    resultGuide: {
      overview: 'Inspect forward/reverse primer coordinates on the sequence track map and select `pair_rank = 1` with balanced `Tm` (`delta_tm_c ≤ 1.0°C`) and 40–60% GC.',
      visualGuide: 'Sequence track maps forward (`+`, blue) and reverse (`−`, green) primers alongside the `+1` amino-acid translation.',
      metrics: [
        {
          columnOrMetric: 'fwd_tm_c / rev_tm_c & delta_tm_c',
          meaning: 'SantaLucia (1998) nearest-neighbor `ΔH°/ΔS°` melting temperatures (`50 mM Na⁺`) and pair difference.',
          cutoffOrRule: 'Target **`58–62°C` with `delta_tm_c ≤ 1.0°C`** for clean single-band annealing.',
        },
        {
          columnOrMetric: 'fwd_gc_pct / rev_gc_pct',
          meaning: 'Primer GC percentage.',
          cutoffOrRule: '**`40%–60%`** minimizes secondary hairpins and mispriming.',
        },
        {
          columnOrMetric: 'amplicon_bp & penalty_score',
          meaning: 'Product length (bp) and composite thermodynamic/homopolymer penalty.',
          cutoffOrRule: 'Lower `penalty_score` is better (`80–150 bp` ideal for qPCR; `150–600 bp` for standard PCR/amplicon sequencing).',
        },
      ],
      nextSteps: 'Chain the template directly into `CRISPR–Cas9 & Cas12a Scorer` to design sgRNAs inside the amplified exon.',
    },
  },

  'crispr-guide-scorer': {
    appId: 'crispr-guide-scorer',
    sampleData: {
      title: 'Human `KRAS` Coding Exon Target Scan for `SpCas9 (NGG)` & `AsCas12a (TTTV)` Guides',
      filename: 'kras_exon_target.fasta',
      rawPreview: `>KRAS_exon2_coding Homo sapiens
ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGTAAATCTTGTTTTAATATGCATATTACTGGTGCAGGACCATTCTTTGATACAGATAAAGGTTTCTCTGACCATTTTCATGAGTACTTATTACAAGATAATTATGCTGA`,
      structureExplanation: [
        '`target_dna`: Target genomic or coding exon DNA sequence (FASTA or raw `A/C/G/T`, ≥30 bp).',
        '`nuclease`: `SpCas9` (`20 nt + 3′-NGG PAM`) or `AsCas12a` (`5′-TTTV PAM + 20 nt`).',
      ],
    },
    formatSpec: {
      summary: 'Paste ≥30 bp of target DNA (`A/C/G/T`) to scan both `+` and `−` strands locally in your browser.',
      checklist: [
        'For knockout experiments, target an early constitutive coding exon (10–65% into the CDS) to trigger nonsense-mediated decay.',
        'Ensure at least one `NGG` (`SpCas9`) or `TTTV` (`AsCas12a`) PAM motif exists on either strand.',
      ],
      autoSanitizerNote: 'Strips FASTA headers and whitespace automatically before scanning both sense and antisense strands.',
    },
    resultGuide: {
      overview: 'Pick 2–3 guides with **`on_target_score ≥ 65`**, balanced `gc_percent` (`40–70%`), and **`poly_t_terminator = false`**.',
      visualGuide: 'Track map and bar chart display top candidate cleavage loci and efficiency scores (`0–100`).',
      metrics: [
        {
          columnOrMetric: 'on_target_score (0–100)',
          meaning: 'Position-weighted Rule Set 2 nucleotide efficiency, GC balance, and seed thermodynamics.',
          cutoffOrRule: '`≥ 65`: high-efficiency candidate · `50–64`: moderate · `< 50`: deprioritize.',
        },
        {
          columnOrMetric: 'gc_percent',
          meaning: 'GC content across the 20 nt spacer.',
          cutoffOrRule: '**`40%–70%`** optimal; `< 30%` or `> 80%` impairs RNP activity or specificity.',
        },
        {
          columnOrMetric: 'poly_t_terminator',
          meaning: 'Presence of a `TTTT` run inside the spacer.',
          cutoffOrRule: 'Must be **`false`** when expressing guides from U6 Pol-III plasmid or lentiviral vectors.',
        },
      ],
      nextSteps: 'Chain ±200 bp flanking sequence into `Primer3 & Biopython Oligo Lab` to design T7E1 or sequencing verification primers.',
    },
  },

  'lifelines-survival': {
    appId: 'lifelines-survival',
    sampleData: {
      title: 'Lung Adenocarcinoma (LUAD) Biomarker-High vs Biomarker-Low Clinical Cohort (`n = 48`)',
      filename: 'clinical_survival_cohort_template.csv',
      rawPreview: `patient_id,time_months,event,group
LUAD-H01,8.4,1,Biomarker-High
LUAD-H02,14.2,1,Biomarker-High
LUAD-H03,19.6,0,Biomarker-High
LUAD-H04,6.1,1,Biomarker-High
LUAD-L01,34.8,0,Biomarker-Low
LUAD-L02,28.5,1,Biomarker-Low
LUAD-L03,46.2,0,Biomarker-Low
LUAD-L04,39.0,0,Biomarker-Low`,
      structureExplanation: [
        '`patient_id` (optional): De-identified subject ID.',
        '`time_months` (required — also matches `time`, `os_months`, `days`, `duration`): Follow-up duration (`> 0`).',
        '`event` (required — also matches `status`, `vital_status`): **`1` = event occurred**, **`0` = right-censored**.',
        '`group` (required — also matches `arm`, `stratum`, `biomarker`, `cohort`): 2–4 cohort labels.',
      ],
    },
    formatSpec: {
      summary: 'Upload a `.csv`, `.tsv`, or `.xlsx` clinical table containing follow-up `time`, binary `event` (`0`/`1`), and `group` (≥2 strata).',
      checklist: [
        'Encode `event` numerically as **`1` (death/relapse/progression)** and **`0` (censored/alive at last follow-up)**.',
        'Use a consistent positive time unit (`months` or `days`) across all rows.',
        'Include at least 2 distinct cohort labels in `group` for Log-Rank testing.',
        'De-identify direct patient PHI prior to upload (worker processes in RAM only with zero retention).',
      ],
      autoSanitizerNote: 'Auto-detects comma/tab/Excel formats, maps common clinical column names (`os_months`, `status`, `arm`, `cohort`), and drops incomplete rows.',
    },
    resultGuide: {
      overview: 'Check the **Log-Rank `p-value`** in the headline banner, then compare step-function Kaplan–Meier curves and `median_survival` times across strata.',
      visualGuide: 'X-axis shows follow-up duration and Y-axis shows cumulative survival probability (`0.00–1.00`). Cleanly separated non-crossing step curves indicate strong prognostic stratification.',
      metrics: [
        {
          columnOrMetric: 'Log-Rank p-value & Chi-Squared',
          meaning: 'Non-parametric test of equal hazard rates across strata over the full follow-up period.',
          cutoffOrRule: '**`p < 0.05`** indicates a statistically significant survival difference between groups.',
        },
        {
          columnOrMetric: 'median_survival',
          meaning: 'Follow-up time at which cumulative survival reaches `0.50` (`NR` if >50% remain event-free).',
          cutoffOrRule: 'The gap between cohort medians quantifies clinical effect size directly in months/days.',
        },
        {
          columnOrMetric: 'survival_12m & survival_24m',
          meaning: '12- and 24-unit milestone Kaplan–Meier survival estimates.',
          cutoffOrRule: 'Useful for comparing early hazard vs long-term tail survival plateaus.',
        },
      ],
      nextSteps: 'Query prognostic biomarker genes in `OpenTargets` or `ChEMBL` to connect survival stratification with therapeutic options.',
    },
  },

  'celltypist-annotator': {
    appId: 'celltypist-annotator',
    sampleData: {
      title: 'Human PBMC 8-Cluster Single-Cell Mean `log1p` Marker Expression Matrix (`2,485 cells`)',
      filename: 'pbmc_cluster_markers_template.csv',
      rawPreview: `cluster_id,cells_count,CD3D,CD4,CD8A,GNLY,NKG7,MS4A1,CD79A,CD14,LYZ,FCGR3A,MS4A7,FCER1A,CD1C,PPBP,PF4
Cluster_0,690,2.84,2.65,0.12,0.09,0.14,0.08,0.05,0.11,0.18,0.06,0.04,0.07,0.05,0.03,0.02
Cluster_1,410,2.61,0.15,3.38,2.10,2.24,0.06,0.04,0.09,0.12,0.18,0.05,0.04,0.03,0.02,0.04
Cluster_2,235,0.18,0.08,0.22,3.62,3.35,0.05,0.07,0.10,0.15,1.89,0.11,0.06,0.04,0.05,0.03
Cluster_3,345,0.11,0.09,0.05,0.08,0.10,3.74,3.41,0.12,0.19,0.07,0.08,0.15,0.21,0.04,0.03
Cluster_4,520,0.09,0.24,0.04,0.11,0.16,0.07,0.06,3.58,3.32,0.21,0.18,0.19,0.14,0.06,0.05`,
      structureExplanation: [
        'Column 1 (`cluster_id`): Cluster identifier from Scanpy/Seurat (`Cluster_0`, `0`, `1`).',
        'Column 2 (`cells_count`, optional): Cell count per cluster.',
        'Remaining columns (`CD3D`, `MS4A1`, `CD14`…): Mean `log1p(CPM)` expression keyed by HGNC gene symbol.',
      ],
    },
    formatSpec: {
      summary: 'Upload a `.csv` or `.tsv` matrix where **rows = clusters** (`cluster_id` in column 1) and **columns = HGNC marker genes**.',
      checklist: [
        'Ensure rows represent cell clusters and column headers represent human gene symbols (`CD3D`, `CD8A`, `MS4A1`, `CD14`, `NKG7`, `PPBP`, etc.).',
        'Provide `log1p`-normalized cluster averages (`0–6` range) rather than raw UMI sums for calibrated softmax probabilities.',
      ],
      autoSanitizerNote: 'Uppercases gene headers automatically, coerces missing cells to `0.0`, and projects clusters onto a 2D truncated SVD manifold.',
    },
    resultGuide: {
      overview: 'Inspect lymphoid vs myeloid separation on the 2D SVD scatter plot and verify each cluster’s `predicted_cell_type`, softmax `confidence`, and `top_expressed_markers`.',
      visualGuide: 'Scatter axes (`SVD-1`, `SVD-2`) project transcriptional marker distance across clusters.',
      metrics: [
        {
          columnOrMetric: 'predicted_cell_type',
          meaning: 'Highest-scoring immune lineage from curated CellTypist marker weights (Domínguez Conde et al., Science 2022).',
          cutoffOrRule: 'Matches canonical T, NK, B, Monocyte, cDC, and Megakaryocyte/Platelet signatures.',
        },
        {
          columnOrMetric: 'confidence (0–1)',
          meaning: 'Softmax margin between top-1 and runner-up lineage scores.',
          cutoffOrRule: '`≥ 0.80`: clean single-lineage cluster · `< 0.60`: inspect for doublets or transitional states.',
        },
        {
          columnOrMetric: 'top_expressed_markers',
          meaning: 'Signature genes expressed (`> 0.5`) driving the cluster’s assignment.',
          cutoffOrRule: 'Directly reusable for manuscript DotPlot/ViolinPlot marker panels.',
        },
      ],
      nextSteps: 'Chain cluster marker genes into `GSEApy & Enrichr Pathways` to characterize lineage-specific functional programs.',
    },
  },

  'smart-table-filter': {
    appId: 'smart-table-filter',
    sampleData: {
      title: 'Deterministic Threshold Filter & Typed Gene/SMILES Extractor Over Upstream JSON Tables',
      filename: 'upstream_table_template.json',
      rawPreview: `[
  {"gene": "DUSP1", "log2FoldChange": 2.94, "padj": 0.00012},
  {"gene": "FKBP5", "log2FoldChange": 3.96, "padj": 0.00018},
  {"gene": "ACTB", "log2FoldChange": -0.02, "padj": 0.94100}
]`,
      structureExplanation: [
        '`json_rows`: JSON array of row objects (`[{...}]`), auto-populated when chaining from upstream studios.',
        '`filter_column` / `operator` / `threshold_value`: Column key (`padj`, `qed_score`, `pattern_similarity`), comparison operator, and cutoff.',
        '`top_k`: Maximum rows retained after filtering.',
      ],
    },
    formatSpec: {
      summary: 'Auto-populated via one-click chaining, or paste a valid JSON array of objects (`[...]`).',
      checklist: [
        'Ensure `json_rows` is a valid JSON array enclosed in `[...]`.',
        'Match `filter_column` case-sensitively to a key present in the row objects.',
      ],
      autoSanitizerNote: 'Automatically detects `gene`/`symbol` and `smiles`/`canonical_smiles` columns in filtered rows to emit typed `GeneSymbolList` and `SMILESList` outputs.',
    },
    resultGuide: {
      overview: 'Verify retained row count (`Filtered N → M rows`) and export CSV or chain the extracted identifiers into downstream blocks.',
      visualGuide: '100% deterministic client-side filter—zero LLM glue-code hallucination.',
      metrics: [
        {
          columnOrMetric: 'Filtered Row Count',
          meaning: 'Records satisfying both the comparison cutoff and `Top-K` cap.',
          cutoffOrRule: 'If `0` rows match, check operator direction (`<` vs `>`) and column spelling.',
        },
      ],
      nextSteps: 'Chain extracted gene or SMILES lists directly into `GSEApy & Enrichr`, `ChEMBL`, or `RDKit`.',
    },
  },

  'bio-id-harmonizer': {
    appId: 'bio-id-harmonizer',
    sampleData: {
      title: 'Batch Ensembl · Entrez · Excel-Corrupted Symbol → Canonical HGNC & UniProt Swiss-Prot Translator',
      rawPreview: `ENSG00000146648.18
ENSG00000141510
ENSG00000133703
7157
1-Mar`,
      structureExplanation: [
        '`identifiers`: Mixed Ensembl IDs (`ENSG...`), NCBI Entrez numbers (`7157`), HGNC symbols, or Excel date-corrupted names (`1-Mar`).',
      ],
    },
    formatSpec: {
      summary: 'Paste 1–200 newline- or comma-separated gene identifiers for live `MyGene.info v3` batch resolution.',
      checklist: [
        'Versioned GENCODE/Ensembl IDs (`ENSG00000146648.18`) can be pasted directly without manual trimming.',
      ],
      autoSanitizerNote: 'Strips `.version` suffixes and repairs Excel date-corrupted symbols (`1-Mar` → `MARCHF1`, `2-Sep` → `SEPTIN2`) prior to querying.',
    },
    resultGuide: {
      overview: 'Check `hgnc_symbol`, `ensembl_gene`, `entrez_id`, and reviewed `uniprot_swissprot` accessions for each input query.',
      visualGuide: 'Rows with `matched = false` flag non-coding transcripts, retired IDs, or pseudogenes.',
      metrics: [
        {
          columnOrMetric: 'hgnc_symbol & uniprot_swissprot',
          meaning: 'Canonical human gene symbol and reviewed Swiss-Prot protein accession.',
          cutoffOrRule: 'Emits both `GeneSymbolList` (for `Enrichr`/`ChEMBL`) and `ProteinAccession` (for `AlphaFold 3D`).',
        },
      ],
      nextSteps: 'Chain harmonized identifiers directly into `AlphaFold DB 3D Inspector`, `GSEApy & Enrichr`, or `ChEMBL`.',
    },
  },

  'batch-result-aggregator': {
    appId: 'batch-result-aggregator',
    sampleData: {
      title: 'Multi-Omics Consensus Rank Aggregation Across Genetics, RNA-seq & ClinVar Streams',
      rawPreview: `{
  "OpenTargets_Genetics": ["EGFR", "KRAS", "ALK", "MET", "ERBB2"],
  "RNAseq_Upregulated": ["EGFR", "MET", "DUSP1", "ERBB2", "SPP1"],
  "ClinVar_Actionable": ["EGFR", "KRAS", "BRAF", "ERBB2"]
}`,
      structureExplanation: [
        '`tables_json`: JSON object mapping evidence stream names to ordered candidate arrays (`index 0` = rank #1).',
      ],
    },
    formatSpec: {
      summary: 'Provide a JSON object containing 2+ ranked candidate arrays (`{"StreamA": ["GENE1", ...], "StreamB": [...]}`).',
      checklist: [
        'Order each array from strongest (#1 at index 0) to weakest.',
      ],
      autoSanitizerNote: 'Normalizes whitespace and case across streams before computing overlap ratios and Borda consensus scores.',
    },
    resultGuide: {
      overview: 'Prioritize targets replicated across all independent streams (`overlap_ratio = 1.0`) with the lowest `mean_rank` and highest `consensus_score`.',
      visualGuide: 'Bar chart compares composite Borda `consensus_score` across top multi-evidence candidates.',
      metrics: [
        {
          columnOrMetric: 'evidence_count & overlap_ratio',
          meaning: 'Number and fraction of independent evidence streams nominating the candidate.',
          cutoffOrRule: '`overlap_ratio = 1.0` highlights targets corroborated across every assay modality.',
        },
        {
          columnOrMetric: 'mean_rank & consensus_score',
          meaning: 'Average rank across streams (lower is better) and weighted Borda score (higher is better).',
          cutoffOrRule: 'Advance top 1–3 consensus targets into 3D pocket and ChEMBL pharmacology validation.',
        },
      ],
      nextSteps: 'Chain the #1 consensus target into `ChEMBL Clinical Drug Repurposer` and `AlphaFold DB 3D Inspector`.',
    },
  },
};
