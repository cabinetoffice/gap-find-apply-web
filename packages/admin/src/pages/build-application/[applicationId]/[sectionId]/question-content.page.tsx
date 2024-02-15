import {
  Button,
  FlexibleQuestionPageLayout,
  Radio,
  TextArea,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import Link from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import {
  addFieldsToSession,
  getSummaryFromSession,
} from '../../../../services/SessionService';
import SchemeQuestionPage from '../../../../types/SchemeQuestionPage';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../utils/session';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './newQuestionServiceError';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const { applicationId, sectionId } = params as Record<string, string>;

  let body: RequestBody | undefined;
  let fieldErrors: ValidationError[] = [];
  const sessionCookie = getSessionIdFromCookies(req);

  const result = await callServiceMethod(
    req,
    res,
    (props: RequestBody) => {
      const { _csrf, ...rest } = props;
      if (!rest.optional) rest.optional = '';
      return addFieldsToSession(
        'newQuestion',
        rest as RequestBody,
        sessionCookie
      );
    },
    `/build-application/${applicationId}/${sectionId}/question-type`,
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

  const sectionTitle = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  )?.sectionTitle;

  let questionSummary = null;
  try {
    questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionCookie
    )) as RequestBody;
  } catch (error) {
    return questionErrorPageRedirect(applicationId);
  }

  let defaultInputValues: RequestBody = {
    fieldTitle: '',
    hintText: '',
    optional: '',
  };
  if (body) {
    defaultInputValues = { ...defaultInputValues, ...body };
  } else if (questionSummary) {
    defaultInputValues = { ...defaultInputValues, ...questionSummary };
  }

  return {
    props: {
      fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
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
        }Add a question - Manage a grant`}
      />

      <Link customStyle="govuk-back-link" href={backButtonHref}>
        Back
      </Link>

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
            TitleTag="h2"
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
            TitleTag="h2"
          />
          <Button text="Save and continue" />
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
  _csrf?: string;
};

export default QuestionContent;
