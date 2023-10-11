import { NextApiRequest, NextApiResponse } from 'next';
import { getAdvertBySlug } from '../../services/GrantAdvertService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = req.query.slug as string;
  try {
    const {
      externalSubmissionUrl,
      version,
      grantApplicationId,
      isInternal,
      grantSchemeId,
    } = await getAdvertBySlug(getJwtFromCookies(req), slug);

    if (version === 1) {
      const redirectUrl = isInternal
        ? `${process.env.HOST}${routes.applications}/${grantApplicationId}`
        : externalSubmissionUrl;
      res.redirect(redirectUrl);
    }

    if (version === 2) {
      res.redirect(
        `${process.env.HOST}${routes.mandatoryQuestions.startPage(
          grantSchemeId.toString()
        )}`
      );
    }
  } catch (e) {
    res.redirect(`${process.env.HOST}/404`);
  }
}
