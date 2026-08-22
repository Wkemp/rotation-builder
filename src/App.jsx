import { useState, useEffect } from 'react';
import { Printer, Tag, RotateCcw, Maximize2, Minimize2, MapPin, RotateCw, Layers, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import CourtDiagram from './components/CourtDiagram';
import RotationSelector from './components/RotationSelector';
import RosterPanel from './components/RosterPanel';
import CheatSheet from './components/CheatSheet';
import ServeOrderSheet from './components/ServeOrderSheet';
import EntitySwitcher from './components/EntitySwitcher';
import DataTransfer from './components/DataTransfer';
import ZonesInfo from './components/info/ZonesInfo';
import RotationsInfo from './components/info/RotationsInfo';
import SystemsInfo from './components/info/SystemsInfo';
import HowToInfo from './components/info/HowToInfo';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createInitialAppData, createEmptyRoster, createEmptyRotationSet, nextDefaultName } from './lib/appData';
import { formationKey } from './lib/rotation';
import { makeId } from './lib/id';
import { exportTeamFile, exportBackupFile, parseImportPayload, remapTeamIds } from './lib/fileTransfer';

const INFO_TABS = [
  { id: 'zones', label: 'Zones', icon: MapPin, Component: ZonesInfo },
  { id: 'rotations', label: 'Rotations', icon: RotateCw, Component: RotationsInfo },
  { id: 'systems', label: 'Systems', icon: Layers, Component: SystemsInfo },
  { id: 'howto', label: 'How To', icon: HelpCircle, Component: HowToInfo },
];

