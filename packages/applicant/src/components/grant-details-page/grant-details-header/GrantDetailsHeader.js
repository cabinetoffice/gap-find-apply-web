import Moment from 'react-moment';
import 'moment-timezone';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import gloss from '../../../utils/glossary.json';

export function GrantDetailsHeader({ grant }) {
  return (
    <div className="govuk-grid-column-three-quarters">
      <h1
        className="govuk-heading-l"
        data-cy="cyGrantDetailName"
        id="main-content-focus"
        tabIndex={-1}
      >
        {grant.grantName}
      </h1>
      <span className="govuk-body">
        {documentToReactComponents(grant.grantStrapLine)}
      </span>
      <ul className="govuk-list">
        <li>
          <strong>{gloss.grantDetails.opens}:</strong>{' '}
          <span>
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {grant.grantApplicationOpenDate}
            </Moment>
          </span>
        </li>
        <li>
          <strong>{gloss.grantDetails.closes}:</strong>{' '}
          <span>
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {grant.grantApplicationCloseDate}
            </Moment>
          </span>
        </li>
      </ul>
    </div>
  );
}
