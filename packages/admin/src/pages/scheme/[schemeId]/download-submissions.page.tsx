import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import ExportStatusEnum from '../../../enums/ExportStatus';
import {
  findApplicationFormFromScheme,
  getGrantScheme,
} from '../../../services/SchemeService';
import {
  getApplicationExportStatus,
  requestSubmissionsExport,
} from '../../../services/SubmissionsService';
import { getLoggedInUsersDetails } from '../../../services/UserService';
import InferProps from '../../../types/InferProps';
import { parseBody } from '../../../utils/parseBody';
import { generateErrorPageRedirect } from '../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../utils/session';
import { DownloadMessage } from '../../../components/notification-banner/DownloadMessage';

export const getServerSideProps = async ({
  req,
  res,
  query,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const { schemeId, requested, pageNumber } = query as Record<string, string>;

  let applicationFormsStatus: {
    applicationId: string;
    submissionCount: number;
  }[];
  let applicationId: string;
  let submissionsCount: number;
  let schemeName: string;
  const applicationsUnavailableForDownload: number[] = []; // TODO Placeholder storage for info about downloads

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
    submissionsCount = applicationFormsStatus[0].submissionCount;

    const scheme = await getGrantScheme(schemeId, sessionCookie);
    schemeName = scheme.name;

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

  if (req.method === 'POST') {
    const body: object = await parseBody(req, res);
    if ('download-submitted-applications' in body) {
      requestSubmissionsExport(sessionCookie, applicationId);
      return {
        redirect: {
          destination: `/scheme/${schemeId}/download-submissions?requested=true`,
          statusCode: 302,
        },
      };
    }
  }

  const exportStatus = await getApplicationExportStatus(
    sessionCookie,
    applicationId
  );

  let userDetails;
  try {
    userDetails = await getLoggedInUsersDetails(sessionCookie);
  } catch (error) {
    return errorPageRedirect;
  }

  return {
    props: {
      backButtonHref: `/scheme/${schemeId}`,
      individualApplicationsHref: `/scheme/${schemeId}/${applicationId}`,
      schemeName,
      exportStatus,
      submissionsCount,
      applicationsUnavailableForDownload,
      pageNumber: pageNumber || null,
      requested: requested || null,
      emailAddress: userDetails.emailAddress,
      formAction: process.env.SUB_PATH + resolvedUrl,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const DownloadSubmissions = ({
  backButtonHref,
  individualApplicationsHref,
  schemeName,
  exportStatus,
  submissionsCount,
  applicationsUnavailableForDownload,
  pageNumber,
  requested,
  emailAddress,
  formAction,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`Download applications${
          exportStatus == ExportStatusEnum.PROCESSING ||
          exportStatus == ExportStatusEnum.REQUESTED ||
          requested == 'true'
            ? ' - In progress'
            : ''
        } - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      {applicationsUnavailableForDownload.length > 0 && (
        <DownloadMessage count={applicationsUnavailableForDownload.length} />
      )}

      <div className="govuk-grid-row govuk-!-padding-top-7 govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          {(exportStatus == ExportStatusEnum.PROCESSING ||
            exportStatus == ExportStatusEnum.REQUESTED ||
            requested == 'true') && (
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

          {exportStatus == ExportStatusEnum.FAILED ||
            (exportStatus == ExportStatusEnum.NOT_STARTED &&
              requested != 'true' && (
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
              ))}

          {exportStatus == ExportStatusEnum.COMPLETE && (
            <>
              <h1 className="govuk-heading-l">{schemeName}</h1>

              <h2 className="govuk-heading-m">
                Applications available to download
              </h2>

              <p
                className="govuk-body"
                data-cy="cy_Download-submissions-page-text-1"
              >
                Your grant has{' '}
                <b>
                  {submissionsCount}{' '}
                  {submissionsCount === 1 ? 'application' : 'applications'}
                </b>{' '}
                available to download.
              </p>
              <FlexibleQuestionPageLayout
                fieldErrors={[]}
                formAction={formAction}
                csrfToken={csrfToken}
              >
                <div className="govuk-button-group">
                  <Button text="Download all applications" addNameAttribute />
                  <CustomLink
                    href={individualApplicationsHref}
                    isSecondaryButton
                  >
                    View individual applications
                  </CustomLink>
                </div>
              </FlexibleQuestionPageLayout>

              {applicationsUnavailableForDownload.length > 0 && (
                // Paginated view goes here
                // Page number will be a param
                <>
                  {/* <p>You are on page {pageNumber} right now</p>
                  <CustomLink
                    href={`/scheme/1/download-submissions?pageNumber=2`}
                    isSecondaryButton
                  >
                    Page 2
                  </CustomLink>
                  <CustomLink
                    href={`/scheme/1/download-submissions?pageNumber=3`}
                    isSecondaryButton
                  >
                    Page 3
                  </CustomLink> */}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DownloadSubmissions;
