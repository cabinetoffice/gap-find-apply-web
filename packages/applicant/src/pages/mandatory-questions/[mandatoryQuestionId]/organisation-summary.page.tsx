import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import Meta from '../../../components/partials/Meta';
import ProcessAddress from '../../organisation/processAddress';
import Link from 'next/link';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import { Button } from 'gap-web-ui';
import { ManageOrganisationDetailsProps } from '../../organisation/index.page';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationSummaryPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl = routes.dashboard;
  const organisationDetails = [
    {
      id: 'organisationName',
      label: 'Name',
      value: mandatoryQuestion?.name,
      url: routes.mandatoryQuestions.namePage(mandatoryQuestionId),
      status: 'Change',
    },
    {
      id: 'organisationAddress',
      label: 'Address',
      value: [
        mandatoryQuestion.addressLine1,
        mandatoryQuestion.addressLine2,
        mandatoryQuestion.city,
        mandatoryQuestion.county,
        mandatoryQuestion.postcode,
      ],
      url: routes.mandatoryQuestions.addressPage(mandatoryQuestionId),
      status: 'Change',
    },
    {
      id: 'organisationType',
      label: 'Type of organisation',
      value: mandatoryQuestion?.orgType,
      url: routes.mandatoryQuestions.typePage(mandatoryQuestionId),
      status: 'Change',
    },
    {
      id: 'organisationCompaniesHouseNumber',
      label: 'Companies house number',
      value: mandatoryQuestion?.companiesHouseNumber,
      url: routes.mandatoryQuestions.companiesHouseNumberPage(
        mandatoryQuestionId
      ),
      status: 'Change',
    },
    {
      id: 'organisationCharity',
      label: 'Charity commission number',
      value: mandatoryQuestion?.charityCommissionNumber,
      url: routes.mandatoryQuestions.charityCommissionNumberPage(
        mandatoryQuestionId
      ),
      status: 'Change',
    },
    {
      id: 'fundingAmount',
      label: 'Funding amount',
      value: mandatoryQuestion?.fundingAmount,
      url: routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId),
      status: 'Change',
    },
    {
      id: 'fundingLocation',
      label: 'Funding location',
      value: mandatoryQuestion?.fundingLocation,
      url: routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId),
      status: 'Change',
    },
  ];
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
              Confirm your details
            </h1>
            <p className="govuk-body">
              Ensure the following details about your organisation are correct
              and up to date. Funding organisations will use this information so
              they can run checks to prevent fraud.
            </p>
            <dl className="govuk-summary-list">
              {organisationDetails &&
                organisationDetails.map((organisationDetail) => {
                  return (
                    <div
                      className="govuk-summary-list__row"
                      key={'row-' + organisationDetail.id}
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
                          {organisationDetail.value
                            ? organisationDetail.value
                            : '-'}
                        </dd>
                      )}
                      <dd className="govuk-summary-list__actions">
                        <Link
                          href={
                            organisationDetail.url + '?fromSummaryPage=true'
                          }
                        >
                          <a
                            className="govuk-link govuk-link--no-visited-state"
                            data-cy={`cy-organisation-details-navigation-${organisationDetail.id}`}
                          >
                            {organisationDetail.status}
                            <span className="govuk-visually-hidden">
                              {organisationDetail.url}?fromSummaryPage=true
                            </span>
                          </a>
                        </Link>
                      </dd>
                    </div>
                  );
                })}
            </dl>

            <Button
              text="Confirm and submit"
              type={ButtonTypePropertyEnum.Submit}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
