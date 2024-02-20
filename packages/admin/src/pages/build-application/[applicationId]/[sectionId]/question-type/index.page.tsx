import { Button, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import ResponseType, {
  ResponseTypeLabels,
} from '../../../../../enums/ResponseType';
import QuestionTypeHint from '../components/QuestionTypeHint';

import { getServerSideProps } from './index.getServerSideProps';
import InferProps from '../../../../../types/InferProps';

const getPageTitle = (fieldErrors: string | any[], isEdit: boolean) =>
  `${fieldErrors.length > 0 ? 'Error: ' : ''}${
    isEdit ? 'Change question type' : 'Add a question'
  } - Manage a grant`;

const QuestionType = ({
  pageData: { sectionName, defaultRadio, backButtonHref },
  formAction,
  fieldErrors,
  csrfToken,
  isEdit,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title={getPageTitle(fieldErrors, isEdit)} />

      <CustomLink
        isBackButton
        dataCy="cy_questionType-page-back-button"
        href={backButtonHref}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={sectionName}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="How would you like this question to be answered?"
            questionHintText={
              isEdit
                ? "If you change the way that applicants answer this question, you will lose any changes you have made to the question's settings. The question's title and description will be kept."
                : 'Choose how you would like your question to be answered?'
            }
            fieldName="responseType"
            fieldErrors={fieldErrors}
            defaultChecked={defaultRadio}
            radioOptions={[
              {
                label: ResponseTypeLabels[ResponseType.ShortAnswer],
                hint: (
                  <QuestionTypeHint
                    description="Can have a maximum of 300 words entered."
                    questionType="short-answer"
                    imageFileName="text-input"
                    imageAlt="A screenshot of a text input, with a title and description"
                    detailsTitle="See how a short answer looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.LongAnswer],
                hint: (
                  <QuestionTypeHint
                    noDescriptionLineBreak
                    description="Can have a maximum of 5000 words entered. You can set a custom word limit."
                    questionType="long-answer"
                    imageFileName="text-area"
                    imageAlt="A screenshot of a long text area input, along with a title and description"
                    detailsTitle="See how a long answer looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.YesNo],
                hint: (
                  <QuestionTypeHint
                    description="Allows one option to be selected."
                    questionType="yes-no"
                    imageFileName="radio"
                    imageAlt="A screenshot of a radio input that has a yes and a no option, with a title and description"
                    detailsTitle="See how a Yes/No question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.Dropdown],
                value: 'Dropdown',
                hint: (
                  <QuestionTypeHint
                    description="Allows just one option to be selected from multiple."
                    questionType="dropdown"
                    imageFileName="dropdown"
                    imageAlt="A screenshot of a dropdown input which allows you to select one option, with a title and description"
                    detailsTitle="See how a multiple choice question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.MultipleSelection],
                value: 'MultipleSelection',
                hint: (
                  <QuestionTypeHint
                    description="Allows more than one option to be selected from multiple."
                    questionType="multiple-selection"
                    imageFileName="multiselect"
                    imageAlt="A screenshot of multiple checkbox inputs which allows the user to select multiple options, with a title and description"
                    detailsTitle="See how a multiple select question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.SingleFileUpload],
                value: ResponseType.SingleFileUpload,
                hint: (
                  <QuestionTypeHint
                    description="Allows files that are .DOC, .DOCX, .ODT, .PDF, .XLS, .XLSX or .ZIP"
                    questionType="document-upload"
                    imageFileName="document-upload"
                    imageAlt="A screenshot of a document upload component, with a button that allows the user to choose a file to upload"
                    detailsTitle="See how document upload looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.Date],
                hint: (
                  <QuestionTypeHint
                    description="Allows a DD/MM/YYYY format to be entered."
                    questionType="date"
                    imageFileName="date"
                    imageAlt="A screenshot of a date input (day, month and year), with a title and description"
                    detailsTitle="See how a date question looks"
                  />
                ),
              },
            ]}
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default QuestionType;
export { getServerSideProps };
