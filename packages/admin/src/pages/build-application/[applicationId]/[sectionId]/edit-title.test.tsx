import { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from './edit-title.page';
import { updateSectionTitle } from '../../../../services/SectionService';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';

jest.mock('../../../../services/SectionService', () => ({
  updateSectionTitle: jest.fn(),
}));

jest.mock('../../../../services/ApplicationService');

beforeEach(() => {
  (getApplicationFormSummary as jest.Mock).mockResolvedValue({
    sections: [
      { sectionId: 'testSectionId', sectionTitle: 'Custom section name' },
    ],
    applicationStatus: 'DRAFT',
    audit: {
      version: 1,
    },
  });
});

const getContext = (method: string) =>
  ({
    params: {
      applicationId: 'testApplicationId',
      sectionId: 'testSectionId',
    },
    req: {
      cookies: { session: 'testSessionId' },
      headers: {
        cookie: 'your-cookie-value',
      },
      method,
    },
    res: {
      getHeader: () => ({
        'x-csrf-token': 'token',
      }),
    },
  } as unknown as GetServerSidePropsContext);

describe('getServerSideProps()', () => {
  process.env.SESSION_COOKIE_NAME = 'session';
  it('should call handleRequest for POST request', async () => {
    await getServerSideProps(getContext('POST'));

    expect(updateSectionTitle).toHaveBeenCalled();
  });

  it('should call handleRequest for GET request', async () => {
    await getServerSideProps(getContext('GET'));

    expect(updateSectionTitle).not.toHaveBeenCalled();
    expect(getApplicationFormSummary).toHaveBeenCalledWith(
      'testApplicationId',
      'testSessionId'
    );
  });
});
