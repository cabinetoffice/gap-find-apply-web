import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { GrantScheme } from '../../../types/models/GrantScheme';
import { GrantSchemeService } from '../../../services/GrantSchemeService';
import {
  ApplicationDetailsInterface,
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  isSubmissionReady,
  QuestionType,
} from '../../../services/SubmissionService';
import { createMockRouter } from '../../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../../utils/jwt';
import SubmissionSections, { getServerSideProps } from './sections.page';
import { getApplicationStatusBySchemeId } from '../../../services/ApplicationService';

jest.mock('../../../services/SubmissionService');
jest.mock('../../../utils/constants');
jest.mock('../../../utils/jwt');
jest.mock('../../../utils/csrf');

jest.mock('../../../services/ApplicationService', () => ({
  getApplicationStatusBySchemeId: jest.fn(),
}));

const context = {
  params: {
    submissionId: '12345678',
  },
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;

const shortAnswer: QuestionType = {
  questionId: 'APPLICANT_ORG_NAME',
  profileField: 'ORG_NAME',
  fieldTitle: 'Enter the name of your organisation',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'ShortAnswer',
  validation: {
    mandatory: true,
    minLength: 5,
    maxLength: 100,
  },
};

const contextNoToken = {
  params: {
    submissionId: '12345678',
  },
  req: { csrfToken: () => '' },
  res: {},
} as unknown as GetServerSidePropsContext;

const numeric: QuestionType = {
  questionId: 'APPLICANT_AMOUNT',
  profileField: 'ORG_AMOUNT',
  fieldTitle: 'Enter the amount',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'MultipleSelection',
  validation: {
    mandatory: true,
    greaterThanZero: true,
  },
  multiResponse: ['test', 'test2'],
};
const eligibility: QuestionType = {
  questionId: 'ELIGIBILITY',
  profileField: 'ORG_AMOUNT',
  fieldTitle: 'Enter the amount',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'YesNo',
  validation: {
    mandatory: true,
    greaterThanZero: true,
  },
  response: 'Yes',
};
const propsWithAllValues: ApplicationDetailsInterface = {
  grantSchemeId: 'schemeId',
  grantApplicationId: 'string',
  grantSubmissionId: 'string',
  applicationName: 'Name of the grant being applied for',
  submissionStatus: 'IN_PROGRESS',
  sections: [
    {
      sectionId: 'ELIGIBILITY',
      sectionTitle: 'Eligibility',
      sectionStatus: 'COMPLETED',
      questions: [eligibility],
    },
    {
      sectionId: 'ORGANISATION_DETAILS',
      sectionTitle: 'Your Organisation',
      sectionStatus: 'IN_PROGRESS',
      questions: [shortAnswer],
    },
    {
      sectionId: 'FUNDING_DETAILS',
      sectionTitle: 'Funding',
      sectionStatus: 'IN_PROGRESS',
      questions: [numeric],
    },
    {
      sectionId: 'ESSENTIAL',
      sectionTitle: 'Essential Information',
      sectionStatus: 'COMPLETED',
      questions: [shortAnswer],
    },
    {
      sectionId: 'NON-ESSENTIAL',
      sectionTitle: 'Non Essential Information',
      sectionStatus: 'IN_PROGRESS',
      questions: [shortAnswer, numeric],
    },
  ],
};

const propsWithoutSectionValues: ApplicationDetailsInterface = {
  ...propsWithAllValues,
  sections: [],
};

const MOCK_GRANT_SCHEME: GrantScheme = {
  id: 1,
  funderId: 1,
  lastUpdated: '2022-08-02 20:10:20-00',
  createdDate: '2022-08-02 20:10:20-00',
  lastUpdatedBy: 1,
  version: 1,
  ggisIdentifier: 'SCH-000003589',
  email: 'test@test.com',
  name: 'TEST',
};

const propsWithInProgressSectionTags: ApplicationDetailsInterface = {
  grantSchemeId: 'string',
  grantApplicationId: 'string',
  grantSubmissionId: 'string',
  applicationName: 'Name of the grant being applied for',
  submissionStatus: 'IN_PROGRESS',
  sections: [
    {
      sectionId: 'ELIGIBILITY',
      sectionTitle: 'Eligibility',
      sectionStatus: 'COMPLETED',
      questions: [eligibility],
    },
    {
      sectionId: 'ESSENTIAL',
      sectionTitle: 'Essential Information',
      sectionStatus: 'IN_PROGRESS',
      questions: [shortAnswer, numeric],
    },
    {
      sectionId: 'NON-ESSENTIAL',
      sectionTitle: 'Non Essential Information',
      sectionStatus: 'NOT_STARTED',
      questions: [numeric],
    },
  ],
};

const propsWithVariedSectionEligilityCompleteOthersMixedNotStarted: ApplicationDetailsInterface =
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'string',
    applicationName: 'Name of the grant being applied for',
    submissionStatus: 'IN_PROGRESS',
    sections: [
      {
        sectionId: 'ELIGIBILITY',
        sectionTitle: 'Eligibility',
        sectionStatus: 'COMPLETED',
        questions: [eligibility],
      },
      {
        sectionId: 'ESSENTIAL',
        sectionTitle: 'Essential Information',
        sectionStatus: 'NOT_STARTED',
        questions: [shortAnswer, numeric],
      },
      {
        sectionId: 'NON-ESSENTIAL',
        sectionTitle: 'Non Essential Information',
        sectionStatus: 'CANNOT_START_YET',
        questions: [numeric],
      },
    ],
  };

