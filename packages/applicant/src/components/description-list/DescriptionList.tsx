import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';

export interface DescriptionListProps {
  data: DescriptionListDataProps[];
  needAddOrChangeButtons: boolean;
  needBorder: boolean;
}
export interface DescriptionListDataProps {
  term: string; //dt
  detail: string; //dd
}

export const DescriptionList: FC<DescriptionListProps> = ({
  data,
  needAddOrChangeButtons,
  needBorder,
}) => {
  const router = useRouter();
  let pathname: string;
  if (router) {
    pathname = router.pathname;
  }

  return (
    <>
      {data && (
        <>
          <dl
            aria-label="description-list"
            className={`govuk-summary-list ${
              needBorder ? '' : 'govuk-summary-list--no-border'
            }`}
          >
            {data.map(({ term, detail }) => {
              return (
                <div className="govuk-summary-list__row" key={term}>
                  <dt className="govuk-summary-list__key" aria-label={term}>
                    {term}
                  </dt>
                  <dd
                    className="govuk-summary-list__value"
                    aria-label={!detail ? '-' : detail}
                  >
                    {!detail ? '-' : detail}
                  </dd>
                  {needAddOrChangeButtons && (
                    <dd
                      className="govuk-summary-list__actions"
                      aria-label={`${!detail ? 'Add' : 'Change'} ${term}`}
                    >
                      <Link href={`${pathname}/${term.toLowerCase()}`}>
                        <a className="govuk-link--no-visited-state">
                          {!detail ? 'Add' : 'Change'}
                          <span className="govuk-visually-hidden"> {term}</span>
                        </a>
                      </Link>
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </>
      )}
    </>
  );
};
