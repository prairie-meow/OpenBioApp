import {
  BIO_APP_MANIFESTS,
  BioAppRunResult,
  } from '../schema/bioAppSchema';

const WORKER_BASE = (import.meta.env.VITE_WORKER_BASE_URL as string | undefined) || '';

function workerUrl(path: string): string {
  return `${WORKER_BASE.replace(/\/$/, '')}${path}`;
}
import {
  executeSequenceOrBridgeApp,
  parseGeneListInput,
} from "./sequenceAndBridgeRunners";

/* =========================================================
   MAIN DISPATCHER FOR ALL 15 OPENBIOAPP BLOCKS
   ========================================================= */
export async function executeBioApp(
  appId: string,
  formValues: Record<string, unknown>,
  uploadedFiles: File[] = []
): Promise<BioAppRunResult> {
  const manifest = BIO_APP_MANIFESTS[appId];
  if (!manifest) {
    throw new Error(`Manifest not found for app '${appId}'.`);
  }
  const t0 = performance.now();

  /* ---------------------------------------------------------
     TIER 2: CLOUD RUN PYTHON SCIENTIFIC WORKER APPS
     --------------------------------------------------------- */
  if (manifest.runtime.tier === 'cloud-run-cpu-worker') {
    let resp: Response;
    if (uploadedFiles.length > 0) {
      const fd = new FormData();
      fd.append('params_json', JSON.stringify(formValues));
      uploadedFiles.forEach((f) => fd.append('files', f, f.name));
      resp = await fetch(workerUrl(`/api/apps/${appId}/run-multipart`), {
        method: 'POST',
        body: fd,
      });
    } else {
      resp = await fetch(workerUrl(`/api/apps/${appId}/run`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: formValues, use_sample: true }),
      });
    }
    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({ detail: resp.statusText }));
      throw new Error(errBody.detail || `Worker HTTP ${resp.status}`);
    }
    const payload = await resp.json();
    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      ...payload,
    };
  }

  /* ---------------------------------------------------------
     APP: OPENTARGETS DISEASE-TARGET EXPLORER (GraphQL v4)
     --------------------------------------------------------- */
  if (appId === 'opentargets-explorer') {
    const queryStr = String(formValues.disease_query || 'non-small cell lung carcinoma').trim();
    const topN = Math.min(30, Math.max(5, Number(formValues.top_n || 15)));

    let diseaseId = queryStr;
    let diseaseName = queryStr;
    if (!/^(EFO|MONDO|ORPHA|HP)_\d+$/i.test(queryStr)) {
      const searchRes = await fetch('https://api.platform.opentargets.org/api/v4/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query SearchDisease($q: String!) {
            search(queryString: $q, entityNames: ["disease"], page: { index: 0, size: 1 }) {
              hits { id name }
            }
          }`,
          variables: { q: queryStr },
        }),
      }).then((r) => r.json());
      const hit = searchRes?.data?.search?.hits?.[0];
      if (!hit) {
        throw new Error(`No disease ontology term matched '${queryStr}' on Open Targets.`);
      }
      diseaseId = hit.id;
      diseaseName = hit.name;
    }

    const assocRes = await fetch('https://api.platform.opentargets.org/api/v4/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query AssocTargets($id: String!, $size: Int!) {
          disease(efoId: $id) {
            id
            name
            associatedTargets(page: { index: 0, size: $size }) {
              count
              rows {
                score
                datatypeScores { id score }
                target { id approvedSymbol approvedName }
              }
            }
          }
        }`,
        variables: { id: diseaseId, size: topN },
      }),
    }).then((r) => r.json());

    const rawRows = assocRes?.data?.disease?.associatedTargets?.rows || [];
    const totalCount = assocRes?.data?.disease?.associatedTargets?.count || rawRows.length;
    const table = rawRows.map((r: any, idx: number) => {
      const dtMap: Record<string, number> = {};
      (r.datatypeScores || []).forEach((d: any) => {
        dtMap[d.id] = Math.round(Number(d.score) * 1000) / 1000;
      });
      return {
        rank: idx + 1,
        gene_symbol: r.target.approvedSymbol,
        target_name: r.target.approvedName,
        ensembl_id: r.target.id,
        overall_score: Math.round(Number(r.score) * 1000) / 1000,
        genetic_assoc: dtMap.genetic_association ?? 0,
        somatic_mutation: dtMap.somatic_mutation ?? 0,
        known_drug_clinical: dtMap.clinical ?? 0,
        literature_evidence: dtMap.literature ?? 0,
      };
    });

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Top target for ${diseaseName} (${diseaseId}): ${table[0]?.gene_symbol || 'N/A'} (score ${table[0]?.overall_score ?? 0}) out of ${totalCount.toLocaleString()} linked genes`,
        disease_id: diseaseId,
        disease_name: diseaseName,
        total_associated_targets: totalCount,
        top_target: table[0]?.gene_symbol,
      },
      table,
      plot: {
        kind: 'bar',
        title: `Open Targets Overall Association Scores — ${diseaseName}`,
        xLabel: 'Overall Association Score (0–1)',
        yLabel: 'Target Gene Symbol',
        series: [
          {
            name: 'Overall Evidence Score',
            color: '#007AFF',
            points: table.slice(0, 12).map((r: any, i: number) => ({
              x: r.overall_score,
              y: i + 1,
              label: r.gene_symbol,
            })),
          },
        ],
      },
      chained_outputs: {
        TargetAssociationTable: table,
        GeneSymbolList: table.map((r: any) => r.gene_symbol),
        BioIdentifierList: table.map((r: any) => r.ensembl_id),
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: 'Open Targets Platform v4 GraphQL',
      },
    };
  }

  /* ---------------------------------------------------------
     APP: ALPHAFOLD DB & RCSB 3D STRUCTURE STUDIO
     --------------------------------------------------------- */
  if (appId === 'alphafold-pdb-studio') {
    const rawQuery = String(formValues.query_protein || 'EGFR').trim().toUpperCase();
    let uniprotId = rawQuery;
    let geneSym = rawQuery;
    let proteinName = rawQuery;
    let organism = 'Homo sapiens';

    if (!/^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/.test(rawQuery)) {
      const upUrl = `https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:${encodeURIComponent(
        rawQuery
      )})+AND+(organism_id:9606)+AND+(reviewed:true)&format=json&size=1`;
      const upJson = await fetch(upUrl).then((r) => r.json());
      const entry = upJson?.results?.[0];
      if (!entry) {
        throw new Error(`Could not resolve reviewed human UniProt accession for '${rawQuery}'.`);
      }
      uniprotId = entry.primaryAccession;
      geneSym = entry.genes?.[0]?.geneName?.value || rawQuery;
      proteinName =
        entry.proteinDescription?.recommendedName?.fullName?.value || geneSym;
      organism = entry.organism?.scientificName || 'Homo sapiens';
    }

    const afPredictions = await fetch(
      `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprotId)}`
    ).then((r) => {
      if (!r.ok) throw new Error(`AlphaFold DB entry not found for ${uniprotId}`);
      return r.json();
    });
    const afEntry = Array.isArray(afPredictions) ? afPredictions[0] : afPredictions;
    const pdbUrl: string = afEntry.pdbUrl;
    const pdbText = await fetch(pdbUrl).then((r) => r.text());

    // Parse CA atoms from PDB to extract per-residue pLDDT scores (stored in B-factor column)
    const caRows: { residue_num: number; residue_aa: string; plddt: number; confidence_tier: string }[] = [];
    let veryHigh = 0;
    let confident = 0;
    let low = 0;
    let veryLow = 0;

    for (const line of pdbText.split('\n')) {
      if (line.startsWith('ATOM  ') && line.slice(12, 16).trim() === 'CA') {
        const resName = line.slice(17, 20).trim();
        const resSeq = parseInt(line.slice(22, 26).trim(), 10);
        const bFactor = parseFloat(line.slice(60, 66).trim());
        if (!Number.isNaN(resSeq) && !Number.isNaN(bFactor)) {
          let tier = 'Very low (<50)';
          if (bFactor >= 90) {
            veryHigh++;
            tier = 'Very high (>90)';
          } else if (bFactor >= 70) {
            confident++;
            tier = 'Confident (70–90)';
          } else if (bFactor >= 50) {
            low++;
            tier = 'Low (50–70)';
          } else {
            veryLow++;
          }
          caRows.push({
            residue_num: resSeq,
            residue_aa: resName,
            plddt: Math.round(bFactor * 100) / 100,
            confidence_tier: tier,
          });
        }
      }
    }

    const meanPlddt =
      caRows.length > 0
        ? Math.round((caRows.reduce((acc, r) => acc + r.plddt, 0) / caRows.length) * 100) / 100
        : Number(afEntry.globalMetricValue || 0);

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `${geneSym} (${uniprotId}) · ${caRows.length} residues · Mean pLDDT ${meanPlddt} (${veryHigh + confident} structured residues ≥70)`,
        uniprot_accession: uniprotId,
        gene_symbol: geneSym,
        protein_name: proteinName,
        residues_count: caRows.length,
        mean_plddt: meanPlddt,
        pdb_download_url: pdbUrl,
      },
      structure3d: {
        accession: uniprotId,
        geneSymbol: geneSym,
        organism,
        title: `${geneSym} — ${proteinName}`,
        pdbText,
        meanPlddt,
        residueCount: caRows.length,
        sourceUrl: pdbUrl,
        confidenceBuckets: { veryHigh, confident, low, veryLow },
      },
      plot: {
        kind: 'line',
        title: `Per-Residue AlphaFold pLDDT Confidence Profile — ${geneSym} (${uniprotId})`,
        xLabel: 'Residue Position',
        yLabel: 'pLDDT Confidence (0–100)',
        yDomain: [0, 100],
        yThreshold: 70,
        series: [
          {
            name: 'pLDDT Score',
            color: '#007AFF',
            lineWidth: 1.6,
            points: caRows
              .filter((_, idx) => idx % Math.max(1, Math.floor(caRows.length / 350)) === 0)
              .map((r) => ({
                x: r.residue_num,
                y: r.plddt,
                label: `${r.residue_aa}${r.residue_num}: pLDDT ${r.plddt}`,
              })),
          },
        ],
      },
      table: caRows.slice(0, 150),
      chained_outputs: {
        ProteinAccession: uniprotId,
        GeneSymbolList: [geneSym],
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: 'EBI AlphaFold DB v6 + UniProt',
      },
    };
  }

  /* ---------------------------------------------------------
     APP: GSEAPY / ENRICHR PATHWAY EXPLORER
     --------------------------------------------------------- */
  if (appId === 'gseapy-enrichr') {
    const genes = parseGeneListInput(formValues.gene_list);
    const library = String(formValues.gene_set_library || 'KEGG_2021_Human');
    if (genes.length < 2) {
      throw new Error('Provide at least 2 gene symbols for pathway enrichment analysis.');
    }

    const resp = await fetch(workerUrl('/api/proxy/enrichr'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genes, gene_set_library: library }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: resp.statusText }));
      throw new Error(err.detail || 'Enrichr query failed');
    }
    const data = await resp.json();
    const table = (data.rows || []).map((row: any) => ({
      rank: row[0],
      pathway_term: row[1],
      p_value: Number(Number(row[2]).toExponential(3)),
      odds_ratio: Math.round(Number(row[3]) * 100) / 100,
      combined_score: Math.round(Number(row[4]) * 100) / 100,
      adjusted_q_value: Number(Number(row[6]).toExponential(3)),
      neg_log10_p: Math.round(-Math.log10(Math.max(Number(row[2]), 1e-50)) * 100) / 100,
      overlapping_genes: Array.isArray(row[5]) ? row[5].join(', ') : '',
    }));

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Top Enriched Pathway (${library}): ${table[0]?.pathway_term || 'None'} (p = ${table[0]?.p_value ?? 'N/A'})`,
        library,
        input_genes_count: genes.length,
        significant_pathways_fdr05: table.filter((r: any) => r.adjusted_q_value < 0.05).length,
      },
      table,
      plot: {
        kind: 'bar',
        title: `Top Enriched Terms in ${library} (-log₁₀ P-value)`,
        xLabel: '-log₁₀(P-value)',
        yLabel: 'Pathway / Term',
        series: [
          {
            name: '-log₁₀ P-value',
            color: '#5856D6',
            points: table.slice(0, 10).map((r: any, idx: number) => ({
              x: r.neg_log10_p,
              y: idx + 1,
              label: r.pathway_term,
            })),
          },
        ],
      },
      chained_outputs: {
        PathwayEnrichmentTable: table,
        GeneSymbolList: genes,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: `Ma'ayan Lab Enrichr (${library})`,
      },
    };
  }

  /* ---------------------------------------------------------
     APP: CHEMBL APPROVED DRUG & BIOACTIVITY FINDER
     --------------------------------------------------------- */
  if (appId === 'chembl-drug-finder') {
    const rawTarget = parseGeneListInput(formValues.target_gene)[0] || 'EGFR';
    const upRes = await fetch(
      `https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:${encodeURIComponent(
        rawTarget
      )})+AND+(organism_id:9606)+AND+(reviewed:true)&format=json&size=1`
    ).then((r) => r.json());
    const uniprotAcc = upRes?.results?.[0]?.primaryAccession;
    if (!uniprotAcc) {
      throw new Error(`No human Swiss-Prot target found for gene symbol '${rawTarget}'.`);
    }

    const tCh = await fetch(
      `https://www.ebi.ac.uk/chembl/api/data/target.json?target_components__accession=${encodeURIComponent(
        uniprotAcc
      )}&target_type=SINGLE%20PROTEIN`
    ).then((r) => r.json());
    const targetEntry = tCh?.targets?.[0];
    if (!targetEntry) {
      throw new Error(`No SINGLE PROTEIN target registered in ChEMBL for ${rawTarget} (${uniprotAcc}).`);
    }
    const targetChemblId = targetEntry.target_chembl_id;

    const mechJson = await fetch(
      `https://www.ebi.ac.uk/chembl/api/data/mechanism.json?target_chembl_id=${encodeURIComponent(
        targetChemblId
      )}&limit=25`
    ).then((r) => r.json());
    const mechs: any[] = mechJson?.mechanisms || [];

    const molIds = Array.from(
      new Set(mechs.map((m) => m.molecule_chembl_id).filter(Boolean))
    ).slice(0, 20);

    let molMap: Record<string, any> = {};
    if (molIds.length > 0) {
      const molsJson = await fetch(
        `https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_chembl_id__in=${molIds.join(
          ','
        )}&limit=25`
      ).then((r) => r.json());
      for (const m of molsJson?.molecules || []) {
        molMap[m.molecule_chembl_id] = m;
      }
    }

    const table = mechs.map((m) => {
      const mol = molMap[m.molecule_chembl_id] || {};
      const smiles = mol?.molecule_structures?.canonical_smiles || '';
      return {
        drug_name: mol.pref_name || m.molecule_chembl_id,
        chembl_id: m.molecule_chembl_id,
        max_clinical_phase: Number(mol.max_phase ?? m.max_phase ?? 0),
        action_type: m.action_type || 'MODULATOR',
        mechanism_of_action: m.mechanism_of_action || '',
        molecule_type: mol.molecule_type || 'Small molecule',
        canonical_smiles: smiles,
      };
    });

    const smallMolSmiles = table
      .filter((r) => r.canonical_smiles)
      .map((r) => `${r.drug_name}, ${r.canonical_smiles}`)
      .join('\n');

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Found ${table.length} curated ChEMBL drugs/modulators targeting ${rawTarget} (${targetChemblId}, UniProt ${uniprotAcc})`,
        target_gene: rawTarget,
        target_chembl_id: targetChemblId,
        uniprot_accession: uniprotAcc,
        approved_phase4_count: table.filter((r) => r.max_clinical_phase === 4).length,
        small_molecules_with_smiles: table.filter((r) => Boolean(r.canonical_smiles)).length,
      },
      table,
      chained_outputs: {
        SMILESList: smallMolSmiles,
        SMILESTable: table.filter((r) => Boolean(r.canonical_smiles)),
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: 'EBI ChEMBL v34 REST API',
      },
    };
  }

  /* ---------------------------------------------------------
     APP: CLINVAR & MYVARIANT PATHOGENICITY ANNOTATOR
     --------------------------------------------------------- */
  if (appId === 'clinvar-variant-annotator') {
    const rawQ = String(formValues.variant_query || 'EGFR').trim();
    const filterMode = String(formValues.clinical_filter || 'pathogenic');
    let qExpr = rawQ;
    if (/^[A-Za-z0-9-]+$/.test(rawQ) && !rawQ.toLowerCase().startsWith('rs') && !rawQ.includes(':')) {
      qExpr =
        filterMode === 'pathogenic'
          ? `clinvar.gene.symbol:${rawQ.toUpperCase()} AND clinvar.rcv.clinical_significance:Pathogenic`
          : `clinvar.gene.symbol:${rawQ.toUpperCase()}`;
    }

    const mvJson = await fetch(
      `https://myvariant.info/v1/query?q=${encodeURIComponent(
        qExpr
      )}&fields=clinvar,cadd.phred,gnomad_exome.af.af,dbsnp.rsid&size=20`
    ).then((r) => r.json());

    const hits: any[] = mvJson?.hits || [];
    const table = hits.map((h) => {
      const cv = h.clinvar || {};
      const rcv = Array.isArray(cv.rcv) ? cv.rcv[0] : cv.rcv || {};
      const cond = rcv?.conditions?.name || cv?.trait || 'Clinical trait';
      return {
        hgvs_id: h._id,
        gene: cv?.gene?.symbol || rawQ.toUpperCase(),
        rsid: h?.dbsnp?.rsid || ( cv.rsid ? `rs${cv.rsid}` : '—' ),
        clinical_significance: rcv?.clinical_significance || 'Annotated',
        condition: Array.isArray(cond) ? cond.join('; ') : String(cond),
        review_status: rcv?.review_status || 'Submitted',
        cadd_phred: h?.cadd?.phred ? Math.round(Number(h.cadd.phred) * 100) / 100 : null,
        gnomad_af: h?.gnomad_exome?.af?.af ? Number(Number(h.gnomad_exome.af.af).toExponential(2)) : 0,
      };
    });

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Annotated ${table.length} clinical variants (${mvJson?.total?.toLocaleString() || table.length} total matching records in ClinVar/MyVariant)`,
        query: rawQ,
        total_database_hits: mvJson?.total || table.length,
      },
      table,
      chained_outputs: {
        VariantAnnotationTable: table,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: 'BioThings MyVariant.info (ClinVar + CADD + gnomAD)',
      },
    };
  }

  return executeSequenceOrBridgeApp(appId, manifest, formValues, t0);
}
