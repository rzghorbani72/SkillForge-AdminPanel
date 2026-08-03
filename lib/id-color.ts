/**
 * Picks a stable palette slot for an entity id. Ids are cuid strings, so the
 * old `id % palette.length` produced NaN and every avatar fell back to the same
 * colour.
 */
export function colorIndexForId(id: string, paletteSize: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % paletteSize;
}
