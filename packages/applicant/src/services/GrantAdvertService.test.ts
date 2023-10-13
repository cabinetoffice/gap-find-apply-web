import axios from 'axios';
import { AdvertDto, getAdvertBySlug } from './GrantAdvertService';

jest.mock('axios');

const BACKEND_HOST = process.env.BACKEND_HOST + '/grant-adverts';
const advertDTO: AdvertDto = {
  id: '123',
  version: 2,
  grantApplicationId: 123,
  isInternal: true,
  grantSchemeId: 456,
  externalSubmissionUrl: 'http://example.com',
  isAdvertOnlyInContentful: false,
};
describe('GrantAdvert Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getGrantBeneficiary', () => {
    it('Should call axios', async () => {
      (axios.get as jest.Mock).mockResolvedValue({});

      await getAdvertBySlug('testJwt', 'slug');

      expect(axios.get as jest.Mock).toHaveBeenNthCalledWith(
        1,
        `${BACKEND_HOST}?contentfulSlug=slug`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer testJwt',
          },
        }
      );
    });

    it('Should return a GrantBeneficiary', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: advertDTO,
      });

      const response = await getAdvertBySlug('testJwt', 'slug');

      expect(response).toStrictEqual(advertDTO);
    });
  });
});
