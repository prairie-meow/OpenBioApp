import {
  BioAppManifest,
  BioAppRunResult,
  SequenceFeatureAnnotation,
} from "../schema/bioAppSchema";

export /* =========================================================
   THERMODYNAMICS & GENOMICS HELPERS (Primer3 / Biopython / CRISPR)
   ========================================================= */
// SantaLucia (1998) PNAS unified nearest-neighbor DNA parameters: [dH kcal/mol, dS cal/(mol·K)]
const NN_THERMO: Record<string, [number, number]> = {
  AA: [-7.9, -22.2],
  TT: [-7.9, -22.2],
  AT: [-7.2, -20.4],
  TA: [-7.2, -21.3],
  CA: [-8.5, -22.7],
  TG: [-8.5, -22.7],
  GT: [-8.4, -22.4],
  AC: [-8.4, -22.4],
  CT: [-7.8, -21.0],
  AG: [-7.8, -21.0],
  GA: [-8.2, -22.2],
  TC: [-8.2, -22.2],
  CG: [-10.6, -27.2],
  GC: [-9.8, -24.4],
  GG: [-8.0, -19.9],
  CC: [-8.0, -19.9],
};

const CODON_TABLE: Record<string, string> = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L', CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M', GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S', CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T', GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*', CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K', GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W', CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R', GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

function cleanDna(raw: string): string {
  return raw
    .split(/\r?\n/)
    .filter((l) => !l.trim().startsWith('>'))
    .join('')
    .toUpperCase()
    .replace(/[^ACGT]/g, '');
}

function revComp(seq: string): string {
  const map: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
  return seq
    .split('')
    .reverse()
    .map((b) => map[b] || 'N')
    .join('');
}

function calcSantaLuciaTm(oligo: string, naMillimolar = 50, primerNanomolar = 250): {
  tm: number;
  gcPct: number;
  dH: number;
  dS: number;
} {
  let dH = 0.2;
  let dS = -5.7;
  for (let i = 0; i < oligo.length - 1; i++) {
    const dinuc = oligo.slice(i, i + 2);
    const pair = NN_THERMO[dinuc];
    if (pair) {
      dH += pair[0];
      dS += pair[1];
    }
  }
  const gcCount = (oligo.match(/[GC]/g) || []).length;
  const gcPct = (gcCount / Math.max(1, oligo.length)) * 100;
  // SantaLucia salt correction
  const dS_salt = dS + 0.368 * (oligo.length - 1) * Math.log(naMillimolar / 1000);
  const R = 1.987; // cal/(K·mol)
  const ct = primerNanomolar * 1e-9;
  const tmK = (dH * 1000) / (dS_salt + R * Math.log(ct / 4));
  return {
    tm: Math.round((tmK - 273.15) * 100) / 100,
    gcPct: Math.round(gcPct * 10) / 10,
    dH: Math.round(dH * 100) / 100,
    dS: Math.round(dS_salt * 100) / 100,
  };
}

function translateDna(seq: string): string {
  const aa: string[] = [];
  for (let i = 0; i + 2 < seq.length; i += 3) {
    aa.push(CODON_TABLE[seq.slice(i, i + 3)] || 'X');
  }
  return aa.join('');
}

export function parseGeneListInput(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
  }
  return String(raw || '')
    .split(/[\r\n,;\t\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length >= 2 && !s.startsWith('#'));
}