const questionDataStandardEligibilityResponseYes = {
  grantSchemeId: 5,
  grantApplicationId: 3,
  grantSubmissionId: '1bb03bdf-66af-4869-94bf-19636d8445bf',
  sectionId: 'ELIGIBILITY',
  sectionTitle: 'Eligibility',
  question: {
    questionId: 'ELIGIBILITY',
    profileField: null,
    fieldTitle: 'Eligibility Statement',
    displayText: 'Display text',
    hintText: null,
    questionSuffix: 'Does your organisation meet the eligibility criteria?',
    fieldPrefix: null,
    adminSummary: null,
    responseType: 'YesNo',
    validation: {
      mandatory: true,
      minLength: null,
      maxLength: null,
      minWords: null,
      maxWords: null,
      greaterThanZero: false,
      validInput: null,
    },
    options: null,
    response: 'Yes',
    multiResponse: null,
  },
  nextNavigation: null,
  previousNavigation: null,
};

const questionDataStandardEligibilityResponseNo = {
  ...questionDataStandardEligibilityResponseYes,
  question: { response: 'No' },
};

const questionDataStandardEligibilityResponseNull = {
  ...questionDataStandardEligibilityResponseYes,
  question: { response: null },
};

describe('getServerSideProps', () => {
  it('should return a redirect to grant-is-closed when submission is REMOVED ', async () => {
    (getApplicationStatusBySchemeId as jest.Mock).mockResolvedValue('REMOVED');
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
    (isSubmissionReady as jest.Mock).mockReturnValue(true);
    (getQuestionById as jest.Mock).mockReturnValue(
      questionDataStandardEligibilityResponseNo
    );
    const response = await getServerSideProps(context);
    expect(response).toEqual({
      redirect: {
        destination: '/grant-is-closed',
        permanent: false,
      },
    });
  });

  it('should return sections, submissionId, applicationName', async () => {
    (getApplicationStatusBySchemeId as jest.Mock).mockResolvedValue(
      'PUBLISHED'
    );
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
    (isSubmissionReady as jest.Mock).mockReturnValue(true);
    const getGrantScheme = jest
      .spyOn(GrantSchemeService.prototype, 'getGrantSchemeById')
      .mockResolvedValue({ grantScheme: MOCK_GRANT_SCHEME });
    (getQuestionById as jest.Mock).mockReturnValue(
      questionDataStandardEligibilityResponseNo
    );
    const response = await getServerSideProps(context);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        supportEmail: 'test@test.com',
        eligibilityCheckPassed: false,
        hasSubmissionBeenSubmitted: false,
        isSubmissionReady: true,
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
    expect(getGrantScheme).toHaveBeenCalled();
    expect(getGrantScheme).toHaveBeenCalledWith('schemeId', 'testJwt');
  });

  it('should return the eligibility check as false is there is no section data present', async () => {
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (getQuestionById as jest.Mock).mockReturnValue('');

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        eligibilityCheckPassed: false,
        hasSubmissionBeenSubmitted: false,
        isSubmissionReady: true,
        supportEmail: 'test@test.com',
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });

  it('should return the eligibility check as false if the eligibility question response is not "Yes"', async () => {
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (getQuestionById as jest.Mock).mockReturnValue(
      questionDataStandardEligibilityResponseNo
    );

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        eligibilityCheckPassed: false,
        hasSubmissionBeenSubmitted: false,
        isSubmissionReady: true,
        supportEmail: 'test@test.com',
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });

  it('should return the eligibility check as false if the eligibility question response is null', async () => {
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (getQuestionById as jest.Mock).mockReturnValue(
      questionDataStandardEligibilityResponseNull
    );
    (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
    (isSubmissionReady as jest.Mock).mockReturnValue(true);
    const getGrantScheme = jest
      .spyOn(GrantSchemeService.prototype, 'getGrantSchemeById')
      .mockResolvedValue({ grantScheme: MOCK_GRANT_SCHEME });
    (getQuestionById as jest.Mock).mockReturnValue(
      questionDataStandardEligibilityResponseNo
    );
    const response = await getServerSideProps(context);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        supportEmail: 'test@test.com',
        eligibilityCheckPassed: false,
        hasSubmissionBeenSubmitted: false,
        isSubmissionReady: true,
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
    expect(getGrantScheme).toHaveBeenCalled();
    expect(getGrantScheme).toHaveBeenCalledWith('schemeId', 'testJwt');
  });

  it('should return correct object from server side props with no token', async () => {
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
    (isSubmissionReady as jest.Mock).mockReturnValue(true);
    const getGrantScheme = jest
      .spyOn(GrantSchemeService.prototype, 'getGrantSchemeById')
      .mockResolvedValue({ grantScheme: MOCK_GRANT_SCHEME });

    const response = await getServerSideProps(contextNoToken);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: '',
        supportEmail: 'test@test.com',
        hasSubmissionBeenSubmitted: false,
        isSubmissionReady: true,
        eligibilityCheckPassed: false,
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
    expect(getGrantScheme).toHaveBeenCalled();
    expect(getGrantScheme).toHaveBeenCalledWith('schemeId', 'testJwt');
  });

  it('should redirect if application has been submitted', async () => {
    (getSubmissionById as jest.Mock).mockReturnValue(propsWithAllValues);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(true);
    const getGrantScheme = jest
      .spyOn(GrantSchemeService.prototype, 'getGrantSchemeById')
      .mockResolvedValue({ grantScheme: MOCK_GRANT_SCHEME });

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      redirect: {
        destination: `/applications`,
        permanent: false,
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
    expect(getGrantScheme).toHaveBeenCalled();
    expect(getGrantScheme).toHaveBeenCalledWith('schemeId', 'testJwt');
  });
});

describe('Submission section page', () => {
  describe('Submission sections should render properly__ no supportEmail', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithAllValues.sections}
            grantSubmissionId={propsWithAllValues.grantSubmissionId}
            applicationName={propsWithAllValues.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            supportEmail=""
            eligibilityCheckPassed={true}
          />
        </RouterContext.Provider>
      );
    });
    it('should render the correct headings', () => {
      expect(screen.getByText('Your Application')).toBeDefined();
      expect(
        screen.getByText('Name of the grant being applied for')
      ).toBeDefined();
    });

    it('should render the application instructions', () => {
      screen.getByText(/how the application form works/i);
      screen.getByText(
        /you must complete each section of the application form/i
      );
      screen.getByText(
        /once all sections are complete you can submit your application/i
      );
      screen.getByText(
        /you can save your application and come back to it later/i
      );
    });

    it('should render the summary list keys with the correct href', () => {
      const sectionData = propsWithAllValues.sections;
      expect(screen.getByText('Non Essential Information')).toBeDefined();
      expect(screen.getByText('Essential Information')).toBeDefined();
      expect(
        screen.getByRole('link', { name: 'Essential Information' })
      ).toHaveAttribute('href', '/api/submissions/string/sections/ESSENTIAL');
      expect(
        screen.getByRole('link', { name: 'Non Essential Information' })
      ).toHaveAttribute(
        'href',
        '/api/submissions/string/sections/NON-ESSENTIAL'
      );
    });

    it('should render the mandatory question sections with the correct href', () => {
      expect(screen.getByText('Your Organisation')).toBeDefined();
      expect(screen.getByText('Funding')).toBeDefined();
      expect(
        screen.getByRole('link', { name: 'Your Organisation' })
      ).toHaveAttribute(
        'href',
        '/submissions/string/sections/ORGANISATION_DETAILS'
      );
      expect(screen.getByRole('link', { name: 'Funding' })).toHaveAttribute(
        'href',
        '/submissions/string/sections/FUNDING_DETAILS'
      );
    });

    it('should render a submit and cancel button', () => {
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toBeDefined();
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).not.toHaveProperty('disabled');
      expect(
        screen.getByRole('link', { name: 'Save and come back later' })
      ).toHaveAttribute('href', '/applications');
    });
  });

  describe('Submission section will render the supportEmail', () => {
    test('should render the HelpAndSupport SideBar', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithAllValues.sections}
            grantSubmissionId={propsWithAllValues.grantSubmissionId}
            applicationName={propsWithAllValues.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            supportEmail="test@test.com"
            eligibilityCheckPassed={true}
          />
        </RouterContext.Provider>
      );

      screen.getByRole('heading', { name: 'Help and support' });
      screen.getByRole('link', { name: 'test@test.com' });
      const separator = screen.getAllByRole('separator')[0];
      expect(separator).toHaveClass(
        'govuk-section-break govuk-section-break--m govuk-section-break--visible'
      );
    });
  });

  describe('Correctly render the links based on the eligibility check', () => {
    it('should render the summary list keys without hyperlinks if eligibility is not passed', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithAllValues.sections}
            grantSubmissionId={propsWithAllValues.grantSubmissionId}
            applicationName={propsWithAllValues.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            eligibilityCheckPassed={false}
            supportEmail="test@test.com"
          />
        </RouterContext.Provider>
      );

      const sectionData = propsWithAllValues.sections;

      expect(screen.getByText('Eligibility')).toBeDefined();
      expect(screen.getByText('Non Essential Information')).toBeDefined();
      expect(screen.getByText('Essential Information')).toBeDefined();
      expect(screen.getByRole('link', { name: 'Eligibility' })).toHaveAttribute(
        'href',
        `/api/submissions/${propsWithAllValues.grantSubmissionId}/sections/${sectionData[0].sectionId}`
      );
      expect(screen.getByText('Essential Information')).not.toHaveAttribute(
        'href',
        `/api/submissions/${propsWithAllValues.grantSubmissionId}/sections/${sectionData[1].sectionId}`
      );
      expect(screen.getByText('Non Essential Information')).not.toHaveAttribute(
        'href',
        `/api/submissions/${propsWithAllValues.grantSubmissionId}/sections/${sectionData[2].sectionId}`
      );
    });
  });

  describe('Correctly render the tags based on the eligibility check', () => {
    it('should render grey tags for Not Started and Cannot Start yet tags', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={
              propsWithVariedSectionEligilityCompleteOthersMixedNotStarted.sections
            }
            grantSubmissionId={
              propsWithVariedSectionEligilityCompleteOthersMixedNotStarted.grantSubmissionId
            }
            applicationName={
              propsWithVariedSectionEligilityCompleteOthersMixedNotStarted.applicationName
            }
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            eligibilityCheckPassed={false}
            supportEmail="test@test.com"
          />
        </RouterContext.Provider>
      );

      expect(screen.getByText('Cannot Start Yet')).toHaveClass(
        'govuk-tag--grey'
      );
      expect(screen.getByText('Not Started')).toHaveClass('govuk-tag--grey');
      expect(screen.getByText('Completed')).not.toHaveClass('govuk-tag--grey');
    });
    it('should render light blue tags for In Progress', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithInProgressSectionTags.sections}
            grantSubmissionId={propsWithInProgressSectionTags.grantSubmissionId}
            applicationName={propsWithInProgressSectionTags.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            eligibilityCheckPassed={false}
            supportEmail="test@test.com"
          />
        </RouterContext.Provider>
      );

      expect(screen.getByText('In Progress')).toHaveClass('govuk-tag--blue');
      expect(screen.getByText('Not Started')).not.toHaveClass(
        'govuk-tag--blue'
      );
      expect(screen.getByText('Completed')).not.toHaveClass('govuk-tag--blue');
    });
  });

  describe('Submission sections page should render appropriate parts if there is no section data', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithoutSectionValues.sections}
            grantSubmissionId={propsWithoutSectionValues.grantSubmissionId}
            applicationName={propsWithoutSectionValues.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            supportEmail=""
            eligibilityCheckPassed={true}
          />
        </RouterContext.Provider>
      );
    });
    it('should still render the headings and buttons even if there are no sections', () => {
      expect(screen.getByText('Your Application')).toBeDefined();
      expect(
        screen.getByText('Name of the grant being applied for')
      ).toBeDefined();

      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toBeDefined();
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).not.toHaveProperty('disabled');
      expect(
        screen.getByRole('link', { name: 'Save and come back later' })
      ).toHaveAttribute('href', '/applications');

      expect(
        screen.queryByRole('link', { name: 'Non Essential Information' })
      ).toBeNull();
      expect(
        screen.queryByRole('link', { name: 'Essential Information' })
      ).toBeNull();
    });
  });

  describe('Submission is not ready for submitting', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithoutSectionValues.sections}
            grantSubmissionId={propsWithoutSectionValues.grantSubmissionId}
            applicationName={propsWithoutSectionValues.applicationName}
            isSubmissionReady={false}
            hasSubmissionBeenSubmitted={false}
            csrfToken="testCSRFToken"
            supportEmail=""
            eligibilityCheckPassed={true}
          />
        </RouterContext.Provider>
      );
    });
    it('should disable the submit button', () => {
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toBeDefined();
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toHaveProperty('disabled', true);
    });
  });

  describe('Submission has already been submitted', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SubmissionSections
            sections={propsWithoutSectionValues.sections}
            grantSubmissionId={propsWithoutSectionValues.grantSubmissionId}
            applicationName={propsWithoutSectionValues.applicationName}
            isSubmissionReady={true}
            hasSubmissionBeenSubmitted={true}
            csrfToken="testCSRFToken"
            supportEmail=""
            eligibilityCheckPassed={true}
          />
        </RouterContext.Provider>
      );
    });
    it('should disable the submit button', () => {
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toBeDefined();
      expect(
        screen.getByRole('button', { name: 'Submit application' })
      ).toHaveProperty('disabled', true);
    });
  });
});
