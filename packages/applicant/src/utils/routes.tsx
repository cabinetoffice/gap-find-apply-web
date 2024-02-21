import getConfig from 'next/config';

export type serviceErrorPropType = {
  errorInformation: string;
  linkAttributes: { href: string; linkText: string; linkInformation: string };
};

const { publicRuntimeConfig } = getConfig();

export const routes = {
  homePage: '/',
  dashboard: '/dashboard',
  grants: '/grants',
  personalDetails: '/personal-details',
  signInDetails: '/sign-in-details',
  organisation: {
    index: '/organisation',
    address: '/organisation/address',
    charityComissionNumber: '/organisation/charity-commission-number',
    companiesHouseNumber: '/organisation/companies-house-number',
    name: '/organisation/name',
    type: '/organisation/type',
  },
  mandatoryQuestions: {
    startPage: (schemeId: string) =>
      `/mandatory-questions/start?schemeId=${schemeId}`,
    namePage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-name`,
    addressPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-address`,
    typePage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-type`,
    companiesHouseNumberPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-companies-house-number`,
    charityCommissionNumberPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-charity-commission-number`,
    fundingAmountPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-funding-amount`,
    fundingLocationPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-funding-location`,
    summaryPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/organisation-summary`,
    externalApplicationPage: (mandatoryQuestionId: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/external-applications`,
  },
  applications: '/applications',
  submissions: {
    index: '/submissions',
    sections: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/sections`,
    section: (grantSubmissionId: string, sectionId: string) =>
      `/submissions/${grantSubmissionId}/sections/${sectionId}`,
    question: (
      grantSubmissionId: string,
      sectionId: string,
      questionId: string
    ) =>
      `/submissions/${grantSubmissionId}/sections/${sectionId}/questions/${questionId}`,
    summary: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/summary`,
    submit: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/submit`,
    submissionConfirmation: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/submission-confirmation`,
    sectionOverview: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/section-overview`,
  },
  findAGrant: publicRuntimeConfig.FIND_A_GRANT_URL,
  serviceError: (serviceErrorProps: serviceErrorPropType): string =>
    `/service-error?serviceErrorProps=${JSON.stringify(serviceErrorProps)}`,
  api: {
    submissions: {
      downloadSummary: (submissionId: string) =>
        `/api/routes/submissions/${submissionId}/download-summary`,
      section: (grantSubmissionId: string, sectionId: string) =>
        `/api/routes/submissions/${grantSubmissionId}/sections/${sectionId}`,
      question: (
        grantSubmissionId: string,
        sectionId: string,
        questionId: string
      ) =>
        `/api/routes/submissions/${grantSubmissionId}/sections/${sectionId}/questions/${questionId}`,
    },
    isNewApplicant: {
      index: (status?: MigrationStatus) =>
        status?.applyMigrationStatus || status?.findMigrationStatus
          ? `/api/isNewApplicant?applyMigrationStatus=${status.applyMigrationStatus}&findMigrationStatus=${status.findMigrationStatus}`
          : `/api/isNewApplicant`,
    },
    createMandatoryQuestion: (schemeId: string) =>
      `/api/create-mandatory-question?schemeId=${schemeId}`,
  },
};

type MigrationStatus = {
  applyMigrationStatus: string;
  findMigrationStatus: string;
};
