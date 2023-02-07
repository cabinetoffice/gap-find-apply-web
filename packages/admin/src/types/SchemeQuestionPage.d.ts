import { ValidationError } from 'gap-web-ui';

type SchemeQuestionPage = {
  fieldErrors: ValidationError[];
  backButtonHref: string;
  formAction: string;
  pageCaption?: string;
  defaultValue?: string;
  csrfToken: string;
};
export default SchemeQuestionPage;
