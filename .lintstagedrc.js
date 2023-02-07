const path = require("path");

const buildEslintCommand = (packageName) => (filenames) =>
  `yarn workspace ${packageName} lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

module.exports = {
  "packages/admin/**/*.{js,jsx,ts,tsx}": [buildEslintCommand("admin")],
  "packages/applicant/**/*.{js,jsx,ts,tsx}": [buildEslintCommand("applicant")],
  "packages/gap-web-ui/**/*.{js,jsx,ts,tsx}": [
    "yarn workspace gap-web-ui lint",
  ],
};
