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
  let i = 2;
  while (existingNames.has(`${base} ${i}`)) i++;
  return `${base} ${i}`;
}

const OLD_KEYS = ['rb.teamName', 'rb.roster', 'rb.slots', 'rb.liberos'];

function readOldKey(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Builds the initial app state. If pre-multi-roster localStorage keys exist,
 * migrate them into a single roster ("My Team" / whatever the old team name
 * was) with one rotation set ("Default") so existing data isn't lost.
 * Otherwise start fresh with one empty roster.
 */
export function createInitialAppData() {
  const oldTeamName = readOldKey('rb.teamName');
  const oldRoster = readOldKey('rb.roster');
  const oldSlots = readOldKey('rb.slots');
  const oldLiberos = readOldKey('rb.liberos');
  const hasOldData = oldTeamName || oldRoster || oldSlots || oldLiberos;

  if (hasOldData) {
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
    const roster = {
      id: makeId('team_'),
      name: oldTeamName || 'My Team',
      players: oldRoster || {},
      rotationSets: { [rotationSet.id]: rotationSet },
      activeRotationSetId: rotationSet.id,
    };
    OLD_KEYS.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore - worst case the stale key just sits there unused
      }
    });
    return { rosters: { [roster.id]: roster }, activeRosterId: roster.id };
  }

  const roster = createEmptyRoster('My Team');
  return { rosters: { [roster.id]: roster }, activeRosterId: roster.id };
}
