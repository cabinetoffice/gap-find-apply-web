import { NextApiRequest, NextApiResponse } from 'next';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { MQ_ORG_TYPES } from '../../utils/constants';
import { InferServiceMethodResponse } from 'gap-web-ui';

const grantMandatoryQuestionService =
  GrantMandatoryQuestionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schemeId = req.query.schemeId as string;
  try {
    const mandatoryQuestion =
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        getJwtFromCookies(req)
      );

    const isOrgProfileCompleted = isOrgProfileComplete(mandatoryQuestion);

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
    return handleError(e, res);
  }
}

type MandatoryQuestion = InferServiceMethodResponse<
  typeof GrantMandatoryQuestionService.prototype.createMandatoryQuestion
>;

export function isOrgProfileComplete(mandatoryQuestion: MandatoryQuestion) {
  const shouldShowCompaniesHouseAndCharityCommission =
    mandatoryQuestion.orgType !== MQ_ORG_TYPES.INDIVIDUAL &&
    mandatoryQuestion.orgType !== MQ_ORG_TYPES.NON_LIMITED_COMPANY;

  return Object.keys(mandatoryQuestion)
    .filter(
      (key) =>
        shouldShowCompaniesHouseAndCharityCommission ||
        (key !== 'companiesHouseNumber' && key !== 'charityCommissionNumber')
    )
    .every((key) => !!key);
}

function handleError(e: any, res: NextApiResponse) {
  console.error('error: ', e);
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
