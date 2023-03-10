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
    frontendHost: process.env.HOST,
    subPath: process.env.SUB_PATH || '/apply/applicant',
  },
  publicRuntimeConfig: {
    subPath: process.env.SUB_PATH || '/apply/applicant',
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
