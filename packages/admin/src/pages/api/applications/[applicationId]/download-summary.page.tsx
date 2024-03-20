import type { NextApiRequest, NextApiResponse } from 'next';
import {
  downloadSummary,
  getApplicationFormSummary,
} from '../../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { APIGlobalHandler } from '../../../../utils/apiErrorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionCookie = getSessionIdFromCookies(req);
  const applicationId = (req.query.applicationId || '').toString();

  const { data } = await downloadSummary(applicationId, sessionCookie);

  const application = await getApplicationFormSummary(
    applicationId,
    sessionCookie,
    false,
    false
  );
  const applicationName = application.applicationName
    .substring(0, 100)
    .replaceAll(new RegExp('[^a-zA-Z0-9\\-\\.()]', 'g'), '_');
  const filename = `${applicationName}_questions.odt`;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(Buffer.from(data));
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);
