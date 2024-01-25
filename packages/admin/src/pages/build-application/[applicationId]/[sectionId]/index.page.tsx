import { GetServerSidePropsContext } from 'next';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { ServiceError } from 'gap-web-ui/dist/cjs/components/question-page/CallServiceMethodTypes';
import InferProps from '../../../../types/InferProps';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { Button, SummaryList, Table } from 'gap-web-ui';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';

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
    const params: ServiceError = {
      errorInformation: 'Something went wrong while trying to edit a section',
      linkAttributes: {
        href: `/scheme-list`,
        linkText: 'Please find your scheme application form and continue.',
        linkInformation: 'Your previous progress has been saved.',
      },
    };

    return {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify(
          params
        )}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      section: applicationFormSummary.sections.find(
        (section) => section.sectionId === sectionId
      )!,
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

      <span className="govuk-caption-l" data-cy="cyApplicationTitle">
        {grantApplicationName}
      </span>

      <h1 className="govuk-heading-l">Edit this section</h1>

      <SummaryList
        rows={[
          {
            key: 'Section title',
            value: section.sectionTitle,
            // GAP-2103: Uncomment this when the edit section page is implemented
            // action: (
            //   <CustomLink
            //     href={`/build-application/${applicationId}/${section.sectionId}/section-name`}
            //   >
            //     Edit
            //   </CustomLink>
            // ),
          },
        ]}
      />

      <Table
        caption="Questions"
        tHeadColumns={[
          {
            name: 'Question title',
            isVisuallyHidden: true,
            width: 'one-quarter',
          },
          {
            name: 'Question type',
            isVisuallyHidden: true,
            width: 'one-quarter',
          },
          { name: 'Actions', isVisuallyHidden: true, width: 'one-half' },
        ]}
        rows={questionTableRows(section)}
      />

      <CustomLink
        href={`/build-application/${applicationId}/${section.sectionId}/question-content`}
        isSecondaryButton
        ariaLabel={`Add a new question to ${section.sectionTitle}`}
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
                  href=""
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

export default EditSectionPage;