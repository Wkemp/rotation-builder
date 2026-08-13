import { useRef, useState } from 'react';
import { Download, Upload, HardDriveDownload } from 'lucide-react';

export default function DataTransfer({ onExportTeam, onExportBackup, onImportFile }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { success, message } | null

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so picking the same file again still fires onChange
    if (!file) return;
    const result = await onImportFile(file);
    setStatus(result);
  }

  const buttonClass =
    'flex items-center gap-1.5 h-11 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors';

  return (
    <div>
      <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2">
        Backup &amp; Sharing
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            onExportTeam();
            setStatus({ success: true, message: 'Team file downloaded.' });
          }}
          className={buttonClass}
        >
          <Download size={14} /> Export this team
        </button>
        <button
          onClick={() => {
            onExportBackup();
            setStatus({ success: true, message: 'Backup file downloaded.' });
          }}
          className={buttonClass}
        >
          <HardDriveDownload size={14} /> Export all teams
        </button>
        <button onClick={() => fileInputRef.current?.click()} className={buttonClass}>
          <Upload size={14} /> Import a file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>
      {status && (
        <p className={`text-xs mt-2 ${status.success ? 'text-chalk-dim' : 'text-serve'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
