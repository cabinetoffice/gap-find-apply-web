import type { NextApiRequest, NextApiResponse } from 'next';
import { downloadDueDiligenceData } from '../../services/MandatoryQuestionsService';
import { getSessionIdFromCookies } from '../../utils/session';

const downloadDueDiligenceChecks = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log('downloadDueDiligenceChecks');

  const schemeId = req.query.schemeId as string;
  const internal = req.query.internal as string;

  const errorRedirect = () => {
    res.redirect(
      `${process.env.SUB_PATH}/service-error?serviceErrorProps=${JSON.stringify(
        {
          errorInformation:
            'Something went wrong while trying to download due diligence information.',
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
    result = await downloadDueDiligenceData(
      getSessionIdFromCookies(req),
      schemeId,
      internal
    );
  } catch (error) {
    console.log('error', error);
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

export default downloadDueDiligenceChecks;
