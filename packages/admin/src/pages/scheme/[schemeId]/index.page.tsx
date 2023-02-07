import { GetServerSidePropsContext } from 'next';
import {
  getGrantScheme,
  findApplicationFormFromScheme,
} from '../../../services/SchemeService';
import Meta from '../../../components/layout/Meta';
import Scheme from '../../../types/Scheme';
import { SummaryList } from 'gap-web-ui';
import CustomLink from '../../../components/custom-link/CustomLink';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import BuildApplicationForm from '../components/BuildApplicationForm';
import SchemeApplications from '../components/SchemeApplications';
import { getSessionIdFromCookies } from '../../../utils/session';
import { generateErrorPageRedirect } from '../../../utils/serviceErrorHelpers';
import FindApplicationFormStatsResponse from '../../../types/FindApplicationFormStatsResponse';
import BuildAdvert from '../components/BuildAdvert';
import InferProps from '../../../types/InferProps';
import { getGrantAdvertPublishInformationBySchemeId } from '../../../services/AdvertPageService';
import { AxiosError } from 'axios';

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

  try {
    scheme = await getGrantScheme(schemeId, sessionCookie);
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
  }

  return {
    props: {
      scheme,
      schemeApplicationsData,
      enabledAdBuilder: process.env.FEATURE_ADVERT_BUILDER!,
      grantAdvertPublishData,
    },
  };
};

const ViewScheme = ({
  scheme,
  schemeApplicationsData,
  enabledAdBuilder,
  grantAdvertPublishData,
}: InferProps<typeof getServerSideProps>) => {
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
              grantAdvertData={grantAdvertPublishData}
            />
          )}

          {schemeApplicationsData?.applicationForm ? (
            <SchemeApplications
              applicationForm={schemeApplicationsData.applicationForm}
              applicationFormStats={schemeApplicationsData.applicationFormStats}
            />
          ) : (
            <BuildApplicationForm schemeId={scheme.schemeId} />
          )}
        </div>
      </div>
    </>
  );
};

export default ViewScheme;
