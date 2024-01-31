import {
  Button,
  FlexibleQuestionPageLayout,
  Radio,
  TextArea,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';
import SchemeQuestionPage from '../../../../../../types/SchemeQuestionPage';
import callServiceMethod from '../../../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './editQuestionServiceError';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  query: { backTo },
  res,
}) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;

  let body: RequestBody | undefined;
  let fieldErrors: ValidationError[] = [];
  let questionSummary = null;

  let questionData;
  try {
    questionData = await getQuestion(
      sessionId,
      applicationId,
      sectionId,
      questionId
    );
  } catch (err) {
    return questionErrorPageRedirect(applicationId);
  }

  const patchQuestionRedirect = `/build-application/${applicationId}/${sectionId}`;

  const result = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      const { optional, ...restOfBody } = body;

      return patchQuestion(sessionId, applicationId, sectionId, questionId, {
        ...restOfBody,
        validation: { mandatory: optional !== 'true' },
      });
    },
    patchQuestionRedirect,
    getErrorPageParams(applicationId)
  );

  if ('redirect' in result) {
    return result;
  } else if ('body' in result) {
    fieldErrors = result.fieldErrors;
    body = result.body;
  }

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return questionErrorPageRedirect(applicationId);
  }

  if (applicationFormSummary.applicationStatus === 'PUBLISHED') {
    return {
      redirect: {
        destination: `/build-application/${applicationId}/${sectionId}/${questionId}/preview`,
        statusCode: 302,
      },
    };
  }

  let defaultInputValues: RequestBody = {
    fieldTitle: '',
    hintText: '',
    optional: 'No',
  };

  if (body) {
    defaultInputValues = { ...defaultInputValues, ...body };
  } else {
    questionSummary = {
      fieldTitle: questionData.fieldTitle,
      hintText: questionData?.hintText || '',
      optional: (
        questionData.validation.mandatory.toString() !== 'true'
      ).toString(),
    };

    defaultInputValues = { ...defaultInputValues, ...questionSummary };
  }

  const backButtonHref =
    backTo === 'dashboard'
      ? `/build-application/${applicationId}/dashboard`
      : `/build-application/${applicationId}/${sectionId}`;

  return {
    props: {
      fieldErrors,
      backTo: backTo ?? '',
      backButtonHref,
      formAction: process.env.SUB_PATH + resolvedUrl,
      ...defaultInputValues,
      csrfToken: res.getHeader('x-csrf-token') as string,
      deleteConfirmationUrl: `/build-application/${applicationId}/${sectionId}/${questionId}/delete-confirmation`,
    },
  };
};

const QuestionContent = ({
  fieldErrors,
  formAction,
  fieldTitle,
  hintText,
  optional,
  csrfToken,
  backButtonHref,
  backTo,
  deleteConfirmationUrl,
}: QuestionContentPageProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit a question - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Edit a question</h1>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Question title"
            titleSize="m"
            questionHintText="This will be shown to applicants as a page title."
            fieldName="fieldTitle"
            fieldErrors={fieldErrors}
            defaultValue={fieldTitle}
          />

          <TextArea
            questionTitle="Add a description (optional)"
            titleSize="m"
            questionHintText="You do not have to give a description. If you do, be clear about the information you want applicants to give you."
            fieldName="hintText"
            fieldErrors={fieldErrors}
            limit={1000}
            defaultValue={hintText}
            TitleTag={'h2'}
          />

          <Radio
            questionTitle="Make this question optional?"
            titleSize="m"
            fieldName="optional"
            fieldErrors={fieldErrors}
            defaultChecked={
              optional === 'true'
                ? 'Yes'
                : optional === 'false'
                ? 'No'
                : undefined
            }
            TitleTag={'h2'}
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
            href={'#change-question-type'} //Implemented with GAP-2106
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

type QuestionContentPageProps = SchemeQuestionPage & RequestBody;

type RequestBody = {
  fieldTitle: string;
  hintText: string;
  optional: string;
};

export default QuestionContent;
