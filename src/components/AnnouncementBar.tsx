import React from 'react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';

export const AnnouncementBar: React.FC = () => {
  const { setIsAppDownloadOpen, setIsTrackOrderOpen, setIsHelpOpen, siteSettings } = useStore();
  const currentAnnouncement = siteSettings?.announcement || siteConfig.announcement;

  const handleAction = (actionId: string) => {
    if (actionId === 'app') setIsAppDownloadOpen(true);
    if (actionId === 'track') setIsTrackOrderOpen(true);
    if (actionId === 'help') setIsHelpOpen(true);
  };

  return (
    <aside aria-label="Announcement" className="bg-black text-white text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-widest uppercase border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
        <p className="font-medium text-neutral-200 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2 min-w-0 max-w-full leading-snug">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="truncate sm:whitespace-normal">{currentAnnouncement.text}</span>
        </p>

        <nav aria-label="Quick links" className="hidden sm:flex items-center gap-3 text-neutral-400 text-[10px] tracking-widest font-medium shrink-0">
          {siteConfig.announcement.links.map((link, idx) => (
            <React.Fragment key={link.label}>
              {idx > 0 && <span className="text-neutral-600 select-none">|</span>}
              <button
                type="button"
                onClick={() => handleAction(link.actionId)}
                className="hover:text-white transition-colors cursor-pointer py-0.5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
              >
                {link.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </aside>
  );
};

