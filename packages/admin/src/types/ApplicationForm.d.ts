import ResponseType from '../enums/ResponseType';

type ApplicationFormQuestion = {
  questionId: string;
  profileField: string;
  fieldPrefix: string;
  fieldTitle: string;
  hintText: string;
  adminSummary: string;
  displayText: string;
  questionSuffix: string;
  responseType: ResponseType;
  validation: { [key: string]: string | undefined };
  options?: string[];
};

type ApplicationFormStatus = 'INCOMPLETE' | 'COMPLETE';

type ApplicationFormSection = {
  sectionId: string;
  sectionTitle: string;
  sectionStatus?: ApplicationFormStatus;
  questions?: ApplicationFormQuestion[];
};

type ApplicationFormSummary = {
  grantApplicationId: string;
  grantSchemeId: string;
  applicationName: string;
  applicationStatus: 'DRAFT' | 'PUBLISHED' | 'REMOVED';
  audit: {
    version: number;
    created: string;
    lastUpdatedDate: string;
    lastUpdatedBy: string;
    lastPublished: string;
  };
  sections: ApplicationFormSection[];
};

export type {
  ApplicationFormSummary,
  ApplicationFormSection,
  ApplicationFormQuestion,
  ApplicationFormStatus,
};
