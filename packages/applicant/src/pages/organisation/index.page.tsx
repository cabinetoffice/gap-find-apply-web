import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Link from 'next/link';
import { FC } from 'react';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantApplicant } from '../../types/models/GrantApplicant';
import { GrantApplicantOrganisationProfile } from '../../types/models/GrantApplicantOrganisationProfile';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import ProcessAddress from './processAddress';

const { publicRuntimeConfig } = getConfig();

export interface ManageOrganisationDetailsProps {
  displayOrganisationDetails: {
    id: string;
    label: string;
    value: string | string[];
    url: string;
    status: string;
  }[];
}

interface OrganisationIndexPageProps {
  organisationDetails: ManageOrganisationDetailsProps;
}

function checkAddressValue(profile: GrantApplicantOrganisationProfile) {
  return (
    profile?.addressLine1 ||
    profile?.addressLine2 ||
    profile?.town ||
    profile?.county ||
    profile?.postcode
  );
}

export const getServerSideProps: GetServerSideProps<
  OrganisationIndexPageProps
> = async ({ req }) => {
  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicant: GrantApplicant =
    await grantApplicantService.getGrantApplicant(getJwtFromCookies(req));

  const organisationData = grantApplicant.organisation;

  const organisationDetails: ManageOrganisationDetailsProps = {
    displayOrganisationDetails: [
      {
        id: 'organisationName',
        label: 'Name',
        value: organisationData?.legalName,
        url: routes.organisation.name,
        status:
          organisationData?.legalName && organisationData.legalName !== '-'
            ? 'Change'
            : 'Add',
      },
      {
        id: 'organisationAddress',
        label: 'Address',
        value: checkAddressValue(organisationData)
          ? [
              organisationData.addressLine1,
              organisationData.addressLine2,
              organisationData.town,
              organisationData.county,
              organisationData.postcode,
            ]
          : null,
        url: routes.organisation.address,
        status: checkAddressValue(organisationData) ? 'Change' : 'Add',
      },
      {
        id: 'organisationType',
        label: 'Type of organisation',
        value: organisationData?.type,
        url: routes.organisation.type,
        status: organisationData?.type ? 'Change' : 'Add',
      },
      {
        id: 'organisationCompaniesHouseNumber',
        label: 'Companies house number',
        value: organisationData?.companiesHouseNumber,
        url: routes.organisation.companiesHouseNumber,
        status: organisationData?.companiesHouseNumber ? 'Change' : 'Add',
      },
      {
        id: 'organisationCharity',
        label: 'Charity commission number',
        value: organisationData?.charityCommissionNumber,
        url: routes.organisation.charityComissionNumber,
        status: organisationData?.charityCommissionNumber ? 'Change' : 'Add',
      },
    ],
  };

  return {
    props: {
      organisationDetails,
    },
  };
};

const ManageOrganisationDetails: FC<OrganisationIndexPageProps> = ({
  organisationDetails,
}) => {
  return (
    <>
      <Meta title="Organisation details - Apply for a grant" />

      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cy-manage-organisation-header"
            >
              Your organisation details
            </h1>
            <p className="govuk-body">
              Funding organisations run checks to prevent fraud. The information
              below will be used as part of these checks.
            </p>
            <dl className="govuk-summary-list">
              {organisationDetails &&
                organisationDetails.displayOrganisationDetails.map(
                  (organisationDetail, index) => {
                    return (
                      <div className="govuk-summary-list__row" key={index}>
                        <dt
                          className="govuk-summary-list__key"
                          data-cy={`cy-organisation-details-${organisationDetail.label}`}
                        >
                          {organisationDetail.label}
                        </dt>
                        {organisationDetail.id === 'organisationAddress' ? (
                          <ProcessAddress
                            data={organisationDetail.value}
                            id={organisationDetail.id}
                            cyTag={organisationDetail.label}
                          />
                        ) : (
                          <dd
                            className="govuk-summary-list__value"
                            id={organisationDetail.id}
                            data-cy={`cy-organisation-value-${organisationDetail.label}`}
                          >
                            {organisationDetail.value
                              ? organisationDetail.value
                              : '-'}
                          </dd>
                        )}
                        <dd className="govuk-summary-list__actions">
                          <Link href={organisationDetail.url}>
                            <a
                              className="govuk-link govuk-link--no-visited-state"
                              data-cy={`cy-organisation-details-navigation-${organisationDetail.id}`}
                            >
                              {organisationDetail.status}
                              <span className="govuk-visually-hidden">
                                {organisationDetail.url}
                              </span>
                            </a>
                          </Link>
                        </dd>
                      </div>
                    );
                  }
                )}
            </dl>

            <a
              href={publicRuntimeConfig.subPath + routes.dashboard}
              role="button"
              draggable="false"
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              data-cy="cy-back-to-dashboard-button"
            >
              Back to my account
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ManageOrganisationDetails;
