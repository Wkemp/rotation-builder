import { makeId } from './id';
import { liberoTargets, liberoServesFor } from './rotation';

const APP_TAG = 'rotation-builder';
const FORMAT_VERSION = 1;

function slugify(name) {
  return (
    (name || 'export')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'export'
  );
}

function buildPayload(teams, exportType) {
  return {
    app: APP_TAG,
    version: FORMAT_VERSION,
    exportType, // 'team' | 'backup' - informational only, import handles both identically
    exportedAt: new Date().toISOString(),
    teams,
  };
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTeamFile(team) {
  downloadJSON(buildPayload([team], 'team'), `${slugify(team.name)}-rotation-export.json`);
}

export function exportBackupFile(rostersById) {
  const teams = Object.values(rostersById);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadJSON(buildPayload(teams, 'backup'), `rotation-builder-backup-${dateStr}.json`);
}

/** Parses and sanity-checks an imported file's text. Throws a user-readable Error if invalid. */
export function parseImportPayload(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!json || json.app !== APP_TAG || !Array.isArray(json.teams) || json.teams.length === 0) {
    throw new Error("That doesn't look like a Rotation Builder export file.");
  }
  const sample = json.teams[0];
  if (!sample.players || !sample.rotationSets || !sample.activeRotationSetId) {
    throw new Error('The file is missing expected data and may be corrupted.');
  }
  return json;
}

/**
 * Returns a copy of `team` with every id (team, players, rotation sets)
 * freshly generated, and every internal reference (slots, libero targets,
 * activeRotationSetId) rewritten to match. Never trusts ids from the file -
 * imported data always gets a clean, locally-unique identity.
 */
export function remapTeamIds(team) {
  const playerIdMap = {};
  const newPlayers = {};
  for (const oldId of Object.keys(team.players)) {
    const newId = makeId('p');
    playerIdMap[oldId] = newId;
    newPlayers[newId] = { ...team.players[oldId], id: newId };
  }

  const setIdMap = {};
  const newRotationSets = {};
  for (const oldSetId of Object.keys(team.rotationSets)) {
    const newSetId = makeId('set_');
    setIdMap[oldSetId] = newSetId;
    const oldSet = team.rotationSets[oldSetId];
    newRotationSets[newSetId] = {
      ...oldSet,
      id: newSetId,
      slots: oldSet.slots.map((pid) => (pid ? playerIdMap[pid] || null : null)),
      liberos: (oldSet.liberos || []).map((l) => {
        const servesFor = liberoServesFor(l);
        return {
          playerId: playerIdMap[l.playerId] || l.playerId,
          forPlayerIds: liberoTargets(l).map((tid) => playerIdMap[tid] || tid),
          servesForPlayerId: servesFor ? playerIdMap[servesFor] || null : null,
        };
      }),
      substitutions: (oldSet.substitutions || []).map((s) => ({
        ...s,
        id: makeId('sub_'),
        subPlayerId: playerIdMap[s.subPlayerId] || s.subPlayerId,
        forPlayerId: playerIdMap[s.forPlayerId] || s.forPlayerId,
      })),
    };
  }

  return {
    id: makeId('team_'),
    name: team.name,
    players: newPlayers,
    rotationSets: newRotationSets,
    activeRotationSetId: setIdMap[team.activeRotationSetId] || Object.keys(newRotationSets)[0],
  };
}
