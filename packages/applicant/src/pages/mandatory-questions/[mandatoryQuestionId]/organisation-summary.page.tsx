import Link from 'next/link';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import { MQ_ORG_TYPES } from '../../../utils/constants';

export { getServerSideProps };

export const generateMandatoryQuestionDetails = (
  mandatoryQuestion: InferProps<typeof getServerSideProps>['mandatoryQuestion'],
  mandatoryQuestionId: InferProps<
    typeof getServerSideProps
  >['mandatoryQuestionId']
) => {
  const shouldDisplayExtraFields = [
    MQ_ORG_TYPES.LIMITED_COMPANY,
    MQ_ORG_TYPES.CHARITY,
    MQ_ORG_TYPES.OTHER,
  ].includes(mandatoryQuestion.orgType);
  const isIndividual = mandatoryQuestion.orgType === MQ_ORG_TYPES.INDIVIDUAL;

  return [
    {
      id: 'organisationType',
      label: isIndividual ? 'Type of application' : 'Type of organisation',
      value: mandatoryQuestion?.orgType,
      url: routes.mandatoryQuestions.typePage(mandatoryQuestionId),
      status: 'Change',
    },
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
      id: 'organisationCompaniesHouseNumber',
      label: 'Companies House number',
      value: mandatoryQuestion?.companiesHouseNumber,
      url: routes.mandatoryQuestions.companiesHouseNumberPage(
        mandatoryQuestionId
      ),
      status: 'Change',
      hidden: !shouldDisplayExtraFields,
    },
    {
      id: 'organisationCharity',
      label: 'Charity Commission number',
      value: mandatoryQuestion?.charityCommissionNumber,
      url: routes.mandatoryQuestions.charityCommissionNumberPage(
        mandatoryQuestionId
      ),
      status: 'Change',
      hidden: !shouldDisplayExtraFields,
    },
    {
      id: 'fundingAmount',
      label: 'How much funding are you applying for?',
      value: mandatoryQuestion?.fundingAmount,
      url: routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId),
      status: 'Change',
      showCurrency: true,
    },
    {
      id: 'fundingLocation',
      label: 'Where will this funding be spent?',
      value: mandatoryQuestion?.fundingLocation,
      url: routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId),
      status: 'Change',
    },
  ];
};

export default function MandatoryQuestionOrganisationSummaryPage({
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const mandatoryQuestionDetails = generateMandatoryQuestionDetails(
    mandatoryQuestion,
    mandatoryQuestionId
  );

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
              and up to date. Funding organisations will use this information to
              run checks that prevent fraud.
            </p>

            <dl className="govuk-summary-list">
              {mandatoryQuestionDetails
                .filter((item) => !item.hidden)
                .map((mandatoryQuestionDetail) => (
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
                      <DisplayMultilineSummaryListValue
                        data={mandatoryQuestionDetail.value as string[]}
                        id={mandatoryQuestionDetail.id}
                        cyTag={mandatoryQuestionDetail.label}
                      />
                    ) : (
                      <dd
                        className="govuk-summary-list__value"
                        id={mandatoryQuestionDetail.id}
                        data-cy={`cy-organisation-value-${mandatoryQuestionDetail.label}`}
                      >
                        {mandatoryQuestionDetail.showCurrency ? '£ ' : ''}
                        {mandatoryQuestionDetail.value
                          ? mandatoryQuestionDetail.value
                          : '-'}
                      </dd>
                    )}
                    <dd className="govuk-summary-list__actions">
                      <Link
                        href={`${mandatoryQuestionDetail.url}?fromSummaryPage=true`}
                        className="govuk-link govuk-link--no-visited-state"
                        data-cy={`cy-organisation-details-navigation-${mandatoryQuestionDetail.id}`}
                      >
                        {mandatoryQuestionDetail.status}
                        <span className="govuk-visually-hidden">
                          {mandatoryQuestionDetail.url}?fromSummaryPage=true
                        </span>
                      </Link>
                    </dd>
                  </div>
                ))}
            </dl>

            <Link
              href={{
                pathname: `/api/create-submission`,
                query: {
                  schemeId: mandatoryQuestion.schemeId.toString(),
                  mandatoryQuestionId,
                },
              }}
              className="govuk-button"
              data-module="govuk-button"
              aria-disabled="false"
            >
              Confirm and submit
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}

type DisplayMultilineSummaryListValueProps = {
  data: string[];
  id: string;
  cyTag: string;
};

const DisplayMultilineSummaryListValue = ({
  data,
  id,
  cyTag,
}: DisplayMultilineSummaryListValueProps) => {
  return data.length > 0 ? (
    <dd
      className="govuk-summary-list__value"
      data-cy={`cy-organisation-value-${cyTag}`}
    >
      <ul className="govuk-list">
        {data.map((line: string, index: number, array: string[]) => {
          if (line) {
            return (
              <li key={line}>
                {index === array.length - 1 ? line : `${line},`}
              </li>
            );
          }
        })}
      </ul>
    </dd>
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
