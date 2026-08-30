import { useState, useEffect } from 'react';
import {
  Printer,
  Tag,
  RotateCcw,
  Maximize2,
  Minimize2,
  Users as UsersIcon,
} from 'lucide-react';
import CourtDiagram from './components/CourtDiagram';
import RotationSelector from './components/RotationSelector';
import CheatSheet from './components/CheatSheet';
import ServeOrderSheet from './components/ServeOrderSheet';
import SlideOutPopup from './components/SlideOutPopup';
import LeftPanelContent from './components/LeftPanelContent';
import RightMenu, { MENU_ITEMS } from './components/RightMenu';
import HelpContent from './components/HelpContent';
import DataTransfer from './components/DataTransfer';
import RosterEditor from './components/editors/RosterEditor';
import LineupEditor from './components/editors/LineupEditor';
import LiberoEditor from './components/editors/LiberoEditor';
import SubsEditor from './components/editors/SubsEditor';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createInitialAppData, createEmptyRoster, createEmptyRotationSet, nextDefaultName } from './lib/appData';
import { formationKey } from './lib/rotation';
import { makeId, makePlayerId } from './lib/id';
import { exportTeamFile, exportBackupFile, parseImportPayload, remapTeamIds } from './lib/fileTransfer';

export default function App() {
  const [appData, setAppData] = useLocalStorage('rb.data', createInitialAppData);

  const [current, setCurrent] = useState(1);
  const [startRotation, setStartRotation] = useState(1);
  const [showZoneLabels, setShowZoneLabels] = useState(false);
  const [serveState, setServeState] = useState('base');
  const [editingFormation, setEditingFormation] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  function openLeftPanel() {
    setActivePopup(null);
    setLeftPanelOpen(true);
  }

  function handleMenuSelect(id) {
    setLeftPanelOpen(false);
    setActivePopup(id);
  }

  function closePopups() {
    setLeftPanelOpen(false);
    setActivePopup(null);
  }

  useEffect(() => {
    if (isFullscreen) closePopups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

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
  const substitutions = activeSet.substitutions || [];
  const substitutionServers = activeSet.substitutionServers || {};
  const formations = activeSet.formations || {};
  const rotationNotes = activeSet.rotationNotes || {};

  function updateActiveRotationSet(patch) {
    setAppData((prev) => {
      const roster = prev.rosters[prev.activeRosterId];
      const set = roster.rotationSets[roster.activeRotationSetId];
      const nextSet = { ...set, ...patch };
      return {
        ...prev,
        rosters: {
          ...prev.rosters,
          [roster.id]: {
            ...roster,
            rotationSets: { ...roster.rotationSets, [set.id]: nextSet },
          },
        },
      };
    });
  }

  function updateActiveRoster(patch) {
    setAppData((prev) => ({
      ...prev,
      rosters: { ...prev.rosters, [prev.activeRosterId]: { ...prev.rosters[prev.activeRosterId], ...patch } },
    }));
  }

  function switchRoster(id) {
    setAppData((prev) => ({ ...prev, activeRosterId: id }));
  }
  function createRoster() {
    const name = nextDefaultName(appData.rosters, 'New Team');
    const team = createEmptyRoster(name);
    setAppData((prev) => ({
      rosters: { ...prev.rosters, [team.id]: team },
      activeRosterId: team.id,
    }));
  }
  function renameRoster(id, name) {
    setAppData((prev) => ({
      ...prev,
      rosters: { ...prev.rosters, [id]: { ...prev.rosters[id], name } },
    }));
  }
  function deleteRoster(id) {
    setAppData((prev) => {
      const next = { ...prev.rosters };
      delete next[id];
      const activeRosterId = prev.activeRosterId === id ? Object.keys(next)[0] : prev.activeRosterId;
      return { rosters: next, activeRosterId };
    });
  }

  function addPlayer({ number, name, position }) {
    const id = makePlayerId();
    updateActiveRoster({ players: { ...activeRoster.players, [id]: { id, number, name, position } } });
  }
  function updatePlayer(id, patch) {
    updateActiveRoster({
      players: { ...activeRoster.players, [id]: { ...activeRoster.players[id], ...patch } },
    });
  }
  function removePlayer(id) {
    const nextPlayers = { ...activeRoster.players };
    delete nextPlayers[id];
    updateActiveRoster({ players: nextPlayers });
    const nextSlots = activeSet.slots.map((pid) => (pid === id ? null : pid));
    const nextLiberos = (activeSet.liberos || [])
      .map((l) => ({
        ...l,
        forPlayerIds: (l.forPlayerIds || []).filter((pid) => pid !== id),
        servesForPlayerId: l.servesForPlayerId === id ? null : l.servesForPlayerId,
      }))
      .filter((l) => l.playerId !== id);
    const nextSubs = substitutions.filter((s) => s.subPlayerId !== id && s.forPlayerId !== id);
    const nextServers = { ...substitutionServers };
    delete nextServers[id];
    for (const starterId of Object.keys(nextServers)) {
      if (nextServers[starterId] === id) delete nextServers[starterId];
    }
    updateActiveRotationSet({
      slots: nextSlots,
      liberos: nextLiberos,
      substitutions: nextSubs,
      substitutionServers: nextServers,
    });
  }

  function switchRotationSet(id) {
    updateActiveRoster({ activeRotationSetId: id });
  }
  function createRotationSet() {
    const name = nextDefaultName(activeRoster.rotationSets, 'New Lineup');
    const set = createEmptyRotationSet(name);
    updateActiveRoster({
      rotationSets: { ...activeRoster.rotationSets, [set.id]: set },
      activeRotationSetId: set.id,
    });
  }
  function duplicateRotationSet(id) {
    const source = activeRoster.rotationSets[id];
    const name = nextDefaultName(activeRoster.rotationSets, `${source.name} Copy`);
    const copy = { ...source, id: makeId('set_'), name };
    updateActiveRoster({
      rotationSets: { ...activeRoster.rotationSets, [copy.id]: copy },
      activeRotationSetId: copy.id,
    });
  }
  function renameRotationSet(id, name) {
    updateActiveRoster({
      rotationSets: { ...activeRoster.rotationSets, [id]: { ...activeRoster.rotationSets[id], name } },
    });
  }
  function deleteRotationSet(id) {
    const next = { ...activeRoster.rotationSets };
    delete next[id];
    const activeRotationSetId =
      activeRoster.activeRotationSetId === id ? Object.keys(next)[0] : activeRoster.activeRotationSetId;
    updateActiveRoster({ rotationSets: next, activeRotationSetId });
  }

  const setSlots = (slots) => updateActiveRotationSet({ slots });
  const setLiberos = (liberos) => updateActiveRotationSet({ liberos });
  const setSubstitutions = (subs) => updateActiveRotationSet({ substitutions: subs });
  const setSubstitutionServers = (servers) => updateActiveRotationSet({ substitutionServers: servers });

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
  const formationEditState = showSwitch && serveState === 'receive' ? 'receive-switch' : serveState;

  function updateRotationNote(rotationNum, text) {
    const next = { ...rotationNotes };
    if (text) next[rotationNum] = text;
    else delete next[rotationNum];
    updateActiveRotationSet({ rotationNotes: next });
  }

  function handleExportTeam() {
    exportTeamFile(activeRoster);
  }
  function handleExportBackup() {
    exportBackupFile(appData);
  }
  function handleImport(text) {
    const data = parseImportPayload(text);
    const imported = data.teams.map(remapTeamIds);
    setAppData((prev) => {
      const nextRosters = { ...prev.rosters };
      for (const team of imported) nextRosters[team.id] = team;
      return { rosters: nextRosters, activeRosterId: imported[0]?.id || prev.activeRosterId };
    });
    return `Imported ${imported.length} team${imported.length === 1 ? '' : 's'}.`;
  }

  const activeMenuItem = MENU_ITEMS.find((m) => m.id === activePopup);
  const popupTitle =
    activePopup === 'serveorder' ? 'Serve Order' : activeMenuItem ? activeMenuItem.label : '';

  const serveStateButtons = (
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
  );

  const courtDiagramProps = {
    rotationNum: current,
    slots: activeSet.slots,
    liberos: activeSet.liberos,
    substitutions,
    substitutionServers,
    roster: activeRoster.players,
    showZoneLabels,
    serveState,
    showSwitch,
    formations,
    editingFormation: editingFormation && serveState !== 'base',
    onPlacePlayer: (slotIndex, gridCell) => placeFormationPlayer(current, formationEditState, slotIndex, gridCell),
    onPrevRotation: () => setCurrent(current === 1 ? 6 : current - 1),
    onNextRotation: () => setCurrent(current === 6 ? 1 : current + 1),
    note: rotationNotes[current] || '',
    onUpdateNote: (text) => updateRotationNote(current, text),
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink text-chalk">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-ink-line flex-shrink-0">
        <img
          src={`${import.meta.env.BASE_URL}icons/logo-header.png`}
          alt=""
          className="w-8 h-8 rounded flex-shrink-0"
          aria-hidden="true"
        />
        <button
          onClick={() => (leftPanelOpen ? setLeftPanelOpen(false) : openLeftPanel())}
          aria-pressed={leftPanelOpen}
          aria-label="Team and lineup"
          className={`flex items-center gap-1.5 h-11 px-3 rounded-lg text-sm font-medium border transition-colors flex-shrink-0 ${
            leftPanelOpen
              ? 'bg-gold text-ink border-gold'
              : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
          }`}
        >
          <UsersIcon size={18} />
        </button>
        {!leftPanelOpen && (
          <span className="text-sm text-chalk-dim truncate min-w-0">
            {activeRoster.name} <span className="text-chalk-dim/50">—</span> {activeSet.name}
          </span>
        )}
        <div className="flex-1" />
        <RightMenu onSelect={handleMenuSelect} />
      </header>

      <div className="flex flex-1 min-h-0 popup:items-stretch relative">
        <SlideOutPopup isOpen={leftPanelOpen} onClose={() => setLeftPanelOpen(false)} side="left" title="Team & Lineup">
          <LeftPanelContent
            rosters={appData.rosters}
            activeRosterId={appData.activeRosterId}
            onSwitchRoster={switchRoster}
            onCreateRoster={createRoster}
            onRenameRoster={renameRoster}
            onDeleteRoster={deleteRoster}
            rotationSets={activeRoster.rotationSets}
            activeRotationSetId={activeRoster.activeRotationSetId}
            onSwitchRotationSet={switchRotationSet}
            onCreateRotationSet={createRotationSet}
            onDuplicateRotationSet={duplicateRotationSet}
            onRenameRotationSet={renameRotationSet}
            onDeleteRotationSet={deleteRotationSet}
            players={activeRoster.players}
            slots={activeSet.slots}
            onShowServeOrder={() => {
              setLeftPanelOpen(false);
              setActivePopup('serveorder');
            }}
          />
        </SlideOutPopup>

        <main className="flex-1 min-w-0 overflow-y-auto p-4">
          <section className="max-w-4xl mx-auto">
            <div className="bg-ink-raised/40 border border-ink-line rounded-xl overflow-hidden mb-5">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-ink-line">
                <span className="font-display text-xs tracking-widest text-chalk-dim uppercase">
                  Court
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    title="Full screen"
                    className="flex items-center justify-center w-11 h-11 rounded-full border bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk transition-colors"
                  >
                    <Maximize2 size={16} />
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
                {serveStateButtons}
              </div>

              {serveState !== 'base' && (
                <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-b border-ink-line flex-wrap">
                  {serveState === 'receive' && (
                    <button
                      onClick={() => setShowSwitch(!showSwitch)}
                      aria-pressed={showSwitch}
                      title="Show playing positions after the switch"
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

              <div className="p-4">
                <CourtDiagram {...courtDiagramProps} isFullscreen={false} />
              </div>
            </div>
          </section>
        </main>

        <SlideOutPopup isOpen={!!activePopup} onClose={() => setActivePopup(null)} side="right" title={popupTitle}>
          {activePopup === 'roster' && (
            <RosterEditor
              players={activeRoster.players}
              onAddPlayer={addPlayer}
              onUpdatePlayer={updatePlayer}
              onRemovePlayer={removePlayer}
            />
          )}
          {activePopup === 'lineup' && (
            <LineupEditor
              rotationSets={activeRoster.rotationSets}
              activeRotationSetId={activeRoster.activeRotationSetId}
              onSwitchRotationSet={switchRotationSet}
              onCreateRotationSet={createRotationSet}
              onDuplicateRotationSet={duplicateRotationSet}
              onRenameRotationSet={renameRotationSet}
              onDeleteRotationSet={deleteRotationSet}
              players={activeRoster.players}
              slots={activeSet.slots}
              liberos={activeSet.liberos}
              onUpdateSlots={setSlots}
            />
          )}
          {activePopup === 'libero' && (
            <LiberoEditor
              players={activeRoster.players}
              slots={activeSet.slots}
              liberos={activeSet.liberos}
              onUpdateLiberos={setLiberos}
            />
          )}
          {activePopup === 'subs' && (
            <SubsEditor
              players={activeRoster.players}
              slots={activeSet.slots}
              liberos={activeSet.liberos}
              substitutions={substitutions}
              substitutionServers={substitutionServers}
              onUpdateSubstitutions={setSubstitutions}
              onUpdateSubstitutionServers={setSubstitutionServers}
            />
          )}
          {activePopup === 'importexport' && (
            <DataTransfer
              activeTeamName={activeRoster.name}
              onExportTeam={handleExportTeam}
              onExportBackup={handleExportBackup}
              onImport={handleImport}
            />
          )}
          {activePopup === 'cheatsheet' && (
            <div className="bg-white rounded-lg p-2 -m-2">
              <button
                onClick={() => window.print()}
                className="mb-3 flex items-center gap-1.5 h-10 bg-gold text-ink rounded-lg px-3 text-sm font-medium hover:bg-gold-dim transition-colors print:hidden"
              >
                <Printer size={16} /> Print
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
            </div>
          )}
          {activePopup === 'serveorder' && (
            <div className="bg-white rounded-lg p-2 -m-2">
              <button
                onClick={() => window.print()}
                className="mb-3 flex items-center gap-1.5 h-10 bg-gold text-ink rounded-lg px-3 text-sm font-medium hover:bg-gold-dim transition-colors print:hidden"
              >
                <Printer size={16} /> Print
              </button>
              <ServeOrderSheet
                teamName={`${activeRoster.name} — ${activeSet.name}`}
                slots={activeSet.slots}
                roster={activeRoster.players}
              />
            </div>
          )}
          {activePopup === 'howto' && <HelpContent />}
        </SlideOutPopup>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-ink overflow-y-auto pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]">
          <div className="bg-ink-raised/40 border border-ink-line overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-ink-line">
              <span className="font-display text-xs tracking-widest text-chalk-dim uppercase">
                Court
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(false)}
                  title="Exit full screen"
                  className="flex items-center justify-center w-11 h-11 rounded-full border bg-gold text-ink border-gold transition-colors"
                >
                  <Minimize2 size={16} />
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
              {serveStateButtons}
            </div>

            <div className="p-4 sm:p-8">
              <CourtDiagram {...courtDiagramProps} isFullscreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
