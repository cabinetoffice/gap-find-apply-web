import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGrantExistsInContentful,
  getAdvertBySlug,
} from '../../services/GrantAdvertService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = req.query.slug as string;
  const grantWebpageUrl = req.query.grantWebpageUrl as string;

  try {
    const { isAdvertInContentful } = await checkIfGrantExistsInContentful(
      slug,
      getJwtFromCookies(req)
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
    } = await getAdvertBySlug(getJwtFromCookies(req), slug);

    if (!isAdvertInDatabase && isAdvertInContentful) {
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
        throw new Error();
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
    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.dashboard,
        linkText: 'Go back to your dashboard',
        linkInformation: '',
      },
    };
    console.log(e);
    res.redirect(
      `${process.env.HOST}${routes.serviceError(serviceErrorProps)}`
    );
  }
}
