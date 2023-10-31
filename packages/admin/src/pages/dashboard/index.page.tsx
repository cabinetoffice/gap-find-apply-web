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

const FAILED = 'FAILED';
const SUCCEEDED = 'SUCCEEDED';

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
}: InferProps<typeof getServerSideProps>) => {
  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <Meta title="Dashboard - Manage a grant" />
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
        {bannerProps && (
          <ImportantBanner
            {...(bannerProps === FAILED
              ? errorBannerProps
              : (bannerProps as { bannerHeading: string; isSuccess: boolean }))}
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
