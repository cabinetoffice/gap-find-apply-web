import { merge } from 'lodash';
import { AdvertDto, getAdvertBySlug } from '../../services/GrantAdvertService';
import { getJwtFromCookies } from '../../utils/jwt';
import handler from './redirect-from-find.page';

// Mock the getAdvertBySlug function (you may need to adjust this based on your actual implementation)
jest.mock('../../services/GrantAdvertService');
jest.mock('../../utils/jwt');
const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides: any = {}) =>
  merge({
    query: {
      slug: 'slug',
    },
  });

const res = (overrides: any = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  );

describe('API Handler Tests', () => {
  beforeEach(() => {
    process.env.HOST = 'http://localhost';
    jest.resetAllMocks();
  });
  it('should redirect to /applications/<applicationId> when advert is version 1 and have internal application', async () => {
    const advertDTO: AdvertDto = {
      id: '123',
      version: 1,
      grantApplicationId: 123,
      isInternal: true,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
    };

    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/applications/123'
    );
  });
  it('should redirect to the external Submission Url when advert is version 1 and have internal application', async () => {
    const advertDTO: AdvertDto = {
      id: '123',
      version: 1,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
    };

    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith('http://example.com');
  });

  it('should redirect to the new Mandatory Question journey start page when advert is version 2 and have internal application', async () => {
    const advertDTO: AdvertDto = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: true,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
    };

    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/mandatory-questions/start?schemeId=456'
    );
  });

  it('should redirect to the new Mandatory Question journey start page when advert is version 2 and have external application', async () => {
    const advertDTO: AdvertDto = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
    };

    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/mandatory-questions/start?schemeId=456'
    );
  });
  it('should redirect to the service Error when there is an error in the call to the backend', async () => {
    (getAdvertBySlug as jest.Mock).mockRejectedValue(new Error('error'));
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());
    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: '/dashboard',
        linkText: 'Go back to your dashboard',
        linkInformation: '',
      },
    };
    expect(mockedRedirect).toHaveBeenCalledWith(
      `http://localhost/service-error?serviceErrorProps=${JSON.stringify(
        serviceErrorProps
      )}`
    );
  });
});
