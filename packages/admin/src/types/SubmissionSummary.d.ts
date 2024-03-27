export type SectionData = {
  sectionId: string;
  sectionTitle: string;
  sectionStatus: string;
  questionIds: string[];
  questions: QuestionType[];
};

export type QuestionType = {
  questionId: string;
  profileField?: string;
  displayText?: string;
  questionSuffix?: string;
  fieldTitle: string;
  hintText?: string;
  responseType: string;
  validation: QuestionValidation;
  response?: string;
  options?: string[];
  multiResponse?: string[];
  attachmentId?: string;
};

export type QuestionValidation = {
  mandatory: boolean;
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  greaterThanZero?: boolean;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
};
