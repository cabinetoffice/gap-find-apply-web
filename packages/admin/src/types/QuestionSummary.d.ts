import ResponseTypeEnum from '../enums/ResponseType';

type QuestionSummary = {
  fieldTitle: string;
  hintText: string;
  optional: string;
};

type QuestionWithOptionsSummary = {
  fieldTitle: string;
  hintText: string;
  optional: string;
  responseType: ResponseTypeEnum;
  options?: string[];
};

export type { QuestionSummary, QuestionWithOptionsSummary };
