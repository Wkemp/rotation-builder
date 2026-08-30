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

  const sideClass = side === 'left' ? 'left-0 popup:border-r' : 'right-0 popup:border-l';

  return (
    <>
      {/* Backdrop - only relevant below the popup breakpoint, where the panel
          overlays the court instead of sitting beside it. popup:hidden means
          it simply doesn't render above that width, since there's nothing to
          dim - the court stays fully visible and interactive alongside it. */}
      <div className="popup:hidden fixed inset-0 z-30 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className={`fixed popup:relative inset-y-0 popup:inset-y-auto ${sideClass} z-40 w-full max-w-sm popup:max-w-none popup:w-96 popup:flex-shrink-0 bg-ink-raised border-ink-line flex flex-col h-full popup:h-auto popup:self-stretch`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ink-line flex-shrink-0">
          <h2 className="font-display text-sm tracking-wide text-chalk uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-chalk-dim hover:text-chalk transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
