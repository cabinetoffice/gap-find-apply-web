import { NextApiRequest, NextApiResponse } from 'next';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const grantApplicantService = GrantApplicantService.getInstance();
  const doesApplicantExist: Boolean =
    await grantApplicantService.doesApplicantExist(getJwtFromCookies(req));
  if (!doesApplicantExist) {
    await grantApplicantService.createAnApplicant(getJwtFromCookies(req));
  }
  res.redirect(process.env.APPLICANT_FRONTEND_URL);
}
