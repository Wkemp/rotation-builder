let counter = 1;

export function makeId(prefix) {
  return `${prefix}${Date.now()}_${counter++}`;
}

export function makePlayerId() {
  return makeId('p');
}
