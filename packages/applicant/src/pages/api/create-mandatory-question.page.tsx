import { NextApiRequest, NextApiResponse } from 'next';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { GrantApplicantOrganisationProfileService } from '../../services/GrantApplicantOrganisationProfileService';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';
import { logger } from '../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();
  const grantApplicantOrganisationProfileService =
    GrantApplicantOrganisationProfileService.getInstance();

  const schemeId = req.query.schemeId as string;
  const jwt = getJwtFromCookies(req);
  try {
    const mandatoryQuestion =
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        jwt
      );

    const isOrgProfileCompleted =
      await grantApplicantOrganisationProfileService.isOrgProfileComplete(jwt);

    if (isOrgProfileCompleted) {
      return res.redirect(
        `${process.env.HOST}${routes.mandatoryQuestions.fundingAmountPage(
          mandatoryQuestion.id
        )}`
      );
    } else {
      return res.redirect(
        `${process.env.HOST}${routes.mandatoryQuestions.typePage(
          mandatoryQuestion.id
        )}`
      );
    }
  } catch (e) {
    return handleError(e, req, res);
  }
}

function handleError(e, req: NextApiRequest, res: NextApiResponse) {
  logger.error(logger.utils.addErrorInfo(e, req));
  const serviceErrorProps = {
    errorInformation: 'There was an error in the service',
    linkAttributes: {
      href: routes.dashboard,
      linkText: 'Go back to your dashboard',
      linkInformation: '',
    },
  };
  return res.redirect(routes.serviceError(serviceErrorProps));
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
