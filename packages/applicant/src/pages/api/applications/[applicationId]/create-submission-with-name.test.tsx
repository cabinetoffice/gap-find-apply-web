import { merge } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { getApplicationById } from '../../../../services/ApplicationService';
import { createSubmission } from '../../../../services/SubmissionService';
import { Overrides } from '../../../../testUtils/unitTestHelpers';
import { getJwtFromCookies } from '../../../../utils/jwt';
import { routes } from '../../../../utils/routes';
import handler from './create-submission-with-name.page';

jest.mock('../../../../services/ApplicationService');
jest.mock('../../../../services/SubmissionService');
jest.mock('../../../../utils/jwt');

const APPLICATION_ID = '1';

const mockedRedirect = jest.fn();
const mockedJson = jest.fn();
const mockedStatus = jest.fn();

const req = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      method: 'POST',
      query: { applicationId: APPLICATION_ID },
      body: { submissionName: 'My application' },
      headers: {},
    },
    overrides || {}
  ) as unknown as NextApiRequest;

const res = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      redirect: mockedRedirect,
      status: mockedStatus,
    },
    overrides || {}
  ) as unknown as NextApiResponse;

const backup_host = process.env.HOST;

describe('create-submission-with-name API handler', () => {
  beforeEach(() => {
    process.env.HOST = 'http://localhost';
    jest.resetAllMocks();
    mockedStatus.mockReturnValue({ json: mockedJson });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (getApplicationById as jest.Mock).mockResolvedValue({
      id: APPLICATION_ID,
      allowsMultipleSubmissions: true,
    });
    (createSubmission as jest.Mock).mockResolvedValue({
      submissionCreated: true,
      submissionId: 'submissionId',
    });
  });

  afterEach(() => {
    process.env.HOST = backup_host;
  });

  it('redirects to the sections page with a 303 so the browser follows with a GET', async () => {
    await handler(req(), res());

    expect(createSubmission).toHaveBeenCalledWith(
      APPLICATION_ID,
      'testJwt',
      'My application'
    );
    expect(mockedRedirect).toHaveBeenCalledWith(
      303,
      `http://localhost${routes.submissions.sections('submissionId')}`
    );
  });

  it('redirects back to the name page with a 303 when the name is missing', async () => {
    await handler(req({ body: { submissionName: '' } }), res());

    expect(createSubmission).not.toHaveBeenCalled();
    expect(mockedRedirect).toHaveBeenCalledWith(
      303,
      `http://localhost${routes.nameSubmission(APPLICATION_ID)}?error=required`
    );
  });

  it('redirects back to the name page with a 303 when the name has invalid characters', async () => {
    await handler(req({ body: { submissionName: 'My-application' } }), res());

    expect(createSubmission).not.toHaveBeenCalled();
    expect(mockedRedirect).toHaveBeenCalledWith(
      303,
      `http://localhost${routes.nameSubmission(
        APPLICATION_ID
      )}?error=invalidCharacters&submissionName=My-application`
    );
  });

  it('redirects to the service error page with a 303 when submission creation fails', async () => {
    (createSubmission as jest.Mock).mockRejectedValue(new Error('backend down'));

    await handler(req(), res());

    const serviceErrorProps = {
      errorInformation: 'Something went wrong while creating your application',
      linkAttributes: {
        href: routes.applications,
        linkText: 'Go back to your applications and try again',
        linkInformation: '',
      },
    };
    expect(mockedRedirect).toHaveBeenCalledWith(
      303,
      `http://localhost${routes.serviceError(serviceErrorProps)}`
    );
  });

  it('returns 405 for methods other than POST', async () => {
    await handler(req({ method: 'GET' }), res());

    expect(mockedStatus).toHaveBeenCalledWith(405);
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
