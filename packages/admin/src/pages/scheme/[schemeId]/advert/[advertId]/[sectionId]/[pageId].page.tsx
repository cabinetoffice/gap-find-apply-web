import {
  Checkboxes,
  DateTimeInput,
  FlexibleQuestionPageLayout,
  Radio,
  RichText,
  TextArea,
  TextInput,
} from 'gap-web-ui';
import { InputComponentProps } from 'gap-web-ui/dist/cjs/components/question-page/inputs/InputComponentProps';
import { useEffect, useState } from 'react';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import { getServerSideProps } from './[pageId].getServerSideProps';
import { useRouter } from 'next/router';
import moment from 'moment';

export { getServerSideProps };

const Page = ({
  sectionName,
  pageTitle,
  formAction,
  csrfToken,
  fieldErrors,
  schemeId,
  advertId,
  questions,
  previousValues,
  pageId,
}: InferProps<typeof getServerSideProps>) => {
  //will create { <questionId>: <inputValue> } so we can use it in the RichText component,
  // to avoid the bug that doesn't persist the single line of text in case of errors
  const richTextValue = questions.reduce(
    (acc: Record<string, string>, { questionId, response, responseType }) => {
      if (responseType === 'RICH_TEXT') {
        const inputValue = previousValues
          ? (previousValues[questionId] as string)
          : response
          ? response.multiResponse[0]
          : '';

        acc[questionId] = inputValue;
      }
      return acc;
    },
    {}
  );

  const router = useRouter();

  //this use state is needed only for the RichText component
  const [richTextQuestionsValues, setRichTextQuestionsValues] =
    useState<Record<string, string>>(richTextValue);

  const [testJs, setTestJs] = useState<string>();

  //if js is disabled useEffect won't run so text will stay undefined
  useEffect(() => {
    setTestJs('banana');
  }, [pageId]);
  const jsEnabled = testJs !== undefined;

  const defaultCompletedRadio = () => {
    if (!previousValues) return undefined;
    const completed = previousValues['completed'];
    if (completed === 'Yes') return "Yes, I've completed this question";
    if (completed === 'No') return "No, I'll come back later";
    return undefined;
  };

  function adjustTimeForMidnight(multiResponse: string[]) {
    multiResponse[3] = '23';
    multiResponse[4] = '59';

    const date = moment(
      `${multiResponse[2]}-${multiResponse[1]}-${multiResponse[0]} ${multiResponse[3]}:${multiResponse[4]}`,
      'YYYY-MM-DD HH:mm'
    );
    date.subtract(1, 'days');

    multiResponse[0] = date.format('DD');
    multiResponse[1] = date.format('MM');
    multiResponse[2] = date.format('YYYY');
  }

  const multipleQuestionPage = questions.length > 1;

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Build a grant advert - ${pageTitle} - Manage a grant`}
      />

      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
        isBackButton
        dataCy={`cy-advert-page-back-button`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          pageCaption={sectionName}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          {multipleQuestionPage && (
            <h1
              className="govuk-heading-l"
              data-cy={`cy-advert-page-title-${pageTitle}`}
            >
              {pageTitle}
            </h1>
          )}

          {questions.map((question) => {
            const commonResponseProps: InputComponentProps & { key: string } = {
              questionTitle: question.questionTitle,
              questionHintText: question.hintText,
              titleSize: multipleQuestionPage ? 'm' : 'l',
              fieldName: question.questionId,
              fieldErrors: fieldErrors,
              TitleTag: multipleQuestionPage ? 'h2' : 'h1',
              multipleQuestionPage: multipleQuestionPage,
              key: question.questionId,
            };

            switch (question.responseType) {
              case 'DATE': {
                let dateValues;
                let timeValues;

                if (previousValues) {
                  dateValues = {
                    day: previousValues[`${question.questionId}-day`] as string,
                    month: previousValues[
                      `${question.questionId}-month`
                    ] as string,
                    year: previousValues[
                      `${question.questionId}-year`
                    ] as string,
                  };
                } else if (question.response) {
                  if (
                    question.response.multiResponse[3] === '00' &&
                    question.response.multiResponse[4] === '00'
                  ) {
                    adjustTimeForMidnight(question.response.multiResponse);
                  }

                  dateValues = {
                    day: question.response.multiResponse[0],
                    month: question.response.multiResponse[1],
                    year: question.response.multiResponse[2],
                  };
                  timeValues = {
                    hour: question.response.multiResponse[3],
                    minute: question.response.multiResponse[4],
                  };
                }

                return (
                  <DateTimeInput
                    {...commonResponseProps}
                    dateDefaultValues={dateValues}
                    timeDefaultValues={`${timeValues?.hour}:${timeValues?.minute}`}
                  ></DateTimeInput>
                );
              }
              case 'RICH_TEXT':
                return (
                  <RichText
                    {...commonResponseProps}
                    newLineAccepted={true}
                    limit={question.questionValidation?.maxLength}
                    defaultValue={
                      jsEnabled && richTextValue[question.questionId]
                        ? removePTag(richTextValue[question.questionId])
                        : richTextValue[question.questionId]
                    }
                    value={richTextQuestionsValues[question.questionId]}
                    setValue={(text) =>
                      setRichTextQuestionsValues((prevQuestionValues) => ({
                        ...prevQuestionValues,
                        [question.questionId]: text,
                      }))
                    }
                    isJsEnabled={jsEnabled}
                    applicationHost={router.basePath}
                  />
                );
              case 'LONG_TEXT':
                return (
                  <TextArea
                    {...commonResponseProps}
                    newLineAccepted={true}
                    limit={question.questionValidation?.maxLength}
                    defaultValue={
                      previousValues
                        ? (previousValues[question.questionId] as string)
                        : question.response
                        ? question.response.response
                        : undefined
                    }
                    exampleText={question.exampleText}
                  />
                );
              case 'SHORT_TEXT':
                return (
                  <TextInput
                    {...commonResponseProps}
                    newLineAccepted={true}
                    defaultValue={
                      previousValues
                        ? (previousValues[question.questionId] as string)
                        : question.response
                        ? question.response.response
                        : undefined
                    }
                  />
                );
              case 'LIST':
                return (
                  <Checkboxes
                    {...commonResponseProps}
                    options={question.options}
                    divideLastCheckboxOption={
                      question.questionId === 'grantLocation'
                    }
                    divideCheckboxIndex={1}
                    defaultCheckboxes={
                      previousValues
                        ? (previousValues[question.questionId] as string[])
                        : question.response
                        ? question.response.multiResponse
                        : undefined
                    }
                  />
                );
              case 'CURRENCY':
              case 'INTEGER':
                return (
                  <TextInput
                    questionTitle={question.questionTitle}
                    questionHintText={question.hintText}
                    fieldName={question.questionId}
                    fieldErrors={fieldErrors}
                    defaultValue={
                      previousValues
                        ? (previousValues[question.questionId] as string)
                        : question.response
                        ? question.response.response
                        : undefined
                    }
                    textInputSubtype="numeric"
                    TitleTag="h2"
                    titleSize="s"
                    key={question.questionId}
                    fieldPrefix={
                      question.fieldPrefix ? question.fieldPrefix : null
                    }
                    newLineAccepted={true}
                  />
                );
              default:
                throw new Error('No valid response type found');
            }
          })}

          <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

          <Radio
            fieldName="completed"
            fieldErrors={fieldErrors}
            questionTitle="Have you completed this question?"
            radioOptions={[
              { label: "Yes, I've completed this question", value: 'Yes' },
              { label: "No, I'll come back later", value: 'No' },
            ]}
            TitleTag="h2"
            defaultChecked={defaultCompletedRadio()}
            titleSize="m"
          />

          <div className="govuk-button-group">
            <button
              className="govuk-button"
              data-module="govuk-button"
              name="saveAndContinue"
              data-cy="cy-advert-page-save-and-continue-button"
            >
              Save and continue
            </button>

            <button
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              name="saveAndExit"
              data-cy="cy-advert-page-save-and-exit-button"
            >
              Save and exit
            </button>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default Page;

export const removePTag = (defaultValue: string): string => {
  return defaultValue.replace(/<p>|<\/p>/gim, '');
};
