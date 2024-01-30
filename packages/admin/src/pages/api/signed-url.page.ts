import { NextApiRequest, NextApiResponse } from 'next';
import { createPresignedUrl } from '../../services/SubmissionsService';
import { getSessionIdFromCookies } from '../../utils/session';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';

const signUrl = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const s3Key = req.query.key as string;
  const { url } = await createPresignedUrl(
    sessionCookie,
    decodeURIComponent(s3Key)
  );
  return res.redirect(url);
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, signUrl);
