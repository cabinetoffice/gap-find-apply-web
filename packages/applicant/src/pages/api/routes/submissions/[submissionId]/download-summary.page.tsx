import type { NextApiRequest, NextApiResponse } from 'next';
import { routes } from '../../../../../utils/routes';
import { downloadSummary } from '../../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../../utils/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const submissionId = req.query.submissionId.toString();
  const { data } = await downloadSummary(submissionId, getJwtFromCookies(req));
  res.send(Buffer.from(data));
}
