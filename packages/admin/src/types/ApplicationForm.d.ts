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
  optional: string;
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
    revision: number;
    created: string;
    createdBy: string;
    lastUpdated: string;
    lastUpdateBy: string;
  };
  sections: ApplicationFormSection[];
};

export type {
  ApplicationFormSummary,
  ApplicationFormSection,
  ApplicationFormQuestion,
  ApplicationFormStatus,
};
