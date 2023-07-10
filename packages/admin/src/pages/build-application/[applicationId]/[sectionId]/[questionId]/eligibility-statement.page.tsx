import Meta from '../../../../../components/layout/Meta';
import {
  Button,
  FlexibleQuestionPageLayout,
  TextArea,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { patchQuestion } from '../../../../../services/QuestionService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import { updateSectionStatus } from '../../../../../services/SectionService';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import InferProps from '../../../../../types/InferProps';
import styles from './eligibility-statement.module.scss';
import {
  generateErrorPageParams,
  generateErrorPageRedirect,
} from '../../../../../utils/serviceErrorHelpers';
import { getGrantScheme } from '../../../../../services/SchemeService';

type RequestBody = {
  displayText: string;
};

export const getServerSideProps = async ({
  resolvedUrl,
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;

  let body;
  let fieldErrors = [] as ValidationError[];
  const result = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      const result = await patchQuestion(
        sessionId,
        applicationId,
        sectionId,
        questionId,
        body
      );
      await updateSectionStatus(
        sessionId,
        applicationId,
        sectionId,
        'COMPLETE'
      );
      return result;
    },
    `/build-application/${applicationId}/dashboard`,
    generateErrorPageParams(
      'Something went wrong while trying to update the question.',
      `/build-application/${applicationId}/dashboard`
    )
  );
  if ('redirect' in result) {
    return result;
  } else if ('body' in result) {
    fieldErrors = result.fieldErrors;
    body = result.body;
  }

  let appForm;
  let existingDisplayText;
  try {
    appForm = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
    const question = appForm.sections
      .find((section) => section.sectionId === sectionId)
      ?.questions?.find((question) => question.questionId === questionId);

    if (!question) {
      return generateErrorPageRedirect(
        `Could not find the question, please make sure the URL is correct`,
        `/build-application/${applicationId}/dashboard`
      );
    }

    existingDisplayText = question.displayText;
  } catch (err: any) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to retrieve the question.',
      `/build-application/${applicationId}/dashboard`
    );
  }

  if (appForm.applicationStatus === 'PUBLISHED') {
    let grantName;
    try {
      grantName = (await getGrantScheme(appForm.grantSchemeId, sessionId)).name;
    } catch (err) {
      return generateErrorPageRedirect(
        'Something went wrong while trying the grant name',
        `/build-application/${applicationId}/dashboard`
      );
    }

    return {
      props: {
        backButtonHref: `/build-application/${applicationId}/dashboard`,
        grantName: grantName,
        defaultValue: existingDisplayText,
        applicationStatus: appForm.applicationStatus,
      },
    };
  }

  return {
    props: {
      fieldErrors: fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: resolvedUrl,
      pageCaption: appForm.applicationName,
      defaultValue:
        body?.displayText === undefined
          ? existingDisplayText || ''
          : body.displayText,
      csrfToken: (req as any).csrfToken?.() || '',
      applicationStatus: appForm.applicationStatus,
    },
  };
};

const EligibilityStatement = ({
  fieldErrors,
  backButtonHref,
  formAction,
  pageCaption,
  defaultValue,
  csrfToken,
  grantName,
  applicationStatus,
}: InferProps<typeof getServerSideProps>) => {
  if (applicationStatus === 'PUBLISHED') {
    return (
      <>
        <Meta title={`Eligibility statement preview - Manage a grant`} />

        <CustomLink href={backButtonHref} isBackButton />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div
              className={`govuk-!-padding-6 ${styles['gap-light-grey-background']}`}
            >
              <span
                className="govuk-caption-l"
                data-testid="question-page-caption"
                data-cy="cy_questionPreviewPage-captionText"
              >
                How this will look to the applicant
              </span>

              <h1 className="govuk-heading-l">Eligibility criteria</h1>

              <p
                className="govuk-body"
                data-cy="cy-eligibility-question-paragraph-1"
              >
                The criteria below tells you if your organisation is eligible to
                apply.
              </p>
              <p
                className="govuk-body"
                data-cy="cy-eligibility-question-paragraph-2"
              >
                Making sure your organisation is eligible before you apply saves
                you time.
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

              <p className={`govuk-body ${styles['gap-new-line']}`}>
                {defaultValue}
              </p>
            </div>

            <div className="govuk-!-padding-top-6">
              <CustomLink
                href={backButtonHref}
                customStyle="govuk-!-font-size-19"
              >
                Return to application form
              </CustomLink>
            </div>
          </div>
        </div>
      </>
    );
  }

  const hintText = (
    <>
      <p>Tell applicants what they need to be eligible for your grant.</p>
      <p>
        This helps them save time. It also helps you reduce time and money spent
        processing queries from users who are not eligible.
      </p>
    </>
  );

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Build an application form - Eligibility statement`}
      />

      <CustomLink
        href={backButtonHref}
        isBackButton
        dataCy="cy_eligibilityPage_backbutton"
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          pageCaption={pageCaption}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextArea
            questionTitle="Eligibility statement"
            questionHintText={hintText}
            fieldName="displayText"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
            limit={6000}
          />
          <Button text="Save and exit" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default EligibilityStatement;
