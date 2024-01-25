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

  const patchQuestionRedirect =
    questionData.responseType == ResponseTypeEnum.Dropdown ||
    questionData.responseType == ResponseTypeEnum.MultipleSelection
      ? `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options`
      : `/build-application/${applicationId}/dashboard`;

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

  const sectionTitle = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  )?.sectionTitle;

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

  return {
    props: {
      fieldErrors,
      backButtonHref: `/build-application/${applicationId}/${sectionId}/${questionId}/preview`,
      formAction: process.env.SUB_PATH + resolvedUrl,
      pageCaption: sectionTitle,
      ...defaultInputValues,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const QuestionContent = ({
  fieldErrors,
  backButtonHref,
  formAction,
  pageCaption,
  fieldTitle,
  hintText,
  optional,
  csrfToken,
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
        <FlexibleQuestionPageLayout
          formAction={formAction}
          pageCaption={pageCaption}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter a question"
            questionHintText="Applicants will see this on their application form"
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
              text="Save and continue"
              data-cy="cy_questionEdit_saveAndContinueButton"
            />
            <CustomLink
              href={backButtonHref}
              dataCy="cy_questionEdit_cancelChangesButton"
            >
              Cancel
            </CustomLink>
          </div>
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
