import axios from 'axios';
import { GrantBeneficiary } from '../types/models/GrantBeneficiary';
import { axiosConfig } from '../utils/jwt';

const BASE_URL = process.env.BACKEND_HOST + '/equality-and-diversity';

const postGrantBeneficiaryResponse = async (
  body: GrantBeneficiary,
  jwt: string,
  grantBeneficiaryId?: string
) => {
  const response = await axios.patch(BASE_URL, body, {
    params: {
      grantBeneficiaryId: grantBeneficiaryId,
    },
    ...axiosConfig(jwt),
  });
  return response.data as string;
};

const getGrantBeneficiary = async (submissionId: string, jwt: string) => {
  const response = await axios.get(
    `${BASE_URL}/${submissionId}`,
    axiosConfig(jwt)
  );
  return response.data as GrantBeneficiary;
};

export { postGrantBeneficiaryResponse, getGrantBeneficiary };
