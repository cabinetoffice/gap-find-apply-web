import axios from 'axios';
import { GrantBeneficiary } from '../models/GrantBeneficiary';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from './GrantBeneficiaryService';

jest.mock('axios');

const BACKEND_HOST = process.env.BACKEND_HOST + '/equality-and-diversity';
const GRANT_BENEFICIARY_ID = 'testGrantBeneficiaryId';
const grantBeneficiary = {
  submissionId: 'testSubmissionId',
  hasProvidedAdditionalAnswers: true,
} as GrantBeneficiary;

describe('GrantBeneficiaryService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('postGrantBeneficiaryResponse', () => {
    it('Should call axios', async () => {
      (axios.patch as jest.Mock).mockResolvedValue({});

      await postGrantBeneficiaryResponse(
        grantBeneficiary,
        'testJwt',
        GRANT_BENEFICIARY_ID
      );

      expect(axios.patch as jest.Mock).toHaveBeenNthCalledWith(
        1,
        BACKEND_HOST,
        grantBeneficiary,
        {
          params: {
            grantBeneficiaryId: GRANT_BENEFICIARY_ID,
          },
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer testJwt',
          },
        }
      );
    });

    it('Should return a grantBeneficiaryId', async () => {
      (axios.patch as jest.Mock).mockResolvedValue({
        data: GRANT_BENEFICIARY_ID,
      });

      const response = await postGrantBeneficiaryResponse(
        grantBeneficiary,
        'testJwt',
        GRANT_BENEFICIARY_ID
      );

      expect(response).toStrictEqual(GRANT_BENEFICIARY_ID);
    });
  });

  describe('getGrantBeneficiary', () => {
    it('Should call axios', async () => {
      (axios.get as jest.Mock).mockResolvedValue({});

      await getGrantBeneficiary(GRANT_BENEFICIARY_ID, 'testJwt');

      expect(axios.get as jest.Mock).toHaveBeenNthCalledWith(
        1,
        `${BACKEND_HOST}/${GRANT_BENEFICIARY_ID}`,
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
        data: grantBeneficiary,
      });

      const response = await getGrantBeneficiary(
        GRANT_BENEFICIARY_ID,
        'testJwt'
      );

      expect(response).toStrictEqual(grantBeneficiary);
    });
  });
});
