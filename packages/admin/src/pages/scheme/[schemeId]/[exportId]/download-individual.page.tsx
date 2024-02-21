import { FlexibleQuestionPageLayout, Table } from 'gap-web-ui';
import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { useState } from 'react';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getGrantScheme } from '../../../../services/SchemeService';
import { getCompletedSubmissionExportList } from '../../../../services/SubmissionsService';
import { downloadFile } from '../../../../utils/general';
import { generateErrorPageRedirect } from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { Pagination } from '../../../../components/pagination/Pagination';

export const getServerSideProps = async ({
  req,
  res,
  params,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const { schemeId, exportId } = params as Record<string, string>;

  let grantScheme;
  let submissionList;
  try {
    [grantScheme, submissionList] = await Promise.all([
      getGrantScheme(schemeId, sessionCookie),
      getCompletedSubmissionExportList(sessionCookie, exportId),
    ]);
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to view submission applications.',
      '/dashboard'
    );
  }

  if (!submissionList.length)
    return generateErrorPageRedirect(
      'There are no submissions available for download.',
      '/dashboard'
    );

  return {
    props: {
      formAction: process.env.SUB_PATH + resolvedUrl,
      schemeName: grantScheme.name,
      submissionList,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

export const CompletedSubmissions = ({
  formAction,
  schemeName,
  submissionList,
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isChecked, setIsChecked] = useState([] as string[]);

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setIsChecked([]);
    } else {
      setIsSelectAll(true);
      setIsChecked(submissionList.map((submission) => submission.label));
    }
  };

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    if (checked) {
      setIsChecked([...isChecked, id]);
    } else {
      setIsChecked(isChecked.filter((fileName) => fileName !== id));
    }
  };

  const tableHeadColumns = [
    {
      name: (
        <>
          {/* Temporarily disabling multidownload */}
          {/* {isJSEnabled() && ( */}
          {false && (
            // TODO eventually refactor checkbox component to support the additional props
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="submissionFileName"
                  type="checkbox"
                  aria-label="Select all"
                  onChange={handleSelectAll}
                />
                <label
                  className="govuk-label govuk-checkboxes__label govuk-!-font-weight-bold"
                  htmlFor="submissionFileName"
                >
                  Name
                </label>
              </div>
            </div>
          )}
          {/* Temporarily disabling multidownload */}
          {/* {!isJSEnabled() && 'Name'} */}
          {true && 'Name'}
        </>
      ),
      width: 'three-quarters',
    },
    {
      name: 'Action',
      isVisuallyHidden: true,
    },
  ] as TheadColumn[];

  const tableRows = submissionList.map((submission) => {
    return {
      cells: [
        {
          content: (
            <>
              {/* Temporarily disabling multidownload */}
              {/* {isJSEnabled() && ( */}
              {false && (
                // TODO eventually refactor checkbox component to support the additional props
                <div
                  className="govuk-checkboxes"
                  data-module="govuk-checkboxes"
                >
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id={submission.label}
                      name={submission.label}
                      type="checkbox"
                      value={submission.label}
                      onChange={handleClick}
                      checked={isChecked.includes(submission.label)}
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label break-all-words"
                      htmlFor={submission.label}
                    >
                      {submission.label}
                    </label>
                  </div>
                </div>
              )}
              {/* Temporarily disabling multidownload */}
              {/* {!isJSEnabled() && submission.label} */}
              {true && submission.label}
            </>
          ),
        },
        {
          content: (
            <div className="govuk-!-text-align-right">
              <CustomLink
                href={`/apply/admin/api/signed-url?key=${encodeURIComponent(
                  submission.s3key
                )}`}
                ariaLabel={`Download submission "${submission.label}"`}
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

  const multiDownloadHandler = async () => {
    const filesToDownload = isChecked
      .map((filename) =>
        submissionList.find((submission) => submission.label === filename)
      )
      .filter((fileInfo) => !!fileInfo);
    await Promise.all(
      filesToDownload.map((fileInfo) =>
        downloadFile(fileInfo!.s3key, fileInfo!.label)
      )
    );
  };

  return (
    <>
      <Meta title={`Download applications - Manage a grant`} />

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
              totalItems={submissionList.length}
              itemCountMargin={true}
            />

            {/* Temporarily disabling multidownload */}
            {/* {isJSEnabled() && ( */}
            {false && (
              // TO DO: refactor Button component to accept various events (something similar to tableAttributes)
              <button
                className="govuk-button"
                type="button"
                disabled={isChecked.length === 0}
                onClick={multiDownloadHandler}
              >
                Download selected
              </button>
            )}
          </div>

          <div className="govuk-!-margin-top-6">
            <CustomLink
              href="/dashboard" // change scheme id from 1 to the real deal
              isSecondaryButton
            >
              Return to overview
            </CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default CompletedSubmissions;
