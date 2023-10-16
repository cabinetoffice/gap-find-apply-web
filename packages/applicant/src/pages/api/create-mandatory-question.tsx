import { NextApiRequest, NextApiResponse } from 'next';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schemeId = req.query.schemeId as string;

  try {
    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();

    const mandatoryQuestionId =
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        getJwtFromCookies(req)
      );

    res.redirect(routes.mandatoryQuestions.namePage(mandatoryQuestionId));
  } catch (e) {
    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.dashboard,
        linkText: 'Go back to your dashboard',
        linkInformation: '',
      },
    };
    res.redirect(routes.serviceError(serviceErrorProps));
  }
}
