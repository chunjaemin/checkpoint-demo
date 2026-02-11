import type { Space } from './types';

export function isTeamSpace(space: Space | null | undefined) {
  return space?.type === 'team';
}

export function isPersonalSpace(space: Space | null | undefined) {
  return space?.type === 'personal';
}

