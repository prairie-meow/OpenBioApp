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
