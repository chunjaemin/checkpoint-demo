import type { User } from './types';
import type { SpaceBase, SpaceMember, MemberRole } from './types';

export function getSelectedSpace(user: User | null, selectedSpaceIndex: number) {
  if (!user) return null;
  return user.spaces?.[selectedSpaceIndex] ?? null;
}

export function getMembers(space: SpaceBase | null | undefined): SpaceMember[] {
  return space?.members ?? [];
}

export function getMemberById(
  space: SpaceBase | null | undefined,
  userId: string | null | undefined
): SpaceMember | null {
  if (!space || !userId) return null;
  return space.members?.find((m) => m.id === userId) ?? null;
}

export function getCurrentUserRole(
  space: SpaceBase | null | undefined,
  userId: string | null | undefined
): MemberRole | null {
  return getMemberById(space, userId)?.role ?? null;
}

