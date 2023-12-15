import {
  AddressInput,
  Button,
  Checkboxes,
  DateInput,
  FlexibleQuestionPageLayout,
  Radio,
  SelectInput,
  TextArea,
  TextInput,
  UploadFile,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../../../components/partials/Layout';
import Meta from '../../../../../../../components/partials/Meta';
import {
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  postQuestionResponse,
  QuestionData,
  QuestionPostBody,
} from '../../../../../../../services/SubmissionService';
import { initiateCSRFCookie } from '../../../../../../../utils/csrf';
import { getJwtFromCookies } from '../../../../../../../utils/jwt';
import postQuestion from '../../../../../../../utils/postQuestion';
import { routes } from '../../../../../../../utils/routes';
import styles from './index.module.scss';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

interface QuestionPageProps {
  questionData: QuestionData;
  grantName: string;
  csrfToken: string;
  isRefererCheckYourAnswerScreen: boolean;
}

export const getValidationErrorsFromQuery = (
  errors: string | string[]
): ValidationError[] => {
  if (Array.isArray(errors)) {
    return errors.map((e) => JSON.parse(e));
  }
  return [JSON.parse(errors)];
};

export const getServerSideProps: GetServerSideProps<
  QuestionPageProps
> = async ({ params, req, res, query }) => {
  const submissionId = params.submissionId.toString();
  const sectionId = params.sectionId.toString();
  const questionId = params.questionId.toString();
  const questionData = await getQuestionById(
    submissionId,
    sectionId,
    questionId,
    getJwtFromCookies(req)
  );

  let isRefererCheckYourAnswerScreen;
  const isFromCYAPageQuery = query?.fromCYAPage;
  isRefererCheckYourAnswerScreen =
    req?.headers?.referer ===
      `${serverRuntimeConfig.frontendHost}${routes.submissions.section(
        submissionId,
        sectionId
      )}` || !!isFromCYAPageQuery;

  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(
    submissionId,
    getJwtFromCookies(req)
  );

  if (hasBeenSubmitted) {
    return {
      redirect: {
        destination: `/applications`,
        permanent: false,
      },
    };
  }
  const sections = await getSubmissionById(
    questionData.grantSubmissionId,
    getJwtFromCookies(req)
  );

  let fieldErrors: ValidationError[] = [];
  let temporaryErrorInputValue: string[] = [];

  if (query && query['errors[]']) {
    fieldErrors = getValidationErrorsFromQuery(query['errors[]']);
  }

  if (req.method !== 'POST') {
    await initiateCSRFCookie(req, res);
  }

  if (req.method === 'POST') {
    const jwt = getJwtFromCookies(req);
    const result = await postQuestion(
      req,
      res,
      (body: QuestionPostBody) =>
        postQuestionResponse(submissionId, sectionId, questionId, body, jwt),
      submissionId,
      sectionId,
      questionId,
      questionData.question.responseType
    );

    if (!('body' in result)) {
      return result;
    }

    fieldErrors = result.fieldErrors;

    temporaryErrorInputValue = result.values ? result.values : null;
    isRefererCheckYourAnswerScreen = result.isRefererCheckYourAnswerScreen;
  }

  if (fieldErrors.length > 0) {
    const questionDataWithError: QuestionData = {
      ...questionData,
      error: fieldErrors,
      temporaryErrorInputValue,
    };
    return {
      props: {
        questionData: questionDataWithError,
        grantName: sections.applicationName,
        csrfToken: (req as any).csrfToken?.() || '',
        isRefererCheckYourAnswerScreen,
      },
    };
  }
  return {
    props: {
      questionData,
      grantName: sections.applicationName,
      csrfToken: (req as any).csrfToken?.() || '',
      isRefererCheckYourAnswerScreen,
    },
  };
};
export default function QuestionPage({
  questionData,
  grantName,
  csrfToken,
  isRefererCheckYourAnswerScreen,
}: QuestionPageProps) {
  const {
    question,
    grantSubmissionId,
    sectionId,
    error,
    temporaryErrorInputValue,
  } = questionData;
  const {
    responseType,
    response,
    questionId,
    options,
    multiResponse,
    attachmentId,
  } = question;
  const titleSizeType: 's' | 'l' | 'xl' = question?.questionSuffix ? 's' : 'l';

  let inputType: JSX.Element;
  let encType = 'application/x-www-form-urlencoded';
  let formAction =
    publicRuntimeConfig.subPath +
    routes.submissions.question(grantSubmissionId, sectionId, questionId);

  // if question is optional and doesn't already end with ' (optional)', append ' (optional)'
  const displayTitle = `${question.fieldTitle}${
    !question.validation.mandatory &&
    !question.fieldTitle.endsWith(' (optional)')
      ? ' (optional)'
      : ''
  }`;

  const commonProps = {
    questionTitle: question?.questionSuffix
      ? question.questionSuffix
      : displayTitle,
    questionHintText: question.hintText?.replaceAll('\\n', '\n'),
    fieldName: question.questionId,
    fieldErrors: error || [],
    titleSize: titleSizeType,
  };
  switch (responseType) {
    case 'ShortAnswer':
      inputType = (
        <TextInput
          {...commonProps}
          limit={question.validation.maxLength || undefined}
          defaultValue={
            error ? temporaryErrorInputValue[0] : response || undefined
          }
        />
      );
      break;
    case 'Numeric':
      inputType = (
        <TextInput
          {...commonProps}
          textInputSubtype="numeric"
          width="10"
          defaultValue={
            error ? temporaryErrorInputValue[0] : response || undefined
          }
        />
      );
      break;
    case 'LongAnswer':
      inputType = (
        <TextArea
          {...commonProps}
          limit={question.validation.maxLength || undefined}
          defaultValue={
            error ? temporaryErrorInputValue[0] : response || undefined
          }
        />
      );
      break;

    case 'YesNo':
      {
        inputType = (
          <Radio
            {...commonProps}
            radioOptions={[
              { label: 'Yes', value: 'Yes' },
              { label: 'No', value: 'No' },
            ]}
            defaultChecked={
              error ? temporaryErrorInputValue[0] : response || undefined
            }
            TitleTag={question.questionId === 'ELIGIBILITY' ? 'h2' : 'h1'}
          />
        );
      }
      break;
    case 'MultipleSelection':
      inputType = (
        <Checkboxes
          {...commonProps}
          options={options}
          defaultCheckboxes={
            error ? temporaryErrorInputValue : multiResponse || undefined
          }
          newLineAccepted={true}
        />
      );
      break;
    case 'Date':
      inputType = (
        <DateInput
          {...commonProps}
          defaultValues={
            error
              ? {
                  day: temporaryErrorInputValue.at(0),
                  month: temporaryErrorInputValue.at(1),
                  year: temporaryErrorInputValue.at(2),
                }
              : multiResponse
              ? {
                  day: multiResponse.at(0),
                  month: multiResponse.at(1),
                  year: multiResponse.at(2),
                }
              : undefined
          }
        />
      );
      break;
    case 'Dropdown':
      inputType = (
        <SelectInput
          {...commonProps}
          selectOptions={options}
          defaultValue={response ? response : undefined}
        />
      );
      break;
    case 'AddressInput':
      inputType = (
        <AddressInput
          {...commonProps}
          defaultAddressValues={
            error
              ? {
                  addressLine1: temporaryErrorInputValue.at(0),
                  addressLine2: temporaryErrorInputValue.at(1),
                  town: temporaryErrorInputValue.at(2),
                  county: temporaryErrorInputValue.at(3),
                  postcode: temporaryErrorInputValue.at(4),
                }
              : multiResponse
              ? {
                  addressLine1: multiResponse.at(0),
                  addressLine2: multiResponse.at(1),
                  town: multiResponse.at(2),
                  county: multiResponse.at(3),
                  postcode: multiResponse.at(4),
                }
              : undefined
          }
        />
      );
      break;
    case 'SingleFileUpload':
      //TODO there must be a nicer way to conditionally pass props than this?
      inputType = (
        <UploadFile
          {...commonProps}
          uploadedFile={
            response
              ? { name: response, removeBaseUrl: '', id: attachmentId }
              : undefined
          }
          deleteUrl={
            response
              ? `${
                  publicRuntimeConfig.subPath
                }${routes.api.submissions.question(
                  grantSubmissionId,
                  sectionId,
                  questionId
                )}/attachments/${attachmentId}/remove${
                  isRefererCheckYourAnswerScreen ? '?fromCYAPage=true' : ''
                }`
              : undefined
          }
        />
      );
      encType = 'multipart/form-data';
      formAction =
        publicRuntimeConfig.subPath +
        '/api/routes' +
        routes.submissions.question(grantSubmissionId, sectionId, questionId) +
        '/upload-file';
      break;
  }

  const backLinkUrl = questionData.previousNavigation?.questionId
    ? routes.submissions.question(
        grantSubmissionId,
        sectionId,
        questionData.previousNavigation.questionId
      )
    : routes.submissions.sections(grantSubmissionId);

  return (
    <>
      <Meta
        title={`${
          error ? 'Error: ' : ''
        }Application question - Apply for a grant`}
      />
      <Layout
        backBtnUrl={
          isRefererCheckYourAnswerScreen
            ? routes.submissions.section(grantSubmissionId, sectionId)
            : backLinkUrl
        }
      >
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={error || []}
          csrfToken={csrfToken}
          encType={encType}
        >
          {question?.questionSuffix && (
            <>
              <h1
                className="govuk-heading-l"
                data-cy="cy-ELIGIBILITY-question-title-page"
              >
                {question.fieldTitle}
              </h1>

              {question.questionId != 'ELIGIBILITY' && (
                <p className="govuk-body">{question?.displayText}</p>
              )}

              {question.questionId === 'ELIGIBILITY' && (
                <>
                  <p
                    className="govuk-body"
                    data-cy="cy-eligibility-question-paragraph-1"
                  >
                    The criteria below tells you if your organisation is
                    eligible to apply.
                  </p>
                  <p
                    className="govuk-body"
                    data-cy="cy-eligibility-question-paragraph-2"
                  >
                    Making sure your organisation is eligible before you apply
                    saves you time.
                  </p>
                  <p
                    className="govuk-body"
                    data-cy="cy-eligibility-question-paragraph-3"
                  >
                    It also means time and money are not spent processing
                    applications from organisations that are not eligible.
                  </p>
                  <h2
                    className="govuk-heading-s"
                    data-cy={`cy-eligibility-question-heading-${grantName}`}
                  >
                    Eligibility criteria for {grantName}
                  </h2>

                  <p
                    className={`govuk-body ${styles['gap-new-line']}`}
                    data-cy="cy-ELIGIBILITY-question-hint"
                  >
                    {question?.displayText}
                  </p>
                </>
              )}
            </>
          )}
          {inputType}
          {isRefererCheckYourAnswerScreen && (
            <input
              type="hidden"
              name="isRefererCheckYourAnswerScreen"
              value="true"
            />
          )}
          <div className="govuk-button-group">
            <Button text="Save and continue" addNameAttribute={true} />
            <Button
              text={isRefererCheckYourAnswerScreen ? 'Cancel' : 'Save and exit'}
              isSecondary={true}
              addNameAttribute={true}
            />
          </div>
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
