import { ImportantBanner, Table } from 'gap-web-ui';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';

import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { Pagination } from '../../../../components/pagination/Pagination';
import {
  ExportDetails,
  getExportDetails,
} from '../../../../services/ExportService';
import { getGrantScheme } from '../../../../services/SchemeService';
import { generateErrorPageRedirect } from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';

export const getServerSideProps = async ({
  req,
  query,
  params,
}: GetServerSidePropsContext) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const { schemeId, exportId } = params as Record<string, string>;

  const pagination = {
    paginate: true,
    page: Number(query.page ?? 1) - 1,
    size: Number(query.limit ?? 10),
  };

  let grantScheme;
  let unavailableSubmissions = [] as ExportDetails[];
  let availableSubmissionsTotalCount = 0;
  let unavailableSubmissionsTotalCount = 0;
  let superZipLocation = '';

  try {
    grantScheme = await getGrantScheme(schemeId, sessionCookie);

    const successExportDetails = await getExportDetails(
      exportId,
      false,
      pagination,
      sessionCookie
    );

    availableSubmissionsTotalCount = successExportDetails.successCount;
    unavailableSubmissionsTotalCount = successExportDetails.failedCount;
    superZipLocation = successExportDetails.superZipFileLocation;

    if (unavailableSubmissionsTotalCount > 0) {
      const failedExportDetails = await getExportDetails(
        exportId,
        true,
        pagination,
        sessionCookie
      );
      unavailableSubmissions = failedExportDetails.exportedSubmissions;
    }
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to view submission applications.',
      '/dashboard'
    );
  }

  if (
    availableSubmissionsTotalCount == 0 &&
    unavailableSubmissionsTotalCount == 0
  )
    return generateErrorPageRedirect(
      'There are no submissions available to view or download.',
      '/dashboard'
    );

  return {
    props: {
      individualApplicationsHref: `/scheme/${schemeId}/${exportId}/download-individual`,
      superZipLocation: superZipLocation,
      schemeName: grantScheme.name,
      availableSubmissionsTotalCount: availableSubmissionsTotalCount,
      unavailableSubmissionsTotalCount: unavailableSubmissionsTotalCount,
      unavailableSubmissions: unavailableSubmissions,
      schemeId: schemeId,
      exportId: exportId,
    },
  };
};

export const CompletedSubmissions = ({
  schemeName,
  individualApplicationsHref,
  availableSubmissionsTotalCount,
  unavailableSubmissionsTotalCount,
  unavailableSubmissions,
  superZipLocation,
  schemeId,
  exportId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const tableHeadColumns = [
    {
      name: <>{true && 'Organisation'}</>,
      width: 'three-quarters',
    },
    {
      name: 'Action',
      isVisuallyHidden: true,
    },
  ] as TheadColumn[];

  const tableRows = unavailableSubmissions.map((submission) => {
    return {
      cells: [
        {
          content: <>{true && submission.name}</>,
        },
        {
          content: (
            <div className="govuk-!-text-align-right">
              <CustomLink
                href={`/scheme/${schemeId}/${exportId}/view/${submission.submissionId}`}
                ariaLabel={`View submission "${submission.name}"`}
              >
                View
              </CustomLink>
            </div>
          ),
        },
      ],
    };
  });

  return (
    <>
      <Meta title={`Download applications - Manage a grant`} />
      <div className="govuk-grid-row govuk-!-padding-top-7 govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-two-thirds">
          {unavailableSubmissionsTotalCount > 0 && (
            <ImportantBanner
              bannerHeading={`Cannot download ${unavailableSubmissionsTotalCount} ${
                unavailableSubmissionsTotalCount > 1
                  ? 'applications'
                  : 'application'
              }`}
              bannerContent={
                'You can view a read-only copy of the applications that are affected in the "Applications unavailable for download" section of this page.'
              }
            />
          )}

          <h1 className="govuk-heading-l">{schemeName}</h1>

          <h2 className="govuk-heading-m">
            Applications available to download
          </h2>

          <p className="govuk-body">
            Your grant has{' '}
            <b>
              {availableSubmissionsTotalCount}{' '}
              {availableSubmissionsTotalCount === 1
                ? 'application'
                : 'applications'}
            </b>{' '}
            available to download.
          </p>
          {availableSubmissionsTotalCount > 0 && (
            <div className="govuk-button-group">
              <CustomLink
                href={`/apply/admin/api/signed-url?key=${encodeURIComponent(
                  superZipLocation
                )}`}
                isButton
                excludeSubPath
                disabled={availableSubmissionsTotalCount == 0}
              >
                Download all applications
              </CustomLink>

              <CustomLink
                href={individualApplicationsHref}
                isSecondaryButton
                disabled={availableSubmissionsTotalCount == 0}
              >
                View individual applications
              </CustomLink>
            </div>
          )}

          {unavailableSubmissions.length > 0 && (
            <>
              <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m govuk-!-margin-top-2 govuk-!-margin-bottom-7"></hr>
              <h2 className="govuk-heading-m">
                Applications unavailable for download
              </h2>

              <p className="govuk-body">
                Your grant has{' '}
                <b>
                  {unavailableSubmissionsTotalCount}{' '}
                  {unavailableSubmissionsTotalCount === 1
                    ? 'application'
                    : 'applications'}
                </b>{' '}
                that cannot be downloaded. You can still view a read-only
                version of these applications.
              </p>

              <div className="submissions-download-table">
                <Table
                  tableClassName="table-thead-bottom-border"
                  captionSize="m"
                  tHeadColumns={tableHeadColumns}
                  rows={tableRows}
                />

                <Pagination
                  additionalQueryData={{}}
                  itemsPerPage={10}
                  totalItems={unavailableSubmissionsTotalCount}
                  itemType="applications"
                  itemCountMargin={unavailableSubmissionsTotalCount > 10}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CompletedSubmissions;
