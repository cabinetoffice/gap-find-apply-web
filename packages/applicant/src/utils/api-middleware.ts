import { NextApiRequest, NextApiResponse } from 'next';

export async function APIGlobalHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.HOST}/500`);
  }
}
