import { AppLocale } from '../i18n/locale';
import { BioAppScientificGuide } from './guides/guideTypes';
import { BIO_APP_GUIDES_EN } from './guides/guidesEn';
import { BIO_APP_GUIDES_KO } from './guides/guidesKo';

export type {
  BioAppScientificGuide,
  FormatCheckItem,
  GuideMetricItem,
  InputFormatValidationReport,
} from './guides/guideTypes';
export { BIO_APP_GUIDES_EN } from './guides/guidesEn';
export { BIO_APP_GUIDES_KO } from './guides/guidesKo';
export { validateBioAppInput } from './guides/inputValidator';

export function getBioAppGuide(
  appId: string,
  locale: AppLocale = 'en'
): BioAppScientificGuide | undefined {
  return locale === 'ko' ? BIO_APP_GUIDES_KO[appId] : BIO_APP_GUIDES_EN[appId];
}
