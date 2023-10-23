import Meta from '../../components/layout/Meta';
import AccountDetails from './AccountDetails';
import ManageGrantSchemes from './ManageGrantSchemes';
import { getUserSchemes } from '../../services/SchemeService';
import Pagination from '../../types/Pagination';
import { getLoggedInUsersDetails } from '../../services/UserService';
import UserDetails from '../../types/UserDetails';
import { getSessionIdFromCookies } from '../../utils/session';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import InferProps from '../../types/InferProps';
import { ImportantBanner } from 'gap-web-ui';

export const getServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const paginationParams: Pagination = {
    paginate: true,
    page: 0,
    size: 2,
    sort: 'createdDate,DESC',
  };
  const sessionCookie = getSessionIdFromCookies(req);
  const schemes = await getUserSchemes(paginationParams, sessionCookie);
  const userDetails: UserDetails = await getLoggedInUsersDetails(sessionCookie);

  const applyMigrationStatus = query?.applyMigrationStatus ?? null;
  const findMigrationStatus = query?.findMigrationStatus ?? null;

  const oneLoginMatchingAccountBannerEnabled =
    process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED === 'true';

  const showMigrationSuccessBanner =
    oneLoginMatchingAccountBannerEnabled &&
    (applyMigrationStatus === 'success' || findMigrationStatus === 'success');

  const showMigrationErrorBanner =
    oneLoginMatchingAccountBannerEnabled &&
    (applyMigrationStatus === 'error' || findMigrationStatus === 'error');

  return {
    props: {
      schemes: schemes,
      userDetails,
      showMigrationSuccessBanner,
      showMigrationErrorBanner,
    },
  };
};

const Dashboard = ({
  schemes,
  userDetails,
  showMigrationSuccessBanner,
  showMigrationErrorBanner,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <Meta title="Dashboard - Manage a grant" />
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
        {showMigrationSuccessBanner && (
          <ImportantBanner
            bannerHeading="Your data has been successfully added to your One Login account."
            isSuccess
          />
        )}

        {showMigrationErrorBanner && (
          <ImportantBanner
            bannerHeading="Something went wrong while transferring your data. "
            bannerContent={
              <p className="govuk-body">
                Please get in contact with our support team at{' '}
                <a
                  className="govuk-notification-banner__link"
                  href="mailto:findagrant@cabinetoffice.gov.uk"
                >
                  findagrant@cabinetoffice.gov.uk
                </a>
                {'.'}
              </p>
            }
          />
        )}

        <AccountDetails userDetails={userDetails} />
        <ManageGrantSchemes schemes={schemes} />

        <CustomLink
          href="/new-scheme/name"
          isButton
          dataCy="cy_addAGrantButton"
        >
          Add a grant
        </CustomLink>
      </div>
    </div>
  );
};

export default Dashboard;
