import type { NextApiRequest, NextApiResponse } from 'next';
import { spotlightExport } from '../../services/SubmissionsService';
import { getSessionIdFromCookies } from '../../utils/session';

const downloadRequiredChecks = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const applicationId = req.query.applicationId as string;
  const schemeId = req.query.schemeId as string;
  const errorRedirect = () => {
    res.redirect(
      `${process.env.SUB_PATH}/service-error?serviceErrorProps=${JSON.stringify(
        {
          errorInformation:
            'Something went wrong while trying to download required checks.',
          linkAttributes: {
            href: `/scheme/${schemeId}`,
            linkText: 'Please return',
            linkInformation: ' and try again.',
          },
        }
      )}`
    );
  };

  let result;
  try {
    result = await spotlightExport(getSessionIdFromCookies(req), applicationId);
  } catch (error) {
    errorRedirect();
    return;
  }

  if (result !== undefined) {
    res.setHeader('Content-Disposition', result.headers['content-disposition']);
    res.setHeader('Content-Type', result.headers['content-type']);
    res.setHeader('Content-Length', result.headers['content-length']);
    res.send(result.data);
  } else {
    errorRedirect();
    return;
  }
};

export default downloadRequiredChecks;
