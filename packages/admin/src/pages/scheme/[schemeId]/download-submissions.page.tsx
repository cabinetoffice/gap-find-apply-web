import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import ExportStatusEnum from '../../../enums/ExportStatus';
import { findApplicationFormFromScheme } from '../../../services/SchemeService';
import {
  getApplicationExportStatus,
  requestSubmissionsExport,
} from '../../../services/SubmissionsService';
import { getLoggedInUsersDetails } from '../../../services/UserService';
import UserDetails from '../../../types/UserDetails';
import callServiceMethod from '../../../utils/callServiceMethod';
import {
  generateErrorPageParams,
  generateErrorPageRedirect,
} from '../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
  resolvedUrl,
}) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const { schemeId } = query as Record<string, string>;

  let exportStatus: ExportStatusEnum;
  let applicationFormsStatus: {
    applicationId: string;
    submissionCount: number;
  }[];
  let applicationId: string;
  let userDetails: UserDetails = {
    firstName: '',
    lastName: '',
    organisationName: '',
    emailAddress: '',
    roles: [],
  };

  const errorPageParams = generateErrorPageParams(
    'Something went wrong while trying to export submissions.',
    `/scheme/${schemeId}`
  );

  const errorPageRedirect = generateErrorPageRedirect(
    'Something went wrong while trying to export submissions.',
    req.headers.referer ? req.headers.referer : '/dashboard',
    !!req.headers.referer
  );

  try {
    applicationFormsStatus = await findApplicationFormFromScheme(
      schemeId,
      sessionCookie
    );
    applicationId = applicationFormsStatus[0].applicationId;

    const hasSubmissions = applicationFormsStatus.some(
      (appForm) => appForm.submissionCount > 0
    );
    if (!hasSubmissions) {
      return errorPageRedirect;
    }
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong. This application has no submissions.',
      req.headers.referer ? req.headers.referer : '/dashboard',
      !!req.headers.referer
    );
  }

  exportStatus = await getApplicationExportStatus(sessionCookie, applicationId);

  if (exportStatus == ExportStatusEnum.COMPLETE) {
    // for now, we just treat COMPLETE the same as NOT_STARTED ie. allow them to trigger another download
    // in the future, if an export is complete we should aim to redirect them to the summary table page
    // so they can access the most recent export without requiring the email link
    exportStatus = ExportStatusEnum.NOT_STARTED;
  }

  if (exportStatus == ExportStatusEnum.NOT_STARTED) {
    const response = await callServiceMethod(
      req,
      res,
      () => requestSubmissionsExport(sessionCookie, applicationId),
      `/scheme/${schemeId}/download-submissions`, // after export is triggered, redirect to same page
      errorPageParams
    );
    if ('redirect' in response) {
      return response;
    }
  }

  if (
    exportStatus == ExportStatusEnum.PROCESSING ||
    exportStatus == ExportStatusEnum.REQUESTED
  ) {
    try {
      userDetails = await getLoggedInUsersDetails(sessionCookie);
    } catch (error) {
      return errorPageRedirect;
    }
  }

  return {
    props: {
      backButtonHref: `/scheme/${schemeId}`,
      exportStatus,
      emailAddress: userDetails.emailAddress,
      formAction: resolvedUrl,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const DownloadSubmissions = ({
  backButtonHref,
  exportStatus,
  emailAddress,
  formAction,
  csrfToken,
}: DownloadSubmissionsProps) => {
  return (
    <>
      <Meta
        title={`Download applications${
          exportStatus == ExportStatusEnum.PROCESSING ||
          exportStatus == ExportStatusEnum.REQUESTED
            ? ' - In progress'
            : ''
        } - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7 govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          {(exportStatus == ExportStatusEnum.PROCESSING ||
            exportStatus == ExportStatusEnum.REQUESTED) && (
            <>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                  <div className="govuk-panel govuk-panel--confirmation">
                    <h1 className="govuk-panel__title">
                      A list of applications is being created
                    </h1>
                  </div>
                </div>
              </div>
              <p className="govuk-body">
                It can take some time to prepare this information.
              </p>
              <p className="govuk-body break-all-words">
                You do not need to wait here. We will email{' '}
                <a href={`mailto:${emailAddress}`} className="govuk-link">
                  {emailAddress}
                </a>{' '}
                when the information is ready.
              </p>
            </>
          )}

          {exportStatus == ExportStatusEnum.NOT_STARTED && (
            <>
              <h1 className="govuk-heading-l">View your applications</h1>
              <p
                className="govuk-body"
                data-cy="cy_Download-submissions-page-text-1"
              >
                To see who has applied for your grant, you need to view and
                download your submitted applications.
              </p>
              <p
                className="govuk-body"
                data-cy="cy_Download-submissions-page-text-2"
              >
                Get started by requesting a list of applications.
              </p>
              <FlexibleQuestionPageLayout
                fieldErrors={[]}
                formAction={formAction}
                csrfToken={csrfToken}
              >
                <Button
                  text="Download submitted applications"
                  addNameAttribute
                />
              </FlexibleQuestionPageLayout>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface DownloadSubmissionsProps {
  backButtonHref: string;
  exportStatus: ExportStatusEnum;
  emailAddress: string;
  formAction: string;
  csrfToken: string;
}

export default DownloadSubmissions;
