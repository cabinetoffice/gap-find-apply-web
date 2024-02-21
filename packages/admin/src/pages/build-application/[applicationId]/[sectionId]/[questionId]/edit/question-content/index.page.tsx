import {
  Button,
  FlexibleQuestionPageLayout,
  Radio,
  TextArea,
  TextInput,
} from 'gap-web-ui';
import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../../components/layout/Meta';
import getServerSideProps from './getServerSideProps';
import InferProps from '../../../../../../../types/InferProps';
import ResponseTypeEnum from '../../../../../../../enums/ResponseType';

export { getServerSideProps };

const QuestionContent = ({
  fieldErrors,
  formAction,
  csrfToken,
  pageData: {
    backButtonHref,
    questionData,
    deleteConfirmationUrl,
    backTo,
    previewUrl,
  },
  previousValues,
}: InferProps<typeof getServerSideProps>) => {
  const optionalRadioDefault = () => {
    if (previousValues?.optional)
      return previousValues?.optional === 'true' ? 'Yes' : 'No';
    if (questionData.validation.mandatory !== undefined)
      return Boolean(questionData.validation.mandatory) === false
        ? 'Yes'
        : 'No';
    return undefined;
  };

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit this question - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Edit this question</h1>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            fieldName="fieldTitle"
            questionTitle="Question title"
            titleSize="m"
            questionHintText="This will be shown to applicants as a page title."
            fieldErrors={fieldErrors}
            defaultValue={previousValues?.fieldTitle || questionData.fieldTitle}
          />

          <TextArea
            fieldName="hintText"
            questionTitle="Add a description (optional)"
            titleSize="m"
            TitleTag="h2"
            questionHintText="You do not have to give a description. If you do, be clear about the information you want applicants to give you."
            limit={1000}
            fieldErrors={fieldErrors}
            defaultValue={previousValues?.hintText || questionData.hintText}
          />

          {questionData.responseType === ResponseTypeEnum.LongAnswer && (
            <TextInput
              fieldName="maxWords"
              questionTitle="Set a word limit"
              titleSize="m"
              TitleTag="h2"
              textInputSubtype="numeric"
              fieldSuffix="words"
              questionHintText="This will set the maximum number of words an applicant can use to answer this question. You can choose a limit of up to 5000 words."
              width="4"
              fieldErrors={fieldErrors}
              defaultValue={
                previousValues?.maxWords ?? questionData.validation.maxWords
              }
            />
          )}

          <Radio
            fieldName="optional"
            questionTitle="Make this question optional?"
            titleSize="m"
            TitleTag="h2"
            fieldErrors={fieldErrors}
            defaultChecked={optionalRadioDefault()}
          />

          <div className="govuk-button-group">
            <Button
              text="Save changes"
              data-cy="cy_questionEdit_saveAndContinueButton"
            />
            <CustomLink
              href={'#change-question-type'} //Implemented with GAP-2105
              isSecondaryButton
              dataCy="cy_questionEdit_cancelChangesButton"
            >
              Change question type
            </CustomLink>
          </div>

          <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

          <h3 className="govuk-heading-m" id="change-question-type">
            Preview question
          </h3>

          <p className="govuk-body">
            You can preview how your question will look to applicants.
          </p>

          <CustomLink
            href={`${previewUrl}`}
            isSecondaryButton
            dataCy="cy_questionEdit_cancelChangesButton"
          >
            Preview Question
          </CustomLink>

          <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

          <h2 className="govuk-heading-m">Delete question</h2>

          <p className="govuk-body">
            You will not be able to undo this action.
          </p>

          <CustomLink
            href={deleteConfirmationUrl + '?backTo=' + backTo}
            isButton
            customStyle="govuk-button--warning"
          >
            Delete question
          </CustomLink>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default QuestionContent;
