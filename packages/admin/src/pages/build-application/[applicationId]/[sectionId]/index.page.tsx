import { GetServerSidePropsContext } from 'next';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../../utils/session';
import InferProps from '../../../../types/InferProps';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { Button, SummaryList, Table } from 'gap-web-ui';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';
import ServiceError from '../../../../types/ServiceError';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId } = params as Record<string, string>;

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return redirectError;
  }

  const section = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  );

  if (!section) {
    return redirectError;
  }

  return {
    props: {
      section,
      grantApplicationName: applicationFormSummary.applicationName,
      applicationId: applicationFormSummary.grantApplicationId,
    },
  };
};

const EditSectionPage = ({
  section,
  grantApplicationName,
  applicationId,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Build an application form - Manage a grant" />

      <CustomLink
        href={`/build-application/${applicationId}/dashboard`}
        isBackButton
      />

      <span
        className="govuk-caption-l govuk-!-margin-top-7"
        data-cy="cyApplicationTitle"
      >
        {grantApplicationName}
      </span>

      <h1 className="govuk-heading-l">Edit this section</h1>

      <SummaryList
        rows={[
          {
            key: 'Section title',
            value: (
              <div className="govuk-!-padding-left-2">
                {section.sectionTitle}
              </div>
            ),
            action: (
              <CustomLink
                href={`/build-application/${applicationId}/${section.sectionId}/edit-title`}
              >
                Edit
              </CustomLink>
            ),
          },
        ]}
      />

      <Table
        caption="Questions"
        tHeadColumns={[
          {
            name: 'Question title',
            isVisuallyHidden: true,
            width: 'one-third',
          },
          {
            name: 'Question type',
            isVisuallyHidden: true,
            width: 'one-third',
          },
          { name: 'Actions', isVisuallyHidden: true, width: 'one-third' },
        ]}
        rows={questionTableRows(section)}
      />

      <CustomLink
        href={`/build-application/${applicationId}/${section.sectionId}/question-content`}
        isSecondaryButton
      >
        Add a new question
      </CustomLink>

      <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Delete this section</h2>

      <p className="govuk-caption-m">
        Any questions or information in this section will be deleted
        permanently.
      </p>

      <CustomLink
        href={`/build-application/${applicationId}/${section.sectionId}/delete-confirmation`}
        isButton
        customStyle="govuk-button--warning"
      >
        Delete section
      </CustomLink>

      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

      <CustomLink
        href={`/build-application/${applicationId}/dashboard`}
        isButton
      >
        Save and go back
      </CustomLink>
    </>
  );
};

function questionTableRows(
  section: InferProps<typeof getServerSideProps>['section']
) {
  return (
    section.questions?.map((question) => ({
      cells: [
        {
          content: (
            <p className="govuk-!-font-weight-bold">{question.fieldTitle}</p>
          ),
        },
        {
          content: <p>{ResponseTypeLabels[question.responseType]}</p>,
        },
        {
          content: (
            <div className="govuk-!-text-align-right govuk-width-container govuk-!-padding-top-2">
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-quarter">
                  <p />
                </div>
                <div className="govuk-grid-column-one-quarter">
                  {/* GAP-2111: Uncomment when move question order is implemented */}
                  {/* <Button text="Up" isSecondary /> */}
                </div>
                <div className="govuk-grid-column-one-quarter">
                  {/* GAP-2111: Uncomment when move question order is implemented */}
                  {/* <Button text="Down" isSecondary /> */}
                </div>
                <CustomLink
                  href="/#"
                  customStyle="govuk-!-padding-left-6 govuk-!-padding-top-2 govuk-grid-column-one-quarter govuk-!-text-align-left"
                >
                  Edit
                </CustomLink>
              </div>
            </div>
          ),
        },
      ],
    })) || []
  );
}

const errorProps: ServiceError = {
  errorInformation: 'Something went wrong while trying to edit a section',
  linkAttributes: {
    href: `/scheme-list`,
    linkText: 'Please find your scheme application form and continue.',
    linkInformation: 'Your previous progress has been saved.',
  },
};

const redirectError = {
  redirect: {
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorProps
    )}`,
    permanent: false,
  },
};

export default EditSectionPage;
