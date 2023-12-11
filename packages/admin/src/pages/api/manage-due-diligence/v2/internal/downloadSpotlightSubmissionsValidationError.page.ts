import type { NextApiRequest, NextApiResponse } from 'next';
import { getSpotlightValidationErrorSubmissions } from '../../../../../services/SpotlightBatchService';
import { getSessionIdFromCookies } from '../../../../../utils/session';

const downloadSpotlightSubmissionsValidationError = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const schemeId = req.query.schemeId as string;
  const errorRedirect = () => {
    res.redirect(
      `${process.env.SUB_PATH}/service-error?serviceErrorProps=${JSON.stringify(
        {
          errorInformation:
            'Something went wrong while trying to download the information for Spotlight submissions with validation errors.',
          linkAttributes: {
            href: `/scheme/${schemeId}/manage-due-diligence-checks`,
            linkText: 'Please return',
            linkInformation: ' and try again.',
          },
        }
      )}`
    );
  };

  let result;
  try {
    result = await getSpotlightValidationErrorSubmissions(
      getSessionIdFromCookies(req),
      schemeId
    );
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

export default downloadSpotlightSubmissionsValidationError;
