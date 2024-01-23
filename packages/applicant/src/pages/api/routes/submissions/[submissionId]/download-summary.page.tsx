import type { NextApiRequest, NextApiResponse } from 'next';
import { routes } from '../../../../../utils/routes';
import { downloadSummary } from '../../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import { APIGlobalHandler } from '../../../../../utils/apiErrorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const submissionId = req.query.submissionId.toString();
  const { data } = await downloadSummary(submissionId, getJwtFromCookies(req));

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename=submission.odt');
  res.send(Buffer.from(data));
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);
