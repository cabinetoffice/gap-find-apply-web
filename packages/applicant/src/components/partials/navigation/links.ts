import getConfig from 'next/config';

const {
  publicRuntimeConfig: { FIND_A_GRANT_URL, ADMIN_FRONTEND_URL },
} = getConfig();

export const links = [
  {
    pageId: 'Search grants',
    link: `${FIND_A_GRANT_URL}/grants`,
    as: `${FIND_A_GRANT_URL}/[slug]`,
    title: 'Search grants',
  },
  {
    pageId: 'Notifications',
    link: `${FIND_A_GRANT_URL}/notifications/manage-notifications`,
    as: `${FIND_A_GRANT_URL}/notifications/manage-notifications`,
    title: 'Notifications',
  },
  {
    pageId: 'Manage Applications',
    link: '/applications',
    as: '/applications',
    title: 'Manage Applications',
  },
  {
    pageId: 'Account details',
    link: '/dashboard',
    as: '/dashboard',
    title: 'Account details',
  },
];

export const authMobileLinks = [
  ...links,
  {
    pageId: 'Superadmin Dashboard',
    link: `${ADMIN_FRONTEND_URL}/super-admin-dashboard`,
    as: `${ADMIN_FRONTEND_URL}/super-admin-dashboard`,
    title: 'Superadmin Dashboard',
  },
];
