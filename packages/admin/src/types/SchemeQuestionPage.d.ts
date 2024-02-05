import { ValidationError } from 'gap-web-ui';

type SchemeQuestionPage = {
  fieldErrors: ValidationError[];
  backButtonHref: string;
  formAction: string;
  pageCaption?: string;
  defaultValue?: string;
  deleteConfirmationUrl: string;
  csrfToken: string;
  backTo?: string;
};
export default SchemeQuestionPage;
