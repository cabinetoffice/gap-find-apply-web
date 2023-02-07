import Link from 'next/link';
import { FC } from 'react';
import styles from './Card.module.scss';
interface CardType {
  link: string;
  linkDescription: string;
  description: string;
}

export const Card: FC<CardType> = ({ link, linkDescription, description }) => {
  return (
    <div className="govuk-grid-column-one-half ">
      <div className={styles.card}>
        <h3 className="govuk-heading-s">
          <Link href={link}>
            <a
              data-cy={`cy-link-card-${linkDescription}`}
              className="govuk-link govuk-link--no-visited-state"
            >
              {linkDescription}
            </a>
          </Link>
        </h3>
        <p className="govuk-body">{description}</p>
      </div>
    </div>
  );
};
