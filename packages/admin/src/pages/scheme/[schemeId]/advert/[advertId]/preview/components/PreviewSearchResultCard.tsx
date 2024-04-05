import 'moment-timezone';
import Link from 'next/link';
import Moment from 'react-moment';
import React from 'react';
import moment from 'moment';

const PreviewSearchResultCard = ({ grant }: PreviewSearchResultCardProps) => {
  const { adjustedOpenDate, adjustedCloseDate } = adjustDate(
    grant.grantApplicationOpenDate,
    grant.grantApplicationCloseDate
  );

  return (
    <div
      className="govuk-grid-column-two-thirds"
      data-testid="advert-preview-search-card-div"
    >
      <div>
        <h2 className="govuk-heading-m">
          <Link href="#" className="govuk-link" data-testid="GrantName">
            {grant.grantName}
          </Link>
        </h2>
        <p className="govuk-body" data-testid="ShortDescription">
          {grant.grantShortDescription}
        </p>

        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="LocationLabel"
            >
              {labels.grantLocation}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="LocationValue"
            >
              {grant.grantLocation.join(', ')}
            </dd>
          </div>

          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="FundingOrganisationLabel"
            >
              {labels.grantFundingOrganisation}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="FundingOrganisationValue"
            >
              {grant.grantFundingOrganisation}
            </dd>
          </div>

          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="ApplicantTypeLabel"
            >
              {labels.grantApplicantType}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="ApplicantTypeValue"
            >
              {grant.grantApplicantType?.join(', ')}
            </dd>
          </div>

          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="MinimumMaximumAwardLabel"
            >
              {labels.grantMinimumMaximumAward}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="MinimumMaximumAwardValue"
            >
              {grant?.grantMinimumAward && grant?.grantMaximumAward
                ? `From ${grant.grantMinimumAward} to ${grant.grantMaximumAward}`
                : ''}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__value govuk-!-font-weight-regular"
              data-testid="TotalAwardAmountLabel"
            >
              {labels.grantTotalAwardAmount}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="TotalAwardAmountValue"
            >
              {grant.grantTotalAwardAmount}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="ApplicationOpenDateLabel"
            >
              {labels.grantApplicationOpenDate}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="ApplicationOpenDateValue"
            >
              {grant.grantApplicationOpenDate.length ? (
                <Moment
                  format="D MMMM YYYY, h:mma"
                  tz="GMT"
                  data-testid="openDate"
                >
                  {adjustedOpenDate}
                </Moment>
              ) : (
                ''
              )}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key govuk-!-font-weight-regular"
              data-testid="ApplicationCloseDateLabel"
            >
              {labels.grantApplicationCloseDate}
            </dt>
            <dd
              className="govuk-summary-list__value"
              data-testid="ApplicationCloseDateValue"
            >
              {grant.grantApplicationCloseDate.length ? (
                <Moment
                  format="D MMMM YYYY, h:mma"
                  tz="GMT"
                  data-testid="closeDate"
                >
                  {adjustedCloseDate}
                </Moment>
              ) : (
                ''
              )}
            </dd>
          </div>
        </dl>
        <div className="govuk-!-margin-bottom-2" />
      </div>
    </div>
  );
};

const parseDate = (date: string[]) => {
  if (date.length) {
    return {
      day: parseInt(date[0], 10),
      month: parseInt(date[1], 10) - 1,
      year: parseInt(date[2], 10),
      hour: parseInt(date[3], 10),
      minute: parseInt(date[4], 10),
    };
  } else {
    return null;
  }
};

function adjustDate(openDate: string[], closeDate: string[]) {
  const openDateFormatted = moment(parseDate(openDate));
  const closeDateFormatted = moment(parseDate(closeDate));

  const adjustedOpenDate = moment.utc(openDateFormatted).startOf('day');
  const adjustedCloseDate = moment.utc(closeDateFormatted).startOf('day');

  return {
    adjustedOpenDate: adjustedOpenDate.isSame(moment.utc(openDateFormatted))
      ? adjustedOpenDate.add(1, 'minute')
      : moment.utc(openDateFormatted),
    adjustedCloseDate: adjustedCloseDate.isSame(moment.utc(closeDateFormatted))
      ? adjustedCloseDate.subtract(1, 'minute')
      : moment.utc(closeDateFormatted),
  };
}

const labels = {
  grantLocation: 'Location',
  grantFundingOrganisation: 'Funding organisation',
  grantApplicantType: 'Who can apply',
  grantTotalAwardAmount: 'Grant scheme size',
  grantMinimumMaximumAward: 'How much you can get',
  grantApplicationOpenDate: 'Opening date',
  grantApplicationCloseDate: 'Closing date',
};

type PreviewSearchResultCardProps = {
  grant: {
    grantName: string;
    grantShortDescription: string;
    grantLocation: string[];
    grantFundingOrganisation: string;
    grantApplicantType: string[];
    grantTotalAwardAmount: string;
    grantMaximumAward: string;
    grantMinimumAward: string;
    grantApplicationOpenDate: string[];
    grantApplicationCloseDate: string[];
  };
};

export default PreviewSearchResultCard;
