import React from 'react';
import { ChevronLeft, Share } from 'lucide-react';
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
  return (
    <div className="story-reader-window">
      <div className="story-reader-topbar">
        <button
          type="button"
          className="mas-circle-nav-btn"
          onClick={onBack}
          title="Back"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="mas-circle-nav-btn"
          onClick={onShare}
          title="Copy Link"
        >
          <Share size={15} />
        </button>
      </div>

      <div className="story-reader-body">
        <div className="story-poster-col" style={{ position: 'sticky' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <EditorialHeroArt
              styleType={story.illustrationStyle}
              bg={story.heroBg}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background:
                'linear-gradient(180deg, rgba(6, 26, 38, 0.72) 0%, rgba(6, 26, 38, 0.28) 38%, rgba(6, 26, 38, 0.45) 100%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
            <div className="t1-eyebrow">{story.eyebrow}</div>
            <h1 className="t1-headline" style={{ fontSize: 30, maxWidth: 360 }}>
              {story.title}
            </h1>
          </div>

          <div
            className="story-dock-pill"
            style={{ position: 'relative', zIndex: 2 }}
            onClick={() => onOpenApp(featuredApp.id)}
            role="button"
            tabIndex={0}
          >
            <BioAppIcon
              glyph={featuredApp.iconGlyph}
              gradient={featuredApp.iconGradient}
              accent={featuredApp.iconAccent}
              size={60}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {featuredApp.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {featuredApp.subtitle}
              </div>
            </div>
            <GetActionButton
              app={featuredApp}
              installState={installStates[featuredApp.id]}
              onTrigger={onInstall}
              variant="white-on-dark"
              hideNote
            />
          </div>
        </div>

        <article className="story-article-col">
          <div
            style={{
              height: 1,
              background: 'var(--divider-hairline)',
              marginBottom: 28,
            }}
          />

          <p className="story-prose">
            <strong>{story.leadBold}</strong> {story.leadRest}
          </p>

          <p className="story-prose">
            <strong>What we love:</strong> {story.whatWeLove}
          </p>

          <figure
            onClick={() => onOpenApp(featuredApp.id)}
            style={{
              margin: '28px 0',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#f5f5f7',
              boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
          >
            <div style={{ minHeight: 170 }}>
              <VerifiedManifestPreviewCard appId={featuredApp.id} />
            </div>
            <figcaption
              style={{
                padding: '12px 18px',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              {story.figureCaption}
            </figcaption>
          </figure>

          <p className="story-prose">
            <strong>Quick tip:</strong> {story.quickTip}
          </p>
        </article>
      </div>
    </div>
  );
};
