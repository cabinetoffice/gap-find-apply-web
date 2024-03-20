import { AxiosError } from 'axios';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from './section-overview.page';

jest.mock('../../../services/ApplicationService');
jest.mock('../../../utils/session');

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
    req: {},
    params: {
      applicationId: 'mockApplicationId',
    },
  } as unknown as GetServerSidePropsContext;

  const axiosError = { response: { data: { code: 500 } } } as AxiosError;

  it('should return props with sections and applicationName', async () => {
    const testSections = [
      { sectionId: 'testSectionId', sectionTitle: 'title', questions: [] },
    ];
    const testApplicationName = 'mockApplicationName';

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

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        applicationId: 'mockApplicationId',
        sections: testSections,
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
