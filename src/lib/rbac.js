export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  AFFILIATE_MANAGER: 'affiliate_manager',
  USER: 'user',
  GUEST: 'guest',
};

export const ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN];
export const AFFILIATE_ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.AFFILIATE_MANAGER];
export const MODERATION_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.MODERATOR];

export function userHasRole(user, roles = []) {
  const role = user?.role || ROLES.GUEST;
  return roles.includes(role);
}
