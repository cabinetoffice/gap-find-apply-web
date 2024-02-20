import { ImportantBanner } from 'gap-web-ui';
import { DashboardPageProps } from './page.page';

export default function DashboardBanner({ searchParams }: DashboardPageProps) {
  if (process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED !== 'true') return;

  const statusArray = Object.values(searchParams);
  if (statusArray.includes('FAILED')) {
    return (
      <ImportantBanner
        bannerHeading="Something went wrong while transferring your data."
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
        isSuccess={false}
      />
    );
  }

  if (statusArray.includes('SUCCEEDED')) {
    return (
      <ImportantBanner
        bannerHeading="Your data has been successfully added to your One Login account."
        isSuccess={true}
      />
    );
  }
}
