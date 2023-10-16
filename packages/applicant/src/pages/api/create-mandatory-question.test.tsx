import { merge } from 'lodash';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import { routes } from '../../utils/routes';
import handler from './create-mandatory-question';

jest.mock('../../services/GrantMandatoryQuestionService.ts');
jest.mock('../../utils/jwt');

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides: any = {}) =>
  merge({
    query: {
      schemeId: 'schemeId',
    },
  });

const res = (overrides: any = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  );

describe('API Handler Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to organisation-name page when mandatory question gets created in db', async () => {
    GrantMandatoryQuestionService.getInstance.mockReturnValue({
      createMandatoryQuestion: jest
        .fn()
        .mockResolvedValue('mandatoryQuestionId'),
    });

    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      routes.mandatoryQuestions.namePage('mandatoryQuestionId')
    );
  });
  it('should redirect to error page when there is an error in the backend', async () => {
    await handler(req(), res());

    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.dashboard,
        linkText: 'Go back to your dashboard',
        linkInformation: '',
      },
    };
    expect(mockedRedirect).toHaveBeenCalledWith(
      `/service-error?serviceErrorProps=${JSON.stringify(serviceErrorProps)}`
    );
  });
});
