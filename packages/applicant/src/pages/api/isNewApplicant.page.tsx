import { NextApiRequest, NextApiResponse } from 'next';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const grantApplicantService = GrantApplicantService.getInstance();
  const doesApplicantExist: boolean =
    await grantApplicantService.doesApplicantExist(getJwtFromCookies(req));
  if (!doesApplicantExist) {
    await grantApplicantService.createAnApplicant(getJwtFromCookies(req));
  }

  req.query.migrationStatus
    ? res.redirect(
        `${process.env.APPLICANT_FRONTEND_URL}?migrationStatus=${req.query.migrationStatus}`
      )
    : res.redirect(process.env.APPLICANT_FRONTEND_URL);
}
