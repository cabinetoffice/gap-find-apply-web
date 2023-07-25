import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface RelatedContentLink {
  title: string;
  href: string;
}

export enum RelatedLinksNames {
  ABOUT_US,
  ACCESSIBILITY,
  TERMS_AND_CONDITIONS,
  PRIVACY_NOTICE,
  COOKIES,
}

export const RelatedContentLinks = new Map<
  RelatedLinksNames,
  RelatedContentLink
>([
  [
    RelatedLinksNames.ABOUT_US,
    {
      title: 'About us',
      href: publicRuntimeConfig.FIND_A_GRANT_URL + '/info/about-us',
    },
  ],
  [
    RelatedLinksNames.ACCESSIBILITY,
    {
      title: 'Accessibility statement',
      href: publicRuntimeConfig.FIND_A_GRANT_URL + '/info/accessibility',
    },
  ],
  [
    RelatedLinksNames.TERMS_AND_CONDITIONS,
    {
      title: 'Terms and conditions',
      href: publicRuntimeConfig.FIND_A_GRANT_URL + '/info/terms-and-conditions',
    },
  ],
  [
    RelatedLinksNames.PRIVACY_NOTICE,
    {
      title: 'Privacy notice',
      href: publicRuntimeConfig.FIND_A_GRANT_URL + '/info/privacy',
    },
  ],
  [
    RelatedLinksNames.COOKIES,
    {
      title: 'Cookies',
      href: publicRuntimeConfig.FIND_A_GRANT_URL + '/info/cookies',
    },
  ],
]);
