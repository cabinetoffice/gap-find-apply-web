import { merge } from 'lodash';
import { downloadDueDiligenceData } from '../../../../../services/SpotlightSubmissionService';
import downloadSpotlightChecks from './downloadSpotlightSubmissionsChecks.page';

jest.mock('../../../../../services/SpotlightSubmissionService');

const SCHEME_ID = 'testSchemeId';

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides: any = {}) =>
  merge(
    {
      query: {
        schemeId: SCHEME_ID,
      },
      headers: {
        referer: `/scheme/${SCHEME_ID}/manage-due-diligence-checks`,
      },
      cookies: { sessionCookieName: 'testSessionId' },
    },
    overrides
  );

const res = (overrides: any = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  );

describe('spotlightExportHandler', () => {
  beforeEach(() => {
    process.env.SUB_PATH = '/apply';
    process.env.SESSION_COOKIE_NAME = 'sessionCookieName';
  });

  it('Should redirect to service error page when trying to retrieve spotlight export csv file throws an error', async () => {
    (downloadDueDiligenceData as jest.Mock).mockRejectedValue({});

    await downloadSpotlightChecks(req(), res());

    expect(mockedRedirect).toHaveBeenNthCalledWith(
      1,
      `/apply/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to download the information for Spotlight checks.","linkAttributes":{"href":"/scheme/testSchemeId/manage-due-diligence-checks","linkText":"Please return","linkInformation":" and try again."}}`
    );
  });

  it('Should redirect to service error page when result for downloadDueDiligenceData is undefined', async () => {
    (downloadDueDiligenceData as jest.Mock).mockResolvedValue(undefined);

    await downloadSpotlightChecks(req(), res());
    expect(mockedRedirect).toHaveBeenNthCalledWith(
      1,
      `/apply/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to download the information for Spotlight checks.","linkAttributes":{"href":"/scheme/testSchemeId/manage-due-diligence-checks","linkText":"Please return","linkInformation":" and try again."}}`
    );
  });

  it('Should set the correct headers and send the data back to client when downloadDueDiligenceData data is retrieved successfully', async () => {
    (downloadDueDiligenceData as jest.Mock).mockResolvedValue({
      headers: {
        'content-disposition': 'Test content disposition',
        'content-type': 'Test content type',
        'content-length': 'Test content length',
      },
      data: 'Some csv data',
    });

    await downloadSpotlightChecks(req(), res());
    expect(mockedSetHeader).toHaveBeenCalledTimes(3);
    expect(mockedSetHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'Test content disposition'
    );
    expect(mockedSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'Test content type'
    );
    expect(mockedSetHeader).toHaveBeenCalledWith(
      'Content-Length',
      'Test content length'
    );
    expect(mockedSend).toHaveBeenNthCalledWith(1, 'Some csv data');
  });
});
