import { FC } from 'react';
import { Card } from '../../components/card/Card';
import {
  DescriptionList,
  DescriptionListProps,
} from '../../components/description-list/DescriptionList';
import { routes } from '../../utils/routes';
import { ImportantBanner } from 'gap-web-ui';
import Link from 'next/link';

export type ApplicantDashBoardProps = {
  organisationType: string;
  descriptionList: DescriptionListProps;
  hasApplications: boolean;
  bannerProps?:
    | string
    | {
        bannerHeading: string;
        bannerContent?: string | JSX.Element;
        isSuccess: boolean;
      };
  oneLoginEnabled: boolean;
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
      {'.'}
    </p>
  ),
  isSuccess: false,
};

export const ApplicantDashboard: FC<ApplicantDashBoardProps> = ({
  descriptionList,
  hasApplications,
  bannerProps,
  oneLoginEnabled,
  organisationType,
}) => {
  const migrationBannerProps =
    bannerProps === 'FAILED'
      ? errorBannerProps
      : (bannerProps as {
          bannerHeading: string;
          bannerContent?: string | JSX.Element;
          isSuccess: boolean;
        });
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {bannerProps && <ImportantBanner {...migrationBannerProps} />}

        <section>
          <h1
            className="govuk-heading-l"
            data-cy="cy-applicant-dashboard-header"
          >
            Your account
          </h1>
          <DescriptionList
            organisationType={organisationType}
            data={descriptionList.data}
            needAddOrChangeButtons={descriptionList.needAddOrChangeButtons}
            needBorder={descriptionList.needBorder}
          />
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </section>
        <section>
          <h2
            className="govuk-heading-m"
            data-cy="cy-applicant-dashboard-applications-subheader"
          >
            View your applications
          </h2>
          {hasApplications ? (
            <>
              <p className="govuk-body">
                See your past and current applications
              </p>
              <Link
                href={'/applications'}
                className="govuk-link govuk-link--no-visited-state"
                data-cy="cy-your-applications-link"
              >
                View your applications
              </Link>
            </>
          ) : (
            <>
              <p
                className="govuk-body"
                data-cy="cy-no-existing-applications-paragraph-1"
              >
                You have not started any applications.
              </p>
              <p
                className="govuk-body"
                data-cy="cy-no-existing-applications-paragraph-2"
              >
                To get started, you need to find a grant that you want to apply
                for.
              </p>
              <a
                href={routes.findAGrant}
                role="button"
                draggable="false"
                className="govuk-button govuk-!-margin-bottom-0"
                data-module="govuk-button"
                data-cy="cy-find-a-grant-link"
              >
                Find a grant
              </a>
            </>
          )}

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
        </section>
        <section>
          <h2
            className="govuk-heading-m"
            data-cy="cy-applicant-dashboard-details-subheader"
          >
            Your details
          </h2>
          <div className="govuk-grid-row">
            <Card
              link={routes.organisation.index} // TODO this will change the organisationID to be dynamic
              linkDescription="Your saved information"
              description="Change the details saved to your profile"
            />
            {oneLoginEnabled && (
              <Card
                link={routes.signInDetails}
                linkDescription={'Your sign in details'}
                description={'Change your sign in details'}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
