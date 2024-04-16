import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

export async function APIGlobalHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) {
  try {
    await handler(req, res);
  } catch (error) {
    logger.error(logger.utils.addErrorInfo(error, req));
    res.redirect(
      `${process.env.SUB_PATH}/service-error?serviceErrorProps=${JSON.stringify(
        {
          errorInformation:
            'Something went wrong while trying to contact the server.',
        }
      )}`
    );
  }
}
