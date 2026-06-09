import { Table } from 'gap-web-ui';
import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
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

const ALLOWED_SORT_FIELDS = ['gapId', 'submittedDate'] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

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

  const sortField = ALLOWED_SORT_FIELDS.includes(query.sortField as SortField)
    ? (query.sortField as SortField)
    : 'submittedDate';
  const sortDir = query.sortDir === 'desc' ? 'desc' : 'asc';

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
      sessionCookie,
      sortField,
      sortDir
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
      sortField,
      sortDir,
    },
  };
};

export const DownloadIndividualSubmissions = ({
  schemeName,
  availableSubmissionsTotalCount,
  exportedSubmissions,
  backBtnUrl,
  sortField,
  sortDir,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const handleSortClick = (field: string) => {
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, sortField: field, sortDir: nextDir },
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField === field && sortDir === 'asc') {
      return (
        <svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor" />
        </svg>
      );
    }
    if (sortField === field && sortDir === 'desc') {
      return (
        <svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor" />
        <path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor" />
      </svg>
    );
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); handleSortClick(field); }}
      className="govuk-link govuk-link--no-visited-state"
      style={{ display: 'inline-flex' }}
    >
      {label}
      <SortIcon field={field} />
    </a>
  );

  const ariaSort = (field: string) =>
    sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

  const tableHeadColumns = [
    {
      name: <SortHeader field="gapId" label="GAP ID" />,
      width: 'one-half',
      theadColumnAttributes: { 'aria-sort': ariaSort('gapId') },
    },
    {
      name: <>{true && 'Name'}</>,
      width: 'one-quarter',
    },
    {
      name: 'Application Name',
      width: 'one-quarter',
    },
    {
      name: <SortHeader field="submittedDate" label="Submission Date" />,
      width: 'one-quarter',
      theadColumnAttributes: { 'aria-sort': ariaSort('submittedDate') },
    },
    {
      name: 'Action',
      isVisuallyHidden: true,
    },
  ] as TheadColumn[];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const tableRows = exportedSubmissions.map((submission) => {
    return {
      cells: [
        {
          content: <>{submission.gapId || '-'}</>,
        },
        {
          content: <>{true && submission.name}</>,
        },
        {
          content: <>{submission.submissionName || '-'}</>,
        },
        {
          content: <>{formatDate(submission.submittedDate)}</>,
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

      <div className="govuk-!-padding-top-7">
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
            additionalQueryData={{ sortField, sortDir }}
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
