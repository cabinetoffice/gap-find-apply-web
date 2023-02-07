import { FlexibleQuestionPageLayout, Table } from 'gap-web-ui';
import { TheadColumn } from 'gap-web-ui/dist/cjs/components/table/Table';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { useState } from 'react';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { getGrantScheme } from '../../../services/SchemeService';
import { getCompletedSubmissionExportList } from '../../../services/SubmissionsService';
import { downloadFile } from '../../../utils/general';
import { generateErrorPageRedirect } from '../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps = async ({
  req,
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
      formAction: resolvedUrl,
      schemeName: grantScheme.name,
      submissionList,
      csrfToken: (req as any).csrfToken?.() || '',
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
                href={submission.url}
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
    for (const fileName of isChecked) {
      const fileInfo = submissionList.find(
        (submission) => submission.label === fileName
      );
      if (fileInfo) await downloadFile(fileInfo.url, fileInfo.label);
    }
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
          <h1 className="govuk-heading-l">{schemeName}</h1>

          <div className="submissions-download-table">
            <Table
              tableClassName="table-thead-bottom-border"
              caption="Applications submitted"
              captionSize="m"
              tHeadColumns={tableHeadColumns}
              rows={tableRows}
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
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default CompletedSubmissions;
