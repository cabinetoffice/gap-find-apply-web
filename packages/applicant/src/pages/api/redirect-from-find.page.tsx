import { NextApiRequest, NextApiResponse } from 'next';
import { getAdvertBySlug } from '../../services/GrantAdvertService';
import { getJwtFromCookies } from '../../utils/jwt';
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
        ? `${process.env.HOST}/applications/${grantApplicationId}`
        : externalSubmissionUrl;
      res.redirect(redirectUrl);
    }

    if (version === 2) {
      res.redirect(
        `${process.env.HOST}/mandatory-questions/${grantSchemeId}/start`
      );
    }
  } catch (e) {
    res.redirect(`${process.env.HOST}/404`);
  }
}
