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
import { MQ_ORG_TYPES } from '../../utils/constants';

const { publicRuntimeConfig } = getConfig();

interface OrganisationDetails {
  id: string;
  label: string;
  value: string | string[];
  url: string;
  status: string;
}
interface ManageOrganisationDetailsProps extends OrganisationData {
  isIndividual: boolean;
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

export const getServerSideProps = async ({ req }) => {
  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicant: GrantApplicant =
    await grantApplicantService.getGrantApplicant(getJwtFromCookies(req));

  const organisationData = grantApplicant.organisation;
  const isIndividual = organisationData?.type === MQ_ORG_TYPES.INDIVIDUAL;
  const isNonLimitedCompany =
    organisationData?.type === MQ_ORG_TYPES.NON_LIMITED_COMPANY;

  const { generalOrganisationRows, typeOfOrganisationRow } =
    getOrganisationData(organisationData, {
      isIndividual,
      isNonLimitedCompany,
    });

  return {
    props: {
      isIndividual,
      generalOrganisationRows,
      typeOfOrganisationRow,
    },
  };
};

const ManageOrganisationDetails: FC<ManageOrganisationDetailsProps> = ({
  isIndividual,
  typeOfOrganisationRow,
  generalOrganisationRows,
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
              Your saved information
            </h1>
            <p className="govuk-body">
              Funding organisations run checks to prevent fraud. The information
              below will be used as part of these checks.
            </p>
            <dl className="govuk-summary-list border-bottom-0">
              <OrganisationDataRow
                noBorderBottom
                organisationDetail={typeOfOrganisationRow}
              />
            </dl>
            <h2
              className="govuk-heading-m"
              data-cy="cy-manage-organisation-header"
            >
              {`Your ${isIndividual ? 'details' : 'organisation details'}`}
            </h2>

            <dl className="govuk-summary-list">
              {generalOrganisationRows &&
                generalOrganisationRows.map((organisationDetail, index) => (
                  <OrganisationDataRow
                    key={index}
                    organisationDetail={organisationDetail}
                  />
                ))}
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

type OrganisationDataRowProps = {
  organisationDetail: OrganisationDetails;
  noBorderBottom?: boolean;
};

const OrganisationDataRow = ({
  organisationDetail,
  noBorderBottom,
}: OrganisationDataRowProps) => (
  <div
    className={`govuk-summary-list__row ${
      noBorderBottom ? 'border-bottom-0-important' : ''
    }`}
  >
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
        {organisationDetail.value ? organisationDetail.value : '-'}
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

type OrganisationData = {
  typeOfOrganisationRow: OrganisationDetails;
  generalOrganisationRows: OrganisationDetails[];
};

export const getOrganisationData = (
  organisationData: GrantApplicantOrganisationProfile,
  { isIndividual, isNonLimitedCompany }: Record<string, boolean>
): OrganisationData => {
  const typeOfOrganisationRow = {
    id: 'organisationType',
    label: `Type of ${isIndividual ? 'application' : 'organisation'}`,
    value: isIndividual ? MQ_ORG_TYPES.INDIVIDUAL : organisationData?.type,
    url: routes.organisation.type,
    status: organisationData?.type ? 'Change' : 'Add',
  };

  const generalOrganisationRows = [
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
      id: 'organisationCompaniesHouseNumber',
      label: 'Companies House number',
      value: organisationData?.companiesHouseNumber,
      url: routes.organisation.companiesHouseNumber,
      status: organisationData?.companiesHouseNumber ? 'Change' : 'Add',
    },
    {
      id: 'organisationCharity',
      label: 'Charity Commission number',
      value: organisationData?.charityCommissionNumber,
      url: routes.organisation.charityComissionNumber,
      status: organisationData?.charityCommissionNumber ? 'Change' : 'Add',
    },
  ];

  if (isNonLimitedCompany || isIndividual) {
    generalOrganisationRows.splice(2, 3);
  }

  return { typeOfOrganisationRow, generalOrganisationRows };
};

export default ManageOrganisationDetails;
