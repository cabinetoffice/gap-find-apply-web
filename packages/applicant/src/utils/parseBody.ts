import bodyParser from 'body-parser';
import util from 'util';

const middleware = util.promisify(bodyParser.urlencoded({ extended: true }));

export const parseBody = async (req, res) => {
  await middleware(req, res);
  return req.body;
};
