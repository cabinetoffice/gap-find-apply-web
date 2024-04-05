import {
  AdvertDto,
  checkIfGrantExistsInContentful,
  getAdvertBySchemeId,
  getAdvertBySlug,
  GrantExistsInContentfulDto,
} from './GrantAdvertService';
import { axios } from '../utils/axios';

jest.mock('../utils/axios');

process.env.BACKEND_HOST = 'http://localhost:8080';
const GRANT_ADVERT_BACKEND_BASE_URL =
  process.env.BACKEND_HOST + '/grant-adverts';
const advertDTO: AdvertDto = {
  id: '123',
  version: 2,
  grantApplicationId: 123,
  isInternal: true,
  grantSchemeId: 456,
  externalSubmissionUrl: 'http://example.com',
  isAdvertInDatabase: false,
};

describe('GrantAdvert Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAdvertBySlug', () => {
    it('Should call axios', async () => {
      (axios.get as jest.Mock).mockResolvedValue({});

      await getAdvertBySlug('testJwt', 'slug');

      expect(axios.get as jest.Mock).toHaveBeenNthCalledWith(
        1,
        `${GRANT_ADVERT_BACKEND_BASE_URL}?contentfulSlug=slug`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer testJwt',
          },
        }
      );
    });

    it('Should return an Advert DTO', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: advertDTO,
      });

      const response = await getAdvertBySlug('testJwt', 'slug');

      expect(response).toStrictEqual(advertDTO);
    });
  });

  describe('checkIfGrantExistsInContentful', () => {
    it('Should call axios', async () => {
      (axios.get as jest.Mock).mockResolvedValue({});

      await checkIfGrantExistsInContentful('slug', 'testJwt');

      expect(axios.get as jest.Mock).toHaveBeenNthCalledWith(
        1,
        `${GRANT_ADVERT_BACKEND_BASE_URL}/slug/exists-in-contentful`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer testJwt',
          },
        }
      );
    });

    it('Should return a the expected data', async () => {
      const expectedResponse: GrantExistsInContentfulDto = {
        isAdvertInContentful: true,
      };
      (axios.get as jest.Mock).mockResolvedValue({
        data: expectedResponse,
      });

      const response = await checkIfGrantExistsInContentful('slug', 'testJwt');

      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('getAdvertBySchemeId', () => {
    it('Should call axios', async () => {
      (axios.get as jest.Mock).mockResolvedValue({});

      await getAdvertBySchemeId('schemeId', 'testJwt');

      expect(axios.get as jest.Mock).toHaveBeenNthCalledWith(
        1,
        `${GRANT_ADVERT_BACKEND_BASE_URL}/scheme/schemeId`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer testJwt',
          },
        }
      );
    });

    it('Should return an Advert DTO', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: advertDTO,
      });

      const response = await getAdvertBySchemeId('schemeId', 'testJwt');

      expect(response).toStrictEqual(advertDTO);
    });
  });
});
