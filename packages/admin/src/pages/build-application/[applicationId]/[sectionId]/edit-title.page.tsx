import { GetServerSidePropsContext } from 'next';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { updateSectionTitle } from '../../../../services/SectionService';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { applicationId, sectionId } = context.params as Record<string, string>;

  const fetchPageData = async (jwt: string) => {
    const application = await getApplicationFormSummary(applicationId, jwt);
    const { sectionTitle } = application.sections.find(
      (section) => section.sectionId === sectionId
    )!;

    return { sectionTitle, applicationId, sectionId };
  };

  const handleRequest = async (
    body: { sectionTitle: string },
    sessionId: string
  ) =>
    updateSectionTitle({
      sessionId,
      applicationId,
      sectionId,
      body,
    });

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: 'Failed to edit title, please try again later.',
    onSuccessRedirectHref: `/build-application/${applicationId}/${sectionId}`,
  });
};

export default function EditSectionTitle({
  csrfToken,
  pageData: { sectionTitle, applicationId, sectionId },
  formAction,
  fieldErrors,
  previousValues,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage Application - Change Section title`}
      />

      <CustomLink
        isBackButton
        href={`/build-application/${applicationId}/${sectionId}`}
      />
      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          csrfToken={csrfToken}
          fieldErrors={fieldErrors}
        >
          <h1 className="govuk-heading-l">Change the title of this section</h1>

          <TextInput
            defaultValue={previousValues?.sectionTitle ?? sectionTitle}
            fieldName="sectionTitle"
            fieldErrors={fieldErrors}
          />

          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Save
            </button>
            <CustomLink
              href={`/build-application/${applicationId}/${sectionId}`}
              dataCy="cy-cancel-button"
              ariaLabel="Cancel"
            >
              Cancel
            </CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
}
