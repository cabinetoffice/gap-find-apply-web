require('dotenv-safe').config();
const path = require('path');

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  serverRuntimeConfig: {
    backendHost: process.env.BACKEND_HOST,
    frontendHost: process.env.HOST,
    subPath: process.env.SUB_PATH || '/apply/applicant',
    userServiceHost: process.env.USER_SERVICE_URL,
  },
  publicRuntimeConfig: {
    subPath: process.env.SUB_PATH || '/apply/applicant',
    oneLoginEnabled: process.env.ONE_LOGIN_ENABLED === 'true',
    FIND_A_GRANT_URL:
      process.env.FIND_A_GRANT_URL ||
      'https://www.find-government-grants.service.gov.uk',
    ONE_LOGIN_SECURITY_URL:
      process.env.ONE_LOGIN_SECURITY_URL ||
      'https://home.integration.account.gov.uk/security',
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  reactStrictMode: true,
  // experimental: { optimizeCss: true },
  distDir: '.next',

  /* Add Your Scss File Folder Path Here */
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `$sub_path: '${process.env.SUB_PATH || '/apply/applicant'}';`,
  },
  basePath: process.env.SUB_PATH || '/apply/applicant',
};
