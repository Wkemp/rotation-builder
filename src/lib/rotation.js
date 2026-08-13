// Volleyball rotation math.
//
// A team's serving order is fixed for the whole set: slots S1..S6, in the
// order they'll serve. What changes each rotation is which court zone each
// slot occupies. Zones are numbered the standard FIVB way:
//
//   4 (LF) | 3 (MF) | 2 (RF)      <- front row (net)
//   5 (LB) | 6 (MB) | 1 (RB/serve) <- back row
//
// In rotation n, slot S_n is serving (zone 1). Every other zone is a fixed
// number of "steps back" from the server in the serving order:
//   zone 1 = 0 steps back, zone 6 = 1, zone 5 = 2, zone 4 = 3, zone 3 = 4, zone 2 = 5
// (zone 2 is always "1 step forward" i.e. the next server - this is the
// well-known volleyball fact that right-front rotates in to serve next.)

export const ZONES = [1, 2, 3, 4, 5, 6];

export const ZONE_LABELS = {
  1: 'RB', 2: 'RF', 3: 'MF', 4: 'LF', 5: 'LB', 6: 'MB',
};

export const ZONE_NAMES = {
  1: 'Right Back (Serving)', 2: 'Right Front', 3: 'Middle Front',
  4: 'Left Front', 5: 'Left Back', 6: 'Middle Back',
};

/** Combined "number · abbreviation" label, e.g. "1 · RB" — used anywhere a zone needs a human label. */
export function zoneLabel(zone) {
  return `${zone} · ${ZONE_LABELS[zone]}`;
}

export const FRONT_ROW_ZONES = [4, 3, 2];
export const BACK_ROW_ZONES = [5, 6, 1];

// Steps "back" from the server (zone 1) for each zone, going backward
// through the serving order.
const STEPS_BACK = { 1: 0, 6: 1, 5: 2, 4: 3, 3: 4, 2: 5 };

/** Which serving-order slot (1-6) occupies `zone` during rotation `rotationNum` (1-6). */
export function slotInZone(rotationNum, zone) {
  const idx = ((rotationNum - 1 - STEPS_BACK[zone]) % 6 + 6) % 6;
  return idx + 1;
}

/** Full zone -> slot map for a given rotation number. */
export function lineupForRotation(rotationNum) {
  const map = {};
  for (const z of ZONES) map[z] = slotInZone(rotationNum, z);
  return map;
}

/** Inverse of lineupForRotation: which zone (1-6) a given slot occupies. */
export function zoneForSlot(rotationNum, slotNum) {
  const lineup = lineupForRotation(rotationNum);
  return ZONES.find((z) => lineup[z] === slotNum);
}

/**
 * Resolve which roster player occupies each zone for a rotation, accounting
 * for liberos. `slots` is an array of 6 player ids (index 0 = S1 ... index 5 = S6).
 * `liberos` is an array of { playerId, forPlayerId, canServe } (0-2 entries) —
 * `forPlayerId` is the roster player this libero swaps in/out for. Which slot
 * that resolves to is looked up fresh from `slots` every call, so if the
 * starting lineup changes later, the libero automatically follows whichever
 * slot that player is in rather than going stale.
 * A libero is on court whenever their target's slot is in a back-row zone;
 * steps off (the original player returns) once that slot rotates to a
 * front-row zone. If canServe is false and the slot lands on zone 1, the
 * original player is shown serving instead (libero sits that rotation out).
 */
export function resolveCourt(rotationNum, slots, liberos = []) {
  const lineup = lineupForRotation(rotationNum);
  const result = {};

  const activeLiberos = liberos
    .filter((l) => l.forPlayerId)
    .map((l) => ({ ...l, forSlot: slots.indexOf(l.forPlayerId) + 1 || null }));

  for (const zone of ZONES) {
    const slotNum = lineup[zone];
    const playerId = slots[slotNum - 1];
    const libero = activeLiberos.find((l) => l.forSlot === slotNum);

    let occupantId = playerId;
    let isLibero = false;

    if (libero && BACK_ROW_ZONES.includes(zone)) {
      if (zone === 1 && !libero.canServe) {
        // libero sits out their own serve turn
        occupantId = playerId;
        isLibero = false;
      } else {
        occupantId = libero.playerId;
        isLibero = true;
      }
    }

    result[zone] = { slotNum, playerId: occupantId, isLibero, originalPlayerId: playerId };
  }

  return result;
}

export function isFrontRow(zone) {
  return FRONT_ROW_ZONES.includes(zone);
}
