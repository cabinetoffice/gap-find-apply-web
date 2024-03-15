import {
  Button,
  Checkboxes,
  FlexibleQuestionPageLayout,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { updateSectionStatus } from '../../../../services/SectionService';
import { ApplicationFormSummary } from '../../../../types/ApplicationForm';
import InferProps from '../../../../types/InferProps';
import callServiceMethod from '../../../../utils/callServiceMethod';
import {
  generateErrorPageParams,
  generateErrorPageRedirect,
} from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';

export const getServerSideProps = async ({
  resolvedUrl,
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId } = params as {
    [key: string]: string;
  };

  let applicationFormSummary: ApplicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err: any) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to retrieve the question.',
      '/'
    );
  }

  const section = applicationFormSummary.sections.find(
    (section) => section.sectionId === 'ESSENTIAL'
  );

  if (!section) {
    return generateErrorPageRedirect(
      `Could not find the section, please make sure the URL is correct `,
      `/build-application/${applicationId}/dashboard`
    );
  }

  const fieldErrors = [] as ValidationError[];

  type RequestBody = {
    confirmation?: string;
  };

  const result = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (
        body.confirmation ===
        'I understand that applicants will be asked for this information'
      ) {
        return updateSectionStatus(
          sessionId,
          applicationId,
          sectionId,
          'COMPLETE'
        );
      } else {
        if (section.sectionStatus !== 'COMPLETE') {
          fieldErrors.push({
            fieldName: 'confirmation',
            errorMessage:
              'You must confirm that you understand these due-diligence checks.',
          });
        }
      }
    },
    `/build-application/${applicationId}/dashboard`,
    generateErrorPageParams(
      'Something went wrong while trying to update the due-diligence checks.',
      `/build-application/${applicationId}/dashboard`
    )
  );

  if (
    'redirect' in result &&
    (fieldErrors.length === 0 || section.sectionStatus === 'COMPLETE')
  ) {
    return result;
  }

  return {
    props: {
      fieldErrors: fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: process.env.SUB_PATH + resolvedUrl,
      pageCaption: applicationFormSummary.applicationName,
      sectionQuestions: section.questions!,
      defaultCheckboxes:
        section.sectionStatus === 'COMPLETE'
          ? ['I understand that applicants will be asked for this information']
          : [],
      disabled: section?.sectionStatus === 'COMPLETE',
      csrfToken: res.getHeader('x-csrf-token') as string,
      applicationStatus: applicationFormSummary.applicationStatus,
    },
  };
};

const DueDiligence = ({
  fieldErrors,
  backButtonHref,
  formAction,
  pageCaption,
  sectionQuestions,
  defaultCheckboxes,
  disabled,
  csrfToken,
  applicationStatus,
}: InferProps<typeof getServerSideProps>) => {
  const adminSummaryList = sectionQuestions.map((question) => (
    <li key={question.adminSummary} data-cy="cy_adminSummaryList-items">
      {question.adminSummary}
    </li>
  ));

  const hintText = (
    <div className="govuk-body">
      <p>All applicants are asked for certain information.</p>
      <p>
        This information will allow you to carry out compliance and
        due-diligence checks, and prevent fraud.
      </p>
      <p>
        These are the questions required to complete a due-diligence check. You
        will have the chance to add additional questions to the application form
        later.
      </p>
      <p>The information we ask for includes:</p>

      <ul>{adminSummaryList}</ul>
    </div>
  );

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Due-diligence checks - Manage a grant`}
      />

      <CustomLink href={backButtonHref}>
        <a className="govuk-back-link">Back</a>
      </CustomLink>

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          pageCaption={pageCaption}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Checkboxes
            questionTitle="Due-diligence checks"
            questionHintText={hintText}
            fieldName="confirmation"
            fieldErrors={fieldErrors}
            options={[
              'I understand that applicants will be asked for this information',
            ]}
            defaultCheckboxes={defaultCheckboxes}
            disabled={disabled}
          />

          {applicationStatus === 'PUBLISHED' ||
          applicationStatus === 'REMOVED' ? (
            <CustomLink
              href={backButtonHref}
              customStyle="govuk-!-font-size-19"
            >
              Return to application form
            </CustomLink>
          ) : (
            <Button text="Save and exit" />
          )}
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default DueDiligence;
