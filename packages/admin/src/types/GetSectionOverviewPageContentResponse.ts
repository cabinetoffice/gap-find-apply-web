export interface GetSectionOverviewPageContentResponse {
  grantSchemeName: string;
  advertName: string;
  isPublishDisabled: boolean;
  sections: AdvertSection[];
}

export interface AdvertSection {
  id: string;
  title: string;
  status: AdvertQuestionStatusEnum;
  pages: AdvertPage[];
}

export interface AdvertPage {
  id: string;
  title: string;
  status: AdvertQuestionStatusEnum;
  questions: AdvertQuestions[];
}

interface AdvertQuestions {
  id: string;
  title: string;
  displayText: string;
  hintText: string;
  suffixText: string;
  options: string[];
  validation: AdvertQuestionValidation;
  responseType: AdvertQuestionResponseTypeEnum;
}

interface AdvertQuestionValidation {
  mandatory: boolean;
  minLength: number;
  maxLength: number;
}

enum AdvertQuestionResponseTypeEnum {
  SHORT_TEXT,
  LONG_TEXT,
  RICH_TEXT,
  LIST,
  INTEGER,
  DATE,
}

export enum AdvertQuestionStatusEnum {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
