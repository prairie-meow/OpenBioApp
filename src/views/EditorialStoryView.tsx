import React, { useEffect } from 'react';
import { ChevronLeft, Share } from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import { BioApp, EditorialStory } from '../types/store';
import {
  BioAppIcon,
  EditorialHeroArt,
} from '../components/BioArtwork';
import {
  GetActionButton,
  InstallStateMap,
  VerifiedManifestPreviewCard,
} from '../components/StorePrimitives';

interface EditorialStoryViewProps {
  story: EditorialStory;
  featuredApp: BioApp;
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onBack: () => void;
  onShare: () => void;
}

export const EditorialStoryView: React.FC<EditorialStoryViewProps> = ({
  story,
  featuredApp,
  installStates,
  onInstall,
  onOpenApp,
  onBack,
  onShare,
}) => {
  const { tr } = useLocale();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  return (
    <div className="story-reader-window">
      <div className="story-reader-topbar">
        <button
          type="button"
          className="mas-circle-nav-btn"
          onClick={onBack}
          aria-label={tr('Back', '뒤로 가기')}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="mas-circle-nav-btn"
          onClick={onShare}
          aria-label={tr('Copy story link', '스토리 링크 복사')}
        >
          <Share size={15} />
        </button>
      </div>

      <div className="story-reader-body">
        <div className="story-poster-col">
          <div className="story-poster-art">
            <EditorialHeroArt
              styleType={story.illustrationStyle}
              bg={story.heroBg}
            />
          </div>
          <div className="story-poster-scrim" />

          <div className="story-poster-copy">
            <h1 className="t1-headline story-poster-title">{story.title}</h1>
          </div>

          <div className="story-dock-pill">
            <button
              type="button"
              className="story-dock-main"
              onClick={() => onOpenApp(featuredApp.id)}
            >
              <BioAppIcon
                glyph={featuredApp.iconGlyph}
                gradient={featuredApp.iconGradient}
                accent={featuredApp.iconAccent}
                size={56}
              />
              <span className="story-dock-meta">
                <span className="story-dock-name">{featuredApp.name}</span>
                <span className="story-dock-sub">{featuredApp.subtitle}</span>
              </span>
            </button>
            <GetActionButton
              app={featuredApp}
              installState={installStates[featuredApp.id]}
              onTrigger={onInstall}
              variant="white-on-dark"
            />
          </div>
        </div>

        <article className="story-article-col">
          <div className="mas-section-divider story-top-divider" />

          <p className="story-prose">
            <strong>{story.leadBold}</strong> {story.leadRest}
          </p>

          <p className="story-prose">
            <strong>{tr('Why it matters:', '핵심 강점:')}</strong> {story.whatWeLove}
          </p>

          <figure className="story-figure">
            <button
              type="button"
              className="story-figure-btn"
              onClick={() => onOpenApp(featuredApp.id)}
              aria-label={tr(`Open ${featuredApp.name} studio`, `${featuredApp.name} 스튜디오 열기`)}
            >
              <VerifiedManifestPreviewCard appId={featuredApp.id} />
            </button>
            <figcaption className="story-figcaption">
              {story.figureCaption}
            </figcaption>
          </figure>

          <p className="story-prose">
            <strong>{tr('Quick tip:', '활용 팁:')}</strong> {story.quickTip}
          </p>
        </article>
      </div>
    </div>
  );
};
