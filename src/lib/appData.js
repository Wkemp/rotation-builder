import { makeId } from './id';

export function createEmptyRotationSet(name = 'Default') {
  return {
    id: makeId('set_'),
    name,
    slots: [null, null, null, null, null, null],
    liberos: [],
    substitutions: [],
    // Which one player (starter's own id, or one of their subs) is
    // authorized to serve for a given starter's substitution group.
    // Keyed by starter playerId; absent = the starter still holds serving
    // rights (nobody's taken them over).
    substitutionServers: {},
    // Serve/receive formations, keyed by "{rotationNum}-{serve|receive}".
    // Each value is an array of 6 entries (index = slot 0-5, i.e. slot 1-6),
    // either null (not customized - falls back to the Base zone-center
    // position) or a { col, row } grid cell.
    formations: {},
    // Free-text coach notes, keyed by rotation number (1-6). One note per
    // rotation, shared across Base/Serving/Receiving views of it.
    rotationNotes: {},
  };
}

export function createEmptyRoster(name = 'My Team') {
  const defaultSet = createEmptyRotationSet('Default');
  return {
    id: makeId('team_'),
    name,
    players: {},
    rotationSets: { [defaultSet.id]: defaultSet },
    activeRotationSetId: defaultSet.id,
  };
}

/** Picks a non-colliding default name: "New Team", then "New Team 2", "New Team 3"... */
export function nextDefaultName(collection, base) {
  const existingNames = new Set(Object.values(collection).map((item) => item.name));
  if (!existingNames.has(base)) return base;
  let n = 2;
  while (existingNames.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}

export function createInitialAppData() {
  // Migrate any pre-existing flat localStorage keys from the very first
  // single-team version of this app, if present.
  const oldTeamName = localStorage.getItem('rb.teamName');
  const oldRosterRaw = localStorage.getItem('rb.roster');
  const oldSlotsRaw = localStorage.getItem('rb.slots');
  const oldLiberosRaw = localStorage.getItem('rb.liberos');

  if (oldTeamName || oldRosterRaw) {
    let oldPlayers = {};
    try {
      const parsed = oldRosterRaw ? JSON.parse(oldRosterRaw) : [];
      for (const p of parsed) oldPlayers[p.id] = p;
    } catch {
      oldPlayers = {};
    }
    let oldSlots = null;
    try {
      oldSlots = oldSlotsRaw ? JSON.parse(oldSlotsRaw) : null;
    } catch {
      oldSlots = null;
    }
    let oldLiberos = [];
    try {
      oldLiberos = oldLiberosRaw ? JSON.parse(oldLiberosRaw) : [];
    } catch {
      oldLiberos = [];
    }

    const rotationSet = {
      id: makeId('set_'),
      name: 'Default',
      slots: oldSlots || [null, null, null, null, null, null],
      liberos: oldLiberos || [],
      substitutions: [],
      substitutionServers: {},
      formations: {},
      rotationNotes: {},
    };
    const team = {
      id: makeId('team_'),
      name: oldTeamName || 'My Team',
      players: oldPlayers,
      rotationSets: { [rotationSet.id]: rotationSet },
      activeRotationSetId: rotationSet.id,
    };
    return { rosters: { [team.id]: team }, activeRosterId: team.id };
  }

  const team = createEmptyRoster('My Team');
  return { rosters: { [team.id]: team }, activeRosterId: team.id };
}
