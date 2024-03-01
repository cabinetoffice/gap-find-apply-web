import { ImportantBanner } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import Meta from '../../components/layout/Meta';
import { getUserSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';
import InferProps from '../../types/InferProps';
import Pagination from '../../types/Pagination';
import UserDetails from '../../types/UserDetails';
import { getSessionIdFromCookies } from '../../utils/session';
import Navigation from '../super-admin-dashboard/Navigation';
import AccountDetails from './AccountDetails';
import ManageGrantSchemes from './ManageGrantSchemes';

const FAILED = 'FAILED';
const SUCCEEDED = 'SUCCEEDED';

export const getServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const paginationParams: Pagination = {
    paginate: false,
    page: 0,
    size: 2,
    sort: 'createdDate,DESC',
  };
  const sessionCookie = getSessionIdFromCookies(req);
  const schemes = await getUserSchemes(paginationParams, sessionCookie);
  const userDetails: UserDetails = await getLoggedInUsersDetails(sessionCookie);

  const isTechSupportUser = userDetails.roles.includes('TECHNICAL_SUPPORT');

  const { applyMigrationStatus, findMigrationStatus } = (query || {}) as Record<
    string,
    string
  >;
  const bannerProps = getBannerProps({
    applyMigrationStatus,
    findMigrationStatus,
  });

  return {
    props: {
      schemes: schemes,
      userDetails,
      bannerProps,
      isTechSupportUser,
    },
  };
};

const errorBannerProps = {
  bannerHeading: 'Something went wrong while transferring your data.',
  bannerContent: (
    <p className="govuk-body">
      Please get in contact with our support team at{' '}
      <a
        className="govuk-notification-banner__link"
        href="mailto:findagrant@cabinetoffice.gov.uk"
      >
        findagrant@cabinetoffice.gov.uk
      </a>
      .
    </p>
  ),
  isSuccess: false,
};

const Dashboard = ({
  schemes,
  userDetails,
  bannerProps,
  isTechSupportUser,
}: InferProps<typeof getServerSideProps>) => {
  const formattedBannerProps =
    bannerProps === FAILED
      ? errorBannerProps
      : (bannerProps as { bannerHeading: string; isSuccess: boolean });
  return (
    <>
      {isTechSupportUser && <Navigation isSuperAdminNav={false}></Navigation>}
      <div className="govuk-grid-row govuk-!-padding-top-7">
        <Meta title="Dashboard - Manage a grant" />
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          {bannerProps && <ImportantBanner {...formattedBannerProps} />}
          <AccountDetails userDetails={userDetails} />
          <ManageGrantSchemes schemes={schemes} />
        </div>
      </div>
    </>
  );
};

const getBannerProps = ({
  findMigrationStatus,
  applyMigrationStatus,
}: Record<string, string>) => {
  if (process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED !== 'true') return null;
  if ([findMigrationStatus, applyMigrationStatus].includes(FAILED))
    return FAILED;

  if ([findMigrationStatus, applyMigrationStatus].includes(SUCCEEDED))
    return {
      bannerHeading:
        'Your data has been successfully added to your One Login account.',
      isSuccess: true,
    };

  return null;
};

export default Dashboard;
