import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { getGrantScheme } from '../../../services/SchemeService';
import { getSessionIdFromCookies } from '../../../utils/session';
import { errorPageRedirect } from './publish-service-errors';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { applicationId } = params as Record<string, string>;

  let grantScheme;
  try {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
    grantScheme = await getGrantScheme(
      applicationFormSummary.grantSchemeId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return errorPageRedirect(applicationId, true);
  }
  const applyToApplicationUrl =
    grantScheme.version === '1'
      ? `/applications/${applicationId}`
      : `/mandatory-questions/start?schemeId=${grantScheme.schemeId}`;

  return {
    props: {
      grantSchemeId: grantScheme.schemeId,
      applyToApplicationUrl,
    },
  };
};

const PublishSuccessPage = ({
  grantSchemeId,
  applyToApplicationUrl,
}: PublishSuccessPageProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToApplicantApplicationForm = `${publicRuntimeConfig.APPLICANT_DOMAIN}${applyToApplicationUrl}`;
  return (
    <>
      <Meta title="Publish your application form - Manage a grant" />

      <div className="govuk-!-padding-top-7">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Grant application form published
              </h1>
            </div>

            <p className="govuk-body">
              To add this application form to your advert, copy the URL below
              and paste it into the &apos;How to Apply&apos; section of your
              grant advert.
            </p>

            <p className="govuk-body break-all-words">
              <a href={linkToApplicantApplicationForm} className="govuk-link">
                {linkToApplicantApplicationForm}
              </a>
            </p>

            <div className="govuk-button-group govuk-!-margin-top-9">
              <CustomLink
                href={`/scheme/${grantSchemeId}`}
                isButton
                dataCy="cy_publishSuccess-manageThisGrant-button"
              >
                Manage this grant
              </CustomLink>

              <CustomLink
                href="/new-scheme/name"
                dataCy="cy_publishSuccess-AddANewGrant-link"
              >
                Add a new grant
              </CustomLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type PublishSuccessPageProps = {
  grantSchemeId: string;
  applyToApplicationUrl: string;
};

export default PublishSuccessPage;
