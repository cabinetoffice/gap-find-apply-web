import { NextApiRequest, NextApiResponse } from 'next';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { MQ_ORG_TYPES } from '../../utils/constants';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schemeId = req.query.schemeId as string;

  try {
    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    const mandatoryQuestion =
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        getJwtFromCookies(req)
      );

    const shouldShowCompaniesHouseAndCharityCommission = ![
      MQ_ORG_TYPES.INDIVIDUAL,
      MQ_ORG_TYPES.NON_LIMITED_COMPANY,
    ].includes(mandatoryQuestion.orgType);

    const organisationProfileKeys = [
      'orgType',
      'name',
      'addressLine1',
      'city',
      'postcode',
      ...(shouldShowCompaniesHouseAndCharityCommission
        ? ['companiesHouseNumber', 'charityCommissionNumber']
        : []),
    ];

    const areOrganisationProfileQuestionsComplete =
      organisationProfileKeys.every((key) => {
        const value = mandatoryQuestion[key];
        return value !== null && value !== undefined && value !== '';
      });

    const redirectionUrl = areOrganisationProfileQuestionsComplete
      ? `${routes.mandatoryQuestions.fundingAmountPage(
          mandatoryQuestion.id
        )}?skip=true`
      : routes.mandatoryQuestions.typePage(mandatoryQuestion.id);

    return res.redirect(`${process.env.HOST}${redirectionUrl}`);
  } catch (e) {
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
}