export async function executeSequenceOrBridgeApp(
  appId: string,
  manifest: BioAppManifest,
  formValues: Record<string, unknown>,
  t0: number
): Promise<BioAppRunResult> {
  /* ---------------------------------------------------------
     APP: PRIMER3 & BIOPYTHON OLIGO SUITE (Browser Instant)
     --------------------------------------------------------- */
  if (appId === 'primer3-biopython') {
    const seq = cleanDna(String(formValues.template_sequence || ''));
    const targetTm = Number(formValues.target_tm || 60.0);
    const minAmp = Number(formValues.min_amplicon || 120);

    if (seq.length < 80) {
      throw new Error('Template DNA sequence must be at least 80 bp long to design PCR primer pairs.');
    }

    const fwdCandidates: { start: number; len: number; seq: string; tm: number; gc: number; pen: number }[] = [];
    const revCandidates: { start: number; len: number; seq: string; tm: number; gc: number; pen: number }[] = [];

    for (let len = 18; len <= 24; len++) {
      for (let pos = 0; pos < Math.min(seq.length - minAmp, Math.floor(seq.length * 0.45)); pos += 2) {
        const sub = seq.slice(pos, pos + len);
        const st = calcSantaLuciaTm(sub);
        if (st.gcPct >= 40 && st.gcPct <= 65 && !/AAAA|TTTT|GGGG|CCCC/.test(sub)) {
          const gcClampBonus = /[GC]$/.test(sub) ? 0 : 0.6;
          const pen = Math.abs(st.tm - targetTm) + gcClampBonus;
          fwdCandidates.push({ start: pos, len, seq: sub, tm: st.tm, gc: st.gcPct, pen });
        }
      }
      for (let endPos = Math.max(minAmp, Math.floor(seq.length * 0.55)); endPos <= seq.length; endPos += 2) {
        const subSense = seq.slice(endPos - len, endPos);
        const revSeq = revComp(subSense);
        const st = calcSantaLuciaTm(revSeq);
        if (st.gcPct >= 40 && st.gcPct <= 65 && !/AAAA|TTTT|GGGG|CCCC/.test(revSeq)) {
          const gcClampBonus = /[GC]$/.test(revSeq) ? 0 : 0.6;
          const pen = Math.abs(st.tm - targetTm) + gcClampBonus;
          revCandidates.push({ start: endPos - len, len, seq: revSeq, tm: st.tm, gc: st.gcPct, pen });
        }
      }
    }

    fwdCandidates.sort((a, b) => a.pen - b.pen);
    revCandidates.sort((a, b) => a.pen - b.pen);

    const pairs: Record<string, unknown>[] = [];
    const features: SequenceFeatureAnnotation[] = [];
    for (const f of fwdCandidates.slice(0, 8)) {
      for (const r of revCandidates.slice(0, 8)) {
        const ampSize = r.start + r.len - f.start;
        if (ampSize >= minAmp && Math.abs(f.tm - r.tm) <= 2.5) {
          const rank = pairs.length + 1;
          pairs.push({
            pair_rank: rank,
            fwd_primer_5to3: f.seq,
            fwd_pos: `${f.start + 1}..${f.start + f.len}`,
            fwd_tm_c: f.tm,
            fwd_gc_pct: f.gc,
            rev_primer_5to3: r.seq,
            rev_pos: `${r.start + 1}..${r.start + r.len}`,
            rev_tm_c: r.tm,
            rev_gc_pct: r.gc,
            product_bp: ampSize,
            delta_tm_c: Math.round(Math.abs(f.tm - r.tm) * 100) / 100,
          });
          if (rank === 1) {
            features.push(
              {
                name: `Fwd Primer #1 (Tm ${f.tm}°C)`,
                start: f.start + 1,
                end: f.start + f.len,
                strand: '+',
                color: '#007AFF',
                detail: f.seq,
              },
              {
                name: `Rev Primer #1 (Tm ${r.tm}°C)`,
                start: r.start + 1,
                end: r.start + r.len,
                strand: '-',
                color: '#FF2D55',
                detail: r.seq,
              }
            );
          }
          if (pairs.length >= 10) break;
        }
      }
      if (pairs.length >= 10) break;
    }

    const templateStats = calcSantaLuciaTm(seq.slice(0, Math.min(seq.length, 60)));
    const overallGc = Math.round(((seq.match(/[GC]/g) || []).length / seq.length) * 1000) / 10;

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: pairs.length
          ? `Designed ${pairs.length} thermodynamically balanced primer pairs · Best Amplicon ${pairs[0].product_bp} bp (ΔTm ${pairs[0].delta_tm_c}°C)`
          : `Analyzed ${seq.length} bp template (${overallGc}% GC) — relax Tm/amplicon constraints for primer pairs`,
        template_length_bp: seq.length,
        template_gc_pct: overallGc,
        pairs_found: pairs.length,
        sample_60bp_tm: templateStats.tm,
      },
      sequenceTrack: {
        sequenceName: 'Target Amplicon Template',
        sequence: seq,
        gcPercent: overallGc,
        lengthBp: seq.length,
        translatedProtein: translateDna(seq),
        features,
      },
      table: pairs,
      chained_outputs: {
        PrimerDesignTable: pairs,
        NucleicAcidSequence: seq,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'browser-wasm',
        elapsed_ms: Math.round((performance.now() - t0) * 100) / 100,
      },
    };
  }

  /* ---------------------------------------------------------
     APP: CRISPR-CAS9 / CAS12A GUIDE RNA SCORER (Browser Instant)
     --------------------------------------------------------- */
  if (appId === 'crispr-guide-scorer') {
    const seq = cleanDna(String(formValues.target_dna || ''));
    const nuclease = String(formValues.nuclease || 'spcas9');
    if (seq.length < 30) {
      throw new Error('Target DNA sequence must be at least 30 bp.');
    }

    const guides: Record<string, unknown>[] = [];
    const scanStrand = (strandSeq: string, strand: '+' | '-') => {
      if (nuclease === 'spcas9') {
        for (let i = 0; i <= strandSeq.length - 23; i++) {
          const spacer = strandSeq.slice(i, i + 20);
          const pam = strandSeq.slice(i + 20, i + 23);
          if (/^[ACGT]GG$/.test(pam)) {
            const gc = ((spacer.match(/[GC]/g) || []).length / 20) * 100;
            // Doench Rule Set 2 inspired sequence preference features (G at pos 20, no C at pos 16, optimal GC 40-65%, no TTTT Pol-III terminator)
            let score = 68;
            if (spacer[19] === 'G') score += 11;
            if (spacer[19] === 'T') score -= 10;
            if (spacer[15] === 'C') score -= 6;
            if (spacer[16] === 'A' || spacer[16] === 'G') score += 6;
            if (gc >= 40 && gc <= 65) score += 10;
            else score -= Math.abs(gc - 52) * 0.6;
            const hasPolyT = /TTTT/.test(spacer);
            if (hasPolyT) score -= 30;
            if (/GGGG/.test(spacer)) score -= 14;
            score = Math.max(5, Math.min(99, Math.round(score * 10) / 10));

            const genomicStart = strand === '+' ? i + 1 : seq.length - (i + 23) + 1;
            const genomicEnd = strand === '+' ? i + 23 : seq.length - i;
            guides.push({
              guide_id: `sgRNA_${guides.length + 1}`,
              strand,
              position: `${genomicStart}..${genomicEnd}`,
              spacer_5to3: spacer,
              pam,
              gc_pct: Math.round(gc * 10) / 10,
              on_target_score: score,
              pol3_polyT_safe: !hasPolyT,
              seed_tm_c: calcSantaLuciaTm(spacer.slice(10)).tm,
              startBp: genomicStart,
              endBp: genomicEnd,
            });
          }
        }
      } else {
        // AsCas12a: 5'-TTTV-3' + 23nt spacer
        for (let i = 0; i <= strandSeq.length - 27; i++) {
          const pam = strandSeq.slice(i, i + 4);
          const spacer = strandSeq.slice(i + 4, i + 27);
          if (/^TTT[ACG]$/.test(pam)) {
            const gc = ((spacer.match(/[GC]/g) || []).length / 23) * 100;
            let score = 70 + (gc >= 35 && gc <= 65 ? 12 : -10) - (/TTTT/.test(spacer) ? 25 : 0);
            score = Math.max(10, Math.min(98, Math.round(score * 10) / 10));
            const genomicStart = strand === '+' ? i + 1 : seq.length - (i + 27) + 1;
            const genomicEnd = strand === '+' ? i + 27 : seq.length - i;
            guides.push({
              guide_id: `crRNA_${guides.length + 1}`,
              strand,
              position: `${genomicStart}..${genomicEnd}`,
              spacer_5to3: spacer,
              pam,
              gc_pct: Math.round(gc * 10) / 10,
              on_target_score: score,
              pol3_polyT_safe: !/TTTT/.test(spacer),
              seed_tm_c: calcSantaLuciaTm(spacer.slice(0, 12)).tm,
              startBp: genomicStart,
              endBp: genomicEnd,
            });
          }
        }
      }
    };

    scanStrand(seq, '+');
    scanStrand(revComp(seq), '-');
    guides.sort((a: any, b: any) => b.on_target_score - a.on_target_score);

    const topFeatures: SequenceFeatureAnnotation[] = guides.slice(0, 6).map((g: any, idx: number) => ({
      name: `${g.guide_id} (Score ${g.on_target_score})`,
      start: g.startBp,
      end: g.endBp,
      strand: g.strand,
      color: idx === 0 ? '#34C759' : '#007AFF',
      score: g.on_target_score,
      detail: `${g.spacer_5to3} [${g.pam}]`,
    }));

    const displayRows = guides.map(({ startBp, endBp, ...rest }) => rest);

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Identified ${displayRows.length} ${nuclease.toUpperCase()} candidate guides · Best Guide ${(displayRows[0] as any)?.spacer_5to3 || 'None'} (Efficiency ${(displayRows[0] as any)?.on_target_score ?? 0}/100)`,
        total_guides_found: displayRows.length,
        high_efficiency_gt75: displayRows.filter((g: any) => g.on_target_score >= 75).length,
      },
      sequenceTrack: {
        sequenceName: 'CRISPR Target Locus',
        sequence: seq,
        gcPercent: Math.round(((seq.match(/[GC]/g) || []).length / seq.length) * 1000) / 10,
        lengthBp: seq.length,
        features: topFeatures,
      },
      table: displayRows,
      chained_outputs: {
        CrisprGuideTable: displayRows,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'browser-wasm',
        elapsed_ms: Math.round((performance.now() - t0) * 100) / 100,
      },
    };
  }

  /* ---------------------------------------------------------
     UTILITY BRIDGE 1: SMART BIO-TABLE FILTER & TOP-K SELECTOR
     --------------------------------------------------------- */
  if (appId === 'smart-table-filter') {
    let rows: Record<string, any>[] = [];
    if (Array.isArray(formValues.json_rows)) {
      rows = formValues.json_rows as Record<string, any>[];
    } else {
      rows = JSON.parse(String(formValues.json_rows || '[]'));
    }
    const col = String(formValues.filter_column || '').trim();
    const op = String(formValues.operator || 'lt');
    const rawThresh = String(formValues.threshold_value ?? '');
    const numThresh = Number(rawThresh);
    const topK = Math.max(1, Number(formValues.top_k || 15));

    const filtered = rows.filter((r) => {
      if (!col || !(col in r)) return true;
      const v = r[col];
      const nv = Number(v);
      const bothNum = !Number.isNaN(nv) && !Number.isNaN(numThresh) && rawThresh !== '';
      switch (op) {
        case 'lt':
          return bothNum ? nv < numThresh : String(v) < rawThresh;
        case 'lte':
          return bothNum ? nv <= numThresh : String(v) <= rawThresh;
        case 'gt':
          return bothNum ? nv > numThresh : String(v) > rawThresh;
        case 'gte':
          return bothNum ? nv >= numThresh : String(v) >= rawThresh;
        case 'neq':
          return bothNum ? nv !== numThresh : String(v) !== rawThresh;
        default:
          return bothNum ? nv === numThresh : String(v).toLowerCase() === rawThresh.toLowerCase();
      }
    });

    const sliced = filtered.slice(0, topK);
    const extractedGenes = sliced
      .map((r) => r.gene || r.gene_symbol || r.symbol || r.target_gene)
      .filter(Boolean);
    const extractedSmiles = sliced
      .filter((r) => r.canonical_smiles || r.smiles)
      .map((r) => `${r.compound || r.drug_name || 'Compound'}, ${r.canonical_smiles || r.smiles}`)
      .join('\n');

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Filtered ${rows.length} → ${sliced.length} rows (${col || 'all'} ${op} ${rawThresh})`,
        input_rows: rows.length,
        retained_rows: sliced.length,
      },
      table: sliced,
      chained_outputs: {
        AnyDataTable: sliced,
        ...(extractedGenes.length ? { GeneSymbolList: extractedGenes } : {}),
        ...(extractedSmiles ? { SMILESList: extractedSmiles } : {}),
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'browser-wasm',
        elapsed_ms: Math.round((performance.now() - t0) * 100) / 100,
      },
    };
  }

  /* ---------------------------------------------------------
     UTILITY BRIDGE 2: UNIVERSAL BIO-ID HARMONIZER (MyGene.info)
     --------------------------------------------------------- */
  if (appId === 'bio-id-harmonizer') {
    const ids = parseGeneListInput(formValues.identifiers);
    if (!ids.length) {
      throw new Error('Provide at least one biological identifier to harmonize.');
    }
    const bodyParams = new URLSearchParams({
      q: ids.join(','),
      scopes: 'ensembl.gene,symbol,entrezgene,uniprot',
      fields: 'symbol,name,ensembl.gene,entrezgene,uniprot.Swiss-Prot',
      species: 'human',
    });
    const mgRes = await fetch('https://mygene.info/v3/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    }).then((r) => r.json());

    const seen = new Set<string>();
    const table: Record<string, unknown>[] = [];
    for (const item of Array.isArray(mgRes) ? mgRes : []) {
      if (item.notfound || seen.has(item.query)) continue;
      seen.add(item.query);
      const ens = Array.isArray(item.ensembl)
        ? item.ensembl[0]?.gene
        : item.ensembl?.gene || '—';
      const up = item?.uniprot?.['Swiss-Prot'];
      const swissProt = Array.isArray(up) ? up[0] : up || '—';
      table.push({
        input_query: item.query,
        hgnc_symbol: item.symbol || '—',
        ensembl_gene_id: ens,
        entrez_id: item.entrezgene || '—',
        uniprot_swissprot: swissProt,
        gene_description: item.name || '',
      });
    }

    const symbols = table.map((r) => String(r.hgnc_symbol)).filter((s) => s !== '—');
    const firstUniprot = table.map((r) => String(r.uniprot_swissprot)).find((u) => u !== '—');

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Harmonized ${table.length}/${ids.length} human identifiers across Ensembl, HGNC, Entrez & Swiss-Prot`,
        mapped_count: table.length,
      },
      table,
      chained_outputs: {
        GeneSymbolList: symbols,
        ...(firstUniprot ? { ProteinAccession: firstUniprot } : {}),
        AnyDataTable: table,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'public-bio-api',
        elapsed_ms: Math.round(performance.now() - t0),
        source_api: 'BioThings MyGene.info v3',
      },
    };
  }

  /* ---------------------------------------------------------
     UTILITY BRIDGE 3: MULTI-SAMPLE & CONSENSUS AGGREGATOR
     --------------------------------------------------------- */
  if (appId === 'batch-result-aggregator') {
    const parsed =
      typeof formValues.tables_json === 'object' && formValues.tables_json !== null
        ? (formValues.tables_json as Record<string, string[]>)
        : JSON.parse(String(formValues.tables_json || '{}'));

    const sourceNames = Object.keys(parsed);
    const entityStats: Record<string, { sources: string[]; rankSum: number }> = {};

    for (const src of sourceNames) {
      const list = Array.isArray(parsed[src]) ? parsed[src] : [];
      list.forEach((rawItem, idx) => {
        const key = String(rawItem).trim().toUpperCase();
        if (!key) return;
        if (!entityStats[key]) {
          entityStats[key] = { sources: [], rankSum: 0 };
        }
        if (!entityStats[key].sources.includes(src)) {
          entityStats[key].sources.push(src);
          entityStats[key].rankSum += idx + 1;
        }
      });
    }

    const table = Object.entries(entityStats)
      .map(([entity, info]) => ({
        candidate: entity,
        evidence_sources_n: info.sources.length,
        total_sources: sourceNames.length,
        consensus_ratio: Math.round((info.sources.length / Math.max(1, sourceNames.length)) * 100) + '%',
        mean_rank: Math.round((info.rankSum / info.sources.length) * 100) / 100,
        supporting_blocks: info.sources.join(', '),
      }))
      .sort((a, b) => b.evidence_sources_n - a.evidence_sources_n || a.mean_rank - b.mean_rank);

    return {
      appId,
      appTitle: manifest.title,
      executedAt: new Date().toISOString(),
      summary: {
        headline: `Ranked ${table.length} unique candidates across ${sourceNames.length} evidence streams · Top Consensus: ${table[0]?.candidate || 'N/A'}`,
        unique_candidates: table.length,
        streams_merged: sourceNames.length,
      },
      table,
      chained_outputs: {
        GeneSymbolList: table.map((r) => r.candidate),
        AnyDataTable: table,
      },
      execution_meta: {
        app_id: appId,
        runtime_tier: 'browser-wasm',
        elapsed_ms: Math.round((performance.now() - t0) * 100) / 100,
      },
    };
  }

  throw new Error(`No execution handler wired for '${appId}'.`);
}
