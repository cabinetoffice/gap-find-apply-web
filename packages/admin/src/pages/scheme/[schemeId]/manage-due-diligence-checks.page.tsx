import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import { getGrantScheme } from '../../../services/SchemeService';
import InferProps from '../../../types/InferProps';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;

  const sessionCookie = getSessionIdFromCookies(req);
  const scheme = await getGrantScheme(schemeId, sessionCookie);
  const hasInfoToDownload = await completedMandatoryQuestions(
    scheme.schemeId,
    sessionCookie
  );

  return {
    props: {
      scheme,
      hasInfoToDownload,
    },
  };
};

const ManageDueDiligenceChecks = ({
  scheme,
  hasInfoToDownload,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Manage due diligence checks - Manage a grant" />

      <CustomLink href={`/scheme/${scheme.schemeId}`} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <h1 className="govuk-heading-l">Manage due diligence checks</h1>

          {!hasInfoToDownload ? (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          ) : (
            <>
              <p className="govuk-body">
                We gather the information you need to run due diligence checks.
              </p>

              <p className="govuk-body">
                You can use the government-owned due diligence tool ‘Spotlight’
                to run your due diligence checks. The information is already in
                the correct format to upload directly into Spotlight.
              </p>

              <p className="govuk-body">
                <CustomLink
                  href={`/api/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}`}
                >
                  Download due diligence information
                </CustomLink>
              </p>
            </>
          )}

          <CustomLink href={`/scheme/${scheme.schemeId}`} isSecondaryButton>
            Back to grant summary
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default ManageDueDiligenceChecks;
