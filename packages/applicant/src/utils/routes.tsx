import getConfig from 'next/config';

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
    externalApplication: (mandatoryQuestionId: string, externalLink: string) =>
      `/mandatory-questions/${mandatoryQuestionId}/external-application?externalLink=${externalLink}`,
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
    submissionConfirmation: (grantSubmissionId: string) =>
      `/submissions/${grantSubmissionId}/submission-confirmation`,
  },
  findAGrant: publicRuntimeConfig.FIND_A_GRANT_URL,
  serviceError: (serviceErrorProps) =>
    `/service-error?serviceErrorProps=${JSON.stringify(serviceErrorProps)}`,
  api: {
    submissions: {
      section: (grantSubmissionId: string, sectionId: string) =>
        `/api/submissions/${grantSubmissionId}/sections/${sectionId}`,
      question: (
        grantSubmissionId: string,
        sectionId: string,
        questionId: string
      ) =>
        `/api/submissions/${grantSubmissionId}/sections/${sectionId}/questions/${questionId}`,
    },
    isNewApplicant: {
      index: (migrationStatus?) =>
        migrationStatus
          ? `/api/isNewApplicant?migrationStatus=${migrationStatus}`
          : `/api/isNewApplicant`,
    },
    createMandatoryQuestion: (schemeId: string) =>
      `/api/create-mandatory-question?schemeId=${schemeId}`,
    getApplicationForm: (mandatoryQuestionId: string) =>
      `/api/get-application-form?mandatoryQuestionId=${mandatoryQuestionId}`,
  },
};
