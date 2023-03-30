export const routes = {
  homePage: '/',
  dashboard: '/dashboard',
  grants: '/grants',
  personalDetails: '/personal-details',
  organisation: {
    index: '/organisation',
    address: '/organisation/address',
    charityComissionNumber: '/organisation/charity-commission-number',
    companiesHouseNumber: '/organisation/companies-house-number',
    name: '/organisation/name',
    type: '/organisation/type',
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
  findAGrant: 'https://www.find-government-grants.service.gov.uk/',
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
    isNewApplicant: '/api/isNewApplicant',
  },
};
