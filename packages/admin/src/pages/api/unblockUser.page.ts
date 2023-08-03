import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserRoles } from '../../services/SuperAdminService';
import { getUserTokenFromCookies } from '../../utils/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const jwt = getUserTokenFromCookies(req);
  const newUserRoles = ['1', '2'];

  await updateUserRoles(id, newUserRoles, jwt);

  res.redirect(303, `${process.env.SUB_PATH}/super-admin-dashboard/user/${id}`);
  res.end();
}
