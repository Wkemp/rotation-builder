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

// Formation grid: the whole court as a 12x8 grid, 4 columns x 4 rows within
// each zone. Used for serve/receive formations - a coach can place a player
// anywhere within their zone (or right at its edge, for realistic stacking)
// rather than being pinned to the zone's exact center the way Base is.
export const GRID_COLS = 12;
export const GRID_ROWS = 8;

/** Grid cell {col, row} -> fractional {x, y} (0-1) for rendering, centered in the cell. */
export function gridToFraction({ col, row }) {
  return { x: (col + 0.5) / GRID_COLS, y: (row + 0.5) / GRID_ROWS };
}

/** Fractional {x, y} (0-1), e.g. from a tap position -> the grid cell it falls in. */
export function fractionToGrid(x, y) {
  const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(x * GRID_COLS)));
  const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(y * GRID_ROWS)));
  return { col, row };
}

/** Storage key for a rotation's formation - one for serving, one for receiving. */
export function formationKey(rotationNum, serveState) {
  return `${rotationNum}-${serveState}`;
}

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
 * Reads a libero's assigned targets regardless of data shape - tolerates
 * older saved data that used a single `forPlayerId` before liberos could
 * have multiple targets, so existing saved lineups don't need to be
 * reconfigured after this change.
 */
export function liberoTargets(libero) {
  if (Array.isArray(libero.forPlayerIds)) return libero.forPlayerIds;
  if (libero.forPlayerId) return [libero.forPlayerId];
  return [];
}

/**
 * Reads which single target (if any) a libero is authorized to serve in
 * place of. Serving eligibility belongs to one specific teammate, not
 * "whoever the libero happens to be covering at the moment" - a libero
 * covering multiple players may only be allowed to serve for one of them,
 * or for none at all. Tolerates the older single-target shape, where a
 * global `canServe: true` meant "serves for my one (and only) target."
 */
export function liberoServesFor(libero) {
  if ('servesForPlayerId' in libero) return libero.servesForPlayerId || null;
  if (libero.canServe && libero.forPlayerId) return libero.forPlayerId;
  return null;
}

/**
 * Resolve which roster player occupies each zone for a rotation, accounting
 * for liberos and planned (non-libero) substitutions.
 * `slots` is an array of 6 player ids (index 0 = S1 ... index 5 = S6).
 *
 * `liberos` is an array of { playerId, forPlayerIds, servesForPlayerId }
 * (0-2 entries). A libero can be assigned multiple targets - e.g. covering
 * whichever of two different back-row players needs it as the rotation
 * cycles. For each rotation, a libero is on court for the FIRST of their
 * assigned targets whose slot is currently in the back row (list order
 * settles the rare case where more than one assigned target is back-row
 * simultaneously - a libero can only be in one place). Steps off once that
 * target's slot rotates to the front row. Separately, `servesForPlayerId`
 * names the ONE target (if any) this libero is allowed to serve in place
 * of - if the libero's currently-active target isn't that specific player,
 * the original player serves instead (libero sits out just that turn, same
 * as if serving weren't allowed at all).
 *
 * `substitutions` is an array of { subPlayerId, forPlayerId, rotations }.
 * A substitution is active for a rotation if `rotations` is empty (meaning
 * "any rotation") or includes the current rotation number. A planned
 * substitution takes priority over a libero swap for the same starter: it's
 * a more specific, deliberately-scoped coaching decision for that exact
 * rotation, and if a regular sub has taken a starter's spot, that starter
 * isn't actually on the court for the libero to swap out from behind.
 */
export function resolveCourt(rotationNum, slots, liberos = [], substitutions = []) {
  const result = {};

  // For each libero, resolve which single target (if any) they're actively
  // covering this rotation, keyed by the zone that target currently occupies.
  const activeLiberoByZone = {};
  for (const libero of liberos) {
    const servesFor = liberoServesFor(libero);
    for (const targetId of liberoTargets(libero)) {
      const slotIdx = slots.indexOf(targetId);
      if (slotIdx === -1) continue;
      const zone = zoneForSlot(rotationNum, slotIdx + 1);
      if (BACK_ROW_ZONES.includes(zone)) {
        if (!activeLiberoByZone[zone]) {
          activeLiberoByZone[zone] = {
            liberoPlayerId: libero.playerId,
            canServeThisTarget: servesFor === targetId,
          };
        }
        break; // this libero has its active target for this rotation - don't check their other targets
      }
    }
  }

  // Map starter playerId -> substitute playerId, for whichever planned
  // substitutions apply to this specific rotation.
  const activeSubByTarget = {};
  for (const s of substitutions) {
    const applies = !s.rotations || s.rotations.length === 0 || s.rotations.includes(rotationNum);
    if (applies && s.forPlayerId && s.subPlayerId) {
      activeSubByTarget[s.forPlayerId] = s.subPlayerId;
    }
  }

  for (const zone of ZONES) {
    const slotNum = slotInZone(rotationNum, zone);
    const playerId = slots[slotNum - 1];
    const activeLibero = activeLiberoByZone[zone];

    let occupantId = playerId;
    let isLibero = false;
    let isSub = false;

    if (playerId && activeSubByTarget[playerId]) {
      occupantId = activeSubByTarget[playerId];
      isSub = true;
    } else if (activeLibero) {
      if (zone === 1 && !activeLibero.canServeThisTarget) {
        // libero sits out this specific serve turn - not authorized to
        // serve for whoever they're currently covering
        occupantId = playerId;
      } else {
        occupantId = activeLibero.liberoPlayerId;
        isLibero = true;
      }
    }

    result[zone] = { slotNum, playerId: occupantId, isLibero, isSub, originalPlayerId: playerId };
  }

  return result;
}

export function isFrontRow(zone) {
  return FRONT_ROW_ZONES.includes(zone);
}
