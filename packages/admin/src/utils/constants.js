export const cookieName = {
  currentEmailAddress: 'currentEmailAddress',
  notificationList: 'notificationList',
};

export const notificationRoutes = {
  checkEmail: '/notifications/check-email',
  addSubscription: '/api/notification-signup/',
  emailConfirmation: '/notifications/email-confirmation',
  unsubscribe: '/notifications/unsubscribe',
  manageNotifications: '/notifications/manage-notifications',
  confirmSubscription: '/api/confirm-email',
  notificationsHome: '/notifications',
  home: '/',
};

export const newsletterRoutes = {
  home: '/newsletter',
  confirmation: '/newsletter/confirmation',
  signup: '/newsletter/signup',
  unsubscribe: '/newsletter/unsubscribe',
};

export const tableHeadArr = [
  {
    children: 'Grant Name',
  },

  {
    children: 'When you signed up',
  },

  {
    children: 'Manage updates',
  },
];

// multiply 365 by 24 to get hours in a year then by 60 to get minutes and by 60 again to get seconds
const oneYear = 365 * 24 * 60 * 60;
export const maxAgeForConsentCookie = oneYear;

// multiply 2 hours by 60 to get minutes then 60 again to get seconds.
const twoHours = 2 * 60 * 60;
export const maxAgeForCookies = twoHours;

export const GRANTS_PER_PAGE = 10;

export const EMAIL_ADDRESS_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR =
  'Enter an email address in the correct format, like name@example.com';
export const PRIVACY_POLICY_VALIDATION_ERROR =
  'You must confirm that you have read and understood the privacy policy';
export const EMAIL_ADDRESS_EMPTY_VALIDATION_ERROR =
  'You must enter an email address';

export const URL_ACTIONS = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  NEWSLETTER_SUBSCRIBE: 'newsletter-subscribe',
  NEWSLETTER_UNSUBSCRIBE: 'newslettter-unsubscribe',
  EVERYTHING_UNSUBSCRIBE: 'unsubscribe-all',
};

export const URL_ACTION_MESSAGES = new Map([
  [URL_ACTIONS.SUBSCRIBE, 'You have signed up for updates about'],
  [URL_ACTIONS.UNSUBSCRIBE, 'You have been unsubscribed from'],
  [
    URL_ACTIONS.NEWSLETTER_SUBSCRIBE,
    'You have signed up for updates about new grants.',
  ],
  [
    URL_ACTIONS.NEWSLETTER_UNSUBSCRIBE,
    'You have unsubscribed from updates about new grants.',
  ],
  [
    URL_ACTIONS.EVERYTHING_UNSUBSCRIBE,
    'You have unsubscribed from all updates.',
  ],
]);

export const ELASTIC_INDEX_FIELDS = {
  grantName: 'fields.grantName.en-US',
  shortDescription: 'fields.grantShortDescription.en-US',
  summary: 'fields.grantSummaryTab.en-US.content.content.value',
  eligibility: 'fields.grantEligibilityTab.en-US.content.content.value',
  contentType: 'sys.contentType.sys.id',
  type: 'sys.type',
  publishedCounter: 'sys.publishedCounter',
  applicationClosingDate: 'fields.grantApplicationCloseDate.en-US',
  grantMaximumAward: 'fields.grantMaximumAward.en-US',
  grantMinimumAward: 'fields.grantMinimumAward.en-US',
  grantApplicationOpenDate: 'fields.grantApplicationOpenDate.en-US',
};

export const ELASTIC_GRANT_PAGE_FIELDS = [
  'fields.grantName',
  'fields.grantShortDescription',
  'fields.grantLocation',
  'fields.grantFunder',
  'fields.grantTotalAwardAmount',
  'fields.grantTotalAwardDisplay',
  'fields.grantMinimumAward',
  'fields.grantMinimumAwardDisplay',
  'fields.grantMaximumAward',
  'fields.grantMaximumAwardDisplay',
  'fields.grantApplicationOpenDate',
  'fields.grantApplicationCloseDate',
  'fields.label',
  'fields.grantApplicantType',
];
