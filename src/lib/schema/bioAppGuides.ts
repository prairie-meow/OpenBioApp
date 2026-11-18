export interface GuideMetricItem {
  columnOrMetric: string;
  meaning: string;
  cutoffOrRule: string;
}

export interface BioAppScientificGuide {
  appId: string;
  sampleData: {
    title: string;
    filename?: string;
    rawPreview: string;
    structureExplanation: string[];
  };
  formatSpec: {
    summary: string;
    checklist: string[];
    autoSanitizerNote: string;
  };
  resultGuide: {
    overview: string;
    visualGuide: string;
    metrics: GuideMetricItem[];
    nextSteps: string;
  };
}

export interface FormatCheckItem {
  level: 'pass' | 'warn' | 'error';
  message: string;
}

export interface InputFormatValidationReport {
  status: 'valid' | 'sample_ready' | 'warning' | 'invalid';
  headline: string;
  checks: FormatCheckItem[];
}

/* =========================================================
   COMPLETE 15-APP SAMPLE DATA, FORMAT SPEC & RESULT GUIDES
   ========================================================= */
export const BIO_APP_GUIDES: Record<string, BioAppScientificGuide> = {
  'nucleospec-dna-agnc': {
    appId: 'nucleospec-dna-agnc',
    sampleData: {
      title: 'Copp Lab GG208 DNA–Agₙ 고해상도 음이온 ESI-MS 스펙트럼 (주형 서열: ATCCCCTGTC)',
      filename: 'GG208_esi_ms_template.txt',
      rawPreview: `# Waters / Thermo / Agilent ESI-MS Negative-Ion Spectrum (헤더는 자동 제거됨)
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
        '1열 (`m/z`): 질량 대 전하비(Mass-to-charge ratio, 양의 실수, 일반적으로 500~4,000 m/z 구간).',
        '2열 (`Intensity`): 해당 m/z에서의 이온 검출 강도(일반 숫자 또는 `2.167e5` 같은 과학적 표기법 모두 허용).',
        '주형 서열 (`sequence_or_formula`): 은 나노클러스터를 감싸는 단일가닥 DNA 서열(`5′→3′`, 예: `ATCCCCTGTC`).',
      ],
    },
    formatSpec: {
      summary: '탭(`\\t`), 쉼표(`,`), 공백으로 구분된 2열(`m/z`, `Intensity`) 텍스트(`.txt`, `.csv`, `.tsv`) 또는 엑셀(`.xlsx`) 파일과 `A/C/G/T/U` 염기서열을 입력합니다.',
      checklist: [
        '파일 각 행에 `m/z`와 `Intensity` 숫자 2개가 순서대로 들어 있는지 확인하세요 (`m/z > 0`, `Intensity ≥ 0`).',
        '동위원소 피크 간격(`1/z` m/z) 판별을 위해 피크 리스트 요약본이 아닌 **고해상도 프로파일(Profile) 원시 스펙트럼**을 권장합니다.',
        '`Single-Stranded DNA–Agₙ` 및 `Duplex Ag(I)` 모드에서는 주형 서열에 `A, C, G, T, U` 영문자만 입력하고(`5′-`나 공백 불필요), `XNA` 모드에서는 중성 분자식(예: `C100H120N40O60P10`)을 입력합니다.',
        '여러 시료 파일을 한 번에 드래그 앤 드롭하면 파일별로 일괄 분석됩니다.',
      ],
      autoSanitizerNote: 'MassLynx, Xcalibur, MassHunter 등 질량분석기 상단 기기 메타데이터 헤더 줄, 빈 줄, 주석(`#`)은 `ms_spectrum_sanitizer`가 자동으로 제거합니다.',
    },
    resultGuide: {
      overview: '상단 요약 배너에서 주성분 화학양론(`(DNA)₂Ag₁₇` 등)과 자유 원자가 전자 수(`N₀`)를 먼저 확인한 뒤, 스펙트럼 차트의 피크 줌 버튼 또는 표의 행을 클릭해 실험값(검정 실선)과 이론 동위원소 봉투(파란 피크)가 정확히 포개지는지 검증합니다.',
      visualGuide: '스펙트럼 그래프 X축은 `m/z`, Y축은 상대 강도(%)입니다. 상단 `Zoom (DNA)2Ag17` 버튼을 누르면 해당 피크 영역(`±3.5 m/z`)으로 확대되어 인접 동위원소 피크 간격(`Δm/z = 1/z`)과 은(¹⁰⁷Ag/¹⁰⁹Ag) 동위원소 분포 일치도를 눈으로 직접 대조할 수 있습니다.',
      metrics: [
        {
          columnOrMetric: 'species / strands / n_Ag',
          meaning: '할당된 나노클러스터 조성: 결합한 DNA 가닥 수(`strands`)와 은 원자 총개수(`n_Ag`) 및 음이온 전하 상태(`z-`).',
          cutoffOrRule: '예: `(DNA)2Ag17 (z=4-)` → DNA 2가닥이 은 원자 17개를 감싼 4가 음이온 복합체.',
        },
        {
          columnOrMetric: 'N0_electrons (N₀) & Qcl',
          meaning: '`N₀ = n_Ag - Qcl`로 계산되는 클러스터 코어 자유 원자가 전자 수(`N₀`)와 코어 양전하(`Qcl`).',
          cutoffOrRule: '형광 막대형 DNA–Agₙ 클러스터는 짝수 매직 넘버(`N₀ = 4` 녹색, `N₀ = 6` 적색, `N₀ = 10~12` 근적외선)를 따르며, `N₀ = 0`은 비형광 Ag⁺ 결합체입니다.',
        },
        {
          columnOrMetric: 'pattern_similarity & confidence',
          meaning: '실험 스펙트럼과 `IsoSpecPy` 이론 동위원소 분포 간의 코사인/피어슨 패턴 유사도(`0~1`).',
          cutoffOrRule: '`≥ 0.90` (`▲ High`): 매우 확실한 조성 할당 / `0.75~0.89`: 양호(중첩 피크·염 부가이온 점검) / `< 0.75`: 피크 줌으로 공용출 여부 확인 권장.',
        },
        {
          columnOrMetric: 'delta_X0_mz (ΔX₀)',
          meaning: '실험 피크 중심과 이론 동위원소 최강 피크 간의 `m/z` 질량 편차.',
          cutoffOrRule: '고해상도 Q-TOF/Orbitrap 기준 `|ΔX₀| ≤ 0.02 m/z` 이내면 질량 보정이 매우 정확함을 뜻합니다.',
        },
      ],
      nextSteps: '하단 체이닝 버튼으로 주형 서열을 `Primer3 & Biopython Oligo Lab`에 넘겨 주형 올리고의 녹는점(`Tm`)과 이차구조 안정성을 바로 점검할 수 있습니다.',
    },
  },

  'pydeseq2-deg': {
    appId: 'pydeseq2-deg',
    sampleData: {
      title: '인간 기도 평활근 세포 덱사메타손(Dexamethasone) 처리 대 대조군 Bulk RNA-seq 카운트 행렬 (4 vs 4 반복)',
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
        '1열 (`gene`): HGNC 유전자 심볼(예: `DUSP1`, `IL6`) 또는 Ensembl 유전자 ID(예: `ENSG00000120129`).',
        '대조군 열 (`Ctrl_Rep1..4`): 컬럼명에 `Ctrl`, `Control`, `Untreat`, `WT`, `Norm` 중 하나가 포함된 대조군 반복 시료의 read count(0 이상의 숫자).',
        '처리군 열 (`Dex_Rep1..4`): 실험군/약물처리군 반복 시료의 read count(0 이상의 숫자).',
      ],
    },
    formatSpec: {
      summary: '첫 번째 열이 유전자 ID이고 나머지 열이 시료별 발현 카운트(음수 없는 정수/실수)인 `.csv`, `.tsv`, `.txt`, `.xlsx` 표를 업로드합니다.',
      checklist: [
        '첫 번째 열에는 유전자 이름이, 첫 번째 행(헤더)에는 시료 이름이 들어가야 합니다.',
        '대조군 컬럼 이름에 `Ctrl`, `Control`, `Untreat`, `WT`, `Norm` 중 하나를 포함시키면 대조군/처리군이 자동 분리됩니다(키워드가 없으면 앞 절반 열을 대조군, 뒤 절반 열을 처리군으로 비교합니다).',
        '통계 검정을 위해 그룹당 최소 2개 이상(권장 3개 이상)의 생물학적 반복(Replicate) 시료를 포함하세요.',
        '이미 로그 변환되어 음수가 섞인 Z-score 대신 **원시 Read Count(또는 음수 없는 정규화 카운트)**를 입력해야 크기 인자(Median-of-ratios) 정규화가 정확히 작동합니다.',
      ],
      autoSanitizerNote: '엑셀에서 날짜로 깨진 유전자 심볼(`1-Mar` → `MARCHF1`, `2-Sep` → `SEPTIN2`)과 Ensembl 버전 번호(`ENSG00000146648.18` → `ENSG00000146648`), 중복 유전자 행 합산을 자동으로 복구합니다.',
    },
    resultGuide: {
      overview: 'Volcano Plot의 오른쪽 상단(유의하게 발현 증가)과 왼쪽 상단(유의하게 발현 감소) 유전자를 확인하고, 표에서 `padj`(다중검정 보정 FDR) 순으로 정렬된 핵심 유전자를 검토합니다.',
      visualGuide: 'Volcano Plot X축은 `log2FoldChange`(발현 배수 변화, `0` 기준 대칭), Y축은 `-log10(FDR)`(위로 갈수록 통계적으로 강하게 유의함)입니다. 세로 점선은 `|log2FC| = 1.0`(2배 변화), 가로 점선은 `FDR = 0.05`(`-log10(0.05) ≈ 1.30`) 기준선을 나타냅니다.',
      metrics: [
        {
          columnOrMetric: 'log2FoldChange',
          meaning: '대조군 대비 처리군의 발현량 배수 변화(`log2(Treated / Control)`).',
          cutoffOrRule: '`+1.0` 이상이면 2배 이상 발현 증가(`Up`), `-1.0` 이하이면 1/2 이하로 발현 감소(`Down`).',
        },
        {
          columnOrMetric: 'padj (BH-FDR)',
          meaning: '수천 개 유전자 동시 검정에 따른 위양성을 보정한 Benjamini–Hochberg 조정 p-값.',
          cutoffOrRule: '단순 `pvalue`가 아닌 **`padj < 0.05` (엄격 기준 `< 0.01`)**를 유의성 판단 기준으로 사용합니다.',
        },
        {
          columnOrMetric: 'baseMean',
          meaning: 'Median-of-ratios 크기 인자로 정규화된 전체 시료 평균 발현량.',
          cutoffOrRule: '`baseMean < 10`인 극저발현 유전자는 노이즈로 배수 변화가 과장될 수 있으므로 `baseMean ≥ 20` 유전자를 우선 신뢰합니다.',
        },
        {
          columnOrMetric: 'regulation',
          meaning: '설정된 `FDR` 및 `|log2FC|` 임계값을 동시에 통과했는지 판정한 라벨(`Up`, `Down`, `NS`).',
          cutoffOrRule: '`Up`/`Down`으로 분류된 유전자 목록이 하위 경로 분석 앱으로 자동 추출되어 체이닝됩니다.',
        },
      ],
      nextSteps: '결과 하단의 `GSEApy & Enrichr Pathways` 체이닝 버튼을 클릭하면 유의미한 차등발현 유전자들이 어떤 신호전달 경로(KEGG/Reactome/GO)에 농축되어 있는지 원클릭으로 분석됩니다.',
    },
  },

  'opentargets-explorer': {
    appId: 'opentargets-explorer',
    sampleData: {
      title: '비소세포폐암(Non-Small Cell Lung Carcinoma, `MONDO_0005233`) 실시간 유전·임상 타겟 우선순위 조회',
      rawPreview: `# 입력 필드 예시 (영문 질환명 또는 MONDO / EFO 온톨로지 ID 모두 가능)
disease_query: non-small cell lung carcinoma
# 다른 검색 예시:
# - ulcerative colitis
# - Alzheimer disease
# - MONDO_0005233
# - EFO_0000311`,
      structureExplanation: [
        '`disease_query`: 영문 표준 질환명(예: `non-small cell lung carcinoma`, `breast carcinoma`) 또는 `MONDO_xxxxxxx` / `EFO_xxxxxxx` 온톨로지 ID.',
        '`top_n`: 상위 몇 개의 질환 연관 타겟 유전자를 불러올지 지정(5~50개).',
      ],
    },
    formatSpec: {
      summary: '별도 파일 업로드 없이 영문 질환명 또는 `MONDO_` / `EFO_` 표준 질환 식별자를 텍스트로 입력합니다.',
      checklist: [
        '질환명은 Open Targets Platform v4 지식그래프 검색을 위해 **영문 질환명**(예: 폐암 → `lung adenocarcinoma` 또는 `non-small cell lung carcinoma`) 또는 표준 온톨로지 코드를 입력하세요.',
        '약어(예: `NSCLC`)보다 풀어쓴 공식 명칭이나 `MONDO_` ID를 입력하면 가장 정확한 질환 엔티티가 매칭됩니다.',
      ],
      autoSanitizerNote: '일반 영문 질환명을 입력하면 Open Targets GraphQL 검색 엔진이 가장 일치도가 높은 공식 `EFO/MONDO` 질환 코드로 자동 매핑한 뒤 연관 타겟을 조회합니다.',
    },
    resultGuide: {
      overview: '막대 차트와 표에서 종합 연관 점수(`overall_score`)가 가장 높은 상위 타겟 유전자를 확인하고, 유전학 근거(`genetic_association`)와 기승인/임상 약물 근거(`known_drug`) 중 어디에서 점수가 기인했는지 분해해 해석합니다.',
      visualGuide: '막대 차트 X축은 상위 타겟 유전자 심볼, Y축은 Open Targets 조화급수 종합 근거 점수(`0.00 ~ 1.00`)입니다.',
      metrics: [
        {
          columnOrMetric: 'overall_score',
          meaning: '인간 유전학·체세포 변이·임상 약물·경로·문헌 근거를 가중 조화급수로 통합한 질환-타겟 연관 점수(`0~1`).',
          cutoffOrRule: '`≥ 0.60`: 매우 강력한 질환 원인/치료 타겟 / `0.30~0.59`: 중등도 근거 / `< 0.30`: 탐색적 후보.',
        },
        {
          columnOrMetric: 'genetic_association & somatic_mutation',
          meaning: 'GWAS 생식세포 유전 변이(`genetic_association`) 및 암 체세포 드라이버 변이(`somatic_mutation`) 근거 점수.',
          cutoffOrRule: '인간 유전학 점수가 높은 타겟(`≥ 0.50`)은 임상 2/3상 성공 확률이 통계적으로 약 2배 이상 높습니다.',
        },
        {
          columnOrMetric: 'known_drug',
          meaning: '해당 질환 또는 관련 적응증에서 이미 임상시험에 진입했거나 승인된 약물이 존재하는지 나타내는 점수.',
          cutoffOrRule: '`genetic_association`은 높지만 `known_drug = 0`이면 신규(First-in-class) 타겟 발굴 기회이며, 둘 다 높으면 약물 재창출에 유리합니다.',
        },
      ],
      nextSteps: '발굴된 1순위 타겟을 `ChEMBL Clinical Drug Repurposer`(기승인 약물 조회) 또는 `AlphaFold DB 3D Inspector`(단백질 3D 포켓 확인)로 원클릭 체이닝하세요.',
    },
  },

  'alphafold-pdb-studio': {
    appId: 'alphafold-pdb-studio',
    sampleData: {
      title: '인간 상피세포 성장인자 수용체(`EGFR` / UniProt `P00533`) AlphaFold DB v6 3D 원자 좌표',
      rawPreview: `# 입력 필드 예시 (HGNC 유전자 심볼 또는 UniProt Swiss-Prot Accession)
query_protein: EGFR
# 다른 입력 예시:
# - P00533   (인간 EGFR UniProt ID 직접 입력)
# - TP53     (암 억제 단백질 p53)
# - KRAS     (GTPase KRas)
# - BRCA1    (유방암 감수성 단백질 1)`,
      structureExplanation: [
        '`query_protein`: 인간 유전자 심볼(예: `EGFR`, `KRAS`) 또는 6~10자리 UniProt Accession(예: `P00533`, `P04637`). 체이닝 시 상위 앱의 1순위 유전자가 자동 입력됩니다.',
      ],
    },
    formatSpec: {
      summary: '단일 유전자 심볼(예: `EGFR`) 또는 UniProt 단백질 고유번호(예: `P00533`) 1개를 입력합니다.',
      checklist: [
        '공백 없는 단일 유전자 심볼 또는 UniProt ID를 입력하세요(여러 줄 목록이 전달된 경우 첫 번째 유전자를 자동 선택합니다).',
        '매우 큰 복합체(>2,700 aa) 일부를 제외한 거의 모든 인간 표준 단백질(Reviewed Swiss-Prot)이 AlphaFold DB v6에서 즉시 조회됩니다.',
      ],
      autoSanitizerNote: '유전자 심볼(`EGFR`)을 입력하면 UniProt REST API를 통해 검증된 인간 Swiss-Prot 대표 Accession(`P00533`)으로 자동 변환한 뒤 최신 `model_v6.pdb` 좌표를 가져옵니다.',
    },
    resultGuide: {
      overview: '3D 캔버스에서 마우스 드래그로 단백질 골격을 회전하며 약물 결합 도메인이 진파란색(`pLDDT > 90`)으로 견고하게 접혀 있는지 확인하고, 아래 선 그래프와 잔기별 표에서 무질서 루프 구간(`pLDDT < 50`)을 구분합니다.',
      visualGuide: '3D 구조 색상은 공식 AlphaFold 신뢰도 기준을 따릅니다: **진파랑(`>90`, 원자 수준 고정밀)** · **하늘색(`70~90`, 주사슬 접힘 신뢰 가능)** · **노랑(`50~70`, 낮은 신뢰도)** · **주황(`50 미만`, 본질적 무질서 IDR 구간)**.',
      metrics: [
        {
          columnOrMetric: 'Mean pLDDT & Confidence Buckets',
          meaning: '전체 아미노산 잔기의 국소 거리 차이 검정 신뢰도(`0~100`) 평균 및 구간별 잔기 수.',
          cutoffOrRule: '저분자 도킹이나 구조 기반 설계에는 **`pLDDT ≥ 70`(특히 활성 부위 `≥ 90`)** 도메인만 사용해야 합니다.',
        },
        {
          columnOrMetric: 'Very Low (<50) 구간 해석 주의점',
          meaning: '주황색 긴 리본처럼 보이는 `pLDDT < 50` 영역.',
          cutoffOrRule: '구조 예측 실패라기보다 세포 내에서 실제로 유연하게 움직이는 **본질적 무질서 영역(IDR)이나 신호 펩타이드/막관통 말단**인 경우가 많으므로 고정된 3D 좌표로 해석하지 마세요.',
        },
      ],
      nextSteps: '`Download .PDB` 버튼으로 원본 원자 좌표 파일을 내려받아 PyMOL, ChimeraX 또는 분자 도킹 도구에 바로 입력할 수 있습니다.',
    },
  },

  'rdkit-molecular-profiler': {
    appId: 'rdkit-molecular-profiler',
    sampleData: {
      title: 'EGFR 표적 항암제 및 대조 화합물 SMILES 목록 (Gefitinib, Erlotinib, Osimertinib 등)',
      filename: 'smiles_library_template.txt',
      rawPreview: `# 형식: "이름: SMILES" 또는 "SMILES\t이름" 또는 "SMILES 단독" (한 줄에 1분자)
Gefitinib: COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1
Erlotinib: COCCOc1cc2ncnc(Nc3cccc(C#C)c3)c2cc1OCCOC
Osimertinib: COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc2nccc(n2)c3cn(C)c4ccccc34
Rhodanine_PAINS_Control: O=C1CSC(=S)N1Cc2ccccc2`,
      structureExplanation: [
        '각 줄마다 `화합물명: SMILES` 형식, 탭/쉼표 구분 `이름,SMILES`, 또는 순수 `SMILES` 문자열을 입력합니다.',
        '`ChEMBL Clinical Drug Repurposer`에서 체이닝하면 조회된 약물들의 SMILES가 자동 입력됩니다.',
      ],
    },
    formatSpec: {
      summary: '줄바꿈으로 구분된 유효한 SMILES 화학 구조식 목록(최대 100개 권장)을 텍스트 창에 붙여넣습니다.',
      checklist: [
        '고리 번호 짝(예: `c1ccccc1`)과 괄호(`(`, `)`)가 닫혀 있는 유효한 SMILES 문자열이어야 합니다.',
        '염(Salt, 예: `.Cl`)이 포함된 SMILES도 입력 가능하며 RDKit 파서가 분자량을 계산합니다.',
        '주석 줄(`#` 시작)과 빈 줄은 자동으로 무시됩니다.',
      ],
      autoSanitizerNote: '`이름: SMILES`, `이름\\tSMILES`, JSON 배열(`ChEMBL` 체이닝 출력) 등 다양한 입력 포맷에서 SMILES 토큰과 화합물 라벨을 자동으로 분리·정규화합니다.',
    },
    resultGuide: {
      overview: '산점도(`cLogP vs TPSA`)에서 경구 흡수 최적 영역 안에 드는 화합물을 확인하고, 표에서 **`QED` 점수가 높고 `lipinski_violations = 0`이며 `pains_alerts = None`인 깨끗한 선도물질**을 선별합니다.',
      visualGuide: '산점도 X축은 친유성(`Wildman–Crippen cLogP`), Y축은 위상 극성 표면적(`TPSA, Å²`)입니다. 일반적으로 `cLogP 0~5`, `TPSA 20~130 Å²`(뇌혈관장벽 투과 목적 시 `TPSA < 90 Å²`) 영역이 이상적인 경구 약물 공간입니다.',
      metrics: [
        {
          columnOrMetric: 'qed_score (0~1)',
          meaning: 'Bickerton 등(Nature Chem. 2012)의 정량적 약물유사성 통합 지수.',
          cutoffOrRule: '`≥ 0.67`: 우수한 경구 약물유사성 / `0.40~0.66`: 허용 가능(키나아제 표적 항암제 다수 포함) / `< 0.35`: 물리화학적 최적화 필요.',
        },
        {
          columnOrMetric: 'lipinski_violations & veber_compliant',
          meaning: 'Lipinski 5규칙(`MW ≤ 500, cLogP ≤ 5, HBD ≤ 5, HBA ≤ 10`) 위반 개수 및 Veber 경구 생체이용률(`RotBonds ≤ 10, TPSA ≤ 140`) 충족 여부.',
          cutoffOrRule: '`lipinski_violations ≤ 1` 및 `veber_compliant = true`이면 경구 흡수 가능성이 높습니다.',
        },
        {
          columnOrMetric: 'pains_alerts & brenk_alerts',
          meaning: 'NIH PAINS(비특이적 분석 간섭 위양성 구조) 및 Brenk(반응성·독성 작용기) 서브스트럭처 경고.',
          cutoffOrRule: '고속 스크리닝(HTS) 유효물질 선정 시 **`pains_alerts = None`**을 최우선 필터로 적용해 위양성 아티팩트를 배제하세요.',
        },
      ],
      nextSteps: '`Smart Bio-Table Filter & Top-K` 블록으로 체이닝하여 `qed_score >= 0.5` 조건을 만족하는 상위 무독성 화합물만 자동 필터링할 수 있습니다.',
    },
  },

  'chembl-drug-finder': {
    appId: 'chembl-drug-finder',
    sampleData: {
      title: '인간 `EGFR` (`CHEMBL203`) 표적 기승인(Phase 4) 및 임상 진입 약물·작용기전 조회',
      rawPreview: `# 입력 필드 예시 (인간 타겟 유전자 심볼 1개)
target_gene: EGFR
# 다른 입력 예시:
# - ERBB2   (HER2 표적 항암제 조회)
# - BRAF    (Vemurafenib, Dabrafenib 등 조회)
# - JAK1    (자가면역질환 JAK 억제제 조회)`,
      structureExplanation: [
        '`target_gene`: 약물 및 저해제를 찾고자 하는 인간 HGNC 유전자 심볼(예: `EGFR`, `BRAF`, `TNF`).',
      ],
    },
    formatSpec: {
      summary: '공식 인간 유전자 심볼(영문 대문자, 예: `EGFR`)을 입력합니다.',
      checklist: [
        '단백질 별칭(예: `HER1`) 대신 표준 HGNC 심볼(`EGFR`)을 입력하면 UniProt → ChEMBL 단일 단백질 타겟 매핑 정확도가 가장 높습니다.',
      ],
      autoSanitizerNote: '`OpenTargets`나 `PyDESeq2`에서 유전자 리스트가 체이닝되면 최상위 타겟 심볼을 자동 추출하고, 돌연변이 세포주 엔트리가 아닌 정식 인간 `SINGLE PROTEIN` ChEMBL 타겟을 우선 매칭합니다.',
    },
    resultGuide: {
      overview: '표에서 임상 최고 단계(`max_phase = 4`, FDA/EMA 기승인 약물)와 작용기전(`action_type`: `INHIBITOR`, `ANTAGONIST`, `AGONIST`)을 확인한 뒤, 저분자 SMILES가 확보된 후보를 화학정보학 분석으로 넘깁니다.',
      visualGuide: '막대 차트는 조회된 각 약물의 최고 임상 개발 단계(`Phase 1 ~ Phase 4 Approved`)를 비교해 보여줍니다.',
      metrics: [
        {
          columnOrMetric: 'max_phase',
          meaning: 'ChEMBL에 기록된 해당 화합물의 최고 임상시험 도달 단계.',
          cutoffOrRule: '`4`: 시판 승인 약물(즉시 약물 재창출 후보) / `2~3`: 임상 후기 후보물질 / `1`: 초기 안전성 검증 단계.',
        },
        {
          columnOrMetric: 'action_type & mechanism_of_action',
          meaning: '표적 단백질에 대한 약리학적 조절 방향(저해제 `INHIBITOR`, 길항제 `ANTAGONIST`, 작용제 `AGONIST`, 분해제 등).',
          cutoffOrRule: '질환에서 과발현·기능획득(`Gain-of-function`)된 타겟에는 `INHIBITOR`/`ANTAGONIST`를 선택합니다.',
        },
        {
          columnOrMetric: 'canonical_smiles',
          meaning: '저분자 약물의 표준 SMILES 구조식(단클론항체 `mAb` 제제는 고분자 단백질이므로 SMILES가 비어 있을 수 있음).',
          cutoffOrRule: '유효한 SMILES가 있는 약물들이 `RDKit MedChem & PAINS Profiler` 체이닝 대상으로 자동 전달됩니다.',
        },
      ],
      nextSteps: '하단 `RDKit MedChem & PAINS Profiler` 체이닝 버튼을 눌러 추출된 임상 약물들의 `QED`, `TPSA`, `cLogP`, `PAINS` 독성 경고를 즉시 계산하세요.',
    },
  },

  'gseapy-enrichr': {
    appId: 'gseapy-enrichr',
    sampleData: {
      title: '덱사메타손 반응 차등발현 유전자 세트의 KEGG / Reactome / GO 경로 농축 분석',
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
        '`gene_list`: 줄바꿈, 쉼표(`,`), 또는 공백으로 구분된 인간 HGNC 유전자 심볼 목록(권장 10~500개).',
        '`gene_set_library`: 농축 검정을 수행할 표준 경로 데이터베이스(`KEGG_2021_Human`, `Reactome_2022`, `GO_Biological_Process_2023`, `MSigDB_Hallmark_2020`).',
      ],
    },
    formatSpec: {
      summary: '공식 인간 유전자 심볼(대문자, 예: `IL6`, `DUSP1`) 목록을 줄바꿈이나 쉼표로 구분해 입력합니다(Ensembl ID인 경우 먼저 `Universal Bio-ID Harmonizer`로 변환 권장).',
      checklist: [
        '통계적 검정력 확보를 위해 최소 **5개 이상(권장 15~300개)**의 유전자 심볼을 입력하세요(전장유전체 수만 개 전체를 넣으면 농축 배경과 구분되지 않습니다).',
        'Ensembl ID(`ENSG...`)가 아닌 표준 유전자 심볼(`TP53`, `EGFR` 등)이어야 경로 라이브러리와 정확히 교집합이 계산됩니다.',
      ],
      autoSanitizerNote: '쉼표·세미콜론·탭·줄바꿈 혼용 입력을 자동 분리하고 대문자 표준화 및 중복 제거를 수행합니다.',
    },
    resultGuide: {
      overview: '막대 차트와 표에서 `adjusted_p_value (FDR) < 0.05`이면서 `combined_score`가 높은 최상위 생물학적 경로를 확인하고, `overlapping_genes`에 내가 관심 있는 핵심 유전자들이 포함되어 있는지 점검합니다.',
      visualGuide: '막대 차트 Y축(또는 높이)은 Ma’ayan Lab Enrichr `Combined Score = -ln(p) × z-score`로, 단순 p-값 편향을 보정한 경로 중요도를 나타냅니다.',
      metrics: [
        {
          columnOrMetric: 'adjusted_p_value (BH q-value)',
          meaning: '수백~수천 개 경로에 대한 Fisher 정확 검정 p-값을 다중검정 보정한 값.',
          cutoffOrRule: '**`adjusted_p_value < 0.05`** 인 경로만 통계적으로 유의미한 농축으로 채택합니다.',
        },
        {
          columnOrMetric: 'odds_ratio & combined_score',
          meaning: '무작위 기대치 대비 입력 유전자가 해당 경로에 몇 배 더 몰려 있는지(`odds_ratio`)와 p-값을 결합한 종합 점수.',
          cutoffOrRule: '`combined_score > 30` 및 `overlap_count ≥ 3`이면 생물학적 재현성이 높은 핵심 기전입니다.',
        },
        {
          columnOrMetric: 'overlapping_genes',
          meaning: '입력한 유전자 목록 중 실제로 해당 경로에 속해 농축 신호를 만든 유전자들.',
          cutoffOrRule: '단 1개 유전자만 겹친 경로는 우연일 가능성이 높으므로 최소 3개 이상 겹치는지 반드시 확인하세요.',
        },
      ],
      nextSteps: '농축된 경로의 핵심 유전자를 `OpenTargets`나 `ChEMBL`에 입력해 해당 경로를 조절하는 임상 약물을 탐색할 수 있습니다.',
    },
  },

  'clinvar-variant-annotator': {
    appId: 'clinvar-variant-annotator',
    sampleData: {
      title: '인간 `BRCA1` 임상 병원성 변이 및 CADD / gnomAD 인구집단 빈도 주석 조회',
      rawPreview: `# 입력 필드 예시 (유전자 심볼, dbSNP rsID, 또는 HGVS 유전체 좌표)
variant_query: BRCA1
# 다른 조회 예시:
# - rs121913529       (KRAS G12D 체세포/생식세포 핫스팟 변이)
# - rs113488022       (BRAF V600E 변이)
# - chr7:g.140453136A>T
# - TP53`,
      structureExplanation: [
        '`variant_query`: 유전자 심볼(`BRCA1`, `TP53`, `CFTR`), `rs`로 시작하는 dbSNP ID(`rs121913529`), 또는 HGVS 유전체 표기(`chr7:g.140453136A>T`).',
        '`clinical_filter`: `Pathogenic / Likely Pathogenic` 병원성 변이만 추려 볼지 전체 ClinVar 변이를 볼지 선택.',
      ],
    },
    formatSpec: {
      summary: '단일 유전자 심볼, `rsID`, 또는 `chr:g.좌표` HGVS 변이 문자열을 입력합니다.',
      checklist: [
        '`rsID` 조회 시 `rs` 소문자 접두사와 숫자를 붙여 입력하세요(예: `rs121913529`).',
        'HGVS 좌표 입력 시 `chr7:g.140453136A>T` 형식을 따릅니다(MyVariant.info GRCh37/hg19 기준 기본 인덱싱).',
      ],
      autoSanitizerNote: '앞뒤 공백과 불필요한 따옴표를 제거하고 유전자 심볼 조회 시 `clinvar.gene.symbol` 필드로 자동 라우팅합니다.',
    },
    resultGuide: {
      overview: '표에서 `clinical_significance`(병원성 판정), 별점/리뷰 상태에 해당하는 전문가 합의 수준, 인실리코 유해도(`cadd_phred`), 일반 인구집단 희귀도(`gnomad_af`) 3박자가 일치하는지 종합 판독합니다.',
      visualGuide: '막대 차트는 조회된 변이들의 임상적 유의성 분류 분포 또는 상위 변이별 `CADD Phred` 유해도 점수를 비교합니다.',
      metrics: [
        {
          columnOrMetric: 'clinical_significance',
          meaning: 'NCBI ClinVar에 보고된 ACMG 기준 임상 병원성 판정.',
          cutoffOrRule: '`Pathogenic` / `Likely pathogenic`: 질환 원인 변이 가능성 높음 / `Uncertain significance (VUS)`: 추가 기능 검증 필요 / `Benign`: 양성 다형성.',
        },
        {
          columnOrMetric: 'cadd_phred',
          meaning: '전장유전체 모든 가능한 단일염기 치환 대비 유해도 순위 점수(`-10 × log10(rank)`).',
          cutoffOrRule: '`≥ 20`: 상위 1% 유해 예측 변이 / `≥ 30`: 상위 0.1% 고위험 기능 손실 예측 변이.',
        },
        {
          columnOrMetric: 'gnomad_af',
          meaning: '일반 인구집단(gnomAD Exome)에서의 대립유전자 빈도(Allele Frequency).',
          cutoffOrRule: '중증 희귀 유전질환의 진성 병원성 변이는 대부분 **`gnomad_af < 0.001` (0.1% 미만) 또는 미관측(`0`)**입니다.',
        },
      ],
      nextSteps: '병원성 변이가 확인된 유전자를 `AlphaFold DB 3D Inspector`로 열어 변이 아미노산 위치가 고신뢰(`pLDDT > 90`) 기능성 포켓에 놓여 있는지 확인하세요.',
    },
  },

  'primer3-biopython': {
    appId: 'primer3-biopython',
    sampleData: {
      title: '인간 `TP53` 엑손 5–6 주형 DNA 서열(FASTA) 기반 PCR 프라이머 쌍 열역학 설계',
      filename: 'tp53_amplicon_template.fasta',
      rawPreview: `>TP53_exon5_6_locus Homo sapiens (217 bp)
TACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGAC`,
      structureExplanation: [
        '`template_sequence`: `>`로 시작하는 FASTA 헤더(선택 사항)와 `A, C, G, T`로 이루어진 주형 DNA 서열(최소 100 bp 이상 권장).',
        '`target_tm`: 목표 녹는점(`Tm`, 기본 `60.0°C`, SantaLucia 1998 최근접 이웃 염 보정 공식 적용).',
        '`min_amplicon`: 최소 증폭 산물(Amplicon) 길이(기본 `90 bp`).',
      ],
    },
    formatSpec: {
      summary: '100% 브라우저 내부에서 실행되며, `A, C, G, T` 염기로 구성된 최소 100 bp 이상의 DNA 서열(순수 서열 또는 FASTA 형식)을 붙여넣습니다.',
      checklist: [
        '정방향·역방향 프라이머와 최소 증폭 구간 확보를 위해 **최소 `min_amplicon + 40 bp` (일반적으로 120 bp 이상)** 길이의 주형 서열을 입력하세요.',
        '숫자, 줄번호, 공백이 섞여 있어도 자동 정제되지만 `N`이 과도하게 포함된 저품질 컨티그 구간은 피하세요.',
      ],
      autoSanitizerNote: 'FASTA `>` 헤더 줄, 줄바꿈, 공백, 숫자를 자동 제거하고 대문자 `A/C/G/T` 서열만 깔끔하게 추출합니다.',
    },
    resultGuide: {
      overview: '상단 서열 트랙 맵에서 정방향(`Fwd`, 파랑)과 역방향(`Rev`, 초록) 프라이머의 결합 위치를 확인하고, 표 1순위(`pair_rank = 1`) 쌍의 녹는점 차이(`delta_tm_c`)와 3′ 말단 안정성을 점검합니다.',
      visualGuide: '트랙 뷰어는 주형 서열 전체 길이 위에서 상위 프라이머 쌍이 증폭하는 Amplicon 위치 좌표(`start..end`)와 `+1` 리딩 프레임 단백질 번역 서열을 함께 보여줍니다.',
      metrics: [
        {
          columnOrMetric: 'fwd_tm_c / rev_tm_c & delta_tm_c',
          meaning: 'SantaLucia(1998) `ΔH°/ΔS°` 및 염 농도(`50 mM Na⁺`) 보정 공식으로 계산된 정·역방향 프라이머 녹는점과 두 값의 차이.',
          cutoffOrRule: '최적 어닐링을 위해 **`58~62°C` 범위 내이면서 두 프라이머 간 `delta_tm_c ≤ 1.0°C`** 인 쌍을 선택합니다.',
        },
        {
          columnOrMetric: 'fwd_gc_pct / rev_gc_pct',
          meaning: '프라이머 내 구아닌(G)·시토신(C) 비율(%).',
          cutoffOrRule: '**`40% ~ 60%`** 범위가 비특이적 결합 없이 안정적인 PCR 증폭 효율을 보입니다.',
        },
        {
          columnOrMetric: 'amplicon_bp & penalty_score',
          meaning: '증폭될 PCR 산물 크기(bp) 및 목표 `Tm`/GC%/말단 클램프/단일염기 반복(Homopolymer) 종합 페널티.',
          cutoffOrRule: '`penalty_score`가 낮을수록 이상적이며(`pair_rank = 1` 최우수), qPCR 용도는 `80~150 bp`, 일반 PCR/생어 시퀀싱은 `150~600 bp`가 적합합니다.',
        },
      ],
      nextSteps: '동일한 표적 엑손 서열에서 유전자 교정용 가이드 RNA도 함께 설계하려면 하단 `CRISPR–Cas9 / Cas12a Guide RNA Designer` 체이닝 버튼을 클릭하세요.',
    },
  },

  'crispr-guide-scorer': {
    appId: 'crispr-guide-scorer',
    sampleData: {
      title: '인간 `KRAS` 코딩 엑손 표적 서열 내 `SpCas9 (NGG)` 및 `AsCas12a (TTTV)` sgRNA 스캔',
      filename: 'kras_exon_target.fasta',
      rawPreview: `>KRAS_exon2_coding Homo sapiens
ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGTAAATCTTGTTTTAATATGCATATTACTGGTGCAGGACCATTCTTTGATACAGATAAAGGTTTCTCTGACCATTTTCATGAGTACTTATTACAAGATAATTATGCTGA`,
      structureExplanation: [
        '`target_dna`: 편집하고자 하는 표적 엑손/유전체 DNA 서열(FASTA 또는 순수 `A/C/G/T`, 최소 30 bp 이상).',
        '`nuclease`: 절단 효소 선택 — `SpCas9` (`20 nt spacer + 3′-NGG PAM`) 또는 `AsCas12a` (`5′-TTTV PAM + 20 nt crRNA`).',
      ],
    },
    formatSpec: {
      summary: '최소 30 bp 이상의 표적 DNA 서열(`A, C, G, T`)을 입력하면 정방향(`+`) 및 역상보(`-`) 양쪽 가닥 전체에서 모든 PAM 위치를 실시간 스캔합니다.',
      checklist: [
        '유전자 녹아웃(Knockout)이 목적이라면 개시코돈 직후가 아닌 **초기 보존적 구성 엑손(Constitutive Exon, 코딩 서열 앞쪽 10~65% 구간)** 서열을 입력하는 것이 NMD 유도에 가장 효과적입니다.',
        '`SpCas9` 선택 시 서열 내 `NGG`(역가닥 `CCN`), `AsCas12a` 선택 시 `TTTV`(역가닥 `BAAA`) 모티프가 최소 1개 이상 존재해야 가이드가 검출됩니다.',
      ],
      autoSanitizerNote: 'FASTA 헤더와 공백·개행을 자동 제거하고 양가닥(`+` / `-`) 모두에서 PAM 인접 스페이서를 추출합니다.',
    },
    resultGuide: {
      overview: '서열 트랙에서 상위 가이드들이 표적 엑손 중앙부에 고르게 배치되는지 확인하고, 표에서 **`on_target_score ≥ 65`이면서 `poly_t_terminator = false`인 상위 2~3개 sgRNA**를 실험 후보로 선정합니다.',
      visualGuide: '막대 차트와 서열 트랙은 검출된 상위 후보 가이드들의 위치별 온타겟 절단 효율 점수(`0~100`)를 비교합니다.',
      metrics: [
        {
          columnOrMetric: 'on_target_score (0~100)',
          meaning: 'Doench Rule Set 2 위치별 염기 선호도(PAM 인접 4번째 자리 `G` 선호, `C` 비선호 등), GC 함량, 시드 구간 열역학을 반영한 절단 효율 점수.',
          cutoffOrRule: '`≥ 65`: 고효율 권장 가이드 / `50~64`: 중등도 효율 / `< 50`: 낮은 절단 효율 예상.',
        },
        {
          columnOrMetric: 'gc_percent',
          meaning: '20 nt 가이드 스페이서 내 GC 비율(%).',
          cutoffOrRule: '**`40% ~ 70%`** 구간이 최적이며, `< 30%`이거나 `> 80%`이면 RNP 결합력이 급격히 떨어지거나 비특이적 결합이 증가합니다.',
        },
        {
          columnOrMetric: 'poly_t_terminator',
          meaning: '가이드 서열 내 `TTTT` 4연속 티민 존재 여부.',
          cutoffOrRule: '렌티바이러스/플라스미드 **U6 Pol-III 프로모터 발현 시 `TTTT`에서 전사가 조기 종료**되므로 반드시 `false`(없음)인 가이드를 선택하세요.',
        },
      ],
      nextSteps: '선정한 가이드 절단 부위 양옆(`±150~250 bp`) 주형 서열을 `Primer3 & Biopython Oligo Lab`에 넘기면 T7E1 또는 Amplicon 시퀀싱 확인용 프라이머를 즉시 설계할 수 있습니다.',
    },
  },

  'lifelines-survival': {
    appId: 'lifelines-survival',
    sampleData: {
      title: '폐선암(LUAD) 바이오마커 고발현군 대 저발현군 임상 생존 코호트 (`n = 48`)',
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
        '`patient_id` (선택): 익명화된 환자 또는 코호트 표본 식별자.',
        '`time_months` (필수 — `time`, `os_months`, `days`, `duration` 컬럼명도 자동 인식): 추적 관찰 기간(양의 실수).',
        '`event` (필수 — `status`, `vital_status` 자동 인식): 사건(사망/재발/진행) 발생 시 **`1`**, 추적 중도절단(우측 검열, 살아있거나 추적 종료) 시 **`0`**.',
        '`group` (필수 — `arm`, `stratum`, `biomarker`, `cohort` 자동 인식): 비교할 2~4개 환자군 이름(예: `Biomarker-High` vs `Biomarker-Low`).',
      ],
    },
    formatSpec: {
      summary: '추적 기간(`time`), 사건 발생 여부(`event: 0 또는 1`), 코호트 그룹(`group: 최소 2개 군`)이 포함된 `.csv`, `.tsv`, `.xlsx` 임상 표를 업로드합니다.',
      checklist: [
        '`event` 열이 반드시 숫자 **`1`(사건 발생)** 과 **`0`(중도절단 Censored)** 으로 코딩되어 있는지 확인하세요(`Alive/Dead` 문자열 대신 `0/1` 권장).',
        '`time` 열에는 음수가 없어야 하며 모든 환자가 동일한 시간 단위(개월 `months` 또는 일 `days`)를 사용해야 합니다.',
        'Log-Rank 통계 비교를 위해 `group` 열에 **최소 2개 이상의 서로 다른 그룹 라벨**이 존재해야 합니다.',
        '직접 식별 가능한 환자 실명·주민번호 등 PHI는 업로드 전 반드시 가명처리하세요(서버는 메모리 연산 직후 즉시 파기합니다).',
      ],
      autoSanitizerNote: '쉼표(`,`)·탭(`\\t`)·엑셀(`.xlsx`) 포맷을 자동 판별하고 `time/os_months/days`, `event/status`, `group/arm/biomarker` 등 흔히 쓰이는 임상 컬럼명을 자동 매핑하며 결측치 행을 안전하게 제외합니다.',
    },
    resultGuide: {
      overview: '상단 배너에서 군 간 생존곡선 차이에 대한 **Log-Rank 검정 `p-value`**를 먼저 확인하고, 계단형 Kaplan–Meier 생존곡선과 군별 중앙 생존기간(`median_survival`) 차이를 비교합니다.',
      visualGuide: '그래프 X축은 추적 기간, Y축은 누적 생존 확률(`0.00 ~ 1.00`)입니다. 각 군의 계단식 실선이 서로 교차하지 않고 뚜렷하게 벌어질수록 바이오마커의 예후 층화력이 우수함을 의미합니다.',
      metrics: [
        {
          columnOrMetric: 'Log-Rank p-value & Chi-Squared',
          meaning: '전체 추적 기간에 걸쳐 두 코호트 간 위험률(Hazard)이 동일하다는 귀무가설에 대한 비모수 카이제곱 검정 결과.',
          cutoffOrRule: '**`p < 0.05`** 이면 두 바이오마커/치료군 간 생존율 차이가 통계적으로 유의합니다.',
        },
        {
          columnOrMetric: 'median_survival',
          meaning: '코호트 누적 생존 확률이 `0.50` (50%)에 도달하는 시점(`NR` 또는 무한대는 추적 기간 내 절반 이상 생존함을 뜻함).',
          cutoffOrRule: '두 군 간 `median_survival` 격차(예: `14.2개월 vs 36.8개월`)가 임상적 효과 크기(Effect Size)를 직관적으로 보여줍니다.',
        },
        {
          columnOrMetric: 'survival_12m & survival_24m',
          meaning: '12단위(1년) 및 24단위(2년) 시점에서의 Kaplan–Meier 추정 생존율 및 95% Greenwood 신뢰구간.',
          cutoffOrRule: '초기 사망 위험과 장기 생존 꼬리(Tail plateau, 면역항암제 등에서 중요)를 구분해 평가할 때 활용합니다.',
        },
      ],
      nextSteps: '예후 차이가 유의한 바이오마커 유전자를 `OpenTargets`나 `ChEMBL`에서 조회해 표적 치료 전략과 연결할 수 있습니다.',
    },
  },

  'celltypist-annotator': {
    appId: 'celltypist-annotator',
    sampleData: {
      title: '인간 말초혈액 단핵구(PBMC) 8개 단일세포 클러스터 평균 마커 발현 행렬 (`log1p` 정규화)',
      filename: 'pbmc_cluster_markers_template.csv',
      rawPreview: `cluster_id,cells_count,CD3D,CD4,CD8A,GNLY,NKG7,MS4A1,CD79A,CD14,LYZ,FCGR3A,MS4A7,FCER1A,CD1C,PPBP,PF4
Cluster_0,690,2.84,2.65,0.12,0.09,0.14,0.08,0.05,0.11,0.18,0.06,0.04,0.07,0.05,0.03,0.02
Cluster_1,410,2.61,0.15,3.38,2.10,2.24,0.06,0.04,0.09,0.12,0.18,0.05,0.04,0.03,0.02,0.04
Cluster_2,235,0.18,0.08,0.22,3.62,3.35,0.05,0.07,0.10,0.15,1.89,0.11,0.06,0.04,0.05,0.03
Cluster_3,345,0.11,0.09,0.05,0.08,0.10,3.74,3.41,0.12,0.19,0.07,0.08,0.15,0.21,0.04,0.03
Cluster_4,520,0.09,0.24,0.04,0.11,0.16,0.07,0.06,3.58,3.32,0.21,0.18,0.19,0.14,0.06,0.05`,
      structureExplanation: [
        '1열 (`cluster_id`): Seurat / Scanpy 등에서 클러스터링된 클러스터 이름(예: `Cluster_0`, `0`, `1`).',
        '2열 (`cells_count`, 선택): 각 클러스터에 속한 단일세포 개수.',
        '나머지 열 (`CD3D`, `CD8A`, `MS4A1`, `CD14` 등): HGNC 유전자 심볼을 컬럼 헤더로 갖는 클러스터별 평균 `log1p(CPM)` 발현값.',
      ],
    },
    formatSpec: {
      summary: '행(Row)이 단일세포 클러스터이고 열(Column)이 유전자 심볼인 클러스터 평균 발현 표(`.csv` 또는 `.tsv`)를 업로드합니다.',
      checklist: [
        '행이 유전자가 아니라 **클러스터(`cluster_id`가 첫 번째 열)**이고, 열 헤더가 **인간 유전자 심볼(`CD3D`, `MS4A1`, `CD14`, `NKG7`, `PPBP` 등)** 방향인지 확인하세요(Scanpy `sc.get.obs_df` 또는 Seurat `AverageExpression` 전치 형태).',
        '원시 UMI 합계 대신 **`log1p` 정규화된 클러스터 평균 발현값(`0 ~ 6` 범위)**을 입력하면 시그니처 가중치 확률 계산이 가장 정확합니다.',
      ],
      autoSanitizerNote: '유전자 컬럼명의 대소문자를 자동 표준화하고 숫자 변환 불가 셀은 `0.0`으로 안전하게 치환한 뒤 2D 특이값 분해(SVD) 매니폴드 좌표를 계산합니다.',
    },
    resultGuide: {
      overview: '2D 매니폴드 산점도에서 림프구(T/B/NK)와 골수성 세포(단핵구/수지상세포/혈소판) 군집 분리를 확인하고, 표에서 클러스터별 예측 세포형(`predicted_cell_type`), 확신도(`confidence`), 결정적 마커(`top_expressed_markers`)를 검증합니다.',
      visualGuide: '산점도 X/Y축(`SVD-1`, `SVD-2`)은 마커 발현 공간에서의 클러스터 간 전사체 유사성 거리를 투영한 2차원 좌표입니다.',
      metrics: [
        {
          columnOrMetric: 'predicted_cell_type',
          meaning: 'Domínguez Conde 등(Science 2022) 면역 계통 시그니처 매칭으로 할당된 최우도 세포 타입.',
          cutoffOrRule: '예: `CD4+ T` (`CD3D/CD4/IL7R`), `CD8+ Cytotoxic T` (`CD8A/GZMB`), `NK` (`GNLY/NKG7`), `B` (`MS4A1/CD79A`), `CD14+ Monocyte` (`CD14/LYZ`).',
        },
        {
          columnOrMetric: 'confidence (0~1)',
          meaning: '1순위 세포형 점수와 2순위 세포형 점수 격차에서 도출된 소프트맥스 분류 신뢰도.',
          cutoffOrRule: '`≥ 0.80`: 명확히 분화된 단일 계통 클러스터 / `< 0.60`: 이중세포(Doublet) 또는 전이 상태 아형 가능성 점검.',
        },
        {
          columnOrMetric: 'top_expressed_markers',
          meaning: '해당 클러스터에서 실제로 높게 발현(`> 0.5`)되어 세포형 판정을 이끈 대표 마커 유전자 목록.',
          cutoffOrRule: '논문 Figure 작성 시 DotPlot / ViolinPlot 검증 마커로 그대로 활용할 수 있습니다.',
        },
      ],
      nextSteps: '관심 세포 클러스터의 대표 마커들을 `GSEApy & Enrichr Pathways` 또는 `OpenTargets`로 체이닝해 면역 아형 특이적 경로와 질환 연관성을 분석하세요.',
    },
  },

  'smart-table-filter': {
    appId: 'smart-table-filter',
    sampleData: {
      title: '상위 분석 결과 JSON 테이블에서 유의미한 행만 정밀 필터링 & 하위 블록용 유전자/SMILES 추출',
      filename: 'upstream_table_template.json',
      rawPreview: `[
  {"gene": "DUSP1", "log2FoldChange": 2.94, "padj": 0.00012},
  {"gene": "FKBP5", "log2FoldChange": 3.96, "padj": 0.00018},
  {"gene": "ACTB", "log2FoldChange": -0.02, "padj": 0.94100}
]`,
      structureExplanation: [
        '`json_rows`: 상위 앱에서 원클릭 체이닝으로 자동 주입되거나 직접 붙여넣는 JSON 객체 배열(`[{...}, {...}]`).',
        '`filter_column` / `operator` / `threshold_value`: 필터링할 컬럼명(예: `padj`, `qed_score`, `pattern_similarity`), 비교 연산자(`<`, `<=`, `>`, `>=`, `==`, `contains`), 기준값.',
        '`top_k`: 조건을 통과한 행 중 상위 몇 개까지 남길지 지정.',
      ],
    },
    formatSpec: {
      summary: '상위 앱 결과 화면에서 체이닝 버튼으로 넘어오면 자동 입력되며, 수동 입력 시 유효한 JSON 배열(`[...]`) 형식을 사용합니다.',
      checklist: [
        '`json_rows`가 대괄호(`[...]`)로 감싸진 유효한 JSON 객체 배열인지 확인하세요.',
        '`filter_column`에 입력한 컬럼명이 JSON 객체 키 이름과 정확히 일치해야 합니다(대소문자 구분, 예: `padj`, `qed_score`).',
      ],
      autoSanitizerNote: '필터링을 통과한 결과 행에서 `gene`/`symbol` 컬럼이나 `smiles`/`canonical_smiles` 컬럼을 자동 감지해 `GeneSymbolList` 및 `SMILESList` 타입으로 변환해 다음 앱에 연결합니다.',
    },
    resultGuide: {
      overview: '원본 행 수 대비 필터 통과 행 수(`Filtered N → M rows`)를 확인하고, 정제된 표를 CSV로 내려받거나 다음 분석 블록으로 전달합니다.',
      visualGuide: '결정론적(Deterministic) 브릿지 블록으로 LLM 환각 없이 100% 정확한 수치 비교만 수행합니다.',
      metrics: [
        {
          columnOrMetric: 'Filtered Row Count',
          meaning: '지정한 임계값 조건과 `Top-K` 제한을 통과한 최종 후보 레코드 수.',
          cutoffOrRule: '통과 행이 `0`개이면 `operator` 방향(`<` vs `>`)이나 `filter_column` 철자를 확인하세요.',
        },
      ],
      nextSteps: '추출된 상위 유전자/화합물 목록을 `GSEApy & Enrichr`, `ChEMBL`, `RDKit` 블록으로 바로 체이닝할 수 있습니다.',
    },
  },

  'bio-id-harmonizer': {
    appId: 'bio-id-harmonizer',
    sampleData: {
      title: 'Ensembl 유전자 ID · Entrez 번호 · HGNC 심볼 → 공식 심볼 & UniProt Swiss-Prot 일괄 변환',
      rawPreview: `ENSG00000146648.18
ENSG00000141510
ENSG00000133703
7157
1-Mar`,
      structureExplanation: [
        '`identifiers`: 줄바꿈·쉼표·공백으로 구분된 Ensembl ID(`ENSG...`), NCBI Entrez Gene ID(`7157`), HGNC 심볼(`EGFR`), 또는 엑셀에서 깨진 날짜형 유전자명(`1-Mar`).',
      ],
    },
    formatSpec: {
      summary: '서로 다른 데이터베이스 식별자가 섞여 있어도 줄바꿈이나 쉼표로 나열해 입력하면 실시간 `MyGene.info v3` 배치 쿼리로 표준화합니다.',
      checklist: [
        '한 번에 1~200개의 유전자 식별자를 입력할 수 있습니다.',
        '`ENSG00000146648.18`처럼 소수점 버전 번호가 붙은 GENCODE/Ensembl ID도 그대로 붙여넣으세요.',
      ],
      autoSanitizerNote: 'Ensembl 버전 접미사(`.18`)를 자동 제거하고 엑셀 날짜 오염 심볼(`1-Mar` → `MARCHF1`, `2-Sep` → `SEPTIN2`)을 선제 복구한 뒤 매핑합니다.',
    },
    resultGuide: {
      overview: '표에서 입력 쿼리(`input_query`)마다 매핑된 표준 `hgnc_symbol`, `ensembl_gene`, `entrez_id`, 그리고 3D 구조 조회에 쓰이는 검증된 `uniprot_swissprot` 고유번호를 확인합니다.',
      visualGuide: '매핑 실패(`matched = false`) 행이 있는지 확인해 위유전자(Pseudogene)나 비코딩 전사체를 걸러낼 수 있습니다.',
      metrics: [
        {
          columnOrMetric: 'hgnc_symbol & uniprot_swissprot',
          meaning: '인간 표준 유전자 심볼 및 EMBL-EBI Reviewed Swiss-Prot 대표 단백질 Accession.',
          cutoffOrRule: '`Enrichr`/`ChEMBL`에는 `hgnc_symbol`이, `AlphaFold DB 3D`에는 `uniprot_swissprot`이 자동 체이닝됩니다.',
        },
      ],
      nextSteps: '변환 완료 후 하단 체이닝 버튼으로 `AlphaFold DB 3D Inspector`, `GSEApy & Enrichr`, `ChEMBL`에 식별자 오류 없이 즉시 연결하세요.',
    },
  },

  'batch-result-aggregator': {
    appId: 'batch-result-aggregator',
    sampleData: {
      title: '유전학(OpenTargets) · 전사체(RNA-seq) · 임상변이(ClinVar) 다중 근거 순위 통합(Consensus Rank)',
      rawPreview: `{
  "OpenTargets_Genetics": ["EGFR", "KRAS", "ALK", "MET", "ERBB2"],
  "RNAseq_Upregulated": ["EGFR", "MET", "DUSP1", "ERBB2", "SPP1"],
  "ClinVar_Actionable": ["EGFR", "KRAS", "BRAF", "ERBB2"]
}`,
      structureExplanation: [
        '`tables_json`: 각 분석 스트림 이름을 키(Key)로, 우선순위 순으로 정렬된 유전자/화합물 배열을 값(Value)으로 갖는 JSON 객체(또는 여러 줄 후보 리스트).',
      ],
    },
    formatSpec: {
      summary: '2개 이상의 독립적인 근거 목록을 담은 JSON 객체(`{"근거1": ["유전자A", ...], "근거2": [...]}`)를 입력합니다.',
      checklist: [
        '각 배열 안에서 **앞쪽(인덱스 0)에 위치할수록 높은 순위(1위)**로 계산됩니다.',
        '유전자 심볼 대소문자를 통일하면(자동 대문자 변환 지원) 교집합 빈도가 정확히 집계됩니다.',
      ],
      autoSanitizerNote: '입력 식별자의 앞뒤 공백과 대소문자 차이를 정규화하여 다중 근거 교집합과 평균 순위를 결정론적으로 산출합니다.',
    },
    resultGuide: {
      overview: '단일 오믹스의 노이즈에 흔들리지 않고 **여러 독립 근거에서 반복 등장(`evidence_streams` 최대)하면서 평균 순위(`mean_rank`)도 앞서는 다중검증 최상위 타겟**을 선정합니다.',
      visualGuide: '막대 차트는 상위 후보별 종합 합의 점수(`consensus_score`)를 비교해 보여줍니다.',
      metrics: [
        {
          columnOrMetric: 'evidence_count & overlap_ratio',
          meaning: '전체 입력 근거 스트림 중 해당 타겟이 등장한 스트림 개수와 비율.',
          cutoffOrRule: '모든 독립 근거에서 공통으로 검출된(`overlap_ratio = 1.0`) 타겟이 가장 재현성 높은 핵심 후보입니다.',
        },
        {
          columnOrMetric: 'mean_rank & consensus_score',
          meaning: '등장한 각 근거 목록에서의 평균 순위(낮을수록 상위권)와 Borda 가중 합의 점수(높을수록 우수).',
          cutoffOrRule: '`consensus_score` 1~3위 후보를 후속 3D 구조 및 약물 스크리닝 타겟으로 우선 채택합니다.',
        },
      ],
      nextSteps: '합의 1순위 타겟을 `ChEMBL Clinical Drug Repurposer` 및 `AlphaFold DB 3D Inspector`로 체이닝해 약물화 가능성을 최종 검증하세요.',
    },
  },
};

