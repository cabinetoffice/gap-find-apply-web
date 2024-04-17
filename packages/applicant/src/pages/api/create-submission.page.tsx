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
  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();
  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicantOrganisationProfileService =
    GrantApplicantOrganisationProfileService.getInstance();
  const grantSchemeService = GrantSchemeService.getInstance();

  const mandatoryQuestionId = req.query.mandatoryQuestionId.toString();
  const schemeId = req.query.schemeId.toString();
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
        'The grant advert, has the apply to url pointing to an external url. Redirecting to external application.'
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
        `${process.env.HOST}${routes.mandatoryQuestions.externalApplicationPage(
          mandatoryQuestionId
        )}?url=${grantAdverts[0].externalSubmissionUrl}`
      );
    }

    logger.info('Grant has an internal application. Creating submission');

    const { submissionId } = await createSubmission(grantApplication.id, jwt);

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

    return res.redirect(
      `${process.env.HOST}${routes.submissions.sections(submissionId)}`
    );
  } catch (e) {
    return handleError(e, mandatoryQuestionId, res);
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
    errorInformation: 'There was an error in the service',
    linkAttributes: {
      href: routes.mandatoryQuestions.summaryPage(mandatoryQuestionId),
      linkText: 'Go back to the summary page and try again',
      linkInformation: '',
    },
  };
  return res.redirect(routes.serviceError(serviceErrorProps));
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
