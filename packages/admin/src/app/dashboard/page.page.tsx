import { cookies } from 'next/headers';
import { getUserSchemes } from '../../services/SchemeService';
import Pagination from '../../types/Pagination';
import { getLoggedInUsersDetails } from '../../services/UserService';
import { Metadata } from 'next';
import Navigation from '../../pages/super-admin-dashboard/Navigation';
import AccountDetails from './AccountDetails';
import ManageGrantSchemes from './ManageGrantSchemes';
import DashboardBanner from './DashboardBanner';
import Link from 'next/link';

export type DashboardPageProps = {
  searchParams: {
    applyMigrationStatus?: string;
    findMigrationStatus?: string;
  };
};

export const metadata: Metadata = {
  title: 'Dashboard - Manage a grant',
};

export default async function Page({ searchParams }: DashboardPageProps) {
  const paginationParams: Pagination = {
    paginate: true,
    page: 0,
    size: 2,
    sort: 'createdDate,DESC',
  };
  const sessionCookie = cookies().get(process.env.SESSION_COOKIE_NAME)!.value;
  const schemes = await getUserSchemes(paginationParams, sessionCookie);
  const userDetails = await getLoggedInUsersDetails(sessionCookie);

  const isTechSupportUser = userDetails.roles.includes('TECHNICAL_SUPPORT');

  return (
    <>
      {isTechSupportUser && <Navigation isSuperAdminNav={false} />}

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <DashboardBanner searchParams={searchParams} />

          <AccountDetails userDetails={userDetails} />

          <ManageGrantSchemes schemes={schemes} />

          <Link className="govuk-button" href="/new-scheme/name">
            Add a grant
          </Link>
        </div>
      </div>
    </>
  );
}
