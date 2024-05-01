import getConfig from 'next/config';
import { GetSectionOverviewPageContentResponse } from '../types/GetSectionOverviewPageContentResponse';
import { GrantAdvertSummaryPageResponse } from '../types/GetSummaryPageContentResponse';
import { axiosSessionConfig, getFullConfig } from '../utils/session';
import {
  GetAdvertSectionPageContentResponse,
  getAdvertStatusBySchemeIdResponse,
  getAdvertPublishInformationBySchemeIdResponse,
  PatchAdvertSectionPageResponseBody,
  PreviewPageContent,
} from './AdvertPageService.d';
import { decrypt } from '../utils/encryption';
import { axios } from '../utils/axios';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_ADVERT_PAGE_URL = BACKEND_HOST + '/pages/adverts';
const BASE_ADVERT_URL = BACKEND_HOST + '/grant-advert';

const createNewAdvert = async (
  sessionId: string,
  schemeId: string,
  advertName: string
) => {
  const requestBody = {
    grantSchemeId: schemeId,
    advertName,
  };

  const res = await axios.post(
    `${BACKEND_HOST}/grant-advert/create`,
    requestBody,
    axiosSessionConfig(sessionId)
  );

  return res.data;
};

const getSectionOverviewPageContent = async (
  sessionId: string,
  schemeId: string,
  advertId: string
): Promise<GetSectionOverviewPageContentResponse> => {
  const res = await axios.get(
    `${BASE_ADVERT_PAGE_URL}/section-overview?schemeId=${schemeId}&advertId=${advertId}`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );
  return res.data;
};

const getSummaryPageContent = async (
  sessionId: string,
  schemeId: string,
  advertId: string
): Promise<GrantAdvertSummaryPageResponse> => {
  const res = await axios.get(
    `${BASE_ADVERT_PAGE_URL}/summary?schemeId=${schemeId}&advertId=${advertId}`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );
  return res.data;
};

const getAdvertSectionPageContent = async (
  sessionId: string,
  grantAdvertId: string,
  advertSectionId: string,
  advertPageId: string
): Promise<GetAdvertSectionPageContentResponse> => {
  const res = await axios.get(
    `${BASE_ADVERT_PAGE_URL}/${grantAdvertId}/questions-page`,
    {
      ...axiosSessionConfig(sessionId),
      params: {
        advertSectionId,
        advertPageId,
      },
    }
  );

  return res.data;
};

const patchAdvertSectionPage = async (
  sessionId: string,
  grantAdvertId: string,
  sectionId: string,
  pageId: string,
  patchAdvertPageResponse: PatchAdvertSectionPageResponseBody
) => {
  await axios.patch(
    `${BASE_ADVERT_URL}/${grantAdvertId}/sections/${sectionId}/pages/${pageId}`,
    patchAdvertPageResponse,
    axiosSessionConfig(sessionId)
  );
};

const publishAdvert = async (sessionId: string, advertId: string) => {
  await axios.post(
    `${BACKEND_HOST}/grant-advert/${advertId}/publish`,
    {},
    axiosSessionConfig(sessionId)
  );
};

const unpublishAdvert = async (sessionId: string, advertId: string) => {
  await axios.post(
    `${BACKEND_HOST}/grant-advert/${advertId}/unpublish`,
    {},
    axiosSessionConfig(sessionId)
  );
};

const unscheduleAdvert = async (sessionId: string, advertId: string) => {
  await axios.post(
    `${BACKEND_HOST}/grant-advert/${advertId}/unschedule`,
    {},
    axiosSessionConfig(sessionId)
  );
};

const scheduleAdvert = async (sessionId: string, advertId: string) => {
  await axios.post(
    `${BACKEND_HOST}/grant-advert/${advertId}/schedule`,
    {},
    axiosSessionConfig(sessionId)
  );
};

const getGrantAdvertPublishInformationBySchemeId = async (
  sessionId: string,
  userServiceJwt: string,
  grantSchemeId: string
): Promise<getAdvertPublishInformationBySchemeIdResponse> => {
  const res = await axios.get(`${BASE_ADVERT_URL}/publish-information`, {
    ...getFullConfig(sessionId, userServiceJwt),
    params: {
      grantSchemeId,
    },
  });

  res.data.lastUpdatedByEmail = res.data.lastUpdatedByEmail
    ? await decrypt(res.data.lastUpdatedByEmail)
    : 'Deleted user';

  return { status: res.status, data: res.data };
};

const getAdvertStatusBySchemeId = async (
  sessionId: string,
  grantSchemeId: string
): Promise<getAdvertStatusBySchemeIdResponse> => {
  const res = await axios.get(`${BASE_ADVERT_URL}/status`, {
    ...axiosSessionConfig(sessionId),
    params: {
      grantSchemeId,
    },
  });
  return { status: res.status, data: res.data };
};

const getAdvertDetailsPreviewContent = async (
  sessionId: string,
  grantAdvertId: string
): Promise<PreviewPageContent> => {
  const res = await axios.get(
    `${BASE_ADVERT_PAGE_URL}/${grantAdvertId}/preview`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );

  return res.data;
};

export {
  createNewAdvert,
  getSectionOverviewPageContent,
  getAdvertSectionPageContent,
  patchAdvertSectionPage,
  publishAdvert,
  unpublishAdvert,
  unscheduleAdvert,
  getSummaryPageContent,
  getAdvertStatusBySchemeId,
  scheduleAdvert,
  getGrantAdvertPublishInformationBySchemeId,
  getAdvertDetailsPreviewContent,
};
