import { Table } from 'gap-web-ui';
import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getGrantScheme } from '../../../../services/SchemeService';
import { generateErrorPageRedirect } from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { Pagination } from '../../../../components/pagination/Pagination';
import {
  ExportDetails,
  getExportDetails,
} from '../../../../services/ExportService';

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
  let availableSubmissionsTotalCount = 0;
  let submissionList;
  let exportedSubmissions: ExportDetails[];

  try {
    grantScheme = await getGrantScheme(schemeId, sessionCookie);

    submissionList = await getExportDetails(
      exportId,
      false,
      pagination,
      sessionCookie
    );

    availableSubmissionsTotalCount = submissionList.successCount;
    exportedSubmissions = submissionList.exportedSubmissions;
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to view submission applications.',
      '/dashboard'
    );
  }

  if (availableSubmissionsTotalCount === 0)
    return generateErrorPageRedirect(
      'There are no submissions available for download.',
      '/dashboard'
    );

  return {
    props: {
      schemeName: grantScheme.name,
      availableSubmissionsTotalCount,
      exportedSubmissions,
      backBtnUrl: `/scheme/${schemeId}/${exportId}`,
    },
  };
};

export const DownloadIndividualSubmissions = ({
  schemeName,
  availableSubmissionsTotalCount,
  exportedSubmissions,
  backBtnUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const tableHeadColumns = [
    {
      name: <>{true && 'Name'}</>,
      width: 'three-quarters',
    },
    {
      name: 'Action',
      isVisuallyHidden: true,
    },
  ] as TheadColumn[];

  const tableRows = exportedSubmissions.map((submission) => {
    return {
      cells: [
        {
          content: <>{true && submission.name}</>,
        },
        {
          content: (
            <div className="govuk-!-text-align-right">
              <CustomLink
                href={`/apply/admin/api/signed-url?key=${encodeURIComponent(
                  submission.zipFileLocation
                )}`}
                ariaLabel={`Download submission "${submission.name}"`}
                excludeSubPath
              >
                Download
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
      <CustomLink href={backBtnUrl} isBackButton />

      <div className="govuk-!-width-two-thirds govuk-!-padding-top-7">
        <span className="govuk-caption-l" data-cy="cyApplicationTitle">
          {schemeName}
        </span>
        <h1 className="govuk-heading-l" tabIndex={-1}>
          Download individual applications
        </h1>

        <div className="submissions-download-table">
          <Table
            tableClassName="table-thead-bottom-border"
            caption="Submitted applications"
            captionSize="m"
            tHeadColumns={tableHeadColumns}
            rows={tableRows}
          />

          <Pagination
            additionalQueryData={{}}
            itemsPerPage={10}
            totalItems={availableSubmissionsTotalCount}
            itemType="applications"
            itemCountMargin={availableSubmissionsTotalCount > 10}
          />
        </div>

        <div className="govuk-!-margin-top-6">
          <CustomLink href={backBtnUrl} isSecondaryButton>
            Return to overview
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default DownloadIndividualSubmissions;
