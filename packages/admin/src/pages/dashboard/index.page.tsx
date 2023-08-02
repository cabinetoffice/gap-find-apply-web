import Meta from '../../components/layout/Meta';
import AccountDetails from './AccountDetails';
import ManageGrantSchemes from './ManageGrantSchemes';
import Scheme from '../../types/Scheme';
import { getUserSchemes } from '../../services/SchemeService';
import Pagination from '../../types/Pagination';
import { getLoggedInUsersDetails } from '../../services/UserService';
import UserDetails from '../../types/UserDetails';
import { getSessionIdFromCookies } from '../../utils/session';
import { GetServerSideProps } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const paginationParams: Pagination = {
    paginate: true,
    page: 0,
    size: 2,
    sort: 'createdDate,DESC',
  };

  const sessionCookie = getSessionIdFromCookies(req);
  const schemes = await getUserSchemes(paginationParams, sessionCookie);
  const userDetails: UserDetails = await getLoggedInUsersDetails(sessionCookie);
  const oneLoginTransferErrorEnabled =
    process.env.ONE_LOGIN_MIGRATION_JOURNEY === 'enabled';

  return {
    props: {
      schemes: schemes,
      userDetails,
      oneLoginTransferErrorEnabled,
    },
  };
};

const Dashboard = ({
  schemes,
  userDetails,
  oneLoginTransferErrorEnabled,
}: DashboardProps) => {
  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <Meta title="Dashboard - Manage a grant" />
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
        {oneLoginTransferErrorEnabled && (
          /* TODO: Placeholder for GAP-2013 */
          <div>
            <h1>PLACEHOLDER FOR ERROR BANNER</h1>
          </div>
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

interface DashboardProps {
  schemes: Scheme[];
  userDetails: UserDetails;
  oneLoginTransferErrorEnabled: boolean;
}

export default Dashboard;
