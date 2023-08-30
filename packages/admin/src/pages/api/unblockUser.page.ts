import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserRoles } from '../../services/SuperAdminService';
import { getUserTokenFromCookies } from '../../utils/session';

const FIND = '1';
const APPLICANT = '2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const jwt = getUserTokenFromCookies(req);
  const newUserRoles = [FIND, APPLICANT];

  await updateUserRoles(id, newUserRoles, jwt);

  res.redirect(303, `${process.env.SUB_PATH}/super-admin-dashboard/user/${id}`);
  res.end();
}
