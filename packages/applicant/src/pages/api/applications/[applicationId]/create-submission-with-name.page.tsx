import { NextApiRequest, NextApiResponse } from 'next';
import { createSubmission } from '../../../../services/SubmissionService';
import { getApplicationById } from '../../../../services/ApplicationService';
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
    
    // Fetch application to check if multiple submissions are enabled
    const application = await getApplicationById(applicationId, jwt);
    
    // Validate submission name is required when multiple submissions are enabled
    if (application?.allowsMultipleSubmissions) {
      if (!submissionName || submissionName.trim() === '') {
        const redirectUrl = `${routes.nameSubmission(applicationId)}?error=required`;
        return res.redirect(
          302,
          `${process.env.HOST || ''}${redirectUrl}`
        );
      }
    }

    // Validate submission name - only alphanumeric characters and spaces allowed
    if (submissionName && !/^[a-zA-Z0-9\s]+$/.test(submissionName)) {
      const redirectUrl = `${routes.nameSubmission(applicationId)}?error=invalidCharacters${submissionName ? `&submissionName=${encodeURIComponent(submissionName)}` : ''}`;
      return res.redirect(
        302,
        `${process.env.HOST || ''}${redirectUrl}`
      );
    }

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
