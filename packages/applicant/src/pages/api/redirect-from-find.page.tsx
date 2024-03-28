import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGrantExistsInContentful,
  getAdvertBySlug,
  validateGrantWebpageUrl,
} from '../../services/GrantAdvertService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';
import { logger } from '../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const contentfulSlug = req.query.slug as string;
  const grantWebpageUrl = req.query.grantWebpageUrl as string;
  const jwt = getJwtFromCookies(req);

  if (contentfulSlug === undefined && grantWebpageUrl == 'grant-is-closed') {
    const redirectUrl = `${process.env.HOST}/grant-is-closed`;
    return res.redirect(redirectUrl);
  }

  try {
    const { isAdvertInContentful } = await checkIfGrantExistsInContentful(
      contentfulSlug,
      jwt
    );

    if (!isAdvertInContentful) {
      throw new Error('Grant does not exist in contentful');
    }

    const {
      externalSubmissionUrl,
      version,
      grantApplicationId,
      isInternal,
      grantSchemeId,
      isAdvertInDatabase,
      mandatoryQuestionsDto,
      isPublished,
    } = await getAdvertBySlug(jwt, contentfulSlug);

    if (!isAdvertInDatabase && isAdvertInContentful) {
      await validateGrantWebpageUrl({ grantWebpageUrl, contentfulSlug, jwt });
      res.redirect(grantWebpageUrl);
    }

    if (version === 1) {
      const redirectUrl = isInternal
        ? `${process.env.HOST}${routes.applications}/${grantApplicationId}`
        : externalSubmissionUrl;
      res.redirect(redirectUrl);
    }

    if (version === 2) {
      if (!isPublished) {
        redirectToServiceError();
      }

      const mqAreCompleted =
        mandatoryQuestionsDto !== null &&
        mandatoryQuestionsDto.status === 'COMPLETED';

      const advertIsInternal = mandatoryQuestionsDto?.submissionId !== null;

      if (mqAreCompleted) {
        const redirectUrl = advertIsInternal
          ? `${process.env.HOST}${routes.applications}`
          : externalSubmissionUrl;

        return res.redirect(redirectUrl);
      }

      //if they are not completed, redirect to the start page
      return res.redirect(
        `${process.env.HOST}${routes.mandatoryQuestions.startPage(
          grantSchemeId.toString()
        )}`
      );
    }
  } catch (e) {
    logger.error(
      'Error redirecting from find',
      logger.utils.addErrorInfo(e, req)
    );
    redirectToServiceError();
  }

  function redirectToServiceError() {
    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.dashboard,
        linkText: 'Go back to your dashboard',
        linkInformation: '',
      },
    };
    res.redirect(
      `${process.env.HOST}${routes.serviceError(serviceErrorProps)}`
    );
  }
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);
