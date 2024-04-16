import { AxiosError } from 'axios';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { GetServerSidePropsContext } from 'next';
import SectionOverview, { getServerSideProps } from './section-overview.page';
import { getGrantScheme } from '../../../services/SchemeService';
import Scheme from '../../../types/Scheme';
import { render } from '@testing-library/react';
import {
  ApplicationFormQuestion,
  ApplicationFormSection,
} from '../../../types/ApplicationForm';
import { HEADERS } from '../../../utils/constants';

jest.mock('../../../services/ApplicationService');
jest.mock('../../../utils/session');
jest.mock('../../../services/SchemeService');

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    backendHost: 'http://localhost:8080',
  },
  publicRuntimeConfig: {
    SUB_PATH: '/apply',
    APPLICANT_DOMAIN: 'http://localhost:8080',
  },
}));

describe('getServerSideProps', () => {
  const context = {
    req: { headers: { [HEADERS.CORRELATION_ID]: 'test-id' } },
    params: {
      applicationId: 'mockApplicationId',
    },
  } as unknown as GetServerSidePropsContext;

  const axiosError = { response: { data: { code: 500 } } } as AxiosError;

  const testSections = [
    { sectionId: 'testSectionId', sectionTitle: 'title', questions: [] },
  ];
  const testApplicationName = 'mockApplicationName';

  it('should return props with sections and applicationName', async () => {
    jest.mocked(getApplicationFormSummary).mockResolvedValue({
      sections: testSections,
      applicationName: testApplicationName,
      grantApplicationId: 'mockGrantApplicationId',
      grantSchemeId: 'mockGrantSchemeId',
      applicationStatus: 'PUBLISHED' as const,
      audit: {
        version: 1,
        created: 'some-date',
        createdBy: 'some-date',
        lastUpdated: 'some-date',
        lastUpdateBy: 'some-date',
        lastPublished: 'some-date',
      },
    });

    jest.mocked(getGrantScheme).mockResolvedValue({ version: '1' } as Scheme);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        applicationId: 'mockApplicationId',
        sections: testSections,
        applicationName: testApplicationName,
      },
    });
  });

  it('should return props with sections and applicationName with a v2 Scheme', async () => {
    jest.mocked(getGrantScheme).mockResolvedValue({ version: '2' } as Scheme);

    jest.mocked(getApplicationFormSummary).mockResolvedValue({
      sections: [
        ...testSections,
        { sectionId: 'ESSENTIAL', sectionTitle: 'title', questions: [] },
      ],
      applicationName: testApplicationName,
      grantApplicationId: 'mockGrantApplicationId',
      grantSchemeId: 'mockGrantSchemeId',
      applicationStatus: 'PUBLISHED' as const,
      audit: {
        version: 1,
        created: 'some-date',
        createdBy: 'some-date',
        lastUpdated: 'some-date',
        lastUpdateBy: 'some-date',
        lastPublished: 'some-date',
      },
    });

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        applicationId: 'mockApplicationId',
        sections: [
          ...testSections,
          {
            sectionId: 'ORGANISATION_DETAILS',
            sectionStatus: 'COMPLETE',
            sectionTitle: 'Your details',
            questions: [],
          },
          {
            questions: [],
            sectionId: 'FUNDING_DETAILS',
            sectionStatus: 'COMPLETE',
            sectionTitle: 'Funding',
          },
        ],
        applicationName: testApplicationName,
      },
    });
  });

  it('should handle errors', async () => {
    jest.mocked(getApplicationFormSummary).mockRejectedValue(axiosError);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        statusCode: 302,
        destination:
          '/error-page/code/500?href=/build-application/mockApplicationId/dashboard',
      },
    });
  });
});

describe('SectionOverview Component', () => {
  const sections = [
    {
      sectionId: 'section1',
      sectionTitle: 'Section 1',
      questions: [
        {
          questionId: 'question1',
          fieldTitle: 'Field Title 1',
          adminSummary: 'Admin Summary 1',
        },
      ],
    },
    {
      sectionId: 'section2',
      sectionTitle: 'Section 2',
      questions: [
        {
          questionId: 'question2',
          fieldTitle: 'Field Title 2',
          adminSummary: 'Admin Summary 2',
        },
      ],
    },
  ] as ApplicationFormSection[];

  it('renders section overview', () => {
    const { getByText } = render(
      <SectionOverview
        applicationId="appId"
        sections={sections}
        applicationName="Test Application"
      />
    );

    expect(getByText('Test Application')).toBeVisible();
    expect(getByText('Overview of application questions')).toBeVisible();
    expect(getByText('Section 1')).toBeVisible();
    expect(getByText('Section 2')).toBeVisible();
  });
});
