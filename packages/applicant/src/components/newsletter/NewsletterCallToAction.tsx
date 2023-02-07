import Link from 'next/link';
import { BellIcon } from '../icons/BellIcon/BellIcon';
import styles from './NewsletterCallToAction.module.css';

type NewsletterCTAProps = {
  returnParams: any;
};

const NewsletterCallToAction = ({ returnParams }: NewsletterCTAProps) => {
  return (
    <div className={`govuk-grid-row ${styles.withBorder}`}>
      <div className="govuk-grid-column-full gap-search-area govuk-!-padding-4">
        <div className={`${styles.newsLetterCtaInnerContent}`}>
          <BellIcon />
          <h3 className={`govuk-heading-s ${styles.newsletterCtaTitle}`}>
            Get updates about new grants
          </h3>
          <Link href={{ pathname: '/newsletter', query: returnParams }}>
            <a
              className={`govuk-link govuk-link--no-visited-state govuk-!-font-size-19`}
              data-cy="cySignUpNewsletter"
            >
              Sign up and we will email you when new grants have been added.
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { NewsletterCallToAction };
