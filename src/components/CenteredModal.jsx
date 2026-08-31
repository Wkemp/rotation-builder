import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function CenteredModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-ink-raised border border-ink-line rounded-xl w-full max-w-5xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
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
    </div>
  );
}
