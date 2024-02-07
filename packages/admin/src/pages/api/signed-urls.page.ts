import { NextApiRequest, NextApiResponse } from 'next';
import { createPresignedUrl } from '../../services/SubmissionsService';
import { getSessionIdFromCookies } from '../../utils/session';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';

const signUrls = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const s3Keys = req.body.s3Keys;
  const signedUrls = await Promise.all(
    s3Keys.map(
      async (s3key: string) =>
        (
          await createPresignedUrl(sessionCookie, s3key)
        ).url
    )
  );
  return res.status(200).json({ signedUrls });
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, signUrls);
