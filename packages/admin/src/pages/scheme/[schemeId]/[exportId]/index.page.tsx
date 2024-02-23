import { FlexibleQuestionPageLayout } from 'gap-web-ui';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';

import CustomLink from '../../../../components/custom-link/CustomLink';
import { getExportDetails } from '../../../../services/ExportService';
import { getGrantScheme } from '../../../../services/SchemeService';
import { generateErrorPageRedirect } from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { DownloadMessage } from '../../../../components/notification-banner/DownloadMessage';

export const getServerSideProps = async ({
  req,
  res,
  resolvedUrl,
  params,
}: GetServerSidePropsContext) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const { schemeId, exportId } = params as Record<string, string>;

  let grantScheme;
  let exportedSubmissions;
  let availableSubmissions = [];
  let unavailableSubmissions = [];
  let superZipLocation = '';

  try {
    grantScheme = await getGrantScheme(schemeId, sessionCookie);

    const exportDetails = await getExportDetails(exportId, sessionCookie);

    exportedSubmissions = exportDetails.exportedSubmissions;
    availableSubmissions = exportedSubmissions.filter(
      (submission: { status: string }) => submission.status === 'COMPLETE'
    );
    unavailableSubmissions = exportedSubmissions.filter(
      (submission: { status: string }) => submission.status === 'FAILED'
    );

    superZipLocation = exportDetails.superZipFileLocation;
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to view submission applications.',
      '/dashboard'
    );
  }

  if (availableSubmissions.length == 0 && unavailableSubmissions.length == 0)
    return generateErrorPageRedirect(
      'There are no submissions available to view or download.',
      '/dashboard'
    );

  return {
    props: {
      formAction: process.env.SUB_PATH + resolvedUrl,
      csrfToken: res.getHeader('x-csrf-token') as string,
      individualApplicationsHref: `/scheme/${schemeId}/${exportId}/download-individual`,
      superZipLocation: superZipLocation,
      schemeName: grantScheme.name,
      availableSubmissions: availableSubmissions,
      unavailableSubmissions: unavailableSubmissions,
    },
  };
};

export const CompletedSubmissions = ({
  formAction,
  csrfToken,
  schemeName,
  individualApplicationsHref,
  availableSubmissions,
  unavailableSubmissions,
  superZipLocation,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  <>
    {unavailableSubmissions.length > 0 && (
      <DownloadMessage count={unavailableSubmissions.length} />
    )}

    <h1 className="govuk-heading-l">{schemeName}</h1>

    <h2 className="govuk-heading-m">Applications available to download</h2>

    <p className="govuk-body" data-cy="cy_Download-submissions-page-text-1">
      Your grant has{' '}
      <b>
        {availableSubmissions.length}{' '}
        {availableSubmissions.length === 1 ? 'application' : 'applications'}
      </b>{' '}
      available to download.
    </p>
    <FlexibleQuestionPageLayout
      fieldErrors={[]}
      formAction={formAction}
      csrfToken={csrfToken}
    >
      <div className="govuk-button-group">
        <CustomLink
          href={`/apply/admin/api/signed-url?key=${encodeURIComponent(
            superZipLocation
          )}`}
          isButton
          excludeSubPath
        >
          Download all applications
        </CustomLink>

        <CustomLink href={individualApplicationsHref} isSecondaryButton>
          View individual applications
        </CustomLink>
      </div>
    </FlexibleQuestionPageLayout>

    {unavailableSubmissions.length > 0 && (
      // Paginated view goes here
      // Page number will be a param?
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
  </>;
};

export default CompletedSubmissions;
