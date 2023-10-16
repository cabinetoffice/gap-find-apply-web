import { NextApiRequest, NextApiResponse } from 'next';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schemeId = req.query.schemeId as string;
  console.log('schemeId', schemeId);
  try {
    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    console.log('grantMandatoryQuestionService', grantMandatoryQuestionService);
    console.log(
      'BANANA',
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        getJwtFromCookies(req)
      )
    );
    const mandatoryQuestionId =
      await grantMandatoryQuestionService.createMandatoryQuestion(
        schemeId,
        getJwtFromCookies(req)
      );

    res.redirect(
      `${process.env.HOST}${routes.mandatoryQuestions.namePage(
        mandatoryQuestionId
      )}`
    );
  } catch (e) {
    console.log('e', e);
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
