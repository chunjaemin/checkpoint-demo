export type SpaceType = 'personal' | 'team';

export type MemberRole = 'admin' | 'member' | (string & {});

export type SpaceMember = {
  id: string;
  name: string;
  role?: MemberRole;
  color?: string;
  hourlyWage?: number;
};

export type SpaceBase = {
  id: string;
  type: SpaceType;
  name: string;
  schedules?: any[];
  members?: SpaceMember[];
};

export type User = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  spaces: SpaceBase[];
};

