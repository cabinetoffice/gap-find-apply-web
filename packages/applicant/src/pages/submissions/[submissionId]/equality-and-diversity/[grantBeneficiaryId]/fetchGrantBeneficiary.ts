import { GetServerSidePropsContext } from 'next';
import { getGrantBeneficiary } from '../../../../../services/GrantBeneficiaryService';
import { getJwtFromCookies } from '../../../../../utils/jwt';

export const fetchGrantBeneficiary = async (
  submissionId: string,
  req: GetServerSidePropsContext['req']
) => {
  const grantBeneficiary = await getGrantBeneficiary(
    submissionId,
    getJwtFromCookies(req)
  );
  return grantBeneficiary;
};
