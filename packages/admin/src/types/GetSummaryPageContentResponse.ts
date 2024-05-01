import { grantAdvertStatus } from '../services/AdvertPageService.d';

export interface GrantAdvertSummaryPageQuestion {
  id: string;
  title: string;
  response: string | null;
  multiResponse: string[] | null;
  summarySuffixText?: string;
  responseType: GrantAdvertQuestionResponseType;
}

export interface GrantAdvertSummaryPagePage {
  id: string;
  title: string;
  questions: GrantAdvertSummaryPageQuestion[];
}

export interface GrantAdvertSummaryPageSection {
  id: string;
  title: string;
  pages: GrantAdvertSummaryPagePage[];
}

export interface GrantAdvertSummaryPageResponse {
  id: string;
  advertName: string;
  sections: GrantAdvertSummaryPageSection[];
  status: grantAdvertStatus;
  openingDate: Date;
  closingDate: Date;
}

export enum GrantAdvertQuestionResponseType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  RICH_TEXT = 'RICH_TEXT',
  LIST = 'LIST',
  INTEGER = 'INTEGER',
  DATE_TIME = 'DATE_TIME',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
}
