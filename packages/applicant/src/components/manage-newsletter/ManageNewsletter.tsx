import Link from 'next/link';
import { NewGrantsButton } from '../../components/newsletter/new-grants/NewGrantsButton';
import { formatDateTimeForSentence } from '../../../src/utils/dateFormatterGDS';
import { newsletterRoutes } from '../../utils/constants';

type ManageNewsletterProps = {
  signupDate: Date;
  subscriptionId: number;
  newGrantsDateParams: any;
};

const ManageNewsletter = ({
  signupDate,
  subscriptionId,
  newGrantsDateParams,
}: ManageNewsletterProps) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <h3 className="govuk-heading-m">Updates about new grants</h3>
        <p>{`You signed up for updates on ${formatDateTimeForSentence(
          signupDate
        )}.`}</p>

        <NewGrantsButton dateParams={newGrantsDateParams} />

        <Link
          href={`${newsletterRoutes.unsubscribe}/${subscriptionId}`}
          className={`govuk-link govuk-link--no-visited-state`}
          data-cy="cyUnsubscribeNewsGrantsLink"
        >
          Unsubscribe from updates about new grants
        </Link>
        <hr className="govuk-!-margin-top-6 govuk-!-margin-bottom-6" />
      </div>
    </div>
  );
};

export { ManageNewsletter };
