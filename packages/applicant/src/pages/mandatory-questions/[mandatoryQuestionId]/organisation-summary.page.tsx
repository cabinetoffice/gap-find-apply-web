import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import Meta from '../../../components/partials/Meta';
import Link from 'next/link';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import { Button } from 'gap-web-ui';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationSummaryPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const mandatoryQuestionDetails = [
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
              {mandatoryQuestionDetails?.map((mandatoryQuestionDetail) => {
                return (
                  <div
                    className="govuk-summary-list__row"
                    key={'row-' + mandatoryQuestionDetail.id}
                  >
                    <dt
                      className="govuk-summary-list__key"
                      data-cy={`cy-organisation-details-${mandatoryQuestionDetail.label}`}
                    >
                      {mandatoryQuestionDetail.label}
                    </dt>
                    {['organisationAddress', 'fundingLocation'].includes(
                      mandatoryQuestionDetail.id
                    ) ? (
                      <DisplayArrayData
                        data={mandatoryQuestionDetail.value}
                        id={mandatoryQuestionDetail.id}
                        cyTag={mandatoryQuestionDetail.label}
                      />
                    ) : (
                      <dd
                        className="govuk-summary-list__value"
                        id={mandatoryQuestionDetail.id}
                        data-cy={`cy-organisation-value-${mandatoryQuestionDetail.label}`}
                      >
                        {mandatoryQuestionDetail.value
                          ? mandatoryQuestionDetail.value
                          : '-'}
                      </dd>
                    )}
                    <dd className="govuk-summary-list__actions">
                      <Link
                        href={`${mandatoryQuestionDetail.url}?fromSummaryPage=true`}
                      >
                        <a
                          className="govuk-link govuk-link--no-visited-state"
                          data-cy={`cy-organisation-details-navigation-${mandatoryQuestionDetail.id}`}
                        >
                          {mandatoryQuestionDetail.status}
                          <span className="govuk-visually-hidden">
                            {mandatoryQuestionDetail.url}?fromSummaryPage=true
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

const DisplayArrayData = ({ data, id, cyTag }) => {
  const dataToDisplay = Array.isArray(data) ? data : data.split(',');

  return data ? (
    <>
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-organisation-value-${cyTag}`}
      >
        <ul className="govuk-list">
          {dataToDisplay.map((line: string, index: number, array: string[]) => {
            if (line) {
              return (
                <li key={index}>
                  {index === array.length - 1 ? line : `${line},`}
                </li>
              );
            }
          })}
        </ul>
      </dd>
    </>
  ) : (
    <dd
      className="govuk-summary-list__value"
      id={id}
      data-cy={'cy-organisation-no-data-' + id}
    >
      -
    </dd>
  );
};
