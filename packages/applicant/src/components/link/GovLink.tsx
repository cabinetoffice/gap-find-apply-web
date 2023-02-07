import { FC } from 'react';
import Link from 'next/link';

export interface LinkType {
  text: string;
  url: string;
  noVisitedState?: boolean;
}

export const GovLink: FC<LinkType> = ({
  text,
  url,
  noVisitedState = false,
}) => {
  return (
    <Link href={url}>
      <a
        className={
          'govuk-link ' + (noVisitedState ? 'govuk-link--no-visited-state' : '')
        }
        data-cy={`cy-link-${text}`}
      >
        {text}
      </a>
    </Link>
  );
};
