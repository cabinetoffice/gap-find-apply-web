import { GrantMandatoryQuestionDto } from '../../services/GrantMandatoryQuestionService';

export type GrantAdvert = {
  id?: string;
  externalSubmissionUrl?: string;
  version?: number;
  grantApplicationId?: number;
  isInternal?: boolean;
  grantSchemeId?: number;
  isAdvertInDatabase: boolean;
  mandatoryQuestionsDto?: GrantMandatoryQuestionDto;
  isPublished?: boolean;
};
