import { merge } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  GrantExistsInContentfulDto,
  checkIfGrantExistsInContentful,
  getAdvertBySlug,
  validateGrantWebpageUrl,
} from '../../services/GrantAdvertService';
import { GrantMandatoryQuestionDto } from '../../services/GrantMandatoryQuestionService';
import { Overrides } from '../../testUtils/unitTestHelpers';
import { getJwtFromCookies } from '../../utils/jwt';
import handler from './redirect-from-find.page';
import { GrantAdvert } from '../../types/models/GrantAdvert';

// Mock the getAdvertBySlug function (you may need to adjust this based on your actual implementation)
jest.mock('../../services/GrantAdvertService');
jest.mock('../../utils/jwt');
const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      query: {
        slug: 'slug',
        grantWebpageUrl: 'grantWebpageUrl',
      },
    },
    overrides || {}
  ) as unknown as NextApiRequest;

const res = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides || {}
  ) as unknown as NextApiResponse;

const backup_host = process.env.HOST;

const advertIsInContenful: GrantExistsInContentfulDto = {
  isAdvertInContentful: true,
};

describe('API Handler Tests', () => {
  beforeEach(() => {
    process.env.HOST = 'http://localhost';
    jest.resetAllMocks();
  });
  afterEach(() => {
    process.env.HOST = backup_host;
  });

  it('should redirect to /grantWebPageUrl when advert is only in contentful', async () => {
    const advertDTO: GrantAdvert = {
      id: null,
      version: null,
      grantApplicationId: null,
      isInternal: null,
      grantSchemeId: null,
      externalSubmissionUrl: null,
      isAdvertInDatabase: false,
      mandatoryQuestionsDto: null,
      isPublished: true,
    };

    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );

    await handler(req(), res());
    expect(validateGrantWebpageUrl).toHaveBeenCalled();

    expect(mockedRedirect).toHaveBeenCalledWith('grantWebpageUrl');
  });
  it('should redirect to /applications/<applicationId> when advert is version 1 and have internal application', async () => {
    const advertDTO: GrantAdvert = {
      id: '123',
      version: 1,
      grantApplicationId: 123,
      isInternal: true,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: null,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/applications/123'
    );
  });
  it('should redirect to the external Submission Url when advert is version 1 and have internal application', async () => {
    const advertDTO: GrantAdvert = {
      id: '123',
      version: 1,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: null,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith('http://example.com');
  });

  it('should redirect to the new Mandatory Question journey start page when advert is version 2 and have internal application', async () => {
    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: true,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: null,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/mandatory-questions/start?schemeId=456'
    );
  });

  it('should redirect to the new Mandatory Question journey start page when advert is version 2 and have external application', async () => {
    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: null,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/mandatory-questions/start?schemeId=456'
    );
  });
  it('should redirect to the new Mandatory Question journey start page when advert is version 2 and mandatoryQuestionsDto has not submissionId', async () => {
    const mandatoryQuestionsDto: GrantMandatoryQuestionDto = {
      submissionId: null,
      status: 'NOT_STARTED',
    };

    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: mandatoryQuestionsDto,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/mandatory-questions/start?schemeId=456'
    );
  });

  it('should redirect to the submission page when advert is version 2 and mandatoryQuestionsDto has COMPLETED status, and advert is internal', async () => {
    const mandatoryQuestionsDto: GrantMandatoryQuestionDto = {
      submissionId: '125',
      status: 'COMPLETED',
    };

    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: mandatoryQuestionsDto,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      'http://localhost/applications'
    );
  });

  it('should redirect to the externalSubmissionUrl when advert is version 2, mandatoryQuestionsDto have COMPLETED status and advert is external', async () => {
    const mandatoryQuestionsDto: GrantMandatoryQuestionDto = {
      submissionId: null,
      status: 'COMPLETED',
    };

    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: mandatoryQuestionsDto,
      isPublished: true,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith('http://example.com');
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

  it('should redirect to the service Error when there the grant does not exist in contentful', async () => {
    (checkIfGrantExistsInContentful as jest.Mock).mockReturnValue({
      isAdvertInContentful: false,
    });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    try {
      await handler(req(), res());
    } catch (e) {
      expect(e.message).toBe('Grant does not exist in contentful');
    }

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

  it('should redirect to the the error page when the advert has not been published', async () => {
    const mandatoryQuestionsDto: GrantMandatoryQuestionDto = {
      submissionId: null,
      status: 'COMPLETED',
    };

    const advertDTO: GrantAdvert = {
      id: '123',
      version: 2,
      grantApplicationId: 123,
      isInternal: false,
      grantSchemeId: 456,
      externalSubmissionUrl: 'http://example.com',
      isAdvertInDatabase: true,
      mandatoryQuestionsDto: mandatoryQuestionsDto,
      isPublished: false,
    };

    (checkIfGrantExistsInContentful as jest.Mock).mockResolvedValue(
      advertIsInContenful
    );
    (getAdvertBySlug as jest.Mock).mockResolvedValue(advertDTO);
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

  it('should redirect to the grant-is-closed paged when the slug is null and the grantwebpageurl is grant-is-closed', async () => {
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    const req = {
      query: {
        slug: undefined,
        grantWebpageUrl: 'grant-is-closed',
      },
    } as unknown as NextApiRequest;
    await handler(req, res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      `http://localhost/grant-is-closed`
    );
  });
});
