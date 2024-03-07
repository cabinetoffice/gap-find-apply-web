import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { toWordsOrdinal } from 'number-to-words';

import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import OptionsQuestionSummary from '../../components/OptionsQuestionSummary';
import getServerSideProps from './question-options.getServerSideProps';

export { getServerSideProps };

const QuestionOptions = ({
  pageCaption,
  questionSummary,
  backButtonHref,
  formAction,
  cancelChangesHref,
  fieldErrors,
  options,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit a question - Manage a grant`}
      />

      <CustomLink
        href={backButtonHref}
        dataCy="cy_questionOptionsPage-backButton"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={pageCaption}
          csrfToken={csrfToken}
        >
          <OptionsQuestionSummary questionSummary={questionSummary} />

          {options.map((option: string, index: number) => {
            return (
              <TextInput
                key={index}
                questionTitle={`Enter the ${toWordsOrdinal(index + 1)} option`}
                titleSize="m"
                fieldName={`options[${index}]`}
                defaultValue={option}
                fieldErrors={fieldErrors}
                fluidWidth="three-quarters"
                TitleTag={'h2'}
              >
                {options.length > 2 && (
                  <button
                    name={`delete_${index}`}
                    className="button--tertiary govuk-!-margin-left-3"
                    aria-label={`Delete the ${toWordsOrdinal(
                      index + 1
                    )} option`}
                    data-module="govuk-button"
                    data-cy={`cy_questionOptions-deleteOption-${index + 1}`}
                  >
                    Delete
                  </button>
                )}
              </TextInput>
            );
          })}

          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-grid-row">
              <Button
                text="Add another option"
                isSecondary={true}
                addNameAttribute={true}
              />
            </div>
            <div className="govuk-grid-row govuk-button-group">
              <Button
                text="Save and continue"
                addNameAttribute={true}
                data-cy="cy_questionOptions-SaveAndContinueButton"
              />
              {cancelChangesHref && (
                <CustomLink
                  href={cancelChangesHref}
                  dataCy="cy_questionOptions-cancelLink"
                >
                  Cancel
                </CustomLink>
              )}
            </div>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default QuestionOptions;
