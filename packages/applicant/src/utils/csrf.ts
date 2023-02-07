import csurf from 'csurf';
import { parseBody } from 'next/dist/server/api-utils/node';
import { IncomingMessage } from 'http';

const initiateCSRFCookie = async (req: IncomingMessage, res: any) => {
  await new Promise((resolve, reject) =>
    csurf({ cookie: { secure: true, sameSite: 'strict', httpOnly: true } })(
      req as any,
      res,
      (result: unknown) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      }
    )
  );
  return { nonPost: true };
};

const validateCSRF = async (req: IncomingMessage, res: any, body?: any) => {
  const parsedBody = body ? body : await parseBody(req, '1mb');

  await new Promise((resolve, reject) =>
    csurf({
      cookie: { secure: true, sameSite: 'strict', httpOnly: true },
      value: () => parsedBody._csrf,
    })(req as any, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    })
  );
};

export { initiateCSRFCookie, validateCSRF };