export default function App() {
  const [appData, setAppData] = useLocalStorage('rb.data', createInitialAppData);
  const [showZoneLabels, setShowZoneLabels] = useLocalStorage('rb.zoneLabels', true);
  const [startRotation, setStartRotation] = useLocalStorage('rb.startRotation', 1);
  const [current, setCurrent] = useState(1);
  const [view, setView] = useState('court'); // 'court' | 'cheatsheet' | 'serveorder'
  const [serveState, setServeState] = useState('base'); // 'base' | 'serve' | 'receive'
  const [editingFormation, setEditingFormation] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false); // receive -> switch (playing position)
  const [infoTab, setInfoTab] = useState(null); // null | 'zones' | 'rotations' | 'systems' | 'howto'
  const [infoBarOpen, setInfoBarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // While full screen: lock body scroll, and let Escape exit it - both
  // standard expectations for a "full screen" mode.
  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsFullscreen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const activeRoster = appData.rosters[appData.activeRosterId];
  const activeSet = activeRoster.rotationSets[activeRoster.activeRotationSetId];
  // Older saved rotation sets (before this feature existed) won't have this field yet.
  const substitutions = activeSet.substitutions || [];
  const substitutionServers = activeSet.substitutionServers || {};
  const formations = activeSet.formations || {};
  const rotationNotes = activeSet.rotationNotes || {};

  // --- Roster (team) level ---

  function switchRoster(id) {
    setAppData((prev) => ({ ...prev, activeRosterId: id }));
  }

  function createRoster() {
    const roster = createEmptyRoster(nextDefaultName(appData.rosters, 'New Team'));
    setAppData((prev) => ({
      rosters: { ...prev.rosters, [roster.id]: roster },
      activeRosterId: roster.id,
    }));
    setCurrent(1);
  }

  function renameRoster(id, name) {
    setAppData((prev) => ({
      ...prev,
      rosters: { ...prev.rosters, [id]: { ...prev.rosters[id], name } },
    }));
  }

  function deleteRoster(id) {
    setAppData((prev) => {
      const ids = Object.keys(prev.rosters);
      if (ids.length <= 1) return prev;
      const nextRosters = { ...prev.rosters };
      delete nextRosters[id];
      const nextActive = prev.activeRosterId === id ? ids.find((r) => r !== id) : prev.activeRosterId;
      return { rosters: nextRosters, activeRosterId: nextActive };
    });
  }

  // Generic patch helper for "change something on the active roster"
  function updateActiveRoster(patch) {
    setAppData((prev) => ({
      ...prev,
      rosters: {
        ...prev.rosters,
        [prev.activeRosterId]: { ...prev.rosters[prev.activeRosterId], ...patch },
      },
    }));
  }

  const setPlayers = (players) => updateActiveRoster({ players });

  // --- Rotation set level (nested under the active roster) ---

  function switchRotationSet(id) {
    updateActiveRoster({ activeRotationSetId: id });
    setCurrent(1);
  }

  function createRotationSet() {
    const set = createEmptyRotationSet(nextDefaultName(activeRoster.rotationSets, 'New Lineup'));
    updateActiveRoster({
      rotationSets: { ...activeRoster.rotationSets, [set.id]: set },
      activeRotationSetId: set.id,
    });
    setCurrent(1);
  }

  function duplicateRotationSet(id) {
    const source = activeRoster.rotationSets[id];
    const copy = {
      ...source,
      id: makeId('set_'),
      name: nextDefaultName(activeRoster.rotationSets, `${source.name} copy`),
    };
    updateActiveRoster({
      rotationSets: { ...activeRoster.rotationSets, [copy.id]: copy },
      activeRotationSetId: copy.id,
    });
    setCurrent(1);
  }

  function renameRotationSet(id, name) {
    updateActiveRoster({
      rotationSets: {
        ...activeRoster.rotationSets,
        [id]: { ...activeRoster.rotationSets[id], name },
      },
    });
  }

  function deleteRotationSet(id) {
    const ids = Object.keys(activeRoster.rotationSets);
    if (ids.length <= 1) return;
    const nextSets = { ...activeRoster.rotationSets };
    delete nextSets[id];
    const nextActiveSetId =
      activeRoster.activeRotationSetId === id ? ids.find((s) => s !== id) : activeRoster.activeRotationSetId;
    updateActiveRoster({ rotationSets: nextSets, activeRotationSetId: nextActiveSetId });
  }

  function updateActiveRotationSet(patch) {
    updateActiveRoster({
      rotationSets: {
        ...activeRoster.rotationSets,
        [activeRoster.activeRotationSetId]: { ...activeSet, ...patch },
      },
    });
  }

  const setSlots = (slots) => updateActiveRotationSet({ slots });
  const setLiberos = (liberos) => updateActiveRotationSet({ liberos });
  const setSubstitutions = (subs) => updateActiveRotationSet({ substitutions: subs });
  const setSubstitutionServers = (servers) => updateActiveRotationSet({ substitutionServers: servers });

  // --- Serve/receive formations ---

  function placeFormationPlayer(rotationNum, state, slotIndex, gridCell) {
    const key = formationKey(rotationNum, state);
    const existing = formations[key] || [null, null, null, null, null, null];
    const next = [...existing];
    next[slotIndex] = gridCell;
    updateActiveRotationSet({ formations: { ...formations, [key]: next } });
  }

  function resetFormation(rotationNum, state) {
    const key = formationKey(rotationNum, state);
    const next = { ...formations };
    delete next[key];
    updateActiveRotationSet({ formations: next });
  }

  // Which formation state is actually being edited right now - normally
  // matches the Base/Serving/Receiving toggle, except when the Switch
  // overlay is active on Receiving, which edits a separate "playing
  // position" formation layered on top of the receive formation.
  const formationEditState = showSwitch && serveState === 'receive' ? 'receive-switch' : serveState;

  // --- Rotation notes ---

  function updateRotationNote(rotationNum, text) {
    const next = { ...rotationNotes };
    if (text) {
      next[rotationNum] = text;
    } else {
      delete next[rotationNum]; // empty note - don't keep clutter in storage
    }
    updateActiveRotationSet({ rotationNotes: next });
  }

  // --- File export/import ---

  function handleExportTeam() {
    exportTeamFile(activeRoster);
  }

  function handleExportBackup() {
    exportBackupFile(appData.rosters);
  }

  async function handleImportFile(file) {
    try {
      const text = await file.text();
      const payload = parseImportPayload(text); // throws a friendly Error if invalid

      const nextRosters = { ...appData.rosters };
      const importedNames = [];
      let firstNewId = null;
      for (const rawTeam of payload.teams) {
        const remapped = remapTeamIds(rawTeam);
        remapped.name = nextDefaultName(nextRosters, remapped.name);
        nextRosters[remapped.id] = remapped;
        importedNames.push(remapped.name);
        if (!firstNewId) firstNewId = remapped.id;
      }

      setAppData({ rosters: nextRosters, activeRosterId: firstNewId });
      setCurrent(1);

      const label = importedNames.length === 1 ? `"${importedNames[0]}"` : `${importedNames.length} teams`;
      return { success: true, message: `Imported ${label}.` };
    } catch (err) {
      return { success: false, message: err.message || 'Import failed.' };
    }
  }

  return (
    <div className="min-h-screen bg-ink text-chalk font-body pb-10">
      <header className="border-b border-ink-line print:hidden">
        <div className="max-w-[88rem] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gold/90 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0 max-w-md">
            <EntitySwitcher
              items={appData.rosters}
              activeId={appData.activeRosterId}
              onSwitch={switchRoster}
              onCreate={createRoster}
              onRename={renameRoster}
              onDelete={deleteRoster}
              label="Team"
            />
          </div>
          <div className="flex items-center gap-1 bg-ink-raised rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => {
                setView('court');
                setInfoTab(null);
              }}
              className={`h-9 px-3 rounded text-sm font-medium transition-colors ${
                view === 'court' && !infoTab ? 'bg-gold text-ink' : 'text-chalk-dim'
              }`}
            >
              Court
            </button>
            <button
              onClick={() => {
                setView('cheatsheet');
                setInfoTab(null);
              }}
              className={`h-9 px-3 rounded text-sm font-medium transition-colors ${
                view === 'cheatsheet' && !infoTab ? 'bg-gold text-ink' : 'text-chalk-dim'
              }`}
            >
              Cheat Sheet
            </button>
            <button
              onClick={() => {
                setView('serveorder');
                setInfoTab(null);
              }}
              className={`h-9 px-3 rounded text-sm font-medium transition-colors ${
                view === 'serveorder' && !infoTab ? 'bg-gold text-ink' : 'text-chalk-dim'
              }`}
            >
              Serve Order
            </button>
          </div>
        </div>

        <div className="border-t border-ink-line">
          <button
            onClick={() => setInfoBarOpen(!infoBarOpen)}
            className="w-full max-w-[88rem] mx-auto flex items-center justify-between gap-1.5 px-4 py-2 text-xs font-medium text-chalk-dim hover:text-chalk transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={14} /> Help &amp; Reference
            </span>
            {infoBarOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {infoBarOpen && (
            <div className="max-w-[88rem] mx-auto flex items-center gap-1.5 px-4 pb-3 overflow-x-auto">
              {INFO_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = infoTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInfoTab(active ? null : tab.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 flex-shrink-0 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-gold text-ink border-gold'
                        : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {infoTab ? (
        <main className="max-w-2xl mx-auto p-4">
          {(() => {
            const ActiveInfo = INFO_TABS.find((t) => t.id === infoTab)?.Component;
            return ActiveInfo ? <ActiveInfo /> : null;
          })()}
        </main>
      ) : view === 'court' ? (
        <main className="max-w-[88rem] mx-auto p-4 panels:flex panels:gap-6 panels:items-start">
          <section className="max-w-md mx-auto panels:flex-[0_1_28rem] panels:max-w-md panels:mx-0 space-y-5 mb-6 panels:mb-0">
            <RosterPanel
              roster={activeRoster.players}
              setRoster={setPlayers}
              slots={activeSet.slots}
              setSlots={setSlots}
              liberos={activeSet.liberos}
              setLiberos={setLiberos}
              substitutions={substitutions}
              setSubstitutions={setSubstitutions}
              substitutionServers={substitutionServers}
              setSubstitutionServers={setSubstitutionServers}
              rotationSets={activeRoster.rotationSets}
              activeRotationSetId={activeRoster.activeRotationSetId}
              onSwitchRotationSet={switchRotationSet}
              onCreateRotationSet={createRotationSet}
              onDuplicateRotationSet={duplicateRotationSet}
              onRenameRotationSet={renameRotationSet}
              onDeleteRotationSet={deleteRotationSet}
            />
          </section>

          <section className="max-w-4xl mx-auto panels:flex-[1_1_56rem] panels:max-w-4xl panels:mx-0">
            <div
              className={
                isFullscreen
                  ? 'fixed inset-0 z-50 bg-ink overflow-y-auto pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]'
                  : 'bg-ink-raised/40 border border-ink-line rounded-xl overflow-hidden mb-5'
              }
            >
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-ink-line">
                <span className="font-display text-xs tracking-widest text-chalk-dim uppercase">
                  Court
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    aria-pressed={isFullscreen}
                    title={isFullscreen ? 'Exit full screen' : 'Full screen'}
                    className={`flex items-center justify-center w-11 h-11 rounded-full border transition-colors ${
                      isFullscreen
                        ? 'bg-gold text-ink border-gold'
                        : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                    }`}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={() => setShowZoneLabels(!showZoneLabels)}
                    aria-pressed={showZoneLabels}
                    className={`flex items-center gap-1.5 h-11 px-3 rounded-full text-sm font-medium border transition-colors ${
                      showZoneLabels
                        ? 'bg-gold text-ink border-gold'
                        : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                    }`}
                  >
                    <Tag size={16} />
                    Zones
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-ink-line flex-wrap">
                <RotationSelector
                  current={current}
                  startRotation={startRotation}
                  onSelect={setCurrent}
                  onSetStart={setStartRotation}
                />
                <div className="flex items-center gap-1 bg-ink rounded-lg p-1">
                  {[
                    { key: 'base', label: 'Base' },
                    { key: 'serve', label: 'Serving' },
                    { key: 'receive', label: 'Receiving' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setServeState(opt.key);
                        if (opt.key === 'base') setEditingFormation(false);
                        if (opt.key !== 'receive') setShowSwitch(false);
                      }}
                      className={`h-9 px-3 rounded text-sm font-medium transition-colors ${
                        serveState === opt.key ? 'bg-gold text-ink' : 'text-chalk-dim'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {serveState !== 'base' && (
                <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-b border-ink-line flex-wrap">
                  {serveState === 'receive' && (
                    <button
                      onClick={() => setShowSwitch(!showSwitch)}
                      aria-pressed={showSwitch}
                      title="Show playing positions after the switch, instead of the legal court positions at serve contact"
                      className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        showSwitch
                          ? 'bg-gold text-ink border-gold'
                          : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                      }`}
                    >
                      Switch
                    </button>
                  )}
                  <button
                    onClick={() => resetFormation(current, formationEditState)}
                    disabled={!formations[formationKey(current, formationEditState)]}
                    title="Reset this formation to its default"
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <button
                    onClick={() => setEditingFormation(!editingFormation)}
                    aria-pressed={editingFormation}
                    className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      editingFormation
                        ? 'bg-gold text-ink border-gold'
                        : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                    }`}
                  >
                    {editingFormation ? 'Done' : 'Edit'}
                  </button>
                </div>
              )}

              <div className={isFullscreen ? 'p-4 sm:p-8' : 'p-4'}>
                <CourtDiagram
                  rotationNum={current}
                  slots={activeSet.slots}
                  liberos={activeSet.liberos}
                  substitutions={substitutions}
                  substitutionServers={substitutionServers}
                  roster={activeRoster.players}
                  showZoneLabels={showZoneLabels}
                  serveState={serveState}
                  showSwitch={showSwitch}
                  formations={formations}
                  editingFormation={editingFormation && serveState !== 'base'}
                  onPlacePlayer={(slotIndex, gridCell) =>
                    placeFormationPlayer(current, formationEditState, slotIndex, gridCell)
                  }
                  isFullscreen={isFullscreen}
                  onPrevRotation={() => setCurrent(current === 1 ? 6 : current - 1)}
                  onNextRotation={() => setCurrent(current === 6 ? 1 : current + 1)}
                  note={rotationNotes[current] || ''}
                  onUpdateNote={(text) => updateRotationNote(current, text)}
                />
              </div>
            </div>
          </section>
        </main>
      ) : view === 'cheatsheet' ? (
        <main className="max-w-[88rem] mx-auto p-4">
          <button
            onClick={() => window.print()}
            className="mb-4 flex items-center gap-1.5 h-11 bg-gold text-ink rounded-lg px-4 text-sm font-medium hover:bg-gold-dim transition-colors print:hidden"
          >
            <Printer size={16} /> Print cheat sheet
          </button>
          <CheatSheet
            teamName={`${activeRoster.name} — ${activeSet.name}`}
            slots={activeSet.slots}
            liberos={activeSet.liberos}
            substitutions={substitutions}
            substitutionServers={substitutionServers}
            formations={formations}
            rotationNotes={rotationNotes}
            roster={activeRoster.players}
          />
        </main>
      ) : (
        <main className="max-w-[88rem] mx-auto p-4">
          <button
            onClick={() => window.print()}
            className="mb-4 flex items-center gap-1.5 h-11 bg-gold text-ink rounded-lg px-4 text-sm font-medium hover:bg-gold-dim transition-colors print:hidden"
          >
            <Printer size={16} /> Print serve order
          </button>
          <ServeOrderSheet
            teamName={`${activeRoster.name} — ${activeSet.name}`}
            slots={activeSet.slots}
            roster={activeRoster.players}
          />
        </main>
      )}

      <div className="max-w-[88rem] mx-auto px-4 mt-2 print:hidden">
        <DataTransfer
          onExportTeam={handleExportTeam}
          onExportBackup={handleExportBackup}
          onImportFile={handleImportFile}
        />
      </div>

      <p className="max-w-[88rem] mx-auto text-center text-[11px] text-chalk-dim/60 px-4 mt-4 print:hidden">
        Planning tool — always confirm rotations against your league's official rules.
      </p>
    </div>
  );
}
