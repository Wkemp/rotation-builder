import { makeId, makePlayerId } from './id';

export function exportTeamFile(team) {
  const payload = { app: 'rotation-builder', version: 1, exportType: 'team', teams: [team] };
  downloadJson(payload, `${slugify(team.name)}-team.json`);
}

export function exportBackupFile(appData) {
  const teams = Object.values(appData.rosters);
  const payload = { app: 'rotation-builder', version: 1, exportType: 'backup', teams };
  downloadJson(payload, `rotation-builder-backup.json`);
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(name) {
  return (name || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function parseImportPayload(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.teams)) {
    throw new Error("This file doesn't look like a Rotation Builder export.");
  }
  return data;
}

/** Remaps every id in an imported team to fresh local ids, so importing
 * never collides with anything already on this device. */
export function remapTeamIds(team) {
  const playerIdMap = {};
  const newPlayers = {};
  for (const player of Object.values(team.players || {})) {
    const newId = makePlayerId();
    playerIdMap[player.id] = newId;
    newPlayers[newId] = { ...player, id: newId };
  }

  const newRotationSets = {};
  let newActiveRotationSetId = null;
  for (const oldSet of Object.values(team.rotationSets || {})) {
    const newSetId = makeId('set_');
    if (oldSet.id === team.activeRotationSetId) newActiveRotationSetId = newSetId;

    const newSet = {
      id: newSetId,
      name: oldSet.name,
      slots: (oldSet.slots || []).map((pid) => (pid ? playerIdMap[pid] || null : null)),
      liberos: (oldSet.liberos || []).map((l) => ({
        playerId: playerIdMap[l.playerId] || l.playerId,
        forPlayerIds: (l.forPlayerIds || (l.forPlayerId ? [l.forPlayerId] : [])).map(
          (pid) => playerIdMap[pid] || pid
        ),
        servesForPlayerId: l.servesForPlayerId
          ? playerIdMap[l.servesForPlayerId] || l.servesForPlayerId
          : l.canServe && l.forPlayerId
            ? playerIdMap[l.forPlayerId] || l.forPlayerId
            : null,
      })),
      substitutions: (oldSet.substitutions || []).map((s) => ({
        ...s,
        id: makeId('sub_'),
        subPlayerId: playerIdMap[s.subPlayerId] || s.subPlayerId,
        forPlayerId: playerIdMap[s.forPlayerId] || s.forPlayerId,
      })),
      substitutionServers: Object.fromEntries(
        Object.entries(oldSet.substitutionServers || {}).map(([starterId, serverId]) => [
          playerIdMap[starterId] || starterId,
          playerIdMap[serverId] || serverId,
        ])
      ),
      formations: oldSet.formations || {},
      rotationNotes: oldSet.rotationNotes || {},
    };
    newRotationSets[newSetId] = newSet;
  }

  return {
    id: makeId('team_'),
    name: team.name,
    players: newPlayers,
    rotationSets: newRotationSets,
    activeRotationSetId: newActiveRotationSetId || Object.keys(newRotationSets)[0],
  };
}
