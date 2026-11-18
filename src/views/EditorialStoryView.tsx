import React from 'react';
import { ChevronLeft, Share } from 'lucide-react';
import { BioApp, EditorialStory } from '../types/store';
import {
  AppScreenshotArt,
  BioAppIcon,
  EditorialHeroArt,
} from '../components/BioArtwork';
import { GetActionButton, InstallStateMap } from '../components/StorePrimitives';

interface EditorialStoryViewProps {
  story: EditorialStory;
  featuredApp: BioApp;
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onBack: () => void;
  onShare: () => void;
}

/* =========================================================
   FULL-WINDOW 2-COLUMN EDITORIAL STORY READER (22-editorial-story.png)
   ========================================================= */
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
      {/* Top Bar: Traffic lights + Circular Back on left, Share on right */}
      <div className="story-reader-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="mas-traffic-dot close" />
            <span className="mas-traffic-dot minimize" />
            <span className="mas-traffic-dot zoom" />
          </div>
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={onBack}
            title="Back"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <button
          type="button"
          className="mas-circle-nav-btn"
          onClick={onShare}
          title="Share Story"
        >
          <Share size={15} />
        </button>
      </div>

      {/* 2-Column Split: Left Sticky Poster + Frosted App Dock, Right Editorial Article */}
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

          {/* Frosted App Lockup Dock inside bottom of poster */}
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

        {/* Right Scrollable Article Column */}
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

          {/* Inline Figure Card with #F5F5F7 Caption Strip (22-editorial-story.png) */}
          <figure
            style={{
              margin: '28px 0',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#f5f5f7',
              boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ aspectRatio: '16 / 9.6' }}>
              <AppScreenshotArt
                theme={story.figureTheme}
                appName={featuredApp.name}
                accent={featuredApp.iconAccent}
              />
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
