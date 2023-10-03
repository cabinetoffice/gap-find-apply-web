import { NextApiRequest, NextApiResponse } from 'next';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const grantApplicantService = GrantApplicantService.getInstance();
  const doesApplicantExist = await grantApplicantService.doesApplicantExist(
    getJwtFromCookies(req)
  );
  if (!doesApplicantExist) {
    await grantApplicantService.createAnApplicant(getJwtFromCookies(req));
  }
  const applyMigrationStatus = req.query?.applyMigrationStatus as string;
  const findMigrationStatus = req.query?.findMigrationStatus as string;
  let url = process.env.APPLICANT_FRONTEND_URL;

  if (applyMigrationStatus) {
    url += `?applyMigrationStatus=${applyMigrationStatus}`;
  }
  if (applyMigrationStatus && findMigrationStatus) {
    url += `&`;
  }
  if (findMigrationStatus) {
    url += `?findMigrationStatus=${findMigrationStatus}`;
  }
  res.redirect(url);
}
