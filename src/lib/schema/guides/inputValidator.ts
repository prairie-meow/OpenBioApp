import { AppLocale } from '../../i18n/locale';
import { FormatCheckItem, InputFormatValidationReport } from './guideTypes';

export async function validateBioAppInput(
  appId: string,
  formValues: Record<string, unknown>,
  files: File[],
  locale: AppLocale = 'en'
): Promise<InputFormatValidationReport> {
  const checks: FormatCheckItem[] = [];
  const t = (en: string, ko: string) => (locale === 'ko' ? ko : en);

  const readFilePreview = async (f: File): Promise<string> => {
    const slice = f.slice(0, 65536);
    return await slice.text();
  };

  if (appId === 'nucleospec-dna-agnc') {
    const mode = String(formValues.analysis_mode || 'dna_agn');
    const seq = String(formValues.sequence_or_formula || '').trim().toUpperCase();
    if (!seq) {
      checks.push({
        level: 'error',
        message: t(
          'Template DNA sequence or XNA formula (`sequence_or_formula`) is required.',
          '주형 DNA 서열 또는 XNA 화학식(`sequence_or_formula`)이 비어 있습니다.'
        ),
      });
    } else if (mode !== 'xna_agn') {
      const invalidChars = seq.replace(/[ACGTU]/g, '');
      if (invalidChars.length > 0) {
        checks.push({
          level: 'error',
          message: t(
            `Sequence contains invalid characters ('${invalidChars}'). Enter only A, C, G, T, or U bases.`,
            `DNA 서열에 허용되지 않는 문자('${invalidChars}')가 포함되어 있습니다. A, C, G, T, U 염기만 입력하세요.`
          ),
        });
      } else {
        checks.push({
          level: 'pass',
          message: t(
            `Template sequence '${seq}' (${seq.length} nt) verified (valid A/C/G/T/U).`,
            `주형 서열 '${seq}' (${seq.length} nt) 염기 구성 정상 확인 (A/C/G/T/U).`
          ),
        });
      }
    } else {
      checks.push({
        level: 'pass',
        message: t(`XNA neutral formula '${seq}' verified.`, `XNA 화학식 '${seq}' 입력 확인.`),
      });
    }

    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: t(
          'No custom file uploaded — ready to run with built-in Copp Lab GG208 benchmark spectrum (154,434 points).',
          '업로드된 파일 없음 → 실행 시 내장된 Copp Lab GG208 표준 스펙트럼(154,434 포인트)으로 동작합니다.'
        ),
      });
    } else {
      for (const f of files) {
        if (f.name.toLowerCase().endsWith('.xlsx')) {
          checks.push({
            level: 'pass',
            message: t(
              `Excel workbook '${f.name}' (${(f.size / 1024).toFixed(1)} KB) detected — columns 1 & 2 (m/z, Intensity) will be extracted.`,
              `'${f.name}' 엑셀 파일 감지 (${(f.size / 1024).toFixed(1)} KB) — 서버에서 1·2열(m/z, Intensity)을 자동 추출합니다.`
            ),
          });
        } else {
          const txt = await readFilePreview(f);
          const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
          let numericPairs = 0;
          let headerLines = 0;
          for (const line of lines.slice(0, 200)) {
            const parts = line.trim().split(/[\t,;\s]+/);
            if (parts.length >= 2 && !Number.isNaN(Number(parts[0])) && !Number.isNaN(Number(parts[1]))) {
              numericPairs++;
            } else {
              headerLines++;
            }
          }
          if (numericPairs < 5) {
            checks.push({
              level: 'error',
              message: t(
                `'${f.name}': Could not find valid 2-column numeric (m/z, Intensity) rows (${numericPairs} numeric rows in first 200 lines).`,
                `'${f.name}': 유효한 2열 숫자 데이터(m/z, Intensity)를 찾지 못했습니다(상위 200줄 중 ${numericPairs}줄).`
              ),
            });
          } else {
            checks.push({
              level: headerLines > 0 ? 'warn' : 'pass',
              message:
                headerLines > 0
                  ? t(
                      `'${f.name}': Valid m/z–Intensity pairs confirmed + ${headerLines} instrument header lines will be auto-stripped.`,
                      `'${f.name}': 유효 스펙트럼 숫자 쌍 확인 + 상단 기기 헤더 ${headerLines}줄 감지(실행 시 자동 제거됨).`
                    )
                  : t(
                      `'${f.name}': Clean 2-column (m/z, Intensity) mass spectrum verified.`,
                      `'${f.name}': 깨끗한 2열(m/z, Intensity) 스펙트럼 데이터 형식 확인 완료.`
                    ),
            });
          }
        }
      }
    }
  } else if (appId === 'pydeseq2-deg') {
    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: t(
          'No count file uploaded — ready to run human airway Dexamethasone RNA-seq benchmark (4 vs 4 replicates).',
          '업로드된 카운트 파일 없음 → 내장 인간 기도 세포 Dexamethasone RNA-seq 표준 데이터(4 vs 4 반복)로 분석합니다.'
        ),
      });
    } else {
      const f = files[0];
      if (f.name.toLowerCase().endsWith('.xlsx')) {
        checks.push({
          level: 'pass',
          message: t(
            `Excel count matrix '${f.name}' detected — Excel date-corrupted gene symbol repair (1-Mar -> MARCHF1) active.`,
            `'${f.name}' 엑셀 카운트 행렬 감지 — 엑셀 날짜 변환 유전자(1-Mar 등) 자동 복구기가 활성화됩니다.`
          ),
        });
      } else {
        const txt = await readFilePreview(f);
        const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 3) {
          checks.push({
            level: 'error',
            message: t(
              `'${f.name}': Requires a header row and at least 2 gene rows.`,
              `'${f.name}': 최소 헤더 1줄과 2개 이상의 유전자 행이 필요합니다.`
            ),
          });
        } else {
          const sep = lines[0].includes('\t') ? '\t' : ',';
          const headers = lines[0].split(sep).map((h) => h.trim());
          if (headers.length < 3) {
            checks.push({
              level: 'error',
              message: t(
                `Too few columns (${headers.length}): requires [gene_id + control columns + treated columns] (at least 3 columns).`,
                `컬럼 수 부족(${headers.length}열): [유전자ID열 + 대조군 시료열 + 처리군 시료열] 최소 3열 이상이 필요합니다.`
              ),
            });
          } else {
            const sampleCols = headers.slice(1);
            const ctrlMatched = sampleCols.filter((c) =>
              /(ctrl|control|untreat|wt|norm)/i.test(c)
            );
            checks.push({
              level: 'pass',
              message: t(
                `${headers.length - 1} sample columns detected (${
                  ctrlMatched.length > 0
                    ? `${ctrlMatched.length} control columns matched: ${ctrlMatched.slice(0, 3).join(', ')}`
                    : 'first half assigned as Control, second half as Treated'
                }).`,
                `총 ${headers.length - 1}개 시료 컬럼 확인 (${
                  ctrlMatched.length > 0
                    ? `대조군 자동 감지 ${ctrlMatched.length}개: ${ctrlMatched.slice(0, 3).join(', ')}`
                    : '컬럼명 키워드 없음 → 앞 절반을 대조군, 뒤 절반을 처리군으로 자동 배정'
                }).`
              ),
            });
            const hasExcelDateGene = lines
              .slice(1, 150)
              .some((l) => /^"?\d{1,2}-(Mar|Sep|Dec)"?[,;\t]/i.test(l.trim()));
            if (hasExcelDateGene) {
              checks.push({
                level: 'warn',
                message: t(
                  'Excel date-corrupted gene symbols (e.g. 1-Mar, 2-Sep) detected — Auto-Sanitizer will restore MARCHF1, SEPTIN2.',
                  '엑셀 날짜 오염 유전자(예: 1-Mar, 2-Sep)가 감지되었습니다 → 실행 시 MARCHF1, SEPTIN2 등 공식 심볼로 자동 복구됩니다.'
                ),
              });
            }
          }
        }
      }
    }
  } else if (appId === 'lifelines-survival') {
    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: t(
          'No file uploaded — ready to run LUAD biomarker survival cohort benchmark (n = 48, High vs Low).',
          '업로드된 파일 없음 → 내장 폐선암(LUAD) 바이오마커 생존 코호트(n=48, Biomarker-High vs Low)로 실행됩니다.'
        ),
      });
    } else {
      const f = files[0];
      if (f.name.toLowerCase().endsWith('.xlsx')) {
        checks.push({
          level: 'pass',
          message: t(`Excel cohort file '${f.name}' detected.`, `'${f.name}' 엑셀 코호트 파일 감지 완료.`),
        });
      } else {
        const txt = await readFilePreview(f);
        const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 5) {
          checks.push({
            level: 'error',
            message: t(
              'At least 4 patient rows are required for survival curve estimation.',
              '생존 곡선 추정을 위해 최소 4명 이상의 환자 행이 필요합니다.'
            ),
          });
        } else {
          const sep = lines[0].includes('\t') ? '\t' : ',';
          const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
          const hasTime = headers.some((h) => ['time_months', 'time', 'os_months', 'days', 'duration'].includes(h));
          const hasEvent = headers.some((h) => ['event', 'status', 'vital_status', 'deceased'].includes(h));
          const hasGroup = headers.some((h) => ['group', 'arm', 'stratum', 'biomarker', 'cohort'].includes(h));
          if (!hasTime || !hasEvent || !hasGroup) {
            checks.push({
              level: 'warn',
              message: t(
                `Standard headers (time_months, event, group) partially missing (${headers.join(', ')}). Positional fallback will run, but standard headers are recommended.`,
                `표준 컬럼명(time_months, event, group) 중 일부가 다릅니다(현재 헤더: ${headers.join(', ')}). 순서 기반 자동 매핑을 시도하지만 표준 컬럼명 사용을 권장합니다.`
              ),
            });
          } else {
            checks.push({
              level: 'pass',
              message: t(
                `Required clinical survival columns (time, event, group) verified (${lines.length - 1} preview rows).`,
                `필수 임상 생존 컬럼(추적기간·사건발생·코호트그룹) 헤더 검증 완료 (미리보기 ${lines.length - 1}행).`
              ),
            });
          }
        }
      }
    }
  } else if (appId === 'celltypist-annotator') {
    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: t(
          'No file uploaded — ready to run 8-cluster PBMC immune marker benchmark (2,485 cells).',
          '업로드된 파일 없음 → 내장 PBMC 8개 단일세포 클러스터 평균 마커 발현 행렬(2,485 cells)로 실행됩니다.'
        ),
      });
    } else {
      const f = files[0];
      const txt = await readFilePreview(f);
      const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        checks.push({
          level: 'error',
          message: t('Cluster matrix requires at least 1 cluster row.', '클러스터 발현 행렬에 최소 1개 이상의 클러스터 행이 필요합니다.'),
        });
      } else {
        const sep = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(sep).map((h) => h.trim().toUpperCase());
        const canonicalMarkers = ['CD3D', 'CD4', 'CD8A', 'GNLY', 'NKG7', 'MS4A1', 'CD79A', 'CD14', 'LYZ', 'FCGR3A', 'PPBP'];
        const overlap = canonicalMarkers.filter((m) => headers.includes(m));
        if (overlap.length === 0) {
          checks.push({
            level: 'error',
            message: t(
              'No canonical immune marker columns (CD3D, MS4A1, CD14, NKG7…) found in header. Ensure rows = clusters and columns = HGNC gene symbols.',
              '열 헤더에서 표준 면역 마커 유전자(CD3D, MS4A1, CD14, NKG7 등)를 찾을 수 없습니다. 행=클러스터, 열=유전자 심볼 방향인지 확인하세요.'
            ),
          });
        } else {
          checks.push({
            level: 'pass',
            message: t(
              `Cluster-by-gene orientation verified — ${overlap.length} canonical immune markers (${overlap.slice(0, 5).join(', ')}) detected.`,
              `클러스터 행렬 방향 정상 확인 — 핵심 면역 마커 ${overlap.length}종(${overlap.slice(0, 5).join(', ')} 등) 감지됨.`
            ),
          });
        }
      }
    }
  } else if (appId === 'primer3-biopython' || appId === 'crispr-guide-scorer') {
    const rawSeq = String(
      formValues[appId === 'primer3-biopython' ? 'template_sequence' : 'target_dna'] || ''
    );
    const cleaned = rawSeq
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith('>'))
      .join('')
      .toUpperCase()
      .replace(/\s+/g, '');
    const nonAcgt = cleaned.replace(/[ACGT]/g, '');
    const minLen = appId === 'primer3-biopython' ? (Number(formValues.min_amplicon) || 90) + 30 : 25;
    if (cleaned.length < minLen) {
      checks.push({
        level: 'error',
        message: t(
          `DNA sequence too short (${cleaned.length} bp): requires at least ${minLen} bp of A/C/G/T bases.`,
          `유효 DNA 서열 길이 부족(현재 ${cleaned.length} bp): 최소 ${minLen} bp 이상의 A/C/G/T 서열이 필요합니다.`
        ),
      });
    } else if (nonAcgt.length > 0) {
      checks.push({
        level: 'warn',
        message: t(
          `${cleaned.length - nonAcgt.length} bp valid DNA found (${nonAcgt.length} non-ACGT chars '${nonAcgt.slice(0, 8)}' will be stripped).`,
          `유효 서열 ${cleaned.length - nonAcgt.length} bp 확인 (비표준 문자 '${nonAcgt.slice(0, 8)}' ${nonAcgt.length}개는 자동 제외됩니다).`
        ),
      });
    } else {
      const gc = Math.round(((cleaned.match(/[GC]/g) || []).length / cleaned.length) * 100);
      checks.push({
        level: 'pass',
        message: t(
          `Valid DNA sequence verified (${cleaned.length} bp, 100% A/C/G/T, ${gc}% GC).`,
          `유효 DNA 주형 서열 ${cleaned.length} bp (100% A/C/G/T, GC ${gc}%) 검증 완료.`
        ),
      });
    }
  } else if (appId === 'rdkit-molecular-profiler') {
    const raw = String(formValues.smiles_input || '').trim();
    if (!raw) {
      checks.push({
        level: 'error',
        message: t('Enter at least one SMILES chemical structure.', '분석할 SMILES 화학 구조식을 1줄 이상 입력하세요.'),
      });
    } else if (raw.startsWith('[')) {
      checks.push({
        level: 'pass',
        message: t('Chained JSON compound table verified.', '상위 앱에서 전달된 JSON 화합물 테이블 형식 확인 완료.'),
      });
    } else {
      const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      checks.push({
        level: lines.length > 0 ? 'pass' : 'error',
        message:
          lines.length > 0
            ? t(`${lines.length} SMILES molecule entries ready.`, `총 ${lines.length}개의 SMILES 분자 입력 행 확인 완료.`)
            : t('No valid SMILES lines found.', '유효한 SMILES 행이 없습니다.'),
      });
    }
  } else if (appId === 'gseapy-enrichr' || appId === 'bio-id-harmonizer') {
    const raw = String(formValues[appId === 'gseapy-enrichr' ? 'gene_list' : 'identifiers'] || '').trim();
    const tokens = raw
      .split(/[\r\n,;\t\s]+/)
      .map((tk) => tk.trim())
      .filter((tk) => tk.length >= 2 && !tk.startsWith('#'));
    if (tokens.length === 0) {
      checks.push({
        level: 'error',
        message: t('Enter at least one gene symbol or identifier.', '최소 1개 이상의 유전자 심볼/식별자를 입력하세요.'),
      });
    } else if (appId === 'gseapy-enrichr' && tokens.length < 4) {
      checks.push({
        level: 'warn',
        message: t(
          `${tokens.length} genes entered — 5 to 300 genes are recommended for statistical pathway enrichment power.`,
          `현재 ${tokens.length}개 유전자 입력됨 — 통계적으로 유의미한 경로 농축 검정을 위해 5~300개 유전자 입력을 권장합니다.`
        ),
      });
    } else {
      checks.push({
        level: 'pass',
        message: t(
          `${tokens.length} gene identifiers (${tokens.slice(0, 4).join(', ')}${tokens.length > 4 ? ' …' : ''}) verified.`,
          `총 ${tokens.length}개 유전자 식별자(${tokens.slice(0, 4).join(', ')}${tokens.length > 4 ? ' …' : ''}) 형식 확인 완료.`
        ),
      });
    }
  } else if (appId === 'smart-table-filter' || appId === 'batch-result-aggregator') {
    const key = appId === 'smart-table-filter' ? 'json_rows' : 'tables_json';
    const raw = String(formValues[key] || '').trim();
    try {
      const parsed = JSON.parse(raw);
      if (appId === 'smart-table-filter' && !Array.isArray(parsed)) {
        checks.push({
          level: 'error',
          message: t('`json_rows` must be a JSON array (`[{...}]`).', '`json_rows`는 JSON 배열(`[{...}]`) 형태여야 합니다.'),
        });
      } else {
        checks.push({
          level: 'pass',
          message: t('Valid JSON input structure verified.', '유효한 JSON 데이터 구조 파싱 확인 완료.'),
        });
      }
    } catch {
      checks.push({
        level: 'error',
        message: t('Invalid JSON syntax — check brackets and quotes.', 'JSON 문법 오류: 괄호나 따옴표 짝이 맞는지 확인하세요.'),
      });
    }
  } else {
    const firstKey = Object.keys(formValues)[0];
    const val = String(formValues[firstKey] ?? '').trim();
    if (!val) {
      checks.push({
        level: 'error',
        message: t('Enter a disease, gene symbol, or variant query.', '조회할 검색어(질환명 / 유전자 심볼 / 변이 ID)를 입력하세요.'),
      });
    } else {
      checks.push({
        level: 'pass',
        message: t(
          `Query '${val}' verified — ready for live public bio-API lookup.`,
          `조회 질의어 '${val}' 입력 형식 정상 확인 — 실시간 공개 바이오 API 호출 준비 완료.`
        ),
      });
    }
  }

  const hasError = checks.some((c) => c.level === 'error');
  const hasWarn = checks.some((c) => c.level === 'warn');

  return {
    status: hasError ? 'invalid' : hasWarn ? 'warning' : 'valid',
    headline: hasError
      ? t('Input format error — fix the item below before running', '입력 데이터 형식 오류 — 실행 전 아래 항목을 수정해 주세요')
      : hasWarn
      ? t('Input ready (Auto-Sanitizer will clean detected quirks)', '입력 데이터 사용 가능 (자동 정제기 보정 안내 포함)')
      : t('Input format verified — ready to execute', '입력 데이터 형식 검증 완료 — 바로 분석 실행 가능합니다'),
    checks,
  };
}
