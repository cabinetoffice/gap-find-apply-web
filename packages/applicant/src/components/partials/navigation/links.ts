import getConfig from 'next/config';

const {
  publicRuntimeConfig: { FIND_A_GRANT_URL },
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
