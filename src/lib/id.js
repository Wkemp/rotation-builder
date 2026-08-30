export function makeId(prefix = 'id_') {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function makePlayerId() {
  return makeId('p_');
}
