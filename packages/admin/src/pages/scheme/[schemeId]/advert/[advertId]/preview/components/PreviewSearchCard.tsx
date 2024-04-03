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
    <div className="govuk-grid-column-two-thirds">
      <div>
        <h2 className="govuk-heading-m" data-cy="cyGrantName">
          <Link href="#" className="govuk-link">
            {grant.grantName}
          </Link>
        </h2>
        <p className="govuk-body" data-cy={`cyGrantShortDescriptions`}>
          {grant.grantShortDescription}
        </p>

        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key  govuk-!-font-weight-regular">
              {labels.location}
            </dt>
            <dd className="govuk-summary-list__value">
              {grant.grantLocation.join(', ')}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-font-weight-regular">
              {labels.funders}
            </dt>
            <dd className="govuk-summary-list__value">
              {grant.grantFundingOrganisation}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-margin-right-2 govuk-!-font-weight-regular">
              {labels.whoCanApply}
            </dt>
            <dd className="govuk-summary-list__value">
              {grant.grantApplicantType?.join(', ')}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-font-weight-regular">
              {labels.size}
            </dt>
            <dd className="govuk-summary-list__value">
              {`From ${grant?.grantMinimumAward} to ${grant.grantMaximumAward}`}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-font-weight-regular">
              {labels.schemeSize}
            </dt>
            <dd className="govuk-summary-list__value">
              {grant.grantTotalAwardAmount}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-font-weight-regular">
              {labels.opens}
            </dt>
            <dd className="govuk-summary-list__value">
              <Moment format="D MMMM YYYY, h:mma" tz="GMT">
                {adjustedOpenDate}
              </Moment>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-font-weight-regular">
              {labels.closes}
            </dt>
            <dd className="govuk-summary-list__value">
              <Moment format="D MMMM YYYY, h:mma" tz="GMT">
                {adjustedCloseDate}
              </Moment>
            </dd>
          </div>
        </dl>
        <div className="govuk-!-margin-bottom-2" />
      </div>
    </div>
  );
};

const parseDate = (date: string[]) => {
  return {
    day: parseInt(date[0], 10),
    month: parseInt(date[1], 10) - 1,
    year: parseInt(date[2], 10),
    hour: parseInt(date[3], 10),
    minute: parseInt(date[4], 10),
  };
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
  location: 'Location',
  funders: 'Funding organisation',
  whoCanApply: 'Who can apply',
  schemeSize: 'Grant scheme size',
  size: 'How much you can get',
  opens: 'Opening date',
  closes: 'Closing date',
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
