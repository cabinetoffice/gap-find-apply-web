import { NextApiRequest, NextApiResponse } from 'next';
import { GrantApplicantOrganisationProfileService } from '../../services/GrantApplicantOrganisationProfileService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../services/GrantSchemeService';
import { createSubmission } from '../../services/SubmissionService';
import { GrantApplicantOrganisationProfile } from '../../types/models/GrantApplicantOrganisationProfile';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { logger } from '../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint should handle POST requests from forms
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();
  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicantOrganisationProfileService =
    GrantApplicantOrganisationProfileService.getInstance();
  const grantSchemeService = GrantSchemeService.getInstance();

  const mandatoryQuestionId = req.query.mandatoryQuestionId?.toString();
  const schemeId = req.query.schemeId?.toString();

  if (!mandatoryQuestionId || !schemeId) {
    return res.status(400).json({
      message: 'mandatoryQuestionId and schemeId are required',
    });
  }

  const jwt = getJwtFromCookies(req);

  try {
    const grantApplicant = await grantApplicantService.getGrantApplicant(jwt);
    const mandatoryQuestionData =
      await grantMandatoryQuestionService.getMandatoryQuestionById(
        mandatoryQuestionId,
        jwt
      );

    const { grantApplication, grantAdverts } =
      await grantSchemeService.getGrantSchemeById(schemeId.toString(), jwt);

    // Check if mandatory question already has a submission
    // This prevents duplicate submissions when the first submission is being created
    // (e.g., from double-clicks or browser retries)
    // However, if the application allows multiple submissions, we should allow creating new ones
    if (
      mandatoryQuestionData.submissionId &&
      !grantApplication?.allowsMultipleSubmissions
    ) {
      logger.info(
        `Mandatory question ${mandatoryQuestionId} already has submission ${mandatoryQuestionData.submissionId}. Redirecting to existing submission.`
      );
      return res.redirect(
        303,
        `${process.env.HOST}${routes.submissions.sections(
          mandatoryQuestionData.submissionId
        )}`
      );
    }

    const updateOrganisationDetailsDto = mapUpdateOrganisationDetailsDto(
      grantApplicant.organisation,
      mandatoryQuestionData
    );

    await grantApplicantOrganisationProfileService.updateOrganisation(
      updateOrganisationDetailsDto,
      jwt
    );

    const { hasInternalApplication, hasAdvertPublished } =
      await grantSchemeService.hasSchemeInternalApplication(schemeId, jwt);
    if (hasAdvertPublished && !hasInternalApplication) {
      logger.info(
        'The grant advert has the apply to url pointing to an external url. Redirecting to external application.'
      );
      await grantMandatoryQuestionService.updateMandatoryQuestion(
        jwt,
        mandatoryQuestionId,
        'external',
        {
          mandatoryQuestionsComplete: true,
        }
      );
      return res.redirect(
        303,
        `${process.env.HOST}${routes.mandatoryQuestions.externalApplicationPage(
          mandatoryQuestionId
        )}?url=${grantAdverts[0].externalSubmissionUrl}`
      );
    }

    logger.info('Grant has an internal application. Creating submission');

    const submissionName = req.body?.submissionName;

    // Validate submission name - only alphanumeric characters and spaces allowed
    if (submissionName && !/^[a-zA-Z0-9\s]+$/.test(submissionName)) {
      // Redirect back to the summary page (for version > 1) or name submission page
      const redirectUrl = `${routes.nameSubmission(grantApplication.id.toString())}?error=invalidCharacters${submissionName ? `&submissionName=${encodeURIComponent(submissionName)}` : ''}`;
      return res.redirect(
        302,
        `${process.env.HOST}${redirectUrl}`
      );
    }

    const { submissionId } = await createSubmission(
      grantApplication.id,
      jwt,
      submissionName || undefined
    );

    await grantMandatoryQuestionService.updateMandatoryQuestion(
      jwt,
      mandatoryQuestionId,
      'creatingSubmissionFromMandatoryQuestion',
      {
        submissionId,
        mandatoryQuestionsComplete: true,
      }
    );

    logger.info(
      `Submission has been added to mandatory question: ${mandatoryQuestionId}`
    );

    // Use 303 See Other to force GET redirect after POST
    return res.redirect(
      303,
      `${process.env.HOST}${routes.submissions.sections(submissionId)}`
    );
  } catch (e) {
    return handleError(e, mandatoryQuestionId || '', res);
  }
}

function mapUpdateOrganisationDetailsDto(
  organisationData: GrantApplicantOrganisationProfile,
  mandatoryQuestionData: GrantMandatoryQuestionDto
) {
  return {
    id: organisationData.id,
    legalName: mandatoryQuestionData.name,
    type: mandatoryQuestionData.orgType,
    addressLine1: mandatoryQuestionData.addressLine1,
    addressLine2: mandatoryQuestionData.addressLine2,
    town: mandatoryQuestionData.city,
    county: mandatoryQuestionData.county,
    postcode: mandatoryQuestionData.postcode,
    charityCommissionNumber: mandatoryQuestionData.charityCommissionNumber,
    companiesHouseNumber: mandatoryQuestionData.companiesHouseNumber,
  };
}

function handleError(
  e: any,
  mandatoryQuestionId: string,
  res: NextApiResponse
) {
  logger.error('error: ', e);
  const serviceErrorProps = {
    errorInformation:
      e?.response?.data?.message || 'There was an error in the service',
    linkAttributes: {
      href: mandatoryQuestionId
        ? routes.mandatoryQuestions.summaryPage(mandatoryQuestionId)
        : routes.applications,
      linkText: mandatoryQuestionId
        ? 'Go back to the summary page and try again'
        : 'Go back to your applications and try again',
      linkInformation: '',
    },
  };
  return res.redirect(routes.serviceError(serviceErrorProps));
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
