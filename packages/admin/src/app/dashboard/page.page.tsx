import { cookies } from 'next/headers';
import { getLoggedInUsersDetails } from '../../services/UserService';
import { Metadata } from 'next';
import Navigation from './Navigation';
import AccountDetails from './AccountDetails';
import PaginatedSchemeList from './PaginatedSchemeList';
import DashboardBanner from './DashboardBanner';
import Link from 'next/link';
import { getUserSchemes } from '../../services/SchemeService';
import Pagination from '../../types/Pagination';

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
  const userDetails = await getLoggedInUsersDetails(sessionCookie);
  const schemes = await getUserSchemes(paginationParams, sessionCookie);

  const isTechSupportUser = userDetails.roles.includes('TECHNICAL_SUPPORT');

  return (
    <>
      {isTechSupportUser && <Navigation />}

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <DashboardBanner searchParams={searchParams} />

          <AccountDetails userDetails={userDetails} />

          <PaginatedSchemeList schemes={schemes} />

          <Link className="govuk-button" href="/new-scheme/name">
            Add a grant
          </Link>
        </div>
      </div>
    </>
  );
}
