import React from 'react';
import { Compass, FileCheck2, Search, ShieldCheck } from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';

export const NotFoundView: React.FC<{
  requestedPath: string;
  onGoDiscover: () => void;
  onGoSearch: () => void;
}> = ({ requestedPath, onGoDiscover, onGoSearch }) => {
  const { tr } = useLocale();
  return (
    <div className="mas-page-content subpage-offset">
      <div className="legal-card notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="legal-title">
          {tr(
            'We couldn’t find that studio or route',
            '요청하신 스튜디오 또는 페이지를 찾을 수 없습니다'
          )}
        </h1>
        <p className="legal-lead">
          {tr(
            `No verified OpenBioApp route matches “${requestedPath}”. Every listed studio is indexed in Discover and Search.`,
            `“${requestedPath}” 경로와 일치하는 페이지가 없습니다. 모든 검증된 실행형 바이오 스튜디오는 탐색 탭과 검색에서 바로 열 수 있습니다.`
          )}
        </p>
        <div className="notfound-actions">
          <button
            type="button"
            className="mas-get-pill solid-blue"
            onClick={onGoDiscover}
          >
            <Compass size={15} aria-hidden="true" />
            <span>{tr('Back to Discover', '탐색 홈으로 이동')}</span>
          </button>
          <button
            type="button"
            className="mas-get-pill"
            onClick={onGoSearch}
          >
            <Search size={15} aria-hidden="true" />
            <span>{tr('Search 15 Verified Studios', '15개 검증 스튜디오 검색')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyView: React.FC<{
  onGoDiscover: () => void;
}> = ({ onGoDiscover }) => {
  const { tr } = useLocale();
  return (
    <div className="mas-page-content subpage-offset">
      <article className="legal-card">
        <div className="legal-icon-row">
          <ShieldCheck size={26} aria-hidden="true" />
          <h1 className="legal-title">
            {tr(
              'OpenBioApp Privacy & Zero-Retention Data Policy',
              'OpenBioApp 개인정보 및 원본 데이터 무보관 정책'
            )}
          </h1>
        </div>
        <p className="legal-lead">
          {tr(
            'Project Governance Draft (for maintainer review; not formal legal advice) · OpenBioApp is engineered for wet-lab and computational researchers who require strict experimental data sovereignty.',
            '프로젝트 거버넌스 초안 (유지관리자 검토용 안내문이며 법률 자문이 아님) · OpenBioApp은 실험 연구자와 생명정보학자의 연구 데이터 주권 보호를 최우선으로 설계되었습니다.'
          )}
        </p>

        <section className="legal-section">
          <h2>
            {tr(
              '1. Ephemeral Stateless Scientific Execution',
              '1. 원본 파일 무보관(Stateless) 과학 연산'
            )}
          </h2>
          <p>
            {tr(
              'Files dropped into Cloud Run Python 3.12 CPU studios (such as NucleoSpec ESI-MS spectra, PyDESeq2 RNA-seq count tables, Lifelines survival cohorts, and CellTypist expression matrices) are processed strictly in ephemeral container memory and discarded immediately when the HTTP response completes. Raw uploaded experimental files are never written to persistent cloud buckets or training datasets.',
              'Cloud Run Python 3.12 CPU 스튜디오(NucleoSpec 질량분석, PyDESeq2 전사체, Lifelines 생존분석, CellTypist 단일세포 등)에 업로드된 파일은 일회성 컨테이너 메모리에서만 처리되며 응답 직후 즉시 파기됩니다. 원본 실험 파일은 클라우드 스토리지에 저장되거나 모델 학습에 절대 사용되지 않습니다.'
            )}
          </p>
        </section>

        <section className="legal-section">
          <h2>
            {tr(
              '2. 100% Browser-Local Studios & BYOK API Keys',
              '2. 브라우저 로컬 실행 및 BYOK API 키 보호'
            )}
          </h2>
          <p>
            {tr(
              'In-browser studios (Primer3 + Biopython, CRISPR Guide Scorer, Biopython Sequence Toolkit, Smart Table Filter, and Batch Result Aggregator) execute entirely inside your browser tab with zero network upload. Bring-Your-Own-Key (BYOK) LLM credentials entered in Settings remain exclusively in your browser’s localStorage and communicate directly with your chosen LLM provider.',
              '브라우저 로컬 스튜디오(Primer3, CRISPR 유전자가위, Biopython 서열 도구, 데이터 브리지 등)는 네트워크 전송 없이 사용자의 탭 내부에서 100% 실행됩니다. 설정 창에 입력한 BYOK API 키는 브라우저 localStorage에만 저장되며 OpenBioApp 서버로 전송되지 않습니다.'
            )}
          </p>
        </section>

        <section className="legal-section">
          <h2>
            {tr(
              '3. Optional Researcher Workspace Sync',
              '3. 선택적 연구자 워크스페이스 클라우드 동기화'
            )}
          </h2>
          <p>
            {tr(
              'Guest sessions store compact run summaries locally in your browser. If you explicitly sign in via Firebase Authentication, compact result artifacts (< 60 KB) are synced to your private user-scoped Firestore collection protected by strict owner-only security rules, and can be deleted at any time from the Workspace tab.',
              '게스트 세션은 요약 결과만 브라우저 내부에 저장합니다. 연구자가 직접 로그인한 경우에 한해 60KB 이하의 요약 결과 아티팩트가 본인 전용 Firestore 경로에 암호화 동기화되며, 워크스페이스에서 언제든 즉시 삭제할 수 있습니다.'
            )}
          </p>
        </section>

        <div className="legal-foot">
          <button type="button" className="mas-get-pill" onClick={onGoDiscover}>
            {tr('Return to Discover', '탐색 홈으로 돌아가기')}
          </button>
        </div>
      </article>
    </div>
  );
};

export const TermsView: React.FC<{
  onGoDiscover: () => void;
}> = ({ onGoDiscover }) => {
  const { tr } = useLocale();
  return (
    <div className="mas-page-content subpage-offset">
      <article className="legal-card">
        <div className="legal-icon-row">
          <FileCheck2 size={26} aria-hidden="true" />
          <h1 className="legal-title">
            {tr(
              'Terms of Use & Upstream Academic Licensing',
              '이용약관 및 오픈소스·학술 라이선스 고지'
            )}
          </h1>
        </div>
        <p className="legal-lead">
          {tr(
            'Project Governance Draft (for maintainer review; not formal legal advice) · OpenBioApp platform source code is licensed under Apache-2.0, and each studio honors its upstream SPDX license and academic citation.',
            '프로젝트 거버넌스 초안 (유지관리자 검토용 안내문이며 법률 자문이 아님) · OpenBioApp 플랫폼 코드는 Apache-2.0을 따르며 개별 스튜디오는 원작 오픈소스 SPDX 라이선스와 논문 인용 규정을 준수합니다.'
          )}
        </p>

        <section className="legal-section">
          <h2>
            {tr(
              '1. Research Use Only (Non-Diagnostic)',
              '1. 학술·연구 전용 (임상 진단 목적 외 사용 금지)'
            )}
          </h2>
          <p>
            {tr(
              'All outputs—including ClinVar variant pathogenicity summaries, ChEMBL drug records, RDKit ADMET profiles, and survival curves—are provided strictly for scientific research and educational use. OpenBioApp is not a medical device and must not be used for clinical diagnosis or patient treatment decisions.',
              'ClinVar 변이 병원성 요약, ChEMBL 약물 조회, RDKit 독성 예측, 생존곡선 등 모든 분석 결과는 순수 연구 및 교육 목적으로만 제공됩니다. 임상 진단이나 환자 치료 결정에 사용할 수 없습니다.'
            )}
          </p>
        </section>

        <section className="legal-section">
          <h2>
            {tr(
              '2. Upstream SPDX & Non-Commercial Academic Attribution',
              '2. 원작 라이선스 및 비상업 학술 인용 의무'
            )}
          </h2>
          <p>
            {tr(
              'Permissive studios (MIT, BSD-3-Clause, Apache-2.0, CC-BY-4.0) support broad research workflows. Studios marked Academic / Non-Commercial—specifically NucleoSpec (wrapping Stacy Copp Lab’s DNASilverAnalyzer, UC Irvine)—are hosted strictly for non-commercial academic research and require citing the primary upstream publication shown in the studio citation bar.',
              '허용적 라이선스(MIT, BSD-3-Clause, Apache-2.0, CC-BY-4.0) 도구는 폭넓은 연구에 활용 가능합니다. 학술·비상업 전용 배지가 표시된 스튜디오(예: UC Irvine Stacy Copp 연구실의 DNASilverAnalyzer 기반 NucleoSpec)는 비상업적 학술 연구 목적으로만 제공되며 논문 발표 시 스튜디오 하단에 표시된 원작 논문을 반드시 인용해야 합니다.'
            )}
          </p>
        </section>

        <div className="legal-foot">
          <button type="button" className="mas-get-pill" onClick={onGoDiscover}>
            {tr('Return to Discover', '탐색 홈으로 돌아가기')}
          </button>
        </div>
      </article>
    </div>
  );
};
