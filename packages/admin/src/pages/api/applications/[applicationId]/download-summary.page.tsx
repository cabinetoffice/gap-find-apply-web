import type { NextApiRequest, NextApiResponse } from 'next';
import { downloadSummary } from '../../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { APIGlobalHandler } from '../../../../utils/apiErrorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const applicationId = (req.query.applicationId || '').toString();
  const { data } = await downloadSummary(
    applicationId,
    getSessionIdFromCookies(req)
  );

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename=application.odt');
  res.send(Buffer.from(data));
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);
