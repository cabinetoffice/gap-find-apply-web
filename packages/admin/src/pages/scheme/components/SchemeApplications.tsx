import { Table } from 'gap-web-ui';
import getConfig from 'next/config';
import CustomLink from '../../../components/custom-link/CustomLink';
import { ApplicationFormSummary } from '../../../types/ApplicationForm';
import FindApplicationFormStatsResponse from '../../../types/FindApplicationFormStatsResponse';

const SchemeApplications = ({
  applicationForm,
  applicationFormStats,
}: SchemeApplicationsProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const { publicRuntimeConfig } = getConfig();

  return (
    <>
      <div
        className="govuk-!-padding-top-4"
        data-testid="scheme-application-component"
      >
        <Table
          caption="Grant application form"
          captionSize="m"
          tHeadColumns={[
            { name: 'Application form name', width: 'one-third' },
            { name: 'Date created' },
            { name: 'Date published' },
            { name: 'Action', isVisuallyHidden: true },
          ]}
          forceCellTopBorder={true}
          rows={[
            {
              cells: [
                { content: applicationForm.applicationName },
                {
                  content: formatDate(applicationForm.audit.created),
                },
                {
                  content:
                    applicationForm.audit.lastPublished &&
                    applicationForm.applicationStatus !== 'REMOVED'
                      ? formatDate(applicationForm.audit.lastPublished)
                      : '-',
                },
                {
                  content: (
                    <CustomLink
                      href={`/build-application/${applicationForm.grantApplicationId}/dashboard`}
                      ariaLabel={`View application: ${applicationForm.applicationName}`}
                      dataCy="cy_view-application-link"
                    >
                      View
                    </CustomLink>
                  ),
                },
              ],
            },
          ]}
        />
      </div>

      <div className="govuk-!-padding-top-4">
        <div>
          <h2
            className="govuk-heading-m"
            data-cy="cy_Scheme-details-page-h2-View submitted applciations"
          >
            View submitted applications
          </h2>

          <p
            className="govuk-body"
            data-cy="cy_Scheme-details-page-Submission-count-text"
          >
            {applicationFormStats.submissionCount === 0 &&
              'No applications have been submitted.'}
            {applicationFormStats.submissionCount > 0 &&
              'To see who has applied for your grant, you need to view and download your submitted applications.'}
          </p>

          <Table
            tHeadColumns={[
              { name: 'Application state', width: 'one-half' },
              {
                name: 'No of applications',
                width: 'one-half',
                theadColumnAttributes: {
                  'aria-label': 'Number of applications',
                  'aria-disabled': 'false',
                },
              },
            ]}
            forceCellTopBorder={true}
            rows={[
              {
                cells: [
                  {
                    cellAttributes: { className: 'govuk-table__header' },
                    content: 'In progress',
                  },
                  { content: applicationFormStats.inProgressCount },
                ],
              },
              {
                cells: [
                  {
                    cellAttributes: { className: 'govuk-table__header' },
                    content: 'Submitted',
                  },
                  { content: applicationFormStats.submissionCount },
                ],
              },
            ]}
          />
          <CustomLink
            href={`/scheme/${applicationForm.grantSchemeId}/download-submissions`}
            isButton
            disabled={applicationFormStats.submissionCount === 0}
            dataCy="cy_Scheme-details-page-button-View submitted application"
          >
            View submitted applications
          </CustomLink>
        </div>
      </div>
    </>
  );
};

type SchemeApplicationsProps = {
  applicationForm: ApplicationFormSummary;
  applicationFormStats: FindApplicationFormStatsResponse;
};

export default SchemeApplications;
