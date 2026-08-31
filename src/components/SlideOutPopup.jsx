import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOutPopup({ isOpen, onClose, side, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // The right-side popup needs to sit clear of the icon rail (w-16 = 4rem)
  // when overlaying on a narrow screen, rather than tucking underneath it -
  // offset by the rail's width and shrink to match, both reset back to
  // normal once past the popup breakpoint where it becomes a plain flex
  // child instead (the rail is a separate flex sibling there, no overlap
  // to account for).
  const sideClass =
    side === 'left'
      ? 'left-0 popup:border-r w-full'
      : 'right-16 popup:right-0 popup:border-l w-[calc(100%-4rem)]';

  return (
    <>
      {/* Backdrop - only relevant below the popup breakpoint, where the panel
          overlays the court instead of sitting beside it. popup:hidden means
          it simply doesn't render above that width, since there's nothing to
          dim - the court stays fully visible and interactive alongside it. */}
      <div className="popup:hidden fixed inset-0 z-30 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className={`fixed popup:relative inset-y-0 popup:inset-y-auto ${sideClass} z-40 max-w-sm popup:max-w-none popup:w-96 popup:flex-shrink-0 bg-ink-raised border-ink-line flex flex-col h-full popup:h-auto popup:self-stretch`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ink-line flex-shrink-0">
          <h2 className="font-display text-sm tracking-wide text-chalk uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 -m-1.5 rounded-full text-chalk-dim hover:text-chalk hover:bg-ink transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
