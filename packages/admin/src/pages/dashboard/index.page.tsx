import { ImportantBanner } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import { getOwnedAndEditableSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';
import InferProps from '../../types/InferProps';
import Pagination from '../../types/Pagination';
import Scheme from '../../types/Scheme';
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
    sort: 'lastUpdated,DESC',
  };
  const sessionCookie = getSessionIdFromCookies(req);
  const { ownedSchemes: schemesUserOwns, editableSchemes: schemesUserCanEdit } =
    await getOwnedAndEditableSchemes(paginationParams, sessionCookie);
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
      schemesUserOwns,
      schemesUserCanEdit,
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
  schemesUserOwns,
  schemesUserCanEdit,
  userDetails,
  bannerProps,
  isTechSupportUser,
}: InferProps<typeof getServerSideProps>) => {
  const formattedBannerProps =
    bannerProps === FAILED
      ? errorBannerProps
      : (bannerProps as { bannerHeading: string; isSuccess: boolean });

  const schemesUserOwnsIsEmpty = schemesUserOwns.length === 0;
  const schemesUserCanEditIsEmpty = schemesUserCanEdit.length === 0;

  return (
    <>
      {isTechSupportUser && <Navigation isSuperAdminNav={false}></Navigation>}
      <div className="govuk-grid-row govuk-!-padding-top-7">
        <Meta title="Dashboard - Manage a grant" />
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          {bannerProps && <ImportantBanner {...formattedBannerProps} />}
          <AccountDetails userDetails={userDetails} />

          {schemesUserOwnsIsEmpty && schemesUserCanEditIsEmpty
            ? noGrantsView()
            : grantsView(
                schemesUserOwns,
                schemesUserCanEdit,
                schemesUserOwnsIsEmpty,
                schemesUserCanEditIsEmpty
              )}
        </div>
      </div>
    </>
  );
};

const noGrantsView = () => (
  <>
    <p className="govuk-body">
      You do not own or have editing permissions for any grants.
    </p>
    <CustomLink href="/new-scheme/name" isButton dataCy="cy_addAGrantButton">
      Add a grant
    </CustomLink>
  </>
);

const grantsView = (
  schemesUserOwns: Scheme[],
  schemesUserCanEdit: Scheme[],
  schemesUserOwnsIsEmpty: boolean,
  schemesUserCanEditIsEmpty: boolean
) => (
  <>
    <p className="govuk-body">
      All of the grants linked to your account are listed below.
    </p>
    <CustomLink href="/new-scheme/name" isButton dataCy="cy_addAGrantButton">
      Add a grant
    </CustomLink>
    {!schemesUserOwnsIsEmpty && (
      <ManageGrantSchemes
        schemes={schemesUserOwns}
        tableHeading="Grants you own"
      />
    )}
    {!schemesUserCanEditIsEmpty && (
      <ManageGrantSchemes
        schemes={schemesUserCanEdit}
        tableHeading="Grants you can edit"
      />
    )}
  </>
);

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
