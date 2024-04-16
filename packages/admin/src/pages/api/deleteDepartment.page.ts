import { NextApiRequest, NextApiResponse } from 'next';
import { getUserTokenFromCookies } from '../../utils/session';
import { deleteDepartmentInformation } from '../../services/SuperAdminService';
import { logger } from '../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const departmentId = req.query.id as string;
  const jwt = getUserTokenFromCookies(req);

  try {
    await deleteDepartmentInformation(departmentId, jwt);
  } catch (error) {
    logger.error(logger.utils.addErrorInfo(error, req));

    if ((error as any)?.response?.status === 500) {
      res.redirect(
        303,
        `${process.env.SUB_PATH}/super-admin-dashboard/manage-departments/delete/${departmentId}/error`
      );
    } else {
      res.redirect(
        303,
        `${
          process.env.SUB_PATH
        }/service-error?serviceErrorProps=${JSON.stringify({
          errorInformation:
            'Something went wrong while deleting the department.',
          linkAttributes: {
            href: `/super-admin-dashboard/manage-departments/delete/${departmentId}`,
            linkText: 'Please return',
            linkInformation: ' and try again.',
          },
        })}`
      );
    }

    res.end();
    return;
  }

  res.redirect(
    303,
    `${process.env.SUB_PATH}/super-admin-dashboard/manage-departments`
  );
  res.end();
}
