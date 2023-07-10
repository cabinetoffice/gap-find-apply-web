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
      href: 'https://www.find-government-grants.service.gov.uk/info/about-us',
    },
  ],
  [
    RelatedLinksNames.ACCESSIBILITY,
    {
      title: 'Accessibility statement',
      href: 'https://www.find-government-grants.service.gov.uk/info/accessibility',
    },
  ],
  [
    RelatedLinksNames.TERMS_AND_CONDITIONS,
    {
      title: 'Terms and conditions',
      href: 'https://www.find-government-grants.service.gov.uk/info/terms-and-conditions',
    },
  ],
  [
    RelatedLinksNames.PRIVACY_NOTICE,
    {
      title: 'Privacy notice',
      href: 'https://www.find-government-grants.service.gov.uk/info/privacy',
    },
  ],
  [
    RelatedLinksNames.COOKIES,
    {
      title: 'Cookies',
      href: 'https://www.find-government-grants.service.gov.uk/info/cookies',
    },
  ],
]);
