import getConfig from 'next/config';

const {
  publicRuntimeConfig: { APPLICANT_DOMAIN, FIND_A_GRANT_URL },
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
    pageId: 'Manage grants',
    link: `/scheme-list`,
    as: `/scheme-list`,
    title: 'Manage grants',
  },
  {
    pageId: 'Account details',
    link: `${APPLICANT_DOMAIN}/dashboard`,
    as: `${APPLICANT_DOMAIN}/dashboard`,
    title: 'Account details',
  },
];
