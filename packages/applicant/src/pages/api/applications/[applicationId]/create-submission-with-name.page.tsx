import { NextApiRequest, NextApiResponse } from 'next';
import { createSubmission } from '../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../utils/jwt';
import { routes } from '../../../../utils/routes';
import { APIGlobalHandler } from '../../../../utils/apiErrorHandler';
import { logger } from '../../../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const applicationId = req.query.applicationId?.toString();
  const submissionName = req.body?.submissionName;

  if (!applicationId) {
    return res.status(400).json({ message: 'Application ID is required' });
  }

  try {
    const jwt = getJwtFromCookies(req);
    const { submissionId } = await createSubmission(
      applicationId,
      jwt,
      submissionName || undefined
    );

    logger.info(
      `Submission created with ID: ${submissionId} for application: ${applicationId}`
    );

    return res.redirect(
      `${process.env.HOST || ''}${routes.submissions.sections(submissionId)}`
    );
  } catch (e: any) {
    logger.error('Error creating submission:', e);
    const serviceErrorProps = {
      errorInformation:
        e?.response?.data?.message ||
        'Something went wrong while creating your application',
      linkAttributes: {
        href: routes.applications,
        linkText: 'Go back to your applications and try again',
        linkInformation: '',
      },
    };
    return res.redirect(routes.serviceError(serviceErrorProps));
  }
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