/* =========================================================
   REAL-TIME PRE-FLIGHT INPUT DATA FORMAT VALIDATOR
   ========================================================= */
export async function validateBioAppInput(
  appId: string,
  formValues: Record<string, unknown>,
  files: File[]
): Promise<InputFormatValidationReport> {
  const checks: FormatCheckItem[] = [];

  const readFilePreview = async (f: File): Promise<string> => {
    const slice = f.slice(0, 65536);
    return await slice.text();
  };

  if (appId === 'nucleospec-dna-agnc') {
    const mode = String(formValues.analysis_mode || 'dna_agn');
    const seq = String(formValues.sequence_or_formula || '').trim().toUpperCase();
    if (!seq) {
      checks.push({ level: 'error', message: '주형 DNA 서열 또는 XNA 화학식(`sequence_or_formula`)이 비어 있습니다.' });
    } else if (mode !== 'xna_agn') {
      const invalidChars = seq.replace(/[ACGTU]/g, '');
      if (invalidChars.length > 0) {
        checks.push({
          level: 'error',
          message: `DNA 서열에 허용되지 않는 문자('${invalidChars}')가 포함되어 있습니다. A, C, G, T, U 염기만 입력하세요.`,
        });
      } else {
        checks.push({
          level: 'pass',
          message: `주형 서열 '${seq}' (${seq.length} nt) 염기 구성 정상 확인 (A/C/G/T/U).`,
        });
      }
    } else {
      checks.push({ level: 'pass', message: `XNA 화학식 '${seq}' 입력 확인.` });
    }

    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: '업로드된 파일 없음 → 실행 시 내장된 Copp Lab GG208 표준 스펙트럼(154,434 포인트)으로 동작합니다.',
      });
    } else {
      for (const f of files) {
        if (f.name.toLowerCase().endsWith('.xlsx')) {
          checks.push({
            level: 'pass',
            message: `'${f.name}' 엑셀 파일 감지 (${(f.size / 1024).toFixed(1)} KB) — 서버에서 1·2열(m/z, Intensity)을 자동 추출합니다.`,
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
              message: `'${f.name}': 유효한 2열 숫자 데이터(m/z, Intensity)를 찾지 못했습니다(상위 200줄 중 ${numericPairs}줄).`,
            });
          } else {
            checks.push({
              level: headerLines > 0 ? 'warn' : 'pass',
              message:
                headerLines > 0
                  ? `'${f.name}': 유효 스펙트럼 숫자 쌍 확인 + 상단 기기 헤더 ${headerLines}줄 감지(실행 시 자동 제거됨).`
                  : `'${f.name}': 깨끗한 2열(m/z, Intensity) 스펙트럼 데이터 형식 확인 완료.`,
            });
          }
        }
      }
    }
  } else if (appId === 'pydeseq2-deg') {
    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: '업로드된 카운트 파일 없음 → 실행 시 내장된 인간 기도 세포 Dexamethasone RNA-seq 표준 데이터(4 vs 4 반복)로 분석합니다.',
      });
    } else {
      const f = files[0];
      if (f.name.toLowerCase().endsWith('.xlsx')) {
        checks.push({
          level: 'pass',
          message: `'${f.name}' 엑셀 카운트 행렬 감지 — 엑셀 날짜 변환 유전자(1-Mar 등) 자동 복구기가 활성화됩니다.`,
        });
      } else {
        const txt = await readFilePreview(f);
        const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 3) {
          checks.push({ level: 'error', message: `'${f.name}': 최소 헤더 1줄과 2개 이상의 유전자 행이 필요합니다.` });
        } else {
          const sep = lines[0].includes('\t') ? '\t' : ',';
          const headers = lines[0].split(sep).map((h) => h.trim());
          if (headers.length < 3) {
            checks.push({
              level: 'error',
              message: `컬럼 수 부족(${headers.length}열): [유전자ID열 + 대조군 시료열 + 처리군 시료열] 최소 3열 이상이 필요합니다.`,
            });
          } else {
            const sampleCols = headers.slice(1);
            const ctrlMatched = sampleCols.filter((c) =>
              /(ctrl|control|untreat|wt|norm)/i.test(c)
            );
            checks.push({
              level: 'pass',
              message: `총 ${headers.length - 1}개 시료 컬럼 확인 (${
                ctrlMatched.length > 0
                  ? `대조군 자동 감지 ${ctrlMatched.length}개: ${ctrlMatched.slice(0, 3).join(', ')}`
                  : '컬럼명 키워드 없음 → 앞 절반을 대조군, 뒤 절반을 처리군으로 자동 배정'
              }).`,
            });
            const hasExcelDateGene = lines
              .slice(1, 150)
              .some((l) => /^"?\d{1,2}-(Mar|Sep|Dec)"?[,;\t]/i.test(l.trim()));
            if (hasExcelDateGene) {
              checks.push({
                level: 'warn',
                message: '엑셀 날짜 오염 유전자(예: 1-Mar, 2-Sep)가 감지되었습니다 → 실행 시 MARCHF1, SEPTIN2 등 공식 HGNC 심볼로 자동 복구됩니다.',
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
        message: '업로드된 파일 없음 → 내장 폐선암(LUAD) 바이오마커 생존 코호트(n=48, Biomarker-High vs Low)로 실행됩니다.',
      });
    } else {
      const f = files[0];
      if (f.name.toLowerCase().endsWith('.xlsx')) {
        checks.push({ level: 'pass', message: `'${f.name}' 엑셀 코호트 파일 감지 완료.` });
      } else {
        const txt = await readFilePreview(f);
        const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 5) {
          checks.push({ level: 'error', message: '생존 곡선 추정을 위해 최소 4명 이상의 환자 행이 필요합니다.' });
        } else {
          const sep = lines[0].includes('\t') ? '\t' : ',';
          const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
          const hasTime = headers.some((h) => ['time_months', 'time', 'os_months', 'days', 'duration'].includes(h));
          const hasEvent = headers.some((h) => ['event', 'status', 'vital_status', 'deceased'].includes(h));
          const hasGroup = headers.some((h) => ['group', 'arm', 'stratum', 'biomarker', 'cohort'].includes(h));
          if (!hasTime || !hasEvent || !hasGroup) {
            checks.push({
              level: 'warn',
              message: `표준 컬럼명(time_months, event, group) 중 일부가 다릅니다(현재 헤더: ${headers.join(', ')}). 순서 기반 자동 매핑을 시도하지만 표준 컬럼명 사용을 권장합니다.`,
            });
          } else {
            checks.push({
              level: 'pass',
              message: `필수 임상 생존 컬럼(추적기간·사건발생·코호트그룹) 헤더 검증 완료 (미리보기 ${lines.length - 1}행).`,
            });
          }
        }
      }
    }
  } else if (appId === 'celltypist-annotator') {
    if (files.length === 0) {
      checks.push({
        level: 'pass',
        message: '업로드된 파일 없음 → 내장 PBMC 8개 단일세포 클러스터 평균 마커 발현 행렬(2,485 cells)로 실행됩니다.',
      });
    } else {
      const f = files[0];
      const txt = await readFilePreview(f);
      const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        checks.push({ level: 'error', message: '클러스터 발현 행렬에 최소 1개 이상의 클러스터 행이 필요합니다.' });
      } else {
        const sep = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(sep).map((h) => h.trim().toUpperCase());
        const canonicalMarkers = ['CD3D', 'CD4', 'CD8A', 'GNLY', 'NKG7', 'MS4A1', 'CD79A', 'CD14', 'LYZ', 'FCGR3A', 'PPBP'];
        const overlap = canonicalMarkers.filter((m) => headers.includes(m));
        if (overlap.length === 0) {
          checks.push({
            level: 'error',
            message: '열 헤더에서 표준 면역 마커 유전자(CD3D, MS4A1, CD14, NKG7 등)를 찾을 수 없습니다. 행=클러스터, 열=유전자 심볼 방향인지 확인하세요.',
          });
        } else {
          checks.push({
            level: 'pass',
            message: `클러스터 행렬 방향 정상 확인 — 핵심 면역 마커 ${overlap.length}종(${overlap.slice(0, 5).join(', ')} 등) 감지됨.`,
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
    const minLen = appId === 'primer3-biopython' ? Number(formValues.min_amplicon || 90) + 30 : 25;
    if (cleaned.length < minLen) {
      checks.push({
        level: 'error',
        message: `유효 DNA 서열 길이 부족(현재 ${cleaned.length} bp): 최소 ${minLen} bp 이상의 A/C/G/T 서열이 필요합니다.`,
      });
    } else if (nonAcgt.length > 0) {
      checks.push({
        level: 'warn',
        message: `유효 서열 ${cleaned.length - nonAcgt.length} bp 확인 (비표준 문자 '${nonAcgt.slice(0, 8)}' ${nonAcgt.length}개는 자동 제외됩니다).`,
      });
    } else {
      checks.push({
        level: 'pass',
        message: `유효 DNA 주형 서열 ${cleaned.length} bp (100% A/C/G/T, GC ${Math.round(
          ((cleaned.match(/[GC]/g) || []).length / cleaned.length) * 100
        )}%) 검증 완료.`,
      });
    }
  } else if (appId === 'rdkit-molecular-profiler') {
    const raw = String(formValues.smiles_input || '').trim();
    if (!raw) {
      checks.push({ level: 'error', message: '분석할 SMILES 화학 구조식을 1줄 이상 입력하세요.' });
    } else if (raw.startsWith('[')) {
      checks.push({ level: 'pass', message: '상위 앱에서 전달된 JSON 화합물 테이블 형식 확인 완료.' });
    } else {
      const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      checks.push({
        level: lines.length > 0 ? 'pass' : 'error',
        message:
          lines.length > 0
            ? `총 ${lines.length}개의 SMILES 분자 입력 행 확인 완료.`
            : '유효한 SMILES 행이 없습니다.',
      });
    }
  } else if (appId === 'gseapy-enrichr' || appId === 'bio-id-harmonizer') {
    const raw = String(formValues[appId === 'gseapy-enrichr' ? 'gene_list' : 'identifiers'] || '').trim();
    const tokens = raw
      .split(/[\r\n,;\t\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !t.startsWith('#'));
    if (tokens.length === 0) {
      checks.push({ level: 'error', message: '최소 1개 이상의 유전자 심볼/식별자를 입력하세요.' });
    } else if (appId === 'gseapy-enrichr' && tokens.length < 4) {
      checks.push({
        level: 'warn',
        message: `현재 ${tokens.length}개 유전자 입력됨 — 통계적으로 유의미한 경로 농축 검정을 위해 5~300개 유전자 입력을 권장합니다.`,
      });
    } else {
      checks.push({
        level: 'pass',
        message: `총 ${tokens.length}개 유전자 식별자(${tokens.slice(0, 4).join(', ')}${tokens.length > 4 ? ' …' : ''}) 형식 확인 완료.`,
      });
    }
  } else if (appId === 'smart-table-filter' || appId === 'batch-result-aggregator') {
    const key = appId === 'smart-table-filter' ? 'json_rows' : 'tables_json';
    const raw = String(formValues[key] || '').trim();
    try {
      const parsed = JSON.parse(raw);
      if (appId === 'smart-table-filter' && !Array.isArray(parsed)) {
        checks.push({ level: 'error', message: '`json_rows`는 JSON 배열(`[{...}]`) 형태여야 합니다.' });
      } else {
        checks.push({
          level: 'pass',
          message: `유효한 JSON 데이터 구조 파싱 확인 완료.`,
        });
      }
    } catch {
      checks.push({ level: 'error', message: 'JSON 문법 오류: 괄호나 따옴표 짝이 맞는지 확인하세요.' });
    }
  } else {
    // Public query apps: opentargets-explorer, alphafold-pdb-studio, chembl-drug-finder, clinvar-variant-annotator
    const firstKey = Object.keys(formValues)[0];
    const val = String(formValues[firstKey] ?? '').trim();
    if (!val) {
      checks.push({ level: 'error', message: '조회할 검색어(질환명 / 유전자 심볼 / 변이 ID)를 입력하세요.' });
    } else {
      checks.push({
        level: 'pass',
        message: `조회 질의어 '${val}' 입력 형식 정상 확인 — 실시간 공개 바이오 API 호출 준비 완료.`,
      });
    }
  }

  const hasError = checks.some((c) => c.level === 'error');
  const hasWarn = checks.some((c) => c.level === 'warn');

  return {
    status: hasError ? 'invalid' : hasWarn ? 'warning' : 'valid',
    headline: hasError
      ? '입력 데이터 형식 오류 — 실행 전 아래 항목을 수정해 주세요'
      : hasWarn
      ? '입력 데이터 사용 가능 (자동 정제기 보정 안내 포함)'
      : '입력 데이터 형식 검증 완료 — 바로 분석 실행 가능합니다',
    checks,
  };
}
