const path = require('path');
const withSass = require('@zeit/next-sass');

module.exports = withSass({
  /* bydefault config  option Read For More Optios
  here https://github.com/vercel/next-plugins/tree/master/packages/next-sass
  */
  cssModules: true,
});
module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  serverRuntimeConfig: {
    backendHost: process.env.BACKEND_HOST,
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
    prependData: `$sub_path: '${process.env.SUB_PATH || '/apply/admin'}';`,
  },
  basePath: process.env.SUB_PATH || '/apply/admin',
  publicRuntimeConfig: {
    SUB_PATH: process.env.SUB_PATH || '/apply/admin',
    APPLICANT_DOMAIN: process.env.APPLICANT_DOMAIN,
    SPOTLIGHT_URL: process.env.SPOTLIGHT_URL,
    FIND_A_GRANT_URL:
      process.env.FIND_A_GRANT_URL ||
      'https://www.find-government-grants.service.gov.uk',
  },
};
