import { ExampleText } from 'gap-web-ui';
import AdvertStatusEnum from '../enums/AdvertStatus';
export type GetAdvertSectionPageContentResponse = {
  sectionName: string;
  pageTitle: string;
  questions: {
    responseType: ResponseType;
    questionId: string;
    questionTitle: string;
    hintText: string;
    options: string[];
    response?: {
      id: string;
      seen: boolean;
      response: string;
      multiResponse: string[];
    } | null;
    questionValidation?: QuestionValidation | null;
    fieldPrefix?: string;
    exampleText?: ExampleText;
  }[];
  previousPageId: string;
  nextPageId?: string | null;
  status: SectionStatus;
};

export type QuestionValidation = {
  maxLength: number;
  minLength: number;
  mandatory: boolean;
};

type ResponseType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'RICH_TEXT'
  | 'LIST'
  | 'INTEGER'
  | 'DATE'
  | 'CURRENCY';

export type PatchAdvertSectionPageResponseBody = {
  questions: (
    | {
        id: string;
        seen: boolean;
        response: string;
        multiResponse?: never;
      }
    | {
        id: string;
        seen: boolean;
        response?: never;
        multiResponse: string[];
      }
  )[];
  status: SectionStatus | null;
};

export type getAdvertStatusBySchemeIdResponse = {
  status: number;
  data?: {
    grantAdvertId: string;
    grantAdvertStatus: grantAdvertStatus;
    contentfulSlug: string | null;
  };
};

export type getAdvertPublishInformationBySchemeIdResponse = {
  status: number;
  data?: {
    grantAdvertId: string;
    grantAdvertStatus: grantAdvertStatus;
    contentfulSlug: string | null;
    openingDate: string | null;
    closingDate: string | null;
    firstPublishedDate: string | null;
    lastUnpublishedDate: string | null;
    unpublishedDate: string | null;
  };
};

type grantAdvertStatus =
  | AdvertStatusEnum.DRAFT
  | AdvertStatusEnum.PUBLISHED
  | AdvertStatusEnum.SCHEDULED
  | AdvertStatusEnum.UNPUBLISHED
  | AdvertStatusEnum.UNSCHEDULED;

export type PreviewPageTab = {
  name: string;
  content: string;
};

export type PreviewPageContent = {
  grantName: string;
  grantShortDescription: string;
  grantApplicationOpenDate: string;
  grantApplicationCloseDate: string;
  tabs: PreviewPageTab[];
};

type SectionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CHANGED';
