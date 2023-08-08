import Link from 'next/link';
import { FC } from 'react';
import { Card } from '../../components/card/Card';
import {
  DescriptionList,
  DescriptionListProps,
} from '../../components/description-list/DescriptionList';
import { routes } from '../../utils/routes';
import getConfig from 'next/config';

interface ApplicantDashBoardProps {
  descriptionList: DescriptionListProps;
  hasApplications: boolean;
  oneLoginMatchingAccountBannerEnabled: boolean;
  oneLoginEnabled: boolean;
}

const { publicRuntimeConfig } = getConfig();

export const ApplicantDashboard: FC<ApplicantDashBoardProps> = ({
  descriptionList,
  hasApplications,
  oneLoginMatchingAccountBannerEnabled,
  oneLoginEnabled,
}) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {oneLoginMatchingAccountBannerEnabled && (
          /* TODO: Placeholder for GAP-1923 */
          <div>
            <h1>MATCHING ACCOUNT BANNER PLACEHOLDER</h1>
          </div>
        )}
        <section>
          <h1
            className="govuk-heading-l"
            data-cy="cy-applicant-dashboard-header"
          >
            Your account
          </h1>
          <DescriptionList
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
              <Link href={'/applications'}>
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  data-cy="cy-your-applications-link"
                >
                  View your applications
                </a>
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
              linkDescription={'Your organisation details'}
              description={'Change your organisation details'}
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
