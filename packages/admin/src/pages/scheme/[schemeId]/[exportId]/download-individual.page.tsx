import { FlexibleQuestionPageLayout, Table } from 'gap-web-ui';
import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getGrantScheme } from '../../../../services/SchemeService';
import { generateErrorPageRedirect } from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { Pagination } from '../../../../components/pagination/Pagination';
import { getExportDetails } from '../../../../services/ExportService';

export const getServerSideProps = async ({
  req,
  res,
  query,
  params,
  resolvedUrl,
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

  try {
    grantScheme = await getGrantScheme(schemeId, sessionCookie);

    submissionList = await getExportDetails(
      exportId,
      false,
      pagination,
      sessionCookie
    );

    availableSubmissionsTotalCount = submissionList.successCount;
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
      formAction: process.env.SUB_PATH + resolvedUrl,
      schemeName: grantScheme.name,
      availableSubmissionsTotalCount,
      submissionList,
      backBtnUrl: `/scheme/${schemeId}/${exportId}`,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

export const DownloadIndividualSubmissions = ({
  formAction,
  schemeName,
  availableSubmissionsTotalCount,
  submissionList,
  backBtnUrl,
  csrfToken,
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

  const tableRows = submissionList.exportedSubmissions.map((submission) => {
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
                  submission.s3key
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
        <FlexibleQuestionPageLayout
          fieldErrors={[]}
          formAction={formAction}
          csrfToken={csrfToken}
        >
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
              itemCountMargin={true}
            />
          </div>

          <div className="govuk-!-margin-top-6">
            <CustomLink href={backBtnUrl} isSecondaryButton>
              Return to overview
            </CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default DownloadIndividualSubmissions;
