/** Mirrors edusphere `classSizeOf` — keep the two semantically identical. */
export type ClassSize = 'PRIVATE' | 'SMALL' | 'PUBLIC';

export const classSizeOf = (capacity: number): ClassSize =>
  capacity === 1 ? 'PRIVATE' : capacity <= 15 ? 'SMALL' : 'PUBLIC';

export const CLASS_SIZE_LABEL: Record<ClassSize, string> = {
  PRIVATE: 'tutoring.groups.sizePrivate',
  SMALL: 'tutoring.groups.sizeSmall',
  PUBLIC: 'tutoring.groups.sizePublic'
};
