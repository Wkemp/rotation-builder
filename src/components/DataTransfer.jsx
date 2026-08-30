import { useState, useRef } from 'react';
import { Download, Upload, FileArchive } from 'lucide-react';

export default function DataTransfer({ onExportTeam, onExportBackup, onImport, activeTeamName }) {
  const [status, setStatus] = useState(null); // { type: 'ok'|'error', message }
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = onImport(text);
      setStatus({ type: 'ok', message: result || 'Team imported successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not import that file.' });
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2">
          Export
        </h3>
        <div className="space-y-2">
          <button
            onClick={onExportTeam}
            className="w-full flex items-center gap-2 h-11 px-3 rounded-lg bg-ink-raised border border-ink-line text-sm text-chalk hover:border-gold/50 transition-colors"
          >
            <Download size={16} />
            Export "{activeTeamName}" only
          </button>
          <button
            onClick={onExportBackup}
            className="w-full flex items-center gap-2 h-11 px-3 rounded-lg bg-ink-raised border border-ink-line text-sm text-chalk hover:border-gold/50 transition-colors"
          >
            <FileArchive size={16} />
            Export all teams (full backup)
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2">
          Import
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2 h-11 px-3 rounded-lg bg-ink-raised border border-ink-line text-sm text-chalk hover:border-gold/50 transition-colors"
        >
          <Upload size={16} />
          Choose a file to import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-[11px] text-chalk-dim mt-1.5">
          Importing always adds new team(s) — it never overwrites anything already on this device.
        </p>
      </div>

      {status && (
        <p className={`text-sm ${status.type === 'ok' ? 'text-gold' : 'text-serve'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
