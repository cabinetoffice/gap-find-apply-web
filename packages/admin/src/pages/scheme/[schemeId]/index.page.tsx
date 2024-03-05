import { AxiosError } from 'axios';
import { SummaryList } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { getGrantAdvertPublishInformationBySchemeId } from '../../../services/AdvertPageService';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import {
  findApplicationFormFromScheme,
  getGrantScheme,
} from '../../../services/SchemeService';
import FindApplicationFormStatsResponse from '../../../types/FindApplicationFormStatsResponse';
import InferProps from '../../../types/InferProps';
import Scheme from '../../../types/Scheme';
import { generateErrorPageRedirect } from '../../../utils/serviceErrorHelpers';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../utils/session';
import BuildAdvert from '../components/BuildAdvert';
import BuildApplicationForm from '../components/BuildApplicationForm';
import SchemeApplications from '../components/SchemeApplications';
import styles from './index.module.scss';
import Link from 'next/link';
import { isSchemeOwner } from '../../../services/SchemeEditorService';
import { getLastEditedEmail } from '../../../services/ApplicationService';

type ManageGrantsSidebarProps = {
  schemeId: string;
  isOwner: boolean;
};

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);
  let scheme: Scheme;
  let allApplicationFormsStats: FindApplicationFormStatsResponse[];
  let schemeApplicationsData = null;
  let grantAdvertPublishData = null;
  let isOwner;
  let editorOrPublisherEmail = null;

  try {
    scheme = await getGrantScheme(schemeId, sessionCookie);

    isOwner = await isSchemeOwner(schemeId, sessionCookie);

    allApplicationFormsStats = await findApplicationFormFromScheme(
      schemeId,
      sessionCookie
    );

    if (allApplicationFormsStats.length > 0) {
      schemeApplicationsData = {
        applicationForm: await getApplicationFormSummary(
          allApplicationFormsStats[0].applicationId,
          sessionCookie,
          false,
          false
        ),
        applicationFormStats: allApplicationFormsStats[0],
      };
      const grantApplicationId =
        schemeApplicationsData.applicationForm.grantApplicationId;
      editorOrPublisherEmail = await getLastEditedEmail(
        grantApplicationId,
        sessionCookie
      );
    }
  } catch (err) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to retrieve scheme details.',
      '/dashboard'
    );
  }

  // In separate try catch as the 404 doesn't redirect, it renders different components.
  try {
    grantAdvertPublishData = await getGrantAdvertPublishInformationBySchemeId(
      sessionCookie,
      getUserTokenFromCookies(req),
      schemeId
    );
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status !== 404) {
      return generateErrorPageRedirect(
        'Something went wrong while trying to retrieve scheme details.',
        '/dashboard'
      );
    }
    grantAdvertPublishData = { status: 404 };
    editorOrPublisherEmail = `NA`;
  }

  return {
    props: {
      scheme,
      isOwner,
      schemeApplicationsData,
      enabledAdBuilder: process.env.FEATURE_ADVERT_BUILDER!,
      grantAdvertPublishData,
      editorOrPublisherEmail,
    },
  };
};

const ViewScheme = ({
  scheme,
  schemeApplicationsData,
  enabledAdBuilder,
  grantAdvertPublishData,
  isOwner,
  editorOrPublisherEmail,
}: InferProps<typeof getServerSideProps>) => {
  const schemeHasApplicationOrAdvert =
    schemeApplicationsData || grantAdvertPublishData.status !== 404;

  const showDueDilligenceSection =
    schemeHasApplicationOrAdvert && parseInt(scheme.version!) > 1;

  return (
    <>
      <Meta title="Grant overview - Manage a grant" />

      <CustomLink href="/dashboard" isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <h1
            className="govuk-heading-l"
            data-testid="scheme-details-overview-header"
            data-cy="cy_schemeDetailsPageHeader"
          >
            {scheme.name}
          </h1>

          <h2 className="govuk-heading-m">Grant summary</h2>

          <SummaryList
            rows={[
              {
                key: 'GGIS Scheme Reference Number',
                value: scheme.ggisReference,
                action: (
                  <CustomLink
                    href={`/scheme/edit/ggis-reference?schemeId=${scheme.schemeId}&defaultValue=${scheme.ggisReference}`}
                    ariaLabel="Change GGIS scheme reference number"
                    dataCy="cy_Change GGIS scheme reference number"
                  >
                    Change
                  </CustomLink>
                ),
              },
              {
                key: 'Support email address',
                value: scheme.contactEmail ? scheme.contactEmail : '–',
                action: (
                  <CustomLink
                    href={`/scheme/edit/email?schemeId=${scheme.schemeId}${
                      scheme.contactEmail
                        ? `&defaultValue=${scheme.contactEmail}`
                        : ''
                    }`}
                    ariaLabel="Change the support email address"
                    dataCy="cy_Change the support email address"
                  >
                    Change
                  </CustomLink>
                ),
              },
            ]}
          />

          {enabledAdBuilder === 'enabled' && (
            <BuildAdvert
              schemeId={scheme.schemeId}
              grantAdvert={grantAdvertPublishData}
            />
          )}

          {schemeApplicationsData?.applicationForm ? (
            <SchemeApplications
              applicationForm={schemeApplicationsData.applicationForm}
              applicationFormStats={schemeApplicationsData.applicationFormStats}
              schemeVersion={scheme.version}
              editorOrPublisherEmail={editorOrPublisherEmail}
            />
          ) : (
            <BuildApplicationForm schemeId={scheme.schemeId} />
          )}

          {showDueDilligenceSection && (
            <>
              <h2
                className="govuk-heading-m govuk-!-padding-top-4"
                data-cy="cy_Scheme-details-page-h2-Required checks"
              >
                Due diligence checks
              </h2>

              <p
                className="govuk-body"
                data-cy="cy_Scheme-details-page-Required-checks-text-1"
              >
                You can download details about your applicants to run due
                diligence checks.{' '}
                {schemeApplicationsData?.applicationForm ? (
                  <>
                    We gather this information as part of the application form
                    for your grant.
                  </>
                ) : (
                  <>
                    We gather this information before applicants start an
                    application form.
                  </>
                )}
              </p>

              <CustomLink
                href={`/scheme/${scheme.schemeId}/manage-due-diligence-checks`}
                isSecondaryButton
              >
                Manage due diligence checks
              </CustomLink>
            </>
          )}
        </div>
        <ManageGrantsSidebar isOwner={isOwner} schemeId={scheme.schemeId} />
      </div>
    </>
  );
};

const ManageGrantsSidebar = ({
  schemeId,
  isOwner,
}: ManageGrantsSidebarProps) => {
  const titleText = isOwner ? 'Add an editor' : 'Grant editors';
  const buttonText = isOwner ? 'Add or manage editors' : 'View editors';
  const paragraphText = isOwner
    ? 'You can add other people to this grant. They will be able to edit it.'
    : 'You can view a list of the people that can edit this grant.';

  return (
    <div className="govuk-grid-column-one-third">
      <hr
        className={`govuk-section-break govuk-section-break--m govuk-section-break--visible ${styles.breakLine}`}
      />
      <h2 className={`govuk-heading-m ${styles['mb-sm-32']}`}>{titleText}</h2>
      <p className={`${styles['mb-sm-32']} govuk-body`}>{paragraphText}</p>
      <Link
        href={`/scheme/${schemeId}/${
          isOwner ? 'manage-editors' : 'view-editors'
        }`}
        role="button"
        draggable="false"
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
        data-cy="cy-apply-register-button"
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default ViewScheme;
