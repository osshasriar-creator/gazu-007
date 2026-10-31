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
    <aside aria-label="Announcement" className="bg-black text-white text-[11px] tracking-widest uppercase border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-neutral-300 text-center sm:text-left flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {currentAnnouncement.text}
        </p>

        <nav aria-label="Quick links" className="flex items-center gap-3 text-neutral-400 text-[10px] tracking-widest font-medium">
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
