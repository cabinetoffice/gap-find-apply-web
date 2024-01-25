import 'moment-timezone';
import Link from 'next/link';
import Moment from 'react-moment';
import gloss from '../../../utils/glossary.json';

export function SearchResultCard({ item }) {
  return (
    <li id={item.label}>
      <h2 className="govuk-heading-m">
        <Link
          href={{
            pathname: '/grants/[pid]',
            query: { pid: item.label },
          }}
          className="govuk-link"
          data-cy="cyGrantNameAndLink"
        >
          {item.grantName}
        </Link>
      </h2>
      <p
        className="govuk-body"
        data-cy={`cyGrantShortDescriptions-${item.label}`}
      >
        {item.grantShortDescription}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.location + ' '}
        </span>
        {item.grantLocation?.join(', ')}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.funders + ' '}
        </span>
        {item.grantFunder}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.whoCanApply + ' '}
        </span>
        {item.grantApplicantType?.join(', ')}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.size + ' '}
        </span>
        {`From ${item.grantMinimumAwardDisplay} to ${item.grantMaximumAwardDisplay}`}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.schemeSize + ' '}
        </span>
        {item.grantTotalAwardDisplay}
      </p>
      <p className="govuk-body govuk-!-margin-bottom-2">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.opens + ' '}
        </span>
        <Moment format="D MMMM YYYY, h:mma" tz="GMT">
          {item.grantApplicationOpenDate}
        </Moment>
      </p>
      <p className="govuk-body govuk-!-margin-bottom-5">
        <span className="govuk-!-font-weight-bold">
          {gloss.browse.closes + ' '}
        </span>
        <Moment format="D MMMM YYYY, h:mma" tz="GMT">
          {item.grantApplicationCloseDate}
        </Moment>
      </p>
      <div className="govuk-!-margin-bottom-5">
        <hr className="govuk-section-break govuk-section-break--visible" />
      </div>
    </li>
  );
}
