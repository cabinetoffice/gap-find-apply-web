import { ValidationError } from '../../../types/ValidationErrorType';

export interface ExampleText {
  title: string;
  text: string;
}

export interface InputComponentProps {
  questionTitle?: string;
  boldHeading?: boolean;
  titleSize?: 's' | 'm' | 'l' | 'xl';
  questionHintText?: string | JSX.Element | null;
  fieldName: string;
  fieldErrors: ValidationError[];
  TitleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  multipleQuestionPage?: boolean;
  exampleText?: ExampleText;
  newLineAccepted?: boolean;
}
