import { NextApiRequest, NextApiResponse } from 'next';
import { GrantScheme } from '../../models/GrantScheme';
import { ApplicationService } from '../../services/ApplicationService';
import { GrantAdvertService } from '../../services/GrantAdvertService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../services/GrantSchemeService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mandatoryQuestionId = req.query.mandatoryQuestionId as string;

  try {
    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    const grantSchemeService = GrantSchemeService.getInstance();
    const applicationService = ApplicationService.getInstance();
    const grantAdvertService = GrantAdvertService.getInstance();

    const mandatoryQuestion =
      (await grantMandatoryQuestionService.getMandatoryQuestionById(
        mandatoryQuestionId,
        getJwtFromCookies(req)
      )) as GrantMandatoryQuestionDto;

    const grantScheme = (await grantSchemeService.getGrantSchemeById(
      mandatoryQuestion.schemeId.toString(),
      getJwtFromCookies(req)
    )) as GrantScheme;
    console.log(grantScheme);

    const doesSchemeHaveApplication =
      await applicationService.doesSchemeHaveApplication(
        grantScheme,
        getJwtFromCookies(req)
      );

    let redirectionUrl;

    if (doesSchemeHaveApplication) {
      // TODO check where this should redirect to
      redirectionUrl = routes.applications;
    } else {
      const externalLink = await grantAdvertService.getExternalLink(
        grantScheme.id.toString(),
        getJwtFromCookies(req)
      );
      redirectionUrl = routes.mandatoryQuestions.externalApplication(
        mandatoryQuestionId,
        externalLink.toString()
      );
    }

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
