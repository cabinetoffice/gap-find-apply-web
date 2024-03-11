import { LastUpdatedBy } from './../pages/scheme/components/BuildAdvertContentHelper';
import axios from 'axios';
import getConfig from 'next/config';
import AdvertStatusEnum from '../enums/AdvertStatus';
import { InferServiceMethodResponse } from '../testUtils/unitTestHelpers';
import {
  createNewAdvert,
  getAdvertPreviewPageContent,
  getAdvertSectionPageContent,
  getAdvertStatusBySchemeId,
  getSectionOverviewPageContent,
  patchAdvertSectionPage,
  publishAdvert,
  unpublishAdvert,
  scheduleAdvert,
  getGrantAdvertPublishInformationBySchemeId,
  unscheduleAdvert,
} from './AdvertPageService';
import { PatchAdvertSectionPageResponseBody } from './AdvertPageService.d';
import { decrypt } from '../utils/encryption';

jest.mock('axios');

jest.mock('../utils/encryption');

describe('AdvertPageService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const advertName = 'testAdvertName';
  const schemeId = 'testSchemeId';
  const sessionId = 'testSessionId';
  const applicationId = 'testApplicationId';
  const advertId = 'testAdvertId';
  const advertStatus = 'testAdvertStatus';
  const sectionId = 'testSectionId';
  const pageId = 'testPageId';
  const BASE_ADVERT_URL = BACKEND_HOST + '/grant-advert';
  const BASE_ADVERT_PAGE_URL = BACKEND_HOST + '/pages/adverts';

  const getSectionOverviewPageContentUrl = `${BASE_ADVERT_PAGE_URL}/section-overview?schemeId=${schemeId}&advertId=${advertId}`;
  const getAdvertPreviewPageContentUrl = `${BASE_ADVERT_PAGE_URL}/${advertId}/preview`;

  describe('createNewAdvert function', () => {
    it('Should create a new application scheme', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: applicationId } });

      const response = await createNewAdvert(sessionId, schemeId, advertName);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BACKEND_HOST}/grant-advert/create`,
        {
          grantSchemeId: schemeId,
          name: advertName,
        },
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );

      expect(response).toStrictEqual({ id: 'testApplicationId' });
    });
  });

  describe('getSectionOverviewPageContent function', () => {
    it('Should send valid get request to backend', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          grantSchemeName: 'grantScheme',
          publishUrl: 'publishUrl',
          isPublishDisabled: true,
          sections: [],
        },
      });
      const response = await getSectionOverviewPageContent(
        sessionId,
        schemeId,
        advertId
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        getSectionOverviewPageContentUrl,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );

      expect(response).toStrictEqual({
        grantSchemeName: 'grantScheme',
        publishUrl: 'publishUrl',
        isPublishDisabled: true,
        sections: [],
      });
    });
  });

  describe('getAdvertSectionPage function', () => {
    const expectedResponse: InferServiceMethodResponse<
      typeof getAdvertSectionPageContent
    > = {
      nextPageId: 'testNextPageId',
      status: 'NOT_STARTED',
      pageTitle: 'Test Page Title',
      previousPageId: 'testPreviousPageId',
      questions: [],
      sectionName: 'testSectionName',
    };

    it('Should send valid get request to backend', async () => {
      mockedAxios.get.mockResolvedValue({
        data: expectedResponse,
      });

      await getAdvertSectionPageContent(sessionId, advertId, sectionId, pageId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ADVERT_PAGE_URL}/${advertId}/questions-page`,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
          params: {
            advertPageId: 'testPageId',
            advertSectionId: 'testSectionId',
          },
        }
      );
    });

    it('Should return the data returned from axios', async () => {
      mockedAxios.get.mockResolvedValue({
        data: expectedResponse,
      });

      const response = await getAdvertSectionPageContent(
        sessionId,
        advertId,
        sectionId,
        pageId
      );

      expect(response).toStrictEqual(
        expect.objectContaining<
          InferServiceMethodResponse<typeof getAdvertSectionPageContent>
        >(expectedResponse)
      );
    });
  });

  describe('patchAdvertSectionPage function', () => {
    const requestBody: PatchAdvertSectionPageResponseBody = {
      status: 'NOT_STARTED',
      questions: [
        { id: 'testQuestionId', response: 'testResponse', seen: true },
      ],
    };

    it('Should send valid patch request to backend', async () => {
      await patchAdvertSectionPage(
        sessionId,
        advertId,
        sectionId,
        pageId,
        requestBody
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_ADVERT_URL}/${advertId}/sections/${sectionId}/pages/${pageId}`,
        requestBody,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('getAdvertStatusBySchemeId function', () => {
    it('Should send a valid get request to and return data returned from axios', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { grantAdvertId: advertId, grantAdvertStatus: advertStatus },
      });

      const response = await getAdvertStatusBySchemeId(sessionId, schemeId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ADVERT_URL}/status`,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
          params: {
            grantSchemeId: 'testSchemeId',
          },
        }
      );

      expect(response).toStrictEqual({
        status: 200,
        data: { grantAdvertId: advertId, grantAdvertStatus: advertStatus },
      });
    });

    it('Should handle 404 errors correctly and return status object', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 404,
        data: null,
      });

      const response = await getAdvertStatusBySchemeId(sessionId, schemeId);

      expect(response).toStrictEqual({
        status: 404,
        data: null,
      });
    });
  });

  describe('getAdvertPublishInformation function', () => {
    const getExpectedResponse = (): InferServiceMethodResponse<
      typeof getGrantAdvertPublishInformationBySchemeId
    > => ({
      status: 200,
      data: {
        created: '2023-03-30T23:01:00Z',
        validLastUpdated: true,
        lastPublishedDate: '2023-03-30T23:01:00Z',
        lastUpdatedByEmail: 'testUser',
        lastUpdated: '2023-03-30T23:01:00Z',
        grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
        grantAdvertStatus: AdvertStatusEnum.DRAFT,
        contentfulSlug: null,
        openingDate: null,
        closingDate: null,
        firstPublishedDate: null,
        lastUnpublishedDate: null,
        unpublishedDate: null,
      },
    });

    it('Should send valid get request to backend', async () => {
      mockedAxios.get.mockResolvedValue({
        data: getExpectedResponse(),
      });

      await getGrantAdvertPublishInformationBySchemeId(
        sessionId,
        'jwt',
        advertId
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ADVERT_URL}/publish-information`,
        {
          headers: { Cookie: 'SESSION=testSessionId; user-service-token=jwt' },
          withCredentials: true,
          params: {
            grantSchemeId: 'testAdvertId',
          },
        }
      );
    });

    //this
    it('Should return the data returned from axios', async () => {
      mockedAxios.get.mockResolvedValue(getExpectedResponse());

      (decrypt as jest.Mock).mockResolvedValue('testUser');

      const response = await getGrantAdvertPublishInformationBySchemeId(
        sessionId,
        'jwt',
        advertId
      );

      expect(decrypt).toHaveBeenCalledWith('testUser');

      expect(response).toMatchObject(
        expect.objectContaining<
          InferServiceMethodResponse<
            typeof getGrantAdvertPublishInformationBySchemeId
          >
        >(getExpectedResponse())
      );
    });
  });

  describe('publishAdvert function', () => {
    it('Should publish a grant advert', async () => {
      await publishAdvert(sessionId, advertId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BACKEND_HOST}/grant-advert/${advertId}/publish`,
        {},
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });
  });

  describe('unpublishAdvert function', () => {
    it('It should unpublish a grant advert', async () => {
      await unpublishAdvert(sessionId, advertId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BACKEND_HOST}/grant-advert/${advertId}/unpublish`,
        {},
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('scheduleAdvert function', () => {
    it('Should publish a grant advert', async () => {
      await scheduleAdvert(sessionId, advertId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BACKEND_HOST}/grant-advert/${advertId}/schedule`,
        {},
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });
  });

  describe('unscheduleAdvert function', () => {
    it('Should unschedule a grant advert', async () => {
      await unscheduleAdvert(sessionId, advertId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BACKEND_HOST}/grant-advert/${advertId}/unschedule`,
        {},
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });
  describe('getAdvertPreviewPageContent function', () => {
    it('Should send valid get request to backend', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          grantName: 'grantName',
          grantShortDescription: 'description',
          grantApplicationOpenDate: 'openDate',
          grantApplicationCloseDate: 'closeDate',
          tabs: {
            summary: '',
            eligibility: '',
            objectives: '',
            dates: '',
            howToApply: '',
            supportingInformation: '',
          },
        },
      });
      const response = await getAdvertPreviewPageContent(sessionId, advertId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        getAdvertPreviewPageContentUrl,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );

      expect(response).toStrictEqual({
        grantName: 'grantName',
        grantShortDescription: 'description',
        grantApplicationOpenDate: 'openDate',
        grantApplicationCloseDate: 'closeDate',
        tabs: {
          summary: '',
          eligibility: '',
          objectives: '',
          dates: '',
          howToApply: '',
          supportingInformation: '',
        },
      });
    });
  });
});
